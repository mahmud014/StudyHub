import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/notes — বিষয়, অধ্যায় এবং সার্চ কন্ডিশন অনুযায়ী নোটস লোড করা (প্যাজিনেশন সহ)
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const chapterId = searchParams.get("chapterId");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const client = await clientPromise;
    const db = client.db();

    // ১. ফিল্টারিং কন্ডিশন (Match Stage) তৈরি করা
    const matchStage: any = {};

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

    if (type) {
      matchStage.type = type;
    }

    // সার্চ ফিল্টার: ইংরেজি শিরোনাম, বাংলা শিরোনাম এবং কন্টেন্টের মধ্যে খুঁজতে কেস-ইনসেনসিটিভ $regex ব্যবহার
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { titleBn: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // ২. মোট নোটস সংখ্যা এবং প্যাজিনেটেড ডেটা সমান্তরালে বের করা (Optimized Parallel Query)
    const [total, notes] = await Promise.all([
      db.collection("Note").countDocuments(matchStage),
      db
        .collection("Note")
        .aggregate([
          { $match: matchStage },
          // প্রথমে order অনুযায়ী এবং তারপর নতুন তৈরি হওয়া নোট আগে দেখানোর জন্য সর্টিং
          { $sort: { order: 1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },

          // Subject কালেকশন জয়েন
          {
            $lookup: {
              from: "Subject",
              localField: "subjectId",
              foreignField: "_id",
              as: "subject",
            },
          },
          { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },

          // Chapter কালেকশন জয়েন
          {
            $lookup: {
              from: "Chapter",
              localField: "chapterId",
              foreignField: "_id",
              as: "chapter",
            },
          },
          { $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true } },
        ])
        .toArray(),
    ]);

    // ৩. রেসপন্স ডেটা ফরম্যাট করা (id কনভার্সন সহ)
    const formattedNotes = notes.map((note: any) => ({
      id: note._id.toString(),
      title: note.title,
      titleBn: note.titleBn,
      content: note.content,
      type: note.type,
      order: note.order,
      pdfUrl: note.pdfUrl || null,
      subjectId: note.subjectId ? note.subjectId.toString() : null,
      chapterId: note.chapterId ? note.chapterId.toString() : null,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      subject: note.subject
        ? {
            id: note.subject._id.toString(),
            name: note.subject.name,
            nameBn: note.subject.nameBn,
          }
        : null,
      chapter: note.chapter
        ? {
            id: note.chapter._id.toString(),
            name: note.chapter.name,
            nameBn: note.chapter.nameBn,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedNotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { success: false, error: "নোট লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/notes — নতুন নোট তৈরি করা (admin/teacher)
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
      content,
      type,
      order,
      pdfUrl,
    } = body as {
      subjectId: string;
      chapterId?: string;
      title: string;
      titleBn: string;
      content: string;
      type?: string;
      order?: number;
      pdfUrl?: string;
    };

    if (!subjectId || !title || !titleBn || !content) {
      return NextResponse.json(
        { success: false, error: "বিষয়, শিরোনাম ও বিষয়বস্তু প্রয়োজন" },
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

    const subjectObjectId = new ObjectId(subjectId);
    const chapterObjectId = chapterId ? new ObjectId(chapterId) : null;

    // ৩. বিষয় ও অধ্যায় সমান্তরালে চেক করে নিশ্চিত হওয়া
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
        { success: false, error: "অধ্যায় পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ৪. নতুন নোট অবজেক্ট তৈরি
    const newNote = {
      subjectId: subjectObjectId,
      chapterId: chapterObjectId,
      title,
      titleBn,
      content,
      type: type || "handnote",
      order: order !== undefined ? parseInt(order as any, 10) : 0,
      pdfUrl: pdfUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("Note").insertOne(newNote);

    // ৫. প্রিজমার মতো করে রিলেশনসহ ডাটা ফেরত দেওয়া
    const noteWithRelations = {
      id: result.insertedId.toString(),
      subjectId: subjectId,
      chapterId: chapterId || null,
      title: newNote.title,
      titleBn: newNote.titleBn,
      content: newNote.content,
      type: newNote.type,
      order: newNote.order,
      pdfUrl: newNote.pdfUrl,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt,
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
    };

    return NextResponse.json({ success: true, data: noteWithRelations });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { success: false, error: "নোট তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
