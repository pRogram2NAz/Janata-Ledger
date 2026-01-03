import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RatingStatus } from '@prisma/client';

// Smart rating calculation - harder to gain, easier to lose
function calculateRatingChange(
  currentRating: number,
  newRating: number,
  isForgiven: boolean = false
): { newOverallRating: number; pointsGained: number; pointsLost: number } {
  if (isForgiven) {
    return { newOverallRating: currentRating, pointsGained: 0, pointsLost: 0 };
  }

  const ratingDifference = newRating - currentRating;

  let pointsGained = 0;
  let pointsLost = 0;

  if (ratingDifference > 0) {
    // Positive: Only gain 50% of increase
    pointsGained = ratingDifference * 0.5;
  } else if (ratingDifference < 0) {
    // Negative: Lose 100% of decrease
    pointsLost = Math.abs(ratingDifference);
  }

  const newOverallRating = currentRating + pointsGained - pointsLost;
  const clampedRating = Math.max(0, Math.min(5, newOverallRating));

  return {
    newOverallRating: clampedRating,
    pointsGained: Math.round(pointsGained * 100) / 100,
    pointsLost: Math.round(pointsLost * 100) / 100
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, contractorId, citizenId, rating, comment, qualityRating, durabilityRating, timelinessRating, proofUrl, proofDescription } = body;

    if (!contractId || !contractorId || !citizenId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { contractor: true }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const contractor = await db.user.findUnique({
      where: { id: contractorId, role: 'CONTRACTOR' },
      include: { contractorRating: true }
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    if (contract.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Can only rate completed contracts' }, { status: 400 });
    }

    if (rating < 3.0 && !proofUrl) {
      return NextResponse.json({ error: 'Proof is required for negative ratings (< 3.0)' }, { status: 400 });
    }

    const currentRating = contractor.contractorRating;

    const ratingChange = calculateRatingChange(currentRating.overallRating, rating);

    const citizenRating = await db.citizenRating.create({
      data: {
        contractId,
        contractorId,
        citizenId,
        rating,
        comment,
        qualityRating,
        durabilityRating,
        timelinessRating,
        proofUrl,
        proofDescription,
        reportedDate: new Date(),
        issueDate: contract.actualLifespanStart || contract.endDate,
        timeSinceCompletionDays: contract.actualLifespanStart
          ? Math.floor((Date.now() - contract.actualLifespanStart.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        status: RatingStatus.PENDING
      }
    });

    await db.contractorRating.update({
      where: { contractorId },
      data: {
        overallRating: ratingChange.newOverallRating,
        qualityOfWork: qualityRating || currentRating.qualityOfWork,
        durabilityScore: durabilityRating || currentRating.durabilityScore,
        pointsGained: currentRating.pointsGained + ratingChange.pointsGained,
        pointsLost: currentRating.pointsLost + ratingChange.pointsLost,
        isBelowMinimum: ratingChange.newOverallRating < 3.8,
        lastUpdated: new Date()
      }
    });

    await db.contractorProgress.update({
      where: { contractorId },
      data: {
        currentRating: ratingChange.newOverallRating,
        canBidMedium: ratingChange.newOverallRating >= 3.8,
        canBidLarge: ratingChange.newOverallRating >= 4.0,
        canBidSmall: ratingChange.newOverallRating >= 3.8,
        isSuspended: ratingChange.newOverallRating < 3.8,
        suspendedReason: ratingChange.newOverallRating < 3.8 ? 'Rating below minimum threshold of 3.8' : null,
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      citizenRating,
      updatedRating: { overallRating: ratingChange.newOverallRating },
      ratingChange: { previous: currentRating.overallRating, new: ratingChange.newOverallRating, pointsGained: ratingChange.pointsGained, pointsLost: ratingChange.pointsLost }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const contractorId = searchParams.get('contractorId');
    const citizenId = searchParams.get('citizenId');
    const status = searchParams.get('status');

    const ratings = await db.citizenRating.findMany({
      where: {
        ...(contractId && { contractId }),
        ...(contractorId && { contractorId }),
        ...(citizenId && { citizenId }),
        ...(status && { status: status as RatingStatus })
      },
      include: {
        contract: { select: { id: true, title: true, location: true } },
        contractor: { select: { id: true, name: true } },
        citizen: { select: { id: true, name: true } }
      },
      orderBy: { reportedDate: 'desc' }
    });

    return NextResponse.json({ success: true, ratings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}
