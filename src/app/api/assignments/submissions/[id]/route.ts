import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// PATCH /api/submissions/[id] — Grade/Review an assignment submission (admin/teacher)
// ============================================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (
      !sessionUser ||
      (sessionUser.role !== "admin" && sessionUser.role !== "teacher")
    ) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 403 },
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর সাবমিশন আইডি" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { marks, feedback } = body as { marks?: number; feedback?: string };

    const client = await clientPromise;
    const db = client.db();
    const submissionObjectId = new ObjectId(id);

    // Find the submission using MongoDB's capitalized "AssignmentSubmission" collection
    const submission = await db.collection("AssignmentSubmission").findOne({
      _id: submissionObjectId,
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "জমাকৃত অ্যাসাইনমেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // Build modern, secure update fields
    const updateData: any = {
      status: "reviewed",
      reviewedAt: new Date(),
    };

    if (marks !== undefined) {
      updateData.marks = marks !== null ? Number(marks) : null;
    }
    if (feedback !== undefined) {
      updateData.feedback = feedback !== null ? feedback : null;
    }

    const result = await db
      .collection("AssignmentSubmission")
      .findOneAndUpdate(
        { _id: submissionObjectId },
        { $set: updateData },
        { returnDocument: "after" },
      );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "মূল্যায়ন আপডেট করা যায়নি" },
        { status: 500 },
      );
    }

    // Map output safely (converting ObjectIds to string IDs) to maintain frontend compatibility
    const formattedSubmission = {
      id: result._id.toString(),
      assignmentId: result.assignmentId ? result.assignmentId.toString() : null,
      userId: result.userId ? result.userId.toString() : null,
      fileUrl: result.fileUrl,
      fileName: result.fileName,
      marks: result.marks,
      feedback: result.feedback,
      status: result.status,
      submittedAt: result.submittedAt,
      reviewedAt: result.reviewedAt,
    };

    return NextResponse.json({ success: true, data: formattedSubmission });
  } catch (error) {
    console.error("Error grading assignment submission:", error);
    return NextResponse.json(
      { success: false, error: "মূল্যায়ন করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
