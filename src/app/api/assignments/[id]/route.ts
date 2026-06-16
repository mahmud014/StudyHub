import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/assignments/[id] — Fetch single assignment with submissions
// ============================================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর অ্যাসাইনমেন্ট আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Use aggregation to fetch subject and submissions along with user profiles
    const aggregationResult = await db
      .collection("Assignment")
      .aggregate([
        { $match: { _id: new ObjectId(id) } },

        // 1. Join Subject details
        {
          $lookup: {
            from: "Subject",
            localField: "subjectId",
            foreignField: "_id",
            as: "subject",
          },
        },
        { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },

        // 2. Join Submissions and their matching User accounts
        {
          $lookup: {
            from: "AssignmentSubmission",
            let: { assignmentId: "$_id" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$assignmentId", "$$assignmentId"] } },
              },
              { $sort: { submittedAt: -1 } }, // Equivalent to Prisma's orderBy: { submittedAt: "desc" }
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "user",
                },
              },
              { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            ],
            as: "submissions",
          },
        },
      ])
      .toArray();

    const assignment = aggregationResult[0];

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "অ্যাসাইনমেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // Adapt MongoDB MongoDB aggregation output back to Prisma-like shape
    const formattedAssignment = {
      id: assignment._id.toString(),
      title: assignment.title,
      titleBn: assignment.titleBn,
      description: assignment.description,
      deadline: assignment.deadline,
      maxMarks: assignment.maxMarks,
      subjectId: assignment.subjectId ? assignment.subjectId.toString() : null,
      chapterId: assignment.chapterId ? assignment.chapterId.toString() : null,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      subject: assignment.subject
        ? {
            id: assignment.subject._id.toString(),
            name: assignment.subject.name,
            nameBn: assignment.subject.nameBn,
          }
        : null,
      submissions:
        assignment.submissions?.map((sub: any) => {
          const { password: _password, ...userWithoutPassword } =
            sub.user || {};
          return {
            id: sub._id.toString(),
            assignmentId: sub.assignmentId ? sub.assignmentId.toString() : null,
            userId: sub.userId ? sub.userId.toString() : null,
            fileUrl: sub.fileUrl,
            fileName: sub.fileName,
            marks: sub.marks,
            feedback: sub.feedback,
            status: sub.status,
            submittedAt: sub.submittedAt,
            reviewedAt: sub.reviewedAt,
            user: sub.user
              ? {
                  id: userWithoutPassword._id.toString(),
                  name: userWithoutPassword.name,
                  email: userWithoutPassword.email,
                }
              : null,
          };
        }) || [],
    };

    return NextResponse.json({ success: true, data: formattedAssignment });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { success: false, error: "অ্যাসাইনমেন্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH /api/assignments/[id] — Update assignment (admin/teacher)
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
        { success: false, error: "অকার্যকর অ্যাসাইনমেন্ট আইডি" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      title,
      titleBn,
      description,
      deadline,
      maxMarks,
      subjectId,
      chapterId,
    } = body;

    const client = await clientPromise;
    const db = client.db();

    // Prepare update parameters safely
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (titleBn !== undefined) updateData.titleBn = titleBn;
    if (description !== undefined) updateData.description = description;

    if (deadline !== undefined) {
      updateData.deadline = deadline ? new Date(deadline) : null;
    }

    if (maxMarks !== undefined) {
      updateData.maxMarks =
        maxMarks !== null ? parseInt(maxMarks) || 100 : null;
    }

    if (subjectId !== undefined) {
      updateData.subjectId =
        subjectId && ObjectId.isValid(subjectId)
          ? new ObjectId(subjectId)
          : null;
    }

    if (chapterId !== undefined) {
      updateData.chapterId =
        chapterId && ObjectId.isValid(chapterId)
          ? new ObjectId(chapterId)
          : null;
    }

    const result = await db
      .collection("Assignment")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
      );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "অ্যাসাইনমেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    const updatedAssignment = {
      id: result._id.toString(),
      ...result,
    };
    delete (updatedAssignment as any)._id;

    return NextResponse.json({ success: true, data: updatedAssignment });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { success: false, error: "অ্যাসাইনমেন্ট আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/assignments/[id] — Delete assignment & submissions
// ============================================================
export async function DELETE(
  _request: Request,
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
        { success: false, error: "অকার্যকর অ্যাসাইনমেন্ট আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const assignmentObjectId = new ObjectId(id);

    // Delete the assignment
    const result = await db
      .collection("Assignment")
      .deleteOne({ _id: assignmentObjectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "অ্যাসাইনমেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // Mimic Prisma's "onDelete: Cascade" by cleaning up related submissions in AssignmentSubmission
    await db
      .collection("AssignmentSubmission")
      .deleteMany({ assignmentId: assignmentObjectId });

    return NextResponse.json({
      success: true,
      data: { message: "অ্যাসাইনমেন্ট এবং এর সমস্ত সাবমিশন মুছে ফেলা হয়েছে" },
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { success: false, error: "অ্যাসাইনমেন্ট মুছতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
