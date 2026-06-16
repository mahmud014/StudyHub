import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    const where: Prisma.NoticeWhereInput = {};
    if (!showAll) where.isActive = true;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const notices = await db.notice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Sort pinned notices first
    const sorted = notices.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    return NextResponse.json({ success: true, data: sorted });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { success: false, error: 'নোটিশ লোড করতে সমস্যা হয়েছে' },
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
    const { title, titleBn, content, type, priority, category, pinned, isActive } = body as {
      title: string;
      titleBn: string;
      content: string;
      type?: string;
      priority?: string;
      category?: string;
      pinned?: boolean;
      isActive?: boolean;
    };

    if (!title || !titleBn || !content) {
      return NextResponse.json(
        { success: false, error: 'শিরোনাম ও বিষয়বস্তু প্রয়োজন' },
        { status: 400 }
      );
    }

    const notice = await db.notice.create({
      data: {
        title,
        titleBn,
        content,
        type: type || 'general',
        priority: priority || 'সাধারণ',
        category: category || 'সাধারণ',
        pinned: pinned ?? false,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { success: false, error: 'নোটিশ তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
