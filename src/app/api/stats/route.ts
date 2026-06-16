import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [
      studentCount,
      videoCount,
      noteCount,
      examCount,
      teacherCount,
      subjectCount,
    ] = await Promise.all([
      db.user.count({ where: { role: 'student' } }),
      db.video.count(),
      db.note.count(),
      db.exam.count(),
      db.user.count({ where: { role: { in: ['admin', 'teacher'] } } }),
      db.subject.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        students: studentCount,
        videos: videoCount,
        notes: noteCount,
        exams: examCount,
        teachers: teacherCount,
        subjects: subjectCount,
        satisfaction: 98, // Static satisfaction rate
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
