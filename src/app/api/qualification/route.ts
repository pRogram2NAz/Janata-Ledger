import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { QualificationStatus } from '@prisma/client';

// Submit contractor qualification (certificate, skills, experience)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contractorId,
      certificateUrl,
      certificateNumber,
      issuedDate,
      expiryDate,
      issuingAuthority,
      skills,
      experienceYears,
      experienceDetails
    } = body;

    // Validate contractor exists and is a contractor
    const contractor = await db.user.findUnique({
      where: { id: contractorId, role: 'CONTRACTOR' }
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    // Check if qualification already exists
    const existingQualification = await db.contractorQualification.findUnique({
      where: { contractorId }
    });

    if (existingQualification) {
      return NextResponse.json(
        { error: 'Qualification already submitted. Please wait for review.' },
        { status: 400 }
      );
    }

    // Calculate initial rating based on certificate and experience
    let initialRating = 0.0;

    // Rating calculation (harder to gain points)
    if (certificateUrl && certificateNumber) {
      initialRating += 2.0; // Certificate gives 2.0 points
    }

    if (experienceYears) {
      // Experience: 0.5 points per year, max 2.0 points (4+ years)
      initialRating += Math.min(experienceYears * 0.5, 2.0);
    }

    if (skills) {
      // Skills: up to 1.0 point based on skill count and relevance
      const skillArray = JSON.parse(skills);
      initialRating += Math.min(skillArray.length * 0.2, 1.0);
    }

    // Maximum initial rating without test is 5.0
    initialRating = Math.min(initialRating, 5.0);

    // Create qualification record
    const qualification = await db.contractorQualification.create({
      data: {
        contractorId,
        certificateUrl,
        certificateNumber,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuingAuthority,
        skills,
        experienceYears: experienceYears || 0,
        experienceDetails,
        initialRating,
        status: QualificationStatus.UNDER_REVIEW
      }
    });

    // Update contractor's initial rating
    const existingRating = await db.contractorRating.findUnique({
      where: { contractorId }
    });

    if (existingRating) {
      await db.contractorRating.update({
        where: { contractorId },
        data: {
          overallRating: initialRating,
          isBelowMinimum: initialRating < 3.8,
          lastUpdated: new Date()
        }
      });
    } else {
      await db.contractorRating.create({
        data: {
          contractorId,
          overallRating: initialRating,
          planRating: initialRating,
          reportQuality: initialRating,
          paymentHistory: initialRating,
          workerManagement: initialRating,
          qualityOfWork: initialRating,
          durabilityScore: initialRating,
          pointsGained: initialRating,
          isBelowMinimum: initialRating < 3.8
        }
      });
    }

    // Update contractor progress
    const existingProgress = await db.contractorProgress.findUnique({
      where: { contractorId }
    });

    if (existingProgress) {
      await db.contractorProgress.update({
        where: { contractorId },
        data: {
          currentRating: initialRating,
          canBidMedium: initialRating >= 3.8,
          canBidLarge: initialRating >= 4.0,
          isSuspended: initialRating < 3.8,
          suspendedReason: initialRating < 3.8
            ? 'Rating below minimum threshold of 3.8'
            : null,
          suspendedAt: initialRating < 3.8 ? new Date() : null,
          lastUpdated: new Date()
        }
      });
    } else {
      await db.contractorProgress.create({
        data: {
          contractorId,
          currentRating: initialRating,
          canBidMedium: initialRating >= 3.8,
          canBidLarge: initialRating >= 4.0,
          canBidSmall: true,
          isSuspended: initialRating < 3.8,
          suspendedReason: initialRating < 3.8
            ? 'Rating below minimum threshold of 3.8'
            : null,
          suspendedAt: initialRating < 3.8 ? new Date() : null
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Qualification submitted for review',
      qualification,
      initialRating
    }, { status: 201 });

  } catch (error) {
    console.error('Submit qualification error:', error);
    return NextResponse.json(
      { error: 'Failed to submit qualification' },
      { status: 500 }
    );
  }
}

// Get qualification by contractor ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractorId = searchParams.get('contractorId');

    if (!contractorId) {
      return NextResponse.json(
        { error: 'Contractor ID is required' },
        { status: 400 }
      );
    }

    const qualification = await db.contractorQualification.findUnique({
      where: { contractorId },
      include: {
        contractor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, qualification });

  } catch (error) {
    console.error('Get qualification error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch qualification' },
      { status: 500 }
    );
  }
}
