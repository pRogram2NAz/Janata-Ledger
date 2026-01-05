// app/api/ai-rating/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  analyzeSentiment,
  classifyComplaint,
  extractGpsFromImage,
  verifyLocation,
  calculateNewRating,
  determineFlag,
  DEFAULT_PROJECT_LOCATION,
  MAX_DISTANCE_METERS,
  type ComplaintFlag,
  type ComplaintSubmissionResult,
  type GPSData,
} from '@/lib/complaint-utils';

// ============================================================================
// GET - Fetch AI Rating
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractorId = searchParams.get('contractorId');
    const includeComplaints = searchParams.get('includeComplaints') === 'true';

    if (!contractorId) {
      return NextResponse.json(
        { error: 'Contractor ID is required' },
        { status: 400 }
      );
    }

    const rating = await db.contractorRating.findUnique({
      where: { contractorId },
    });

    if (!rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }

    // Optionally include complaints summary
    if (includeComplaints) {
      const complaints = await db.complaint.findMany({
        where: { contractorId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          complaintType: true,
          status: true,
          sentimentScore: true,
          locationVerified: true,
          distanceMeters: true,
          createdAt: true,
        },
      });

      const complaintStats = {
        total: complaints.length,
        verified: complaints.filter(c => c.status === 'VERIFIED').length,
        rejected: complaints.filter(c => c.status === 'REJECTED').length,
        pending: complaints.filter(c => c.status === 'PENDING_REVIEW').length,
      };

      return NextResponse.json({
        success: true,
        rating,
        complaints,
        complaintStats,
      });
    }

    return NextResponse.json({ success: true, rating });
  } catch (error) {
    console.error('Error fetching AI rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI rating' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Handle Different Request Types
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle complaint submission (multipart form data with image)
    if (contentType.includes('multipart/form-data')) {
      return handleComplaintSubmission(request);
    }

    // Handle JSON requests
    const body = await request.json();

    // Route to appropriate handler based on request type
    if (body.type === 'complaint') {
      return handleComplaintJson(body);
    }

    if (body.type === 'verify-chain') {
      return handleVerifyChain();
    }

    // Default: AI rating calculation
    return handleAIRating(body);
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// COMPLAINT SUBMISSION HANDLER (Form Data with Image)
// ============================================================================

async function handleComplaintSubmission(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const formData = await request.formData();

    // Extract form fields
    const text = formData.get('text') as string;
    const email = formData.get('email') as string;
    const imageFile = formData.get('image') as File;
    const contractorId = formData.get('contractorId') as string;
    const contractId = formData.get('contractId') as string | null;

    // Validation
    if (!text || !email || !imageFile) {
      return NextResponse.json(
        { error: 'Missing required fields: text, email, and image are required' },
        { status: 400 }
      );
    }

    if (!contractorId) {
      return NextResponse.json(
        { error: 'Contractor ID is required' },
        { status: 400 }
      );
    }

    // Verify contractor exists
    const contractor = await db.user.findUnique({
      where: { id: contractorId, role: 'CONTRACTOR' },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    // Get project location (from contract or default)
    let projectLocation = DEFAULT_PROJECT_LOCATION;
    
    if (contractId) {
      const locationRecord = await db.projectLocation.findUnique({
        where: { contractId },
      });
      
      if (locationRecord) {
        projectLocation = {
          latitude: locationRecord.latitude,
          longitude: locationRecord.longitude,
        };
      }
    }

    // Convert image to buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // Analyze text
    const sentiment = await analyzeSentiment(text);
    const { type: complaintType, confidence } = await classifyComplaint(text);

    // Extract GPS from image EXIF
    const gps = await extractGpsFromImage(imageBuffer);

    // Verify location
    let locationOk = false;
    let distance: number | null = null;
    const hasGps = gps !== null;

    if (gps) {
      const locationResult = verifyLocation(
        gps.latitude,
        gps.longitude,
        projectLocation.latitude,
        projectLocation.longitude
      );
      locationOk = locationResult.isValid;
      distance = locationResult.distance;
    }

    // Determine flag status
    const { flag, reasons: flagReasons } = determineFlag(hasGps, locationOk, distance);

    // Get current rating and calculate new rating
    const currentRating = await getContractorRating(contractorId);
    const newRating = calculateNewRating(currentRating, sentiment);

    // Save image to storage
    const imageUrl = await saveImage(imageFile, imageBuffer, contractorId);

    // Create complaint record
    const complaint = await db.complaint.create({
      data: {
        text,
        sentimentScore: sentiment,
        complaintType,
        confidence,
        imageUrl,
        gpsLatitude: gps?.latitude ?? null,
        gpsLongitude: gps?.longitude ?? null,
        photoTimestamp: gps?.timestamp ?? null,
        locationVerified: locationOk,
        timestampVerified: true, // Always true (no time check per requirements)
        distanceMeters: distance,
        userEmail: email,
        oldRating: currentRating,
        newRating,
        status: flag,
        contractorId,
        contractId: contractId || null,
      },
    });

    // Update contractor rating only if verified
    if (flag === 'VERIFIED') {
      await updateContractorRating(contractorId, newRating);
    }

    const result: ComplaintSubmissionResult = {
      success: true,
      complaintId: complaint.id,
      sentiment: parseFloat(sentiment.toFixed(2)),
      type: complaintType,
      rating: newRating,
      hasGps,
      distance: distance ? parseFloat(distance.toFixed(2)) : null,
      locationVerified: locationOk,
      flag,
      flagReason: flagReasons.length > 0 ? flagReasons.join(', ') : 'All checks passed',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting complaint:', error);
    return NextResponse.json(
      { error: 'Failed to submit complaint' },
      { status: 500 }
    );
  }
}

// ============================================================================
// COMPLAINT SUBMISSION HANDLER (JSON without image - for testing)
// ============================================================================

async function handleComplaintJson(body: {
  text: string;
  email: string;
  contractorId: string;
  contractId?: string;
  latitude?: number;
  longitude?: number;
}): Promise<NextResponse> {
  try {
    const { text, email, contractorId, contractId, latitude, longitude } = body;

    if (!text || !email || !contractorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Analyze text
    const sentiment = await analyzeSentiment(text);
    const { type: complaintType, confidence } = await classifyComplaint(text);

    // Check GPS if provided
    let hasGps = false;
    let locationOk = false;
    let distance: number | null = null;

    if (latitude !== undefined && longitude !== undefined) {
      hasGps = true;
      const locationResult = verifyLocation(
        latitude,
        longitude,
        DEFAULT_PROJECT_LOCATION.latitude,
        DEFAULT_PROJECT_LOCATION.longitude
      );
      locationOk = locationResult.isValid;
      distance = locationResult.distance;
    }

    // Determine flag status
    const { flag, reasons: flagReasons } = determineFlag(hasGps, locationOk, distance);

    // Get current rating and calculate new rating
    const currentRating = await getContractorRating(contractorId);
    const newRating = calculateNewRating(currentRating, sentiment);

    // Create complaint record
    const complaint = await db.complaint.create({
      data: {
        text,
        sentimentScore: sentiment,
        complaintType,
        confidence,
        imageUrl: null,
        gpsLatitude: latitude ?? null,
        gpsLongitude: longitude ?? null,
        photoTimestamp: null,
        locationVerified: locationOk,
        timestampVerified: true,
        distanceMeters: distance,
        userEmail: email,
        oldRating: currentRating,
        newRating,
        status: flag,
        contractorId,
        contractId: contractId || null,
      },
    });

    // Update contractor rating only if verified
    if (flag === 'VERIFIED') {
      await updateContractorRating(contractorId, newRating);
    }

    const result: ComplaintSubmissionResult = {
      success: true,
      complaintId: complaint.id,
      sentiment: parseFloat(sentiment.toFixed(2)),
      type: complaintType,
      rating: newRating,
      hasGps,
      distance: distance ? parseFloat(distance.toFixed(2)) : null,
      locationVerified: locationOk,
      flag,
      flagReason: flagReasons.length > 0 ? flagReasons.join(', ') : 'All checks passed',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting complaint (JSON):', error);
    return NextResponse.json(
      { error: 'Failed to submit complaint' },
      { status: 500 }
    );
  }
}

// ============================================================================
// AI RATING CALCULATION HANDLER
// ============================================================================

async function handleAIRating(body: {
  contractorId: string;
  sentiment?: number;
}): Promise<NextResponse> {
  try {
    const { contractorId, sentiment } = body;

    if (!contractorId) {
      return NextResponse.json(
        { error: 'Contractor ID is required' },
        { status: 400 }
      );
    }

    // Get current rating
    const currentRating = await getContractorRating(contractorId);

    // Calculate new rating if sentiment provided
    let newRating = currentRating;
    if (sentiment !== undefined) {
      newRating = calculateNewRating(currentRating, sentiment);
      await updateContractorRating(contractorId, newRating);
    }

    return NextResponse.json({
      success: true,
      contractorId,
      currentRating,
      newRating,
    });
  } catch (error) {
    console.error('Error calculating AI rating:', error);
    return NextResponse.json(
      { error: 'Failed to calculate AI rating' },
      { status: 500 }
    );
  }
}

// ============================================================================
// VERIFY CHAIN HANDLER (Blockchain verification simulation)
// ============================================================================

async function handleVerifyChain(): Promise<NextResponse> {
  try {
    // Get all verified complaints
    const verifiedComplaints = await db.complaint.findMany({
      where: { status: 'VERIFIED' },
      select: {
        id: true,
        contractorId: true,
        sentimentScore: true,
        createdAt: true,
      },
    });

    // Simulate blockchain verification
    const chainValid = verifiedComplaints.length > 0;
    const totalComplaints = verifiedComplaints.length;

    return NextResponse.json({
      success: true,
      chainValid,
      totalComplaints,
      message: chainValid
        ? 'Blockchain verification successful'
        : 'No verified complaints found',
    });
  } catch (error) {
    console.error('Error verifying chain:', error);
    return NextResponse.json(
      { error: 'Failed to verify chain' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get contractor rating, create if doesn't exist
 */
async function getContractorRating(contractorId: string): Promise<number> {
  let rating = await db.contractorRating.findUnique({
    where: { contractorId },
  });

  if (!rating) {
    rating = await db.contractorRating.create({
      data: {
        contractorId,
        rating: 5.0, // Default rating
        totalComplaints: 0,
        verifiedComplaints: 0,
      },
    });
  }

  return rating.rating;
}

/**
 * Update contractor rating
 */
async function updateContractorRating(
  contractorId: string,
  newRating: number
): Promise<void> {
  await db.contractorRating.update({
    where: { contractorId },
    data: {
      rating: newRating,
      totalComplaints: { increment: 1 },
      verifiedComplaints: { increment: 1 },
      lastUpdated: new Date(),
    },
  });
}

/**
 * Save image to file system
 */
async function saveImage(
  imageFile: File,
  imageBuffer: Buffer,
  contractorId: string
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'complaints');
  
  // Create directory if it doesn't exist
  await mkdir(uploadsDir, { recursive: true });

  // Generate unique filename
  const fileExtension = path.extname(imageFile.name);
  const fileName = `${contractorId}-${uuidv4()}${fileExtension}`;
  const filePath = path.join(uploadsDir, fileName);

  // Write file
  await writeFile(filePath, imageBuffer);

  // Return public URL
  return `/uploads/complaints/${fileName}`;
}