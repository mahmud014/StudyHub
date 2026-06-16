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
    const { title, titleBn, subjectId, youtubeId, scheduledAt, duration, status, hostName, description } = body as {
      title?: string;
      titleBn?: string;
      subjectId?: string;
      youtubeId?: string;
      scheduledAt?: string;
      duration?: number;
      status?: string;
      hostName?: string;
      description?: string | null;
    };

    const existing = await db.liveClass.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'লাইভ ক্লাস পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const liveClass = await db.liveClass.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(titleBn !== undefined && { titleBn }),
        ...(subjectId !== undefined && { subjectId }),
        ...(youtubeId !== undefined && { youtubeId }),
        ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
        ...(duration !== undefined && { duration }),
        ...(status !== undefined && { status }),
        ...(hostName !== undefined && { hostName }),
        ...(description !== undefined && { description }),
      },
      include: {
        subject: { select: { id: true, name: true, nameBn: true, color: true } }
      }
    });

    return NextResponse.json({ success: true, data: liveClass });
  } catch (error) {
    console.error('Error updating live class:', error);
    return NextResponse.json(
      { success: false, error: 'লাইভ ক্লাস আপডেট করতে সমস্যা হয়েছে' },
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
    const { status } = body as { status: string };

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'স্ট্যাটাস প্রয়োজন' },
        { status: 400 }
      );
    }

    const existing = await db.liveClass.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'লাইভ ক্লাস পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const liveClass = await db.liveClass.update({
      where: { id },
      data: { status },
      include: {
        subject: { select: { id: true, name: true, nameBn: true, color: true } }
      }
    });

    return NextResponse.json({ success: true, data: liveClass });
  } catch (error) {
    console.error('Error patching live class:', error);
    return NextResponse.json(
      { success: false, error: 'লাইভ ক্লাস স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' },
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

    const existing = await db.liveClass.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'লাইভ ক্লাস পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    await db.liveClass.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: 'লাইভ ক্লাস মুছে ফেলা হয়েছে' } });
  } catch (error) {
    console.error('Error deleting live class:', error);
    return NextResponse.json(
      { success: false, error: 'লাইভ ক্লাস মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
