import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db();

    // MongoDB তে রিলেশন বা 'include' করার জন্য lookup ব্যবহার করতে হয়
    const subject = await db
      .collection("subjects")
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "chapters", // আপনার chapters কালেকশনের নাম
            localField: "_id",
            foreignField: "subjectId", // chapters টেবিলে যে ফিল্ডে সাবজেক্টের ID আছে
            as: "chapters",
          },
        },
        {
          $addFields: {
            chapters: {
              $sortArray: { input: "$chapters", sortBy: { order: 1 } },
            },
          },
        },
      ])
      .next();

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "বিষয় পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { success: false, error: "বিষয় লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
