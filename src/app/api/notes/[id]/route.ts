import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// হেল্পার ফাংশন: রিলেশনসহ নির্দিষ্ট নোট ডাটাবেজ থেকে খুঁজে আনা
// ============================================================
async function getNoteWithRelations(db: any, noteObjectId: ObjectId) {
  const result = await db
    .collection("Note")
    .aggregate([
      { $match: { _id: noteObjectId } },
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
    .toArray();

  const note = result[0];
  if (!note) return null;

  return {
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
  };
}

// ============================================================
// GET /api/notes/[id] — একটি নির্দিষ্ট নোটের বিস্তারিত তথ্য লোড করা
// ============================================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর বিষয় আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const noteObjectId = new ObjectId(id);

    const note = await getNoteWithRelations(db, noteObjectId);

    if (!note) {
      return NextResponse.json(
        { success: false, error: "নোট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { success: false, error: "নোট লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// PUT /api/notes/[id] — নোটের তথ্য আপডেট করা (admin/teacher)
// ============================================================
export async function PUT(
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
        { success: false, error: "অকার্যকর বিষয় আইডি" },
        { status: 400 },
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
      subjectId?: string;
      chapterId?: string | null;
      title?: string;
      titleBn?: string;
      content?: string;
      type?: string;
      order?: number;
      pdfUrl?: string | null;
    };

    const client = await clientPromise;
    const db = client.db();
    const noteObjectId = new ObjectId(id);

    // ১. নোটটি ডাটাবেজে আছে কিনা তা চেক করা
    const existing = await db.collection("Note").findOne({ _id: noteObjectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "নোট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ২. ডাইনামিক আপডেট ডাটা অবজেক্ট তৈরি করা
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (titleBn !== undefined) updateData.titleBn = titleBn;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (order !== undefined) updateData.order = parseInt(order as any, 10) || 0;
    if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl || null;

    if (subjectId !== undefined) {
      if (subjectId && ObjectId.isValid(subjectId)) {
        updateData.subjectId = new ObjectId(subjectId);
      } else {
        return NextResponse.json(
          { success: false, error: "অকার্যকর বিষয় আইডি" },
          { status: 400 },
        );
      }
    }

    if (chapterId !== undefined) {
      if (chapterId && ObjectId.isValid(chapterId)) {
        updateData.chapterId = new ObjectId(chapterId);
      } else {
        updateData.chapterId = null;
      }
    }

    // ৩. ডকুমেন্ট আপডেট করা
    await db
      .collection("Note")
      .updateOne({ _id: noteObjectId }, { $set: updateData });

    // ৪. রিলেশনসহ আপডেটেড নোটের ডেটা তুলে নিয়ে আসা
    const updatedNote = await getNoteWithRelations(db, noteObjectId);

    return NextResponse.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { success: false, error: "নোট আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/notes/[id] — নোটটি মুছে ফেলা (admin/teacher)
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
        { success: false, error: "অকার্যকর বিষয় আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const noteObjectId = new ObjectId(id);

    // নোটটি ডাটাবেজে আছে কিনা তা চেক করা
    const existing = await db.collection("Note").findOne({ _id: noteObjectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "নোট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // মঙ্গোডিবি থেকে নোটটি মুছে ফেলা
    await db.collection("Note").deleteOne({ _id: noteObjectId });

    return NextResponse.json({
      success: true,
      message: "নোট মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { success: false, error: "নোট মুছে ফেলতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
