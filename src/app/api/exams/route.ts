import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const chapterId = searchParams.get('chapterId');
    const showAll = searchParams.get('all') === 'true';

    const where: {
      subjectId?: string;
      chapterId?: string;
      isActive?: boolean;
    } = {};

    if (!showAll) where.isActive = true;
    if (subjectId) where.subjectId = subjectId;
    if (chapterId) where.chapterId = chapterId;

    const exams = await db.exam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        subject: {
          select: { id: true, name: true, nameBn: true },
        },
        chapter: {
          select: { id: true, name: true, nameBn: true },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { success: false, error: 'পরীক্ষা লোড করতে সমস্যা হয়েছে' },
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
    const { subjectId, chapterId, title, titleBn, duration, totalMarks, isActive } = body as {
      subjectId: string;
      chapterId?: string;
      title: string;
      titleBn: string;
      duration?: number;
      totalMarks?: number;
      isActive?: boolean;
    };

    if (!subjectId || !title || !titleBn) {
      return NextResponse.json(
        { success: false, error: 'বিষয় ও শিরোনাম প্রয়োজন' },
        { status: 400 }
      );
    }

    const exam = await db.exam.create({
      data: {
        subjectId,
        chapterId: chapterId || null,
        title,
        titleBn,
        duration: duration || 30,
        totalMarks: totalMarks || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        subject: { select: { id: true, name: true, nameBn: true } },
        chapter: { select: { id: true, name: true, nameBn: true } },
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { success: false, error: 'পরীক্ষা তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
