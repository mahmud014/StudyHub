import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

interface AnswerRequestBody {
  content: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 401 }
      );
    }
    const userId = sessionUser.id;

    const { id: questionId } = await params;
    const body = (await request.json()) as AnswerRequestBody;
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'content প্রয়োজন' },
        { status: 400 }
      );
    }

    // Check if question exists
    const question = await db.qAQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'প্রশ্ন পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const answer = await db.qAAnswer.create({
      data: {
        questionId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: answer }, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { success: false, error: 'উত্তর তৈরি করতে সমস্যা হয়েছে' },
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
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 401 }
      );
    }

    const { id: questionId } = await params;
    const body = await request.json() as {
      answerId: string;
      action: 'upvote' | 'downvote';
    };

    if (!body.answerId) {
      return NextResponse.json(
        { success: false, error: 'answerId প্রয়োজন' },
        { status: 400 }
      );
    }

    // Check answer exists and belongs to question
    const answer = await db.qAAnswer.findUnique({
      where: { id: body.answerId },
    });

    if (!answer || answer.questionId !== questionId) {
      return NextResponse.json(
        { success: false, error: 'উত্তর পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    switch (body.action) {
      case 'upvote': {
        const updated = await db.qAAnswer.update({
          where: { id: body.answerId },
          data: { upvotes: { increment: 1 } },
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case 'downvote': {
        const updated = await db.qAAnswer.update({
          where: { id: body.answerId },
          data: { upvotes: { decrement: 1 } },
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'অবৈধ action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating answer:', error);
    return NextResponse.json(
      { success: false, error: 'আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
