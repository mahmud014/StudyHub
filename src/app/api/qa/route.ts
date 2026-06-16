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

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: { subjectId?: string } = {};
    if (subjectId) where.subjectId = subjectId;

    const [questions, total] = await Promise.all([
      db.qAQuestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
          subject: {
            select: { id: true, name: true, nameBn: true },
          },
          _count: {
            select: { answers: true },
          },
        },
      }),
      db.qAQuestion.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching QA questions:', error);
    return NextResponse.json(
      { success: false, error: 'প্রশ্ন লোড করতে সমস্যা হয়েছে' },
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
      subjectId?: string;
      title: string;
      content: string;
    };
    const { subjectId, title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'title এবং content প্রয়োজন' },
        { status: 400 }
      );
    }

    const question = await db.qAQuestion.create({
      data: {
        userId,
        subjectId: subjectId || null,
        title,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        subject: {
          select: { id: true, name: true, nameBn: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: question }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { success: false, error: 'প্রশ্ন তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
