import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const chapterId = searchParams.get('chapterId');

    const where: {
      subjectId?: string;
      chapterId?: string;
    } = {};

    if (subjectId) where.subjectId = subjectId;
    if (chapterId) where.chapterId = chapterId;

    const videos = await db.video.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        subject: {
          select: { id: true, name: true, nameBn: true },
        },
        chapter: {
          select: { id: true, name: true, nameBn: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, error: 'ভিডিও লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'teacher')) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subjectId, chapterId, title, titleBn, youtubeId, duration, order } = body as {
      subjectId: string;
      chapterId?: string;
      title: string;
      titleBn: string;
      youtubeId: string;
      duration?: number;
      order?: number;
    };

    if (!subjectId || !title || !titleBn || !youtubeId) {
      return NextResponse.json(
        { success: false, error: 'বিষয়, শিরোনাম ও ইউটিউব আইডি প্রয়োজন' },
        { status: 400 }
      );
    }

    const video = await db.video.create({
      data: {
        subjectId,
        chapterId: chapterId || null,
        title,
        titleBn,
        youtubeId,
        duration: duration || null,
        order: order || 0,
      },
      include: {
        subject: { select: { id: true, name: true, nameBn: true } },
        chapter: { select: { id: true, name: true, nameBn: true } },
      },
    });

    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { success: false, error: 'ভিডিও তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
