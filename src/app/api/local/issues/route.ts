import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const issues = await db.issueReport.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        contract: {
          select: {
            id: true,
            title: true
          }
        },
        contractor: {
          select: {
            id: true,
            name: true
          }
        },
        citizen: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Issues API error:', error);
    return NextResponse.json({ issues: [] }, { status: 200 });
  }
}