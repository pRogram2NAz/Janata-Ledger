import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaymentStatus } from '@prisma/client';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, approvedBy, rejectionReason } = body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const paymentRequest = await db.paymentRequest.findUnique({
      where: { id: params.id },
      include: { contract: true }
    });

    if (!paymentRequest) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
    }

    const updatedData: any = {
      status,
      approvedBy,
      approvedAt: status === 'APPROVED' ? new Date() : null,
      rejectedAt: status === 'REJECTED' ? new Date() : null,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null
    };

    if (status === 'APPROVED') {
      updatedData.blockchainTxHash = 'PENDING_BLOCKCHAIN';
      updatedData.walletAddress = 'PENDING_WALLET';
    }

    const updatedPayment = await db.paymentRequest.update({
      where: { id: params.id },
      data: updatedData
    });

    return NextResponse.json({ success: true, paymentRequest: updatedPayment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentRequest = await db.paymentRequest.findUnique({
      where: { id: params.id },
      include: {
        contract: true,
        requester: true
      }
    });

    if (!paymentRequest) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, paymentRequest });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}
