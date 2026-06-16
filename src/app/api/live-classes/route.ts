import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/live-classes — লাইভ ক্লাসের তালিকা লোড করা
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const status = searchParams.get("status");

    const client = await clientPromise;
    const db = client.db();

    // ১. ফিল্টারিং কন্ডিশন তৈরি করা
    const matchStage: any = {};

    if (subjectId && ObjectId.isValid(subjectId)) {
      matchStage.subjectId = new ObjectId(subjectId);
    } else if (subjectId) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর বিষয় আইডি" },
        { status: 400 },
      );
    }

    if (status) {
      matchStage.status = status;
    }

    // ২. মঙ্গোডিবি এগ্রিগেশন পাইপলাইন চালিয়ে Subject জয়েন এবং সর্টিং হ্যান্ডল করা
    const classes = await db
      .collection("LiveClass")
      .aggregate([
        { $match: matchStage },
        // শিডিউল টাইম অনুযায়ী ছোট থেকে বড় সাজানো (আসন্ন ক্লাসগুলো আগে দেখানোর জন্য)
        { $sort: { scheduledAt: 1 } },

        // Subject কালেকশন থেকে বিষয়ের তথ্য জয়েন করা
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

    // ৩. রেসপন্স ডাটা ফরম্যাট করা (id কনভার্সন সহ)
    const formattedClasses = classes.map((liveClass: any) => ({
      id: liveClass._id.toString(),
      title: liveClass.title,
      description: liveClass.description || null,
      meetingUrl: liveClass.meetingUrl || null,
      scheduledAt: liveClass.scheduledAt,
      duration: liveClass.duration || null,
      status: liveClass.status,
      subjectId: liveClass.subjectId ? liveClass.subjectId.toString() : null,
      createdAt: liveClass.createdAt,
      updatedAt: liveClass.updatedAt,
      subject: liveClass.subject
        ? {
            id: liveClass.subject._id.toString(),
            name: liveClass.subject.name,
            nameBn: liveClass.subject.nameBn,
            icon: liveClass.subject.icon || null,
            color: liveClass.subject.color || null,
          }
        : null,
    }));

    return NextResponse.json({ success: true, data: formattedClasses });
  } catch (error) {
    console.error("Error fetching live classes:", error);
    return NextResponse.json(
      { success: false, error: "লাইভ ক্লাস লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/live-classes — নতুন লাইভ ক্লাস তৈরি করা (admin/teacher)
// ============================================================
export async function POST(req: NextRequest) {
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

    const body = await requestJson(req);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "অনুরোধের ডাটা পাওয়া যায়নি" },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      meetingUrl,
      scheduledAt,
      duration,
      status,
      subjectId,
    } = body;

    if (!title || !meetingUrl || !scheduledAt || !subjectId) {
      return NextResponse.json(
        {
          success: false,
          error: "শিরোনাম, মিটিং লিংক, সময় এবং বিষয় আইডি প্রয়োজন",
        },
        { status: 400 },
      );
    }

    if (!ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর বিষয় আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // বিষয়ের অস্তিত্ব চেক করা
    const subjectObjectId = new ObjectId(subjectId);
    const subject = await db
      .collection("Subject")
      .findOne({ _id: subjectObjectId });
    if (!subject) {
      return NextResponse.json(
        { success: false, error: "বিষয় পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // নতুন লাইভ ক্লাস ডকুমেন্ট তৈরি করা
    const newLiveClass = {
      title,
      description: description || null,
      meetingUrl,
      scheduledAt: new Date(scheduledAt),
      duration: duration ? parseInt(duration) : null,
      status: status || "upcoming",
      subjectId: subjectObjectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("LiveClass").insertOne(newLiveClass);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertedId.toString(),
          ...newLiveClass,
          subjectId: subjectId,
          subject: {
            id: subject._id.toString(),
            name: subject.name,
            nameBn: subject.nameBn,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating live class:", error);
    return NextResponse.json(
      { success: false, error: "লাইভ ক্লাস তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// সেফ বডি পার্সিং হেল্পার ফাংশন
async function requestJson(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
