import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { IssueCategory } from '@prisma/client';

// Calculate rating penalty for contractor fault issues
function calculateIssuePenalty(category: IssueCategory, severity: string): number {
  if (category === 'NATURAL_DISASTER') {
    return 0; // Natural disasters don't affect rating
  }

  const severityMultiplier: any = {
    LOW: 0.5,
    MEDIUM: 1.0,
    HIGH: 1.5,
    CRITICAL: 2.0
  };

  return severityMultiplier[severity] || 1.0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, contractorId, citizenId, title, description, category, issueDate, issueType, severity, location, photos } = body;

    if (!contractId || !contractorId || !citizenId || !title || !category || !issueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: {
        contractor: {
          include: {
            contractorRating: true
          }
        }
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const contractor = await db.user.findUnique({ where: { id: contractorId, role: 'CONTRACTOR' } });
    const citizen = await db.user.findUnique({ where: { id: citizenId, role: 'CITIZEN' } });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    if (!citizen) {
      return NextResponse.json({ error: 'Citizen not found' }, { status: 404 });
    }

    if (category === 'CONTRACTOR_FAULT' && !photos) {
      return NextResponse.json({ error: 'Photos are required for contractor fault reports' }, { status: 400 });
    }

    // Calculate penalty for contractor fault
    let penalty = 0;
    if (category === 'CONTRACTOR_FAULT') {
      penalty = calculateIssuePenalty(category, severity);

      // More penalty for durability issues (road failing before expected lifespan)
      if (contract.actualLifespanStart && contract.expectedLifespanYears) {
        const daysSinceCompletion = Math.floor(
          (Date.now() - contract.actualLifespanStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        const expectedDays = contract.expectedLifespanYears * 365;

        if (daysSinceCompletion < expectedDays * 0.5) {
          penalty *= 2; // Double penalty if failing before 50% of expected lifespan
        }
      }

      await db.contractorRating.update({
        where: { contractorId },
        data: {
          overallRating: Math.max(0, contract.contractor!.contractorRating.overallRating - penalty),
          durabilityScore: Math.max(0, contract.contractor!.contractorRating.durabilityScore - penalty * 0.5),
          pointsLost: contract.contractor!.contractorRating.pointsLost + penalty,
          isBelowMinimum: Math.max(0, contract.contractor!.contractorRating.overallRating - penalty) < 3.8,
          lastUpdated: new Date()
        }
      });

      await db.contractorProgress.update({
        where: { contractorId },
        data: {
          currentRating: Math.max(0, contract.contractor!.contractorRating.overallRating - penalty),
          canBidMedium: Math.max(0, contract.contractor!.contractorRating.overallRating - penalty) >= 3.8,
          canBidLarge: Math.max(0, contract.contractor!.contractorRating.overallRating - penalty) >= 4.0,
          canBidSmall: Math.max(0, contract.contractor!.contractorRating.overallRating - penalty) >= 3.8,
          isSuspended: Math.max(0, contract.contractor!.contractorRating.overallRating - penalty) < 3.8,
          suspendedReason: Math.max(0, contract.contractor!.contractorRating.overallRating - penalty) < 3.8
            ? 'Rating below minimum threshold of 3.8 due to quality issues'
            : null,
          lastUpdated: new Date()
        }
      });
    }

    const issueReport = await db.issueReport.create({
      data: {
        contractId,
        contractorId,
        citizenId,
        title,
        description,
        category,
        issueDate: new Date(issueDate),
        issueType,
        severity,
        location,
        photos: photos ? JSON.stringify(photos) : null,
        status: category === 'NATURAL_DISASTER' ? 'PENDING' : 'UNDER_REVIEW',
        isForgivenessRequest: category === 'NATURAL_DISASTER'
      }
    });

    return NextResponse.json({
      success: true,
      message: category === 'NATURAL_DISASTER'
        ? 'Issue report submitted. Will be reviewed for forgiveness eligibility.'
        : 'Issue report submitted. Contractor rating updated.',
      issueReport,
      penalty: category === 'CONTRACTOR_FAULT' ? penalty : 0
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit issue report' }, { status: 500 });
  }
}

// Approve/reject forgiveness request (for government)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueId, forgive, reviewedBy } = body;

    const issue = await db.issueReport.findUnique({
      where: { id: issueId },
      include: {
        contractor: {
          include: {
            contractorRating: true
          }
        }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue report not found' }, { status: 404 });
    }

    // Only natural disaster issues can be forgiven
    if (issue.category !== 'NATURAL_DISASTER') {
      return NextResponse.json({ error: 'Only natural disaster issues can be forgiven' }, { status: 400 });
    }

    if (forgive) {
      // Approve forgiveness - no rating impact
      await db.issueReport.update({
        where: { id: issueId },
        data: {
          forgivenessApproved: true,
          forgivenessApprovedBy: reviewedBy,
          forgivenessApprovedAt: new Date(),
          status: 'APPROVED'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Forgiveness approved. Contractor rating remains unchanged.',
        issue
      });
    } else {
      // Reject forgiveness - treat as contractor fault
      const penalty = calculateIssuePenalty('CONTRACTOR_FAULT', issue.severity);
      const currentRating = issue.contractor!.contractorRating;

      await db.contractorRating.update({
        where: { contractorId: issue.contractorId },
        data: {
          overallRating: Math.max(0, currentRating.overallRating - penalty),
          durabilityScore: Math.max(0, currentRating.durabilityScore - penalty * 0.5),
          pointsLost: currentRating.pointsLost + penalty,
          forgivenessCount: currentRating.forgivenessCount + 1,
          isBelowMinimum: Math.max(0, currentRating.overallRating - penalty) < 3.8,
          lastUpdated: new Date()
        }
      });

      await db.contractorProgress.update({
        where: { contractorId: issue.contractorId },
        data: {
          currentRating: Math.max(0, currentRating.overallRating - penalty),
          canBidMedium: Math.max(0, currentRating.overallRating - penalty) >= 3.8,
          canBidLarge: Math.max(0, currentRating.overallRating - penalty) >= 4.0,
          canBidSmall: Math.max(0, currentRating.overallRating - penalty) >= 3.8,
          isSuspended: Math.max(0, currentRating.overallRating - penalty) < 3.8,
          lastUpdated: new Date()
        }
      });

      await db.issueReport.update({
        where: { id: issueId },
        data: {
          forgivenessApproved: false,
          forgivenessApprovedBy: reviewedBy,
          forgivenessApprovedAt: new Date(),
          status: 'REJECTED'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Forgiveness rejected. Penalty applied to contractor rating.',
        penalty
      });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Failed to review forgiveness request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const contractorId = searchParams.get('contractorId');
    const citizenId = searchParams.get('citizenId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const issues = await db.issueReport.findMany({
      where: {
        ...(contractId && { contractId }),
        ...(contractorId && { contractorId }),
        ...(citizenId && { citizenId }),
        ...(category && { category: category as IssueCategory }),
        ...(status && { status })
      },
      include: {
        contract: {
          select: { id: true, title: true, location: true }
        },
        contractor: {
          select: { id: true, name: true }
        },
        citizen: {
          select: { id: true, name: true }
        }
      },
      orderBy: { issueDate: 'desc' }
    });

    return NextResponse.json({ success: true, issues });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch issue reports' }, { status: 500 });
  }
}
