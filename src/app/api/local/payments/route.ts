import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const payments = await db.paymentRequest.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        contract: {
          select: {
            id: true,
            title: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Payments API error:', error);
    return NextResponse.json({ payments: [] }, { status: 200 });
  }
}