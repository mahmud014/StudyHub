import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await db.qAQuestion.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        subject: {
          select: { id: true, name: true, nameBn: true },
        },
        answers: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'প্রশ্ন পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { success: false, error: 'প্রশ্ন লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const body = await request.json() as {
      action: 'upvote' | 'downvote' | 'accept-answer';
      answerId?: string;
    };

    // Check question exists
    const question = await db.qAQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'প্রশ্ন পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    switch (body.action) {
      case 'upvote': {
        const updated = await db.qAQuestion.update({
          where: { id: questionId },
          data: { upvotes: { increment: 1 } },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            subject: { select: { id: true, name: true, nameBn: true } },
          },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case 'downvote': {
        const updated = await db.qAQuestion.update({
          where: { id: questionId },
          data: { upvotes: { decrement: 1 } },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            subject: { select: { id: true, name: true, nameBn: true } },
          },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case 'accept-answer': {
        if (!body.answerId) {
          return NextResponse.json(
            { success: false, error: 'answerId প্রয়োজন' },
            { status: 400 }
          );
        }
        // Check answer exists and belongs to this question
        const answer = await db.qAAnswer.findUnique({
          where: { id: body.answerId },
        });
        if (!answer || answer.questionId !== questionId) {
          return NextResponse.json(
            { success: false, error: 'উত্তর পাওয়া যায়নি' },
            { status: 404 }
          );
        }
        // Un-accept any previously accepted answer, then accept the new one
        await db.qAAnswer.updateMany({
          where: { questionId, isAccepted: true },
          data: { isAccepted: false },
        });
        await db.qAAnswer.update({
          where: { id: body.answerId },
          data: { isAccepted: true },
        });
        // Mark question as solved
        const updatedQuestion = await db.qAQuestion.update({
          where: { id: questionId },
          data: { isSolved: true },
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
            subject: { select: { id: true, name: true, nameBn: true } },
            answers: {
              orderBy: { createdAt: 'asc' },
              include: {
                user: { select: { id: true, name: true, avatar: true, role: true } },
              },
            },
          },
        });
        return NextResponse.json({ success: true, data: updatedQuestion });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'অবৈধ action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { success: false, error: 'আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
