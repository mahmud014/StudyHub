import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// ─── Grade Helper ─────────────────────────────────────────────────────────────

function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');

    let targetUserId = sessionUser.id;

    if (queryUserId && queryUserId !== sessionUser.id) {
      // If student is querying someone else, forbid
      if (sessionUser.role === 'student') {
        return NextResponse.json(
          { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
          { status: 403 }
        );
      }
      // If guardian is querying, verify the student is their child
      if (sessionUser.role === 'guardian') {
        const isChild = await db.studentProfile.findFirst({
          where: {
            userId: queryUserId,
            guardian: {
              userId: sessionUser.id
            }
          }
        });
        if (!isChild) {
          return NextResponse.json(
            { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
            { status: 403 }
          );
        }
      }
      // If teacher/admin, allow any student
      targetUserId = queryUserId;
    }

    // Fetch real exam results from database
    const examResults = await db.examResult.findMany({
      where: { userId: targetUserId },
      orderBy: { completedAt: 'desc' },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            titleBn: true,
            totalMarks: true,
            subject: {
              select: { id: true, name: true, nameBn: true, color: true },
            },
          },
        },
      },
    });

    // Build history items from real data
    const history = examResults.map((result) => {
      const percentage = result.totalMarks > 0
        ? Math.round((result.score / result.totalMarks) * 100)
        : 0;
      const timeTakenMinutes = result.timeTaken
        ? Math.round(result.timeTaken / 60)
        : 0;

      // Parse answers to get question-level details
      let parsedAnswers: Record<string, string> = {};
      try {
        parsedAnswers = JSON.parse(result.answers);
      } catch {
        parsedAnswers = {};
      }

      const totalQuestions = Object.keys(parsedAnswers).length;
      // We can't know correctAnswers without re-fetching questions, so estimate from score
      // Each question's marks might vary, so we just provide what we have
      const correctAnswers = totalQuestions > 0 && result.totalMarks > 0
        ? Math.round((result.score / result.totalMarks) * totalQuestions)
        : 0;

      return {
        id: result.id,
        examId: result.examId,
        examTitle: result.exam.titleBn || result.exam.title,
        subject: result.exam.subject?.name || '',
        subjectBn: result.exam.subject?.nameBn || '',
        subjectColor: result.exam.subject?.color || 'emerald',
        totalMarks: result.totalMarks,
        obtainedMarks: result.score,
        percentage,
        grade: getGrade(percentage),
        dateTaken: result.completedAt.toISOString(),
        timeTaken: timeTakenMinutes,
        totalQuestions,
        correctAnswers,
        answers: parsedAnswers,
      };
    });

    // Calculate summary stats
    const totalExams = history.length;
    const avgScore = totalExams > 0
      ? history.reduce((sum, e) => sum + e.percentage, 0) / totalExams
      : 0;
    const bestSubject = getBestSubject(history);
    const improvementRate = calculateImprovementRate(history);

    return NextResponse.json({
      success: true,
      data: {
        history,
        summary: {
          totalExams,
          avgScore: Math.round(avgScore * 10) / 10,
          bestSubject,
          improvementRate,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching exam history:', error);
    return NextResponse.json(
      { success: false, error: 'পরীক্ষার ইতিহাস লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

interface HistoryItem {
  subject: string;
  subjectBn: string;
  percentage: number;
}

function getBestSubject(data: HistoryItem[]): { name: string; nameBn: string; avgScore: number } {
  const subjectScores: Record<string, { total: number; count: number; nameBn: string }> = {};

  for (const exam of data) {
    if (!exam.subject) continue;
    if (!subjectScores[exam.subject]) {
      subjectScores[exam.subject] = { total: 0, count: 0, nameBn: exam.subjectBn };
    }
    subjectScores[exam.subject].total += exam.percentage;
    subjectScores[exam.subject].count += 1;
  }

  let best = { name: '', nameBn: '', avgScore: 0 };
  for (const [name, scores] of Object.entries(subjectScores)) {
    const avg = scores.total / scores.count;
    if (avg > best.avgScore) {
      best = { name, nameBn: scores.nameBn, avgScore: Math.round(avg * 10) / 10 };
    }
  }

  return best;
}

function calculateImprovementRate(data: HistoryItem[]): number {
  if (data.length < 2) return 0;

  // Sort by date ascending for improvement calc
  const sorted = [...data];

  // Compare last 3 exams avg vs first 3 exams avg
  const recent = sorted.slice(0, Math.min(3, sorted.length));
  const early = sorted.slice(-Math.min(3, sorted.length));

  const recentAvg = recent.reduce((s, e) => s + e.percentage, 0) / recent.length;
  const earlyAvg = early.reduce((s, e) => s + e.percentage, 0) / early.length;

  if (earlyAvg === 0) return 0;
  const improvement = ((recentAvg - earlyAvg) / earlyAvg) * 100;
  return Math.round(improvement * 10) / 10;
}
