import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, nidNumber, phone, address } = body;

    console.log('=== LOGIN/REGISTRATION ATTEMPT ===');
    console.log('Role:', role);
    console.log('Email:', email);

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({ 
      where: { email },
      include: {
        contractorRating: true,
        contractorProgress: true
      }
    });

    if (existingUser) {
      // User exists - LOGIN
      if (existingUser.role !== role) {
        return NextResponse.json({ 
          error: `This email is registered as ${existingUser.role}. Please select the correct role.` 
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          nidNumber: existingUser.nidNumber,
          phone: existingUser.phone,
          address: existingUser.address
        }
      }, { status: 200 });
    }

    // User doesn't exist - REGISTER
    if (role === 'CITIZEN' && !nidNumber) {
      return NextResponse.json({ error: 'NID number is required for citizens' }, { status: 400 });
    }

    const user = await db.user.create({
      data: { email, name, role, nidNumber, phone, address }
    });

    if (role === 'CONTRACTOR') {
      await db.contractorRating.create({
        data: {
          contractorId: user.id,
          overallRating: 0.0,
          planRating: 0.0,
          reportQuality: 0.0,
          paymentHistory: 0.0,
          workerManagement: 0.0,
          qualityOfWork: 0.0,
          durabilityScore: 0.0
        }
      });

      await db.contractorProgress.create({
        data: {
          contractorId: user.id,
          currentRating: 0.0,
          canBidLarge: false,
          canBidMedium: false,
          canBidSmall: true,
          isSuspended: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        nidNumber: user.nidNumber,
        phone: user.phone,
        address: user.address
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    console.error('========================');
    
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const email = searchParams.get('email');

    const users = await db.user.findMany({
      where: {
        ...(role && { role: role as UserRole }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nidNumber: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Update user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, nidNumber, phone, address, name } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(nidNumber !== undefined && { nidNumber }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(name !== undefined && { name })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nidNumber: true,
        phone: true,
        address: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error: any) {
  console.error('=== REGISTRATION ERROR ===');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  console.error('Full error:', error);
  console.error('========================');
  
  return NextResponse.json({ 
    error: 'Failed to register user',
    details: error.message,
    code: error.code
  }, { status: 500 });
}
}