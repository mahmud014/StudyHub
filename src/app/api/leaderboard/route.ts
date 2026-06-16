import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');

    const where: { week?: string } = {};
    if (week) where.week = week;

    // Get the latest week if not specified
    let targetWeek = week;
    if (!targetWeek) {
      const latestEntry = await db.leaderboardEntry.findFirst({
        orderBy: { week: 'desc' },
        select: { week: true },
      });
      if (latestEntry) {
        targetWeek = latestEntry.week;
        where.week = targetWeek;
      }
    }

    const entries = await db.leaderboardEntry.findMany({
      where,
      orderBy: { rank: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        week: targetWeek,
        entries,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'লিডারবোর্ড লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
