import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/study-groups — স্টাডি গ্রুপের তালিকা লোড করা
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const client = await clientPromise;
    const db = client.db();

    const matchStage: any = {};
    if (subjectId && ObjectId.isValid(subjectId)) {
      matchStage.subjectId = new ObjectId(subjectId);
    }

    const groups = await db
      .collection("studyGroups")
      .aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },

        // Subject জয়েন
        {
          $lookup: {
            from: "Subject",
            localField: "subjectId",
            foreignField: "_id",
            as: "subject",
          },
        },
        { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },

        // Creator জয়েন
        {
          $lookup: {
            from: "users",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
          },
        },
        { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },

        // Members জয়েন
        {
          $lookup: {
            from: "groupMembers",
            localField: "_id",
            foreignField: "groupId",
            as: "members",
          },
        },
      ])
      .toArray();

    const formattedGroups = groups.map((g: any) => ({
      ...g,
      id: g._id.toString(),
      _count: { members: g.members?.length || 0 },
    }));

    return NextResponse.json({ success: true, data: formattedGroups });
  } catch (error) {
    console.error("GET Study Groups Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch study groups" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/study-groups — স্টাডি গ্রুপ তৈরি করা
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();

    if (!body.name || !body.subjectId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const creatorObjectId = new ObjectId(sessionUser.id);
    const subjectObjectId = new ObjectId(body.subjectId);

    const group = {
      name: body.name,
      description: body.description,
      subjectId: subjectObjectId,
      creatorId: creatorObjectId,
      maxMembers: body.maxMembers || 10,
      createdAt: new Date(),
    };

    const result = await db.collection("studyGroups").insertOne(group);

    // অ্যাডমিন মেম্বার যোগ করা
    await db.collection("groupMembers").insertOne({
      groupId: result.insertedId,
      userId: creatorObjectId,
      role: "admin",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { id: result.insertedId.toString(), ...group },
    });
  } catch (error) {
    console.error("POST Study Group Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create study group" },
      { status: 500 },
    );
  }
}
