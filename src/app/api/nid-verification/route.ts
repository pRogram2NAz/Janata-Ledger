// Updated API route for NID Verification
// Save as: src/app/api/nid-verification/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      citizenId, 
      nidNumber, 
      fullName, 
      dob, 
      district, 
      municipality, 
      wardNumber,
      nidPhotoUrl 
    } = body;

    // Validate required fields
    if (!citizenId || !nidNumber || !fullName) {
      return NextResponse.json(
        { error: 'Citizen ID, NID number, and full name are required' }, 
        { status: 400 }
      );
    }

    // Check if this citizen already has a verification
    const existingVerification = await db.nIDVerification.findFirst({
      where: { citizenId }
    });

    if (existingVerification) {
      return NextResponse.json(
        { error: 'Citizen already has a verification record' }, 
        { status: 409 }
      );
    }

    // Check if the NID is already verified by someone else
    const nidUsedByOther = await db.nIDVerification.findFirst({
      where: { 
        nidNumber,
        citizenId: { not: citizenId }
      }
    });

    if (nidUsedByOther) {
      return NextResponse.json(
        { error: 'This NID is already verified by another user' }, 
        { status: 409 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: citizenId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Create or update NID verification
    const verification = await db.nIDVerification.upsert({
      where: { 
        nidNumber // This will create if doesn't exist, update if exists
      },
      create: {
        citizenId,
        nidNumber,
        fullName,
        dob: dob || '',
        district: district || '',
        municipality: municipality || '',
        wardNumber: wardNumber || 0,
        nidPhotoUrl: nidPhotoUrl || null,
        verified: false
      },
      update: {
        citizenId,
        fullName,
        dob: dob || '',
        district: district || '',
        municipality: municipality || '',
        wardNumber: wardNumber || 0,
        nidPhotoUrl: nidPhotoUrl || null
      }
    });

    // Update user's NID number if not already set
    if (!user.nidNumber) {
      await db.user.update({
        where: { id: citizenId },
        data: { nidNumber }
      });
    }

    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        nidNumber: verification.nidNumber,
        verified: verification.verified
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('NID Verification Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify NID', details: error.message }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const citizenId = searchParams.get('citizenId');
    const nidNumber = searchParams.get('nidNumber');

    if (!citizenId && !nidNumber) {
      return NextResponse.json(
        { error: 'citizenId or nidNumber is required' }, 
        { status: 400 }
      );
    }

    const verification = await db.nIDVerification.findFirst({
      where: {
        ...(citizenId && { citizenId }),
        ...(nidNumber && { nidNumber })
      },
      include: {
        citizen: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verification
    });

  } catch (error: any) {
    console.error('Fetch Verification Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification' }, 
      { status: 500 }
    );
  }
}