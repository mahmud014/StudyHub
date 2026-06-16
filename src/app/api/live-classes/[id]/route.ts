import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

//Helper function to fetch a live class with its joined subject
async function getLiveClassWithSubject(db: any, objectId: ObjectId) {
  const result = await db
    .collection("LiveClass")
    .aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: "Subject",
          localField: "subjectId",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
    ])
    .toArray();

  const liveClass = result[0];
  if (!liveClass) return null;

  return {
    id: liveClass._id.toString(),
    title: liveClass.title,
    titleBn: liveClass.titleBn || liveClass.title,
    meetingUrl: liveClass.meetingUrl || null,
    youtubeId: liveClass.youtubeId || null,
    scheduledAt: liveClass.scheduledAt,
    duration: liveClass.duration || null,
    status: liveClass.status,
    hostName: liveClass.hostName || null,
    description: liveClass.description || null,
    subjectId: liveClass.subjectId ? liveClass.subjectId.toString() : null,
    createdAt: liveClass.createdAt,
    updatedAt: liveClass.updatedAt,
    subject: liveClass.subject
      ? {
          id: liveClass.subject._id.toString(),
          name: liveClass.subject.name,
          nameBn: liveClass.subject.nameBn,
          color: liveClass.subject.color || null,
        }
      : null,
  };
}

// ============================================================
// PUT /api/live-classes/[id] — সম্পূর্ণ লাইভ ক্লাস তথ্য আপডেট করা
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
        { success: false, error: "অকার্যকর লাইভ ক্লাস আইডি" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      title,
      titleBn,
      subjectId,
      youtubeId,
      scheduledAt,
      duration,
      status,
      hostName,
      description,
    } = body as {
      title?: string;
      titleBn?: string;
      subjectId?: string;
      youtubeId?: string;
      scheduledAt?: string;
      duration?: number;
      status?: string;
      hostName?: string;
      description?: string | null;
    };

    const client = await clientPromise;
    const db = client.db();
    const classObjectId = new ObjectId(id);

    // ১. লাইভ ক্লাসটি ডাটাবেজে আছে কিনা তা চেক করা
    const existing = await db
      .collection("LiveClass")
      .findOne({ _id: classObjectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "লাইভ ক্লাস পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ২. ডাইনামিক আপডেট ডাটা অবজেক্ট তৈরি করা
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (titleBn !== undefined) updateData.titleBn = titleBn;
    if (youtubeId !== undefined) updateData.youtubeId = youtubeId || null;
    if (duration !== undefined)
      updateData.duration =
        duration !== null ? parseInt(duration as any) : null;
    if (status !== undefined) updateData.status = status;
    if (hostName !== undefined) updateData.hostName = hostName || null;
    if (description !== undefined) updateData.description = description || null;

    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    }

    if (subjectId !== undefined) {
      if (subjectId && ObjectId.isValid(subjectId)) {
        updateData.subjectId = new ObjectId(subjectId);
      } else {
        updateData.subjectId = null;
      }
    }

    // ৩. ডকুমেন্ট আপডেট করা
    await db
      .collection("LiveClass")
      .updateOne({ _id: classObjectId }, { $set: updateData });

    // ৪. আপডেটেড ডেটা রিলেশন সহ তুলে নিয়ে আসা (Prisma-র include ফিচারের বিকল্প)
    const updatedClass = await getLiveClassWithSubject(db, classObjectId);

    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error("Error updating live class:", error);
    return NextResponse.json(
      { success: false, error: "লাইভ ক্লাস আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH /api/live-classes/[id] — শুধুমাত্র স্ট্যাটাস পরিবর্তন করা
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
        { success: false, error: "অকার্যকর লাইভ ক্লাস আইডি" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { status } = body as { status: string };

    if (!status) {
      return NextResponse.json(
        { success: false, error: "স্ট্যাটাস প্রয়োজন" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const classObjectId = new ObjectId(id);

    const existing = await db
      .collection("LiveClass")
      .findOne({ _id: classObjectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "লাইভ ক্লাস পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // স্ট্যাটাস ফিল্ডটি আপডেট করা
    await db
      .collection("LiveClass")
      .updateOne(
        { _id: classObjectId },
        { $set: { status, updatedAt: new Date() } },
      );

    const updatedClass = await getLiveClassWithSubject(db, classObjectId);

    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error("Error patching live class:", error);
    return NextResponse.json(
      {
        success: false,
        error: "লাইভ ক্লাস স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/live-classes/[id] — লাইভ ক্লাস মুছে ফেলা
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
        { success: false, error: "অকার্যকর লাইভ ক্লাস আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const classObjectId = new ObjectId(id);

    const existing = await db
      .collection("LiveClass")
      .findOne({ _id: classObjectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "লাইভ ক্লাস পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    await db.collection("LiveClass").deleteOne({ _id: classObjectId });

    return NextResponse.json({
      success: true,
      data: { message: "লাইভ ক্লাস মুছে ফেলা হয়েছে" },
    });
  } catch (error) {
    console.error("Error deleting live class:", error);
    return NextResponse.json(
      { success: false, error: "লাইভ ক্লাস মুছতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
