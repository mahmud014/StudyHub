import { db } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

interface SubmitRequestBody {
  fileUrl: string;
  assignmentId: string;
  fileName?: string;
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 401 },
      );
    }
    const userId = sessionUser.id;

    const body = (await request.json()) as SubmitRequestBody;
    const { fileUrl, assignmentId, fileName } = body;

    if (!fileUrl || !assignmentId) {
      return NextResponse.json(
        { success: false, error: "fileUrl এবং assignmentId প্রয়োজন" },
        { status: 400 },
      );
    }

    // Check if assignment exists
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "অ্যাসাইনমেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // Check if already submitted
    const existing = await db.assignmentSubmission.findFirst({
      where: { assignmentId, userId },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "আপনি ইতিমধ্যে এই অ্যাসাইনমেন্ট জমা দিয়েছেন",
        },
        { status: 409 },
      );
    }

    const submission = await db.assignmentSubmission.create({
      data: {
        assignmentId,
        userId,
        fileUrl,
        fileName: fileName || fileUrl.split("/").pop() || "file",
      },
    });

    return NextResponse.json(
      { success: true, data: submission },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { success: false, error: "অ্যাসাইনমেন্ট জমা দিতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
