import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await db.note.findUnique({
      where: { id },
      include: {
        subject: {
          select: { id: true, name: true, nameBn: true },
        },
        chapter: {
          select: { id: true, name: true, nameBn: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'নোট পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { success: false, error: 'নোট লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

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
    const { subjectId, chapterId, title, titleBn, content, type, order, pdfUrl } = body as {
      subjectId?: string;
      chapterId?: string | null;
      title?: string;
      titleBn?: string;
      content?: string;
      type?: string;
      order?: number;
      pdfUrl?: string | null;
    };

    // Check if note exists
    const existing = await db.note.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'নোট পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const note = await db.note.update({
      where: { id },
      data: {
        ...(subjectId !== undefined && { subjectId }),
        ...(chapterId !== undefined && { chapterId: chapterId || null }),
        ...(title !== undefined && { title }),
        ...(titleBn !== undefined && { titleBn }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
        ...(order !== undefined && { order }),
        ...(pdfUrl !== undefined && { pdfUrl: pdfUrl || null }),
      },
      include: {
        subject: { select: { id: true, name: true, nameBn: true } },
        chapter: { select: { id: true, name: true, nameBn: true } },
      },
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { success: false, error: 'নোট আপডেট করতে সমস্যা হয়েছে' },
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

    // Check if note exists
    const existing = await db.note.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'নোট পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    await db.note.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'নোট মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { success: false, error: 'নোট মুছে ফেলতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
