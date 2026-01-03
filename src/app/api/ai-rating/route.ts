import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractorId } = body;

    if (!contractorId) {
      return NextResponse.json({ error: 'Contractor ID is required' }, { status: 400 });
    }

    const contractor = await db.user.findUnique({
      where: { id: contractorId, role: 'CONTRACTOR' },
      include: {
        contracts: {
          include: {
            dailyPlans: {
              include: {
                workReports: true
              }
            },
            paymentRequests: true
          }
        },
        contractorRating: true
      }
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const rating = contractor.contractorRating;

    return NextResponse.json({
      success: true,
      message: 'AI rating calculation placeholder',
      note: 'You will integrate your AI model here to analyze contractor performance',
      rating: rating,
      contractorData: {
        totalContracts: contractor.contracts.length,
        activeContracts: contractor.contracts.filter(c => c.contract.status === 'IN_PROGRESS').length,
        completedContracts: contractor.contracts.filter(c => c.contract.status === 'COMPLETED').length,
        totalPlans: contractor.contracts.reduce((sum, c) => sum + c.dailyPlans.length, 0),
        totalReports: contractor.contracts.reduce((sum, c) => sum + c.dailyPlans.reduce((rSum, dp) => rSum + dp.workReports.length, 0), 0),
        totalPaymentRequests: contractor.contracts.reduce((sum, c) => sum + c.paymentRequests.length, 0)
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate AI rating' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractorId = searchParams.get('contractorId');

    if (!contractorId) {
      return NextResponse.json({ error: 'Contractor ID is required' }, { status: 400 });
    }

    const rating = await db.contractorRating.findUnique({
      where: { contractorId }
    });

    if (!rating) {
      return NextResponse.json({ error: 'Rating not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, rating });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI rating' }, { status: 500 });
  }
}
