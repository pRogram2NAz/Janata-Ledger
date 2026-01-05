import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const contractors = await db.user.findMany({
      where: {
        role: 'CONTRACTOR',
      },
      include: {
        contractorRating: true,
        contractorProgress: true,
        contractorQualification: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(contractors);
  } catch (error) {
    console.error('[CONTRACTORS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}