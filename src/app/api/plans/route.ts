import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, contractorId, planDate, plannedWork, workers, materials, estimatedCosts } = body;

    if (!contractId || !contractorId || !planDate || !plannedWork) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contract = await db.contract.findUnique({ where: { id: contractId } });
    if (!contract || contract.contractorId !== contractorId) {
      return NextResponse.json({ error: 'Invalid contract or contractor' }, { status: 400 });
    }

    const dailyPlan = await db.dailyPlan.create({
      data: {
        contractId,
        contractorId,
        planDate: new Date(planDate),
        plannedWork,
        workers: workers ? parseInt(workers) : 0,
        materials: materials ? JSON.stringify(materials) : null,
        estimatedCosts
      }
    });

    return NextResponse.json({ success: true, dailyPlan }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create daily plan' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const contractorId = searchParams.get('contractorId');
    const date = searchParams.get('date');

    const dailyPlans = await db.dailyPlan.findMany({
      where: {
        ...(contractId && { contractId }),
        ...(contractorId && { contractorId }),
        ...(date && {
          planDate: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
          }
        })
      },
      include: {
        contract: { select: { id: true, title: true, location: true } },
        contractor: { select: { id: true, name: true } },
        workReports: {
          select: {
            id: true,
            workSummary: true,
            hoursWorked: true,
            workersUsed: true,
            progress: true
          }
        }
      },
      orderBy: { planDate: 'desc' }
    });

    return NextResponse.json({ success: true, dailyPlans });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch daily plans' }, { status: 500 });
  }
}
