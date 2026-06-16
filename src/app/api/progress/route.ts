import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 401 }
      );
    }
    const userId = sessionUser.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: { userId: string; type?: string } = { userId };
    if (type) where.type = type;

    const progress = await db.progress.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { success: false, error: 'অগ্রগতি লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 401 }
      );
    }
    const userId = sessionUser.id;

    const body = await request.json() as {
      type: string;
      refId: string;
      progress: number;
    };
    const { type, refId, progress: progressValue } = body;

    if (!type || !refId || progressValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'type, refId এবং progress প্রয়োজন' },
        { status: 400 }
      );
    }

    if (progressValue < 0 || progressValue > 100) {
      return NextResponse.json(
        { success: false, error: 'progress মান ০ থেকে ১০০ এর মধ্যে হতে হবে' },
        { status: 400 }
      );
    }

    // Upsert progress
    const existing = await db.progress.findFirst({
      where: { userId, type, refId },
    });

    let result;
    if (existing) {
      result = await db.progress.update({
        where: { id: existing.id },
        data: { progress: progressValue },
      });
    } else {
      result = await db.progress.create({
        data: { userId, type, refId, progress: progressValue },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { success: false, error: 'অগ্রগতি সংরক্ষণ করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
