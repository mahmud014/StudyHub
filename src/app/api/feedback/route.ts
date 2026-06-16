import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth"; // আপনার ফাইল পাথ অনুযায়ী

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const body = await request.json();
    const { type, rating, description, title, subject } = body;

    const client = await clientPromise;
    const db = client.db();

    const newFeedbackNotice = {
      title: title || `ফিডব্যাক - ${type}`,
      category: type,
      isActive: true,
      createdAt: new Date(),
      // এখানে ইউজারের নাম এবং আইডি সেভ করছি
      content: JSON.stringify({
        userId: sessionUser?.id || null,
        userName: sessionUser?.name || "ব্যবহারকারী",
        type,
        subject: subject || null,
        rating,
        description,
      }),
    };

    await db.collection("feedback").insertOne(newFeedbackNotice);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "সাবমিট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const feedbackNotices = await db
      .collection("feedback")
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    const feedbackList = feedbackNotices.map((notice: any) => {
      let parsed: any = {};
      try {
        parsed = JSON.parse(notice.content);
      } catch {}

      return {
        id: notice._id.toString(),
        text: parsed.description || "",
        rating: parsed.rating || 0,
        author: parsed.userName || "ব্যবহারকারী",
        date: new Date(notice.createdAt).toLocaleDateString("bn-BD"),
      };
    });

    return NextResponse.json({ success: true, data: feedbackList });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
