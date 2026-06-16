import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * API route to add questions to an exam.
 * Uses native MongoDB driver to ensure performance and avoid Prisma.
 */
export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    // Verify session
    if (
      !sessionUser ||
      (sessionUser.role !== "admin" && sessionUser.role !== "teacher")
    ) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { examId, questions } = body;

    // Basic Validation
    if (!examId || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "পরীক্ষা ID এবং প্রশ্নসমূহ প্রদান করুন" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Verify existence of the exam
    const exam = await db
      .collection("exams")
      .findOne({ _id: new ObjectId(examId) });
    if (!exam) {
      return NextResponse.json(
        { success: false, error: "পরীক্ষাটি খুঁজে পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // 2. Map data for MongoDB insertion
    const questionsToInsert = questions.map((q: any, index: number) => ({
      examId: new ObjectId(examId),
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      marks: Number(q.marks) || 1,
      order: q.order ?? index + 1,
      createdAt: new Date(),
    }));

    // 3. Bulk insert
    const insertResult = await db
      .collection("examQuestions")
      .insertMany(questionsToInsert);

    // 4. Atomically increment the total marks in the exam document
    const totalAddedMarks = questions.reduce(
      (sum: number, q: any) => sum + (Number(q.marks) || 1),
      0,
    );
    await db
      .collection("exams")
      .updateOne(
        { _id: new ObjectId(examId) },
        { $inc: { totalMarks: totalAddedMarks } },
      );

    // Returning success message for your toast sonner implementation
    return NextResponse.json({
      success: true,
      message: `${insertResult.insertedCount} টি প্রশ্ন সফলভাবে যোগ করা হয়েছে!`,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "সিস্টেম এরর, আবার চেষ্টা করুন" },
      { status: 500 },
    );
  }
}
