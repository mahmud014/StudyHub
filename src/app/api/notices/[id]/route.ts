import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notice = await db.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return NextResponse.json(
        { success: false, error: 'নোটিশ পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { success: false, error: 'নোটিশ লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'teacher')) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, titleBn, content, type, priority, category, pinned, isActive } = body as {
      title?: string;
      titleBn?: string;
      content?: string;
      type?: string;
      priority?: string;
      category?: string;
      pinned?: boolean;
      isActive?: boolean;
    };

    const notice = await db.notice.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(titleBn !== undefined && { titleBn }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
        ...(priority !== undefined && { priority }),
        ...(category !== undefined && { category }),
        ...(pinned !== undefined && { pinned }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json(
      { success: false, error: 'নোটিশ আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'teacher')) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await db.notice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: 'নোটিশ মুছে ফেলা হয়েছে' } });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      { success: false, error: 'নোটিশ মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
