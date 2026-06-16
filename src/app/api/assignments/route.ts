import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// ============================================================
// POST /api/assignments — Create new assignment (admin/teacher)
// ============================================================
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
    const { title, titleBn, description, subjectId, deadline, maxMarks } = body;

    if (!title || !titleBn || !description || !subjectId) {
      return NextResponse.json(
        { success: false, error: 'শিরোনাম, বিবরণ এবং বিষয় প্রয়োজন' },
        { status: 400 }
      );
    }

    // Verify subject exists
    const subject = await db.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'বিষয় পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const assignment = await db.assignment.create({
      data: {
        title,
        titleBn,
        description,
        subjectId,
        deadline: deadline ? new Date(deadline) : null,
        maxMarks: maxMarks || 100,
      },
      include: {
        subject: {
          select: { id: true, name: true, nameBn: true, icon: true, color: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'অ্যাসাইনমেন্ট তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET /api/assignments — List all assignments
// ============================================================
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 401 }
      );
    }
    const userId = sessionUser.id;

    const assignments = await db.assignment.findMany({
      orderBy: { deadline: 'asc' },
      include: {
        subject: {
          select: { id: true, name: true, nameBn: true, icon: true, color: true },
        },
        submissions: {
          where: { userId },
          select: {
            id: true,
            userId: true,
            fileUrl: true,
            fileName: true,
            marks: true,
            feedback: true,
            status: true,
            submittedAt: true,
            reviewedAt: true,
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'অ্যাসাইনমেন্ট লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
