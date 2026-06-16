import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

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
    const { marks, feedback } = body as { marks?: number; feedback?: string };

    const submission = await db.assignmentSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'জমাকৃত অ্যাসাইনমেন্ট পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const updated = await db.assignmentSubmission.update({
      where: { id },
      data: {
        marks: marks !== undefined ? marks : null,
        feedback: feedback !== undefined ? feedback : null,
        status: 'reviewed',
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error grading assignment submission:', error);
    return NextResponse.json(
      { success: false, error: 'মূল্যায়ন করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
