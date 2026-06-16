import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// ─── Grade Helper ─────────────────────────────────────────────────────────────

function getGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

// ─── Types & Logic Helpers ───────────────────────────────────────────────────

interface HistoryItem {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  subjectBn: string;
  subjectColor: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  dateTaken: string;
  timeTaken: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: Record<string, string>;
}

function getBestSubject(data: HistoryItem[]): {
  name: string;
  nameBn: string;
  avgScore: number;
} {
  const subjectScores: Record<
    string,
    { total: number; count: number; nameBn: string }
  > = {};

  for (const exam of data) {
    if (!exam.subject) continue;
    if (!subjectScores[exam.subject]) {
      subjectScores[exam.subject] = {
        total: 0,
        count: 0,
        nameBn: exam.subjectBn,
      };
    }
    subjectScores[exam.subject].total += exam.percentage;
    subjectScores[exam.subject].count += 1;
  }

  let best = { name: "", nameBn: "", avgScore: 0 };
  for (const [name, scores] of Object.entries(subjectScores)) {
    const avg = scores.total / scores.count;
    if (avg > best.avgScore) {
      best = {
        name,
        nameBn: scores.nameBn,
        avgScore: Math.round(avg * 10) / 10,
      };
    }
  }
  return best;
}

function calculateImprovementRate(data: HistoryItem[]): number {
  if (data.length < 2) return 0;
  const sorted = [...data].sort(
    (a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime(),
  );
  const recent = sorted.slice(-3);
  const early = sorted.slice(0, 3);
  const recentAvg =
    recent.reduce((s, e) => s + e.percentage, 0) / recent.length;
  const earlyAvg = early.reduce((s, e) => s + e.percentage, 0) / early.length;
  return earlyAvg === 0
    ? 0
    : Math.round(((recentAvg - earlyAvg) / earlyAvg) * 100 * 10) / 10;
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    const client = await clientPromise;
    const db = client.db();

    let targetUserId = sessionUser.id;

    // Permissions check
    if (queryUserId && queryUserId !== sessionUser.id) {
      if (sessionUser.role === "student") {
        return NextResponse.json(
          { success: false, error: "অননুমোদিত অ্যাক্সেস" },
          { status: 403 },
        );
      }
      // Note: Add your specific guardian lookup logic here if needed
      targetUserId = queryUserId;
    }

    // Aggregation Pipeline
    const examResults = await db
      .collection("examResults")
      .aggregate([
        { $match: { userId: targetUserId } },
        { $sort: { completedAt: -1 } },
        {
          $lookup: {
            from: "exams",
            localField: "examId",
            foreignField: "_id",
            as: "examData",
          },
        },
        { $unwind: { path: "$examData", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "subjects",
            localField: "examData.subjectId",
            foreignField: "_id",
            as: "subjectData",
          },
        },
        { $unwind: { path: "$subjectData", preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    const history: HistoryItem[] = examResults.map((result) => {
      const totalMarks = result.examData?.totalMarks || 0;
      const percentage =
        totalMarks > 0 ? Math.round((result.score / totalMarks) * 100) : 0;

      let parsedAnswers: Record<string, string> = {};
      try {
        parsedAnswers =
          typeof result.answers === "string"
            ? JSON.parse(result.answers)
            : result.answers;
      } catch {}

      const totalQuestions = Object.keys(parsedAnswers).length;

      return {
        id: result._id.toString(),
        examId: result.examId.toString(),
        examTitle:
          result.examData?.titleBn || result.examData?.title || "পরীক্ষা",
        subject: result.subjectData?.name || "",
        subjectBn: result.subjectData?.nameBn || "",
        subjectColor: result.subjectData?.color || "emerald",
        totalMarks: totalMarks,
        obtainedMarks: result.score,
        percentage,
        grade: getGrade(percentage),
        dateTaken: result.completedAt?.toISOString(),
        timeTaken: result.timeTaken ? Math.round(result.timeTaken / 60) : 0,
        totalQuestions,
        correctAnswers:
          totalQuestions > 0
            ? Math.round((result.score / (totalMarks || 1)) * totalQuestions)
            : 0,
        answers: parsedAnswers,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        history,
        summary: {
          totalExams: history.length,
          avgScore:
            history.length > 0
              ? Math.round(
                  (history.reduce((sum, e) => sum + e.percentage, 0) /
                    history.length) *
                    10,
                ) / 10
              : 0,
          bestSubject: getBestSubject(history),
          improvementRate: calculateImprovementRate(history),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching exam history:", error);
    return NextResponse.json(
      { success: false, error: "পরীক্ষার ইতিহাস লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
