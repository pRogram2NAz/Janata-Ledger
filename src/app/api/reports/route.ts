import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, contractorId, dailyPlanId, reportDate, workSummary, hoursWorked, workersUsed, progress, photos } = body;

    if (!contractId || !contractorId || !reportDate || !workSummary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contract = await db.contract.findUnique({ where: { id: contractId } });
    if (!contract || contract.contractorId !== contractorId) {
      return NextResponse.json({ error: 'Invalid contract or contractor' }, { status: 400 });
    }

    const workReport = await db.workReport.create({
      data: {
        contractId,
        contractorId,
        dailyPlanId,
        reportDate: new Date(reportDate),
        workSummary,
        hoursWorked: parseFloat(hoursWorked) || 0,
        workersUsed: workersUsed ? parseInt(workersUsed) : 0,
        progress: parseFloat(progress) || 0,
        photos: photos ? JSON.stringify(photos) : null
      }
    });

    return NextResponse.json({ success: true, workReport }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create work report' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const contractorId = searchParams.get('contractorId');
    const dailyPlanId = searchParams.get('dailyPlanId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const workReports = await db.workReport.findMany({
      where: {
        ...(contractId && { contractId }),
        ...(contractorId && { contractorId }),
        ...(dailyPlanId && { dailyPlanId }),
        ...(startDate && {
          reportDate: { gte: new Date(startDate) }
        }),
        ...(endDate && {
          reportDate: { lte: new Date(endDate) }
        })
      },
      include: {
        contract: { select: { id: true, title: true, location: true } },
        contractor: { select: { id: true, name: true } },
        dailyPlan: { select: { id: true, plannedWork: true, workers: true } }
      },
      orderBy: { reportDate: 'desc' }
    });

    return NextResponse.json({ success: true, workReports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch work reports' }, { status: 500 });
  }
}
