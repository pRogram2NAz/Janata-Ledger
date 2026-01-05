import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;  // ← Await params
    const body = await request.json();
    const { contractorId, assignedBy } = body;

    if (!contractorId) {
      return NextResponse.json({ error: 'Contractor ID is required' }, { status: 400 });
    }

    // Get the contract
    const contract = await db.contract.findUnique({
      where: { id }  // ← Use id instead of params.id
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.contractorId) {
      return NextResponse.json({ error: 'Contract already has an assigned contractor' }, { status: 400 });
    }

    // ... rest of the code, replace params.id with id ...

    // Assign contractor
    const updatedContract = await db.contract.update({
      where: { id },  // ← Use id
      data: {
        contractorId,
        status: 'IN_PROGRESS',
      },
      include: {
        contractor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Contractor assigned successfully',
      contract: updatedContract 
    });

  } catch (error) {
    console.error('Assignment error:', error);
    return NextResponse.json({ error: 'Failed to assign contractor' }, { status: 500 });
  }
}