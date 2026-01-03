import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        nidNumber: true,
        createdAt: true,
        contractorRating: true,
        contractorProgress: true,
        contracts: {
          include: {
            contract: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, phone, address } = body;

    const user = await db.user.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        address
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true
      }
    });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
