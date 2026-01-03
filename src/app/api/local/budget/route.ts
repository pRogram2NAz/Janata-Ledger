// Save as: src/app/api/local/budget/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all contracts for budget calculation
    const contracts = await db.contract.findMany({
      include: {
        paymentRequests: true
      }
    });

    const allocated = contracts.reduce((sum, c) => sum + c.budget, 0);
    const spent = contracts.reduce((sum, c) => {
      return sum + c.paymentRequests
        .filter(p => p.status === 'PAID')
        .reduce((psum, p) => psum + p.amount, 0);
    }, 0);

    return NextResponse.json({
      allocated,
      spent,
      remaining: allocated - spent
    });
  } catch (error) {
    console.error('Budget API error:', error);
    return NextResponse.json(
      { allocated: 0, spent: 0, remaining: 0 },
      { status: 200 }
    );
  }
}