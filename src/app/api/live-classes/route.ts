import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const status = searchParams.get('status');

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (status) where.status = status;

    const classes = await db.liveClass.findMany({
      where,
      include: { subject: true },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch live classes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'teacher')) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const liveClass = await db.liveClass.create({ data: body });
    return NextResponse.json({ success: true, data: liveClass });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create live class' }, { status: 500 });
  }
}
