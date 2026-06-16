import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

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

    const results = await db.examResult.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            titleBn: true,
            totalMarks: true,
            subject: {
              select: { id: true, name: true, nameBn: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { success: false, error: 'পরীক্ষার ফলাফল লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
