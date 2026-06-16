import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const chapterId = searchParams.get('chapterId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: {
      subjectId?: string;
      chapterId?: string;
      type?: string;
      OR?: Array<{
        title?: { contains: string };
        titleBn?: { contains: string };
        content?: { contains: string };
      }>;
    } = {};

    if (subjectId) where.subjectId = subjectId;
    if (chapterId) where.chapterId = chapterId;
    if (type) where.type = type;

    // Search filter: search across title, titleBn, and content
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleBn: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      db.note.findMany({
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
        skip,
        take: limit,
      }),
      db.note.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { success: false, error: 'নোট লোড করতে সমস্যা হয়েছে' },
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
    const { subjectId, chapterId, title, titleBn, content, type, order, pdfUrl } = body as {
      subjectId: string;
      chapterId?: string;
      title: string;
      titleBn: string;
      content: string;
      type?: string;
      order?: number;
      pdfUrl?: string;
    };

    if (!subjectId || !title || !titleBn || !content) {
      return NextResponse.json(
        { success: false, error: 'বিষয়, শিরোনাম ও বিষয়বস্তু প্রয়োজন' },
        { status: 400 }
      );
    }

    const note = await db.note.create({
      data: {
        subjectId,
        chapterId: chapterId || null,
        title,
        titleBn,
        content,
        type: type || 'handnote',
        order: order || 0,
        pdfUrl: pdfUrl || null,
      },
      include: {
        subject: { select: { id: true, name: true, nameBn: true } },
        chapter: { select: { id: true, name: true, nameBn: true } },
      },
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { success: false, error: 'নোট তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
