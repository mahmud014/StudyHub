import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/progress — লগইনকৃত শিক্ষার্থীর অগ্রগতি লোড করা (টাইপ অনুযায়ী ফিল্টারিং সহ)
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const client = await clientPromise;
    const db = client.db();
    const userObjectId = new ObjectId(userId);

    // ১. কোয়েরি কন্ডিশন তৈরি করা
    const query: any = { userId: userObjectId };
    if (type) query.type = type;

    // ২. মঙ্গোডিবি থেকে ডেটা কুয়েরি করা (সর্বশেষ আপডেট হওয়া রেকর্ড আগে দেখাবে)
    const progressRecords = await db
      .collection("progress")
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();

    // ৩. রেসপন্স ডাটা ফরম্যাট করা (_id কে স্ট্রিং id-তে রূপান্তর)
    const formattedProgress = progressRecords.map((p: any) => ({
      id: p._id.toString(),
      userId: p.userId ? p.userId.toString() : null,
      refId: p.refId ? p.refId.toString() : null,
      type: p.type,
      progress: p.progress,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formattedProgress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { success: false, error: "অগ্রগতি লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/progress — নতুন অগ্রগতি সংরক্ষণ বা বিদ্যমান অগ্রগতি আপডেট (Upsert) করা
// ============================================================
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

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর ব্যবহারকারী আইডি" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as {
      type: string;
      refId: string;
      progress: number;
    };
    const { type, refId, progress: progressValue } = body;

    if (!type || !refId || progressValue === undefined) {
      return NextResponse.json(
        { success: false, error: "type, refId এবং progress প্রয়োজন" },
        { status: 400 },
      );
    }

    const parsedProgressValue = Number(progressValue);
    if (
      isNaN(parsedProgressValue) ||
      parsedProgressValue < 0 ||
      parsedProgressValue > 100
    ) {
      return NextResponse.json(
        { success: false, error: "progress মান ০ থেকে ১০০ এর মধ্যে হতে হবে" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const userObjectId = new ObjectId(userId);
    // যদি refId একটি ভ্যালিড অবজেক্ট আইডি হয় তবে সেটিকে কাস্ট করা, অন্যথায় স্ট্রিং রাখা
    const refObjectId = ObjectId.isValid(refId) ? new ObjectId(refId) : refId;

    // ৩. মঙ্গোডিবি-র এটোমিক findOneAndUpdate এবং upsert অপারেটর দিয়ে নিখুঁত আপসার্ট
    // এটি আগের প্রিজমা কোডের মতো প্রথমে findFirst এবং পরে ক্রিয়েট/আপডেট করার চেয়ে অনেক দ্রুত ও নিরাপদ
    const result = await db.collection("progress").findOneAndUpdate(
      { userId: userObjectId, type, refId: refObjectId },
      {
        $set: {
          progress: parsedProgressValue,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "অগ্রগতি সংরক্ষণ করা যায়নি" },
        { status: 500 },
      );
    }

    // ৪. রিটার্ন ডাটা ফরম্যাট করা
    const formattedResult = {
      id: result._id.toString(),
      userId: result.userId ? result.userId.toString() : null,
      refId: result.refId ? result.refId.toString() : null,
      type: result.type,
      progress: result.progress,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return NextResponse.json({ success: true, data: formattedResult });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { success: false, error: "অগ্রগতি সংরক্ষণ করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
