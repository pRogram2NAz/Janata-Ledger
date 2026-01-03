import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContractSize, ContractStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, budget, startDate, endDate, size, location, governmentId } = body;

    if (!title || !description || !budget || !startDate || !governmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const government = await db.user.findUnique({
      where: { id: governmentId, role: 'LOCAL_GOVERNMENT' }
    });

    if (!government) {
      return NextResponse.json({ error: 'Invalid government user' }, { status: 403 });
    }

    const contract = await db.contract.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        size: size || ContractSize.MEDIUM,
        location,
        governmentId,
        status: ContractStatus.PENDING
      }
    });

    return NextResponse.json({
      success: true,
      contract
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const governmentId = searchParams.get('governmentId');
    const contractorId = searchParams.get('contractorId');
    const status = searchParams.get('status');
    const size = searchParams.get('size');

    const contracts = await db.contract.findMany({
      where: {
        ...(governmentId && { governmentId }),
        ...(contractorId && { contractorId }),
        ...(status && { status: status as ContractStatus }),
        ...(size && { size: size as ContractSize })
      },
      include: {
        government: { select: { id: true, name: true, email: true } },
        contractor: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            paymentRequests: true,
            dailyPlans: true,
            workReports: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, contracts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}
