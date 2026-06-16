import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// ============================================================
// GET /api/subjects — সাবজেক্ট ও তাদের চ্যাপ্টারসমূহ লোড করা
// ============================================================
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // মঙ্গোডিবিতে রিলেশনাল ডেটা Fetch করার জন্য aggregate ব্যবহার করা হয়েছে
    const subjects = await db
      .collection("subjects")
      .aggregate([
        { $sort: { order: 1 } },
        {
          $lookup: {
            from: "chapters",
            localField: "_id",
            foreignField: "subjectId",
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
      .toArray();

    const formattedData = subjects.map((s) => ({
      ...s,
      id: s._id.toString(),
      chapters: s.chapters.map((c: any) => ({
        ...c,
        id: c._id.toString(),
        subjectId: c.subjectId.toString(),
      })),
    }));

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { success: false, error: "বিষয়সমূহ লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
