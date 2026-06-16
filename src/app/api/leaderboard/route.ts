import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/leaderboard — নির্দিষ্ট বা সর্বশেষ সপ্তাহের লিডারবোর্ড লোড করা
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");

    const client = await clientPromise;
    const db = client.db();

    // ১. যদি নির্দিষ্ট কোনো সপ্তাহ (week) পাঠানো না হয়, তবে সর্বশেষ সপ্তাহটি খুঁজে নেওয়া
    let targetWeek = week;
    if (!targetWeek) {
      const latestEntry = await db.collection("leaderboardEntries").findOne(
        {},
        {
          sort: { week: -1 },
          projection: { week: 1 },
        },
      );

      if (latestEntry) {
        targetWeek = latestEntry.week;
      }
    }

    // ২. ফিল্টারিং কন্ডিশন তৈরি করা
    const matchStage: any = {};
    if (targetWeek) {
      matchStage.week = targetWeek;
    }

    // ৩. মঙ্গোডিবি এগ্রিগেশন চালিয়ে রিলেশনশিপ ডাটা এবং সর্টিং হ্যান্ডল করা
    const entries = await db
      .collection("leaderboardEntries")
      .aggregate([
        { $match: matchStage },
        // র‍্যাঙ্ক অনুযায়ী ছোট থেকে বড় সাজানো (যেমন: ১ম, ২য়, ৩য়...)
        { $sort: { rank: 1 } },

        // User কালেকশন থেকে প্রোফাইলের তথ্য জয়েন করা
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        // প্রয়োজনীয় ফিল্ডগুলো প্রজেক্ট করা
        {
          $project: {
            _id: 1,
            userId: 1,
            week: 1,
            score: 1,
            rank: 1,
            createdAt: 1,
            updatedAt: 1,
            user: {
              _id: "$user._id",
              name: "$user.name",
              avatar: "$user.avatar",
            },
          },
        },
      ])
      .toArray();

    // ৪. রেসপন্স ডাটা ফরম্যাট করা (ফ্রন্টএন্ড ফ্রেন্ডলি string 'id' দিয়ে সাজানো)
    const formattedEntries = entries.map((entry: any) => ({
      id: entry._id.toString(),
      userId: entry.userId ? entry.userId.toString() : null,
      week: entry.week,
      score: entry.score,
      rank: entry.rank,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      user: entry.user?._id
        ? {
            id: entry.user._id.toString(),
            name: entry.user.name,
            avatar: entry.user.avatar || null,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        week: targetWeek,
        entries: formattedEntries,
      },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "লিডারবোর্ড লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
