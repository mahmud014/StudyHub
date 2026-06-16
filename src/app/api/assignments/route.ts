import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// POST /api/assignments — Create new assignment (admin/teacher)
// ============================================================
export async function POST(request: Request) {
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

    const body = await request.json();
    const { title, titleBn, description, subjectId, deadline, maxMarks } = body;

    if (!title || !titleBn || !description || !subjectId) {
      return NextResponse.json(
        { success: false, error: "শিরোনাম, বিবরণ এবং বিষয় প্রয়োজন" },
        { status: 400 },
      );
    }

    if (!ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { success: false, error: "ভ্যালিড বিষয় আইডি প্রয়োজন" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify subject exists
    const subject = await db
      .collection("Subject")
      .findOne({ _id: new ObjectId(subjectId) });
    if (!subject) {
      return NextResponse.json(
        { success: false, error: "বিষয় পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    const newAssignment = {
      title,
      titleBn,
      description,
      subjectId: new ObjectId(subjectId),
      deadline: deadline ? new Date(deadline) : null,
      maxMarks: maxMarks || 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("Assignment").insertOne(newAssignment);

    // Reconstruct Prisma representation to return matching shape
    const assignmentWithRelations = {
      id: result.insertedId.toString(),
      title: newAssignment.title,
      titleBn: newAssignment.titleBn,
      description: newAssignment.description,
      subjectId: newAssignment.subjectId.toString(),
      deadline: newAssignment.deadline,
      maxMarks: newAssignment.maxMarks,
      subject: {
        id: subject._id.toString(),
        name: subject.name,
        nameBn: subject.nameBn,
        icon: subject.icon || null,
        color: subject.color || null,
      },
      _count: {
        submissions: 0,
      },
    };

    return NextResponse.json(
      { success: true, data: assignmentWithRelations },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { success: false, error: "অ্যাসাইনমেন্ট তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// GET /api/assignments — List all assignments
// ============================================================
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 401 },
      );
    }

    const userId = sessionUser.id;
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর ব্যবহারকারী আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch assignments with relations in single database round-trip
    const assignments = await db
      .collection("Assignment")
      .aggregate([
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

        // 2. Join only the current user's submission history
        {
          $lookup: {
            from: "AssignmentSubmission",
            let: { assignmentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$assignmentId", "$$assignmentId"] },
                      { $eq: ["$userId", new ObjectId(userId)] },
                    ],
                  },
                },
              },
            ],
            as: "submissions",
          },
        },

        // 3. Join all submissions to count them
        {
          $lookup: {
            from: "AssignmentSubmission",
            localField: "_id",
            foreignField: "assignmentId",
            as: "allSubmissions",
          },
        },

        // 4. Map outputs and calculate total submissions count
        {
          $project: {
            _id: 1,
            title: 1,
            titleBn: 1,
            description: 1,
            subjectId: 1,
            deadline: 1,
            maxMarks: 1,
            subject: 1,
            submissions: 1,
            _count: {
              submissions: { $size: "$allSubmissions" },
            },
          },
        },
        // Sort by deadline ascending
        { $sort: { deadline: 1 } },
      ])
      .toArray();

    // 5. Adapt MongoDB schemas to look like Prisma payloads (convert _id to id)
    const formattedAssignments = assignments.map((asg: any) => {
      const { _id, subjectId, subject, submissions, ...rest } = asg;

      return {
        id: _id.toString(),
        subjectId: subjectId ? subjectId.toString() : null,
        ...rest,
        subject: subject
          ? {
              id: subject._id.toString(),
              name: subject.name,
              nameBn: subject.nameBn,
              icon: subject.icon || null,
              color: subject.color || null,
            }
          : null,
        submissions:
          submissions?.map((sub: any) => ({
            id: sub._id.toString(),
            userId: sub.userId ? sub.userId.toString() : null,
            fileUrl: sub.fileUrl,
            fileName: sub.fileName,
            marks: sub.marks,
            feedback: sub.feedback,
            status: sub.status,
            submittedAt: sub.submittedAt,
            reviewedAt: sub.reviewedAt,
          })) || [],
      };
    });

    return NextResponse.json({ success: true, data: formattedAssignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { success: false, error: "অ্যাসাইনমেন্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
