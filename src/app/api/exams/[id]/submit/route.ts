import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

interface SubmitRequestBody {
  answers: Record<string, string>;
  timeTaken?: number;
}

interface QuestionResult {
  questionId: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
  explanation: string;
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

    const { id: examId } = await params;
    const body = (await request.json()) as SubmitRequestBody;
    const { answers, timeTaken } = body;

    if (!answers) {
      return NextResponse.json(
        { success: false, error: 'answers প্রয়োজন' },
        { status: 400 }
      );
    }

    // Fetch exam with questions (including correct answers)
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'পরীক্ষা পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // Calculate score
    let score = 0;
    const results: QuestionResult[] = [];

    for (const question of exam.questions) {
      const selected = answers[question.id] || '';
      const isCorrect = selected === question.correctAnswer;
      if (isCorrect) score += question.marks;

      results.push({
        questionId: question.id,
        selected,
        correct: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || '',
      });
    }

    // Save exam result
    const examResult = await db.examResult.create({
      data: {
        examId,
        userId,
        score,
        totalMarks: exam.totalMarks,
        answers: JSON.stringify(answers),
        timeTaken: timeTaken || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        resultId: examResult.id,
        score,
        totalMarks: exam.totalMarks,
        results,
      },
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { success: false, error: 'পরীক্ষা জমা দিতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
