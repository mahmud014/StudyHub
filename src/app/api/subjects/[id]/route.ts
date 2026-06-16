import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subject = await db.subject.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'বিষয় পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json(
      { success: false, error: 'বিষয় লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
