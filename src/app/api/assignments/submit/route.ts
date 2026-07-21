import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

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

    // Connect to database
    const client = await clientPromise;
    const db = client.db();

    // Check if assignment exists
    let assignmentObjectId;
    try {
      assignmentObjectId = new ObjectId(assignmentId);
    } catch {
      return NextResponse.json(
        { success: false, error: "অ্যাসাইনমেন্ট আইডি সঠিক নয়" },
        { status: 400 },
      );
    }

    const assignment = await db.collection("Assignment").findOne({
      _id: assignmentObjectId,
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "অ্যাসাইনমেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // Check if already submitted
    const existing = await db.collection("AssignmentSubmission").findOne({
      assignmentId: assignmentId,
      userId: userId,
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

    // Create submission data
    const newSubmission = {
      assignmentId: assignmentId,
      userId: userId,
      fileUrl: fileUrl,
      fileName: fileName || fileUrl.split("/").pop() || "file",
      createdAt: new Date(),
    };

    const result = await db
      .collection("AssignmentSubmission")
      .insertOne(newSubmission);

    const createdSubmission = {
      id: result.insertedId.toString(),
      ...newSubmission,
    };

    return NextResponse.json(
      { success: true, data: createdSubmission },
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
