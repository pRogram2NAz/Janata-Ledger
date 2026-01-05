import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const issues = await db.issueReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        contract: {
          select: {
            id: true,
            title: true,
          }
        },
        citizen: {
          select: {
            id: true,
            name: true,
          }
        },
        contractor: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error("[ISSUES_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}