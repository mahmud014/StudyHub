import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

interface QuestionInput {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string; // A, B, C, D
  explanation?: string;
  marks?: number;
  order?: number;
}

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
    const { examId, questions } = body as {
      examId: string;
      questions: QuestionInput[];
    };

    if (!examId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'পরীক্ষা ID এবং প্রশ্নসমূহ প্রয়োজন' },
        { status: 400 }
      );
    }

    // Verify exam exists
    const exam = await db.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'পরীক্ষা পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // Create all questions
    const createdQuestions = await db.$transaction(
      questions.map((q, index) =>
        db.examQuestion.create({
          data: {
            examId,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            marks: q.marks || 1,
            order: q.order ?? index + 1,
          },
        })
      )
    );

    // Update exam totalMarks based on questions
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    await db.exam.update({
      where: { id: examId },
      data: { totalMarks },
    });

    return NextResponse.json({
      success: true,
      data: {
        questionsCreated: createdQuestions.length,
        totalMarks,
      },
    });
  } catch (error) {
    console.error('Error creating exam questions:', error);
    return NextResponse.json(
      { success: false, error: 'প্রশ্ন তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
