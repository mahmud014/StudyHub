import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignment = await db.assignment.findUnique({
      where: { id },
      include: {
        subject: {
          select: { id: true, name: true, nameBn: true },
        },
        submissions: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'অ্যাসাইনমেন্ট পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { success: false, error: 'অ্যাসাইনমেন্ট লোড করতে সমস্যা হয়েছে' },
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
    const { title, titleBn, description, deadline, maxMarks, subjectId, chapterId } = body;

    const assignment = await db.assignment.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(titleBn !== undefined && { titleBn }),
        ...(description !== undefined && { description }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(maxMarks !== undefined && { maxMarks: parseInt(maxMarks) || undefined }),
        ...(subjectId !== undefined && { subjectId }),
        ...(chapterId !== undefined && { chapterId: chapterId || null }),
      },
    });

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'অ্যাসাইনমেন্ট আপডেট করতে সমস্যা হয়েছে' },
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
    await db.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: 'অ্যাসাইনমেন্ট মুছে ফেলা হয়েছে' } });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { success: false, error: 'অ্যাসাইনমেন্ট মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
