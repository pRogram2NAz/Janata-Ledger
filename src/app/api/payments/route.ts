import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaymentStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, requesterId, amount, reason, workPeriod, materials, materialProof } = body;

    if (!contractId || !requesterId || !amount || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { contractor: true }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.contractorId !== requesterId) {
      return NextResponse.json({ error: 'Only assigned contractor can request payment' }, { status: 403 });
    }

    const paymentRequest = await db.paymentRequest.create({
      data: {
        contractId,
        requesterId,
        amount: parseFloat(amount),
        reason,
        workPeriod,
        materials: materials ? JSON.stringify(materials) : null,
        materialProof,
        status: PaymentStatus.PENDING
      },
      include: {
        contract: { select: { id: true, title: true, budget: true } },
        requester: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json({ success: true, paymentRequest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payment request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const requesterId = searchParams.get('requesterId');
    const status = searchParams.get('status');

    const paymentRequests = await db.paymentRequest.findMany({
      where: {
        ...(contractId && { contractId }),
        ...(requesterId && { requesterId }),
        ...(status && { status: status as PaymentStatus })
      },
      include: {
        contract: {
          select: { id: true, title: true, budget: true, location: true }
        },
        requester: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, paymentRequests });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment requests' }, { status: 500 });
  }
}
