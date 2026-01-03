import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContractStatus, ContractSize } from '@prisma/client';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { contractorId, status, actualLifespanStart } = body;

    const contract = await db.contract.findUnique({ where: { id: params.id } });
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const updatedData: any = {};
    
    if (contractorId) {
      const contractor = await db.user.findUnique({ where: { id: contractorId, role: 'CONTRACTOR' } });
      if (!contractor) {
        return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
      }
      updatedData.contractorId = contractorId;
      if (!status || status === ContractStatus.PENDING) {
        updatedData.status = ContractStatus.APPROVED;
      }
    }

    if (status) {
      updatedData.status = status;
      if (status === ContractStatus.COMPLETED && !contract.actualLifespanStart) {
        updatedData.actualLifespanStart = new Date();
      }
    }

    const updatedContract = await db.contract.update({
      where: { id: params.id },
      data: updatedData
    });

    return NextResponse.json({ success: true, contract: updatedContract });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contract = await db.contract.findUnique({
      where: { id: params.id },
      include: {
        government: { select: { id: true, name: true, email: true } },
        contractor: { select: { id: true, name: true, email: true } },
        paymentRequests: true,
        dailyPlans: { include: { workReports: true } },
        workReports: true,
        citizenRatings: true,
        issueReports: true
      }
    });

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      budget, 
      startDate, 
      endDate, 
      size, 
      location, 
      expectedLifespanYears, 
      governmentId 
    } = body;

    // Validate required fields
    if (!title || !description || !budget || !startDate || !governmentId) {
      return NextResponse.json({ 
        error: 'Title, description, budget, start date, and government ID are required' 
      }, { status: 400 });
    }

    // Create contract
    const contract = await db.contract.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        size: size || ContractSize.MEDIUM,
        location: location || '',
        expectedLifespanYears: expectedLifespanYears || 10,
        governmentId,
        status: ContractStatus.PENDING
      },
      include: {
        government: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      contract 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create contract error:', error);
    return NextResponse.json({ 
      error: 'Failed to create contract',
      details: error.message 
    }, { status: 500 });
  }
}

