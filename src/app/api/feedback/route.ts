import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id || null;

    const body = await request.json();
    const { type, subject, rating, title, description } = body;

    if (!type || !rating || !description) {
      return NextResponse.json(
        { success: false, error: 'প্রয়োজনীয় ফিল্ড পূরণ করুন' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে' },
        { status: 400 }
      );
    }

    // Store feedback as a notice with type 'feedback' since we don't have a dedicated Feedback model
    // This allows feedback to be persisted in the database
    const feedbackNotice = await db.notice.create({
      data: {
        title: title || `ফিডব্যাক - ${type}`,
        titleBn: title || `ফিডব্যাক - ${type}`,
        content: JSON.stringify({
          userId: userId || null,
          type,
          subject: subject || null,
          rating,
          description,
          isFeedback: true,
        }),
        type: 'feedback',
        priority: 'সাধারণ',
        category: type,
        pinned: false,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: feedbackNotice.id,
        type,
        subject: subject || null,
        rating,
        title: title || null,
        description,
        createdAt: feedbackNotice.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'ফিডব্যাক জমা দিতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'teacher')) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch feedback stored as notices with type 'feedback'
    const feedbackNotices = await db.notice.findMany({
      where: { type: 'feedback', isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const feedbackList = feedbackNotices.map((notice) => {
      let parsed = {};
      try {
        parsed = JSON.parse(notice.content);
      } catch {
        parsed = { description: notice.content };
      }

      return {
        id: notice.id,
        rating: (parsed as Record<string, unknown>).rating as number || 0,
        category: notice.category || 'অন্যান্য',
        text: ((parsed as Record<string, unknown>).description as string) || notice.content,
        date: notice.createdAt.toLocaleDateString('bn-BD'),
        anonymous: !((parsed as Record<string, unknown>).userId),
        author: (parsed as Record<string, unknown>).userId ? 'ব্যবহারকারী' : 'বেনামী ব্যবহারকারী',
      };
    });

    return NextResponse.json({
      success: true,
      data: feedbackList,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'ফিডব্যাক লোড করতে সমস্যা' },
      { status: 500 }
    );
  }
}
