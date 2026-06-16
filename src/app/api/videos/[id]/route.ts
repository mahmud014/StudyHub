import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function PUT(
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
    const { subjectId, chapterId, title, titleBn, youtubeId, duration, order } = body as {
      subjectId?: string;
      chapterId?: string | null;
      title?: string;
      titleBn?: string;
      youtubeId?: string;
      duration?: number | null;
      order?: number;
    };

    // Check if video exists
    const existing = await db.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ভিডিও পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const video = await db.video.update({
      where: { id },
      data: {
        ...(subjectId !== undefined && { subjectId }),
        ...(chapterId !== undefined && { chapterId: chapterId || null }),
        ...(title !== undefined && { title }),
        ...(titleBn !== undefined && { titleBn }),
        ...(youtubeId !== undefined && { youtubeId }),
        ...(duration !== undefined && { duration: duration || null }),
        ...(order !== undefined && { order }),
      },
      include: {
        subject: { select: { id: true, name: true, nameBn: true } },
        chapter: { select: { id: true, name: true, nameBn: true } },
      },
    });

    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { success: false, error: 'ভিডিও আপডেট করতে সমস্যা হয়েছে' },
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

    // Check if video exists
    const existing = await db.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ভিডিও পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    await db.video.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: 'ভিডিও মুছে ফেলা হয়েছে' } });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { success: false, error: 'ভিডিও মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
