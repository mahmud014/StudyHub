import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/exams — Fetch exams list with subject, chapter, and question count
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const chapterId = searchParams.get("chapterId");
    const showAll = searchParams.get("all") === "true";

    const client = await clientPromise;
    const db = client.db();

    // 1. Build the match conditions
    const matchStage: any = {};

    if (!showAll) {
      matchStage.isActive = true;
    }

    if (subjectId && ObjectId.isValid(subjectId)) {
      matchStage.subjectId = new ObjectId(subjectId);
    } else if (subjectId) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর বিষয় আইডি" },
        { status: 400 },
      );
    }

    if (chapterId && ObjectId.isValid(chapterId)) {
      matchStage.chapterId = new ObjectId(chapterId);
    } else if (chapterId) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর অধ্যায় আইডি" },
        { status: 400 },
      );
    }

    // 2. Query exams using an aggregation pipeline to handle joins and counts
    const exams = await db
      .collection("Exam")
      .aggregate([
        { $match: matchStage },

        // Join Subject details
        {
          $lookup: {
            from: "Subject",
            localField: "subjectId",
            foreignField: "_id",
            as: "subject",
          },
        },
        { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },

        // Join Chapter details
        {
          $lookup: {
            from: "Chapter",
            localField: "chapterId",
            foreignField: "_id",
            as: "chapter",
          },
        },
        { $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true } },

        // Join Exam Questions to calculate _count
        {
          $lookup: {
            from: "ExamQuestion",
            localField: "_id",
            foreignField: "examId",
            as: "questions",
          },
        },

        // Project fields and compute question size
        {
          $project: {
            _id: 1,
            subjectId: 1,
            chapterId: 1,
            title: 1,
            titleBn: 1,
            duration: 1,
            totalMarks: 1,
            isActive: 1,
            createdAt: 1,
            updatedAt: 1,
            subject: 1,
            chapter: 1,
            _count: {
              questions: { $size: "$questions" },
            },
          },
        },
        // Sort by creation date descending
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // 3. Format results to ensure standard string IDs for frontend components
    const formattedExams = exams.map((exam: any) => ({
      id: exam._id.toString(),
      subjectId: exam.subjectId ? exam.subjectId.toString() : null,
      chapterId: exam.chapterId ? exam.chapterId.toString() : null,
      title: exam.title,
      titleBn: exam.titleBn,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      isActive: exam.isActive,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      subject: exam.subject
        ? {
            id: exam.subject._id.toString(),
            name: exam.subject.name,
            nameBn: exam.subject.nameBn,
          }
        : null,
      chapter: exam.chapter
        ? {
            id: exam.chapter._id.toString(),
            name: exam.chapter.name,
            nameBn: exam.chapter.nameBn,
          }
        : null,
      _count: exam._count,
    }));

    return NextResponse.json({ success: true, data: formattedExams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, error: "পরীক্ষা লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/exams — Create new exam (admin/teacher)
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
    const {
      subjectId,
      chapterId,
      title,
      titleBn,
      duration,
      totalMarks,
      isActive,
    } = body as {
      subjectId: string;
      chapterId?: string;
      title: string;
      titleBn: string;
      duration?: number;
      totalMarks?: number;
      isActive?: boolean;
    };

    if (!subjectId || !title || !titleBn) {
      return NextResponse.json(
        { success: false, error: "বিষয় ও শিরোনাম প্রয়োজন" },
        { status: 400 },
      );
    }

    if (!ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর বিষয় আইডি" },
        { status: 400 },
      );
    }

    if (chapterId && !ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর অধ্যায় আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify parent subject and chapter exist in parallel
    const subjectObjectId = new ObjectId(subjectId);
    const chapterObjectId = chapterId ? new ObjectId(chapterId) : null;

    const [subject, chapter] = await Promise.all([
      db.collection("Subject").findOne({ _id: subjectObjectId }),
      chapterObjectId
        ? db.collection("Chapter").findOne({ _id: chapterObjectId })
        : Promise.resolve(null),
    ]);

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "বিষয় পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    if (chapterId && !chapter) {
      return NextResponse.json(
        { success: false, error: "অধ্যায় পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // Insert the new Exam document using native MongoDB structure
    const newExam = {
      subjectId: subjectObjectId,
      chapterId: chapterObjectId,
      title,
      titleBn,
      duration: duration || 30,
      totalMarks: totalMarks || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("Exam").insertOne(newExam);

    // Format the return value to match Prisma's nested include structure
    const examWithRelations = {
      id: result.insertedId.toString(),
      subjectId: subjectId,
      chapterId: chapterId || null,
      title: newExam.title,
      titleBn: newExam.titleBn,
      duration: newExam.duration,
      totalMarks: newExam.totalMarks,
      isActive: newExam.isActive,
      createdAt: newExam.createdAt,
      updatedAt: newExam.updatedAt,
      subject: {
        id: subject._id.toString(),
        name: subject.name,
        nameBn: subject.nameBn,
      },
      chapter: chapter
        ? {
            id: chapter._id.toString(),
            name: chapter.name,
            nameBn: chapter.nameBn,
          }
        : null,
      _count: {
        questions: 0,
      },
    };

    return NextResponse.json({ success: true, data: examWithRelations });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { success: false, error: "পরীক্ষা তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
