import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const chapterId = searchParams.get("chapterId");

    const client = await clientPromise;
    const db = client.db();

    // ফিল্টারিং লজিক
    const matchQuery: any = {};
    if (subjectId) matchQuery.subjectId = new ObjectId(subjectId);
    if (chapterId) matchQuery.chapterId = new ObjectId(chapterId);

    // Aggregate দিয়ে Join (Include) করা
    const videos = await db
      .collection("videos")
      .aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "subjects",
            localField: "subjectId",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $lookup: {
            from: "chapters",
            localField: "chapterId",
            foreignField: "_id",
            as: "chapter",
          },
        },
        { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true } },
        { $sort: { order: 1, createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { success: false, error: "ভিডিও লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

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
    const { subjectId, chapterId, title, titleBn, youtubeId, duration, order } =
      body;

    if (!subjectId || !title || !titleBn || !youtubeId) {
      return NextResponse.json(
        { success: false, error: "বিষয়, শিরোনাম ও ইউটিউব আইডি প্রয়োজন" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const newVideo = {
      subjectId: new ObjectId(subjectId),
      chapterId: chapterId ? new ObjectId(chapterId) : null,
      title,
      titleBn,
      youtubeId,
      duration: duration || null,
      order: order || 0,
      createdAt: new Date(),
    };

    const result = await db.collection("videos").insertOne(newVideo);

    return NextResponse.json({
      success: true,
      data: { ...newVideo, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { success: false, error: "ভিডিও তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
