import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/study-plans — ইউজারের স্টাডি প্ল্যান তালিকা লোড করা
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

    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(sessionUser.id);

    const plans = await db
      .collection("studyPlans")
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    const formattedPlans = plans.map((p) => ({
      id: p._id.toString(),
      userId: p.userId.toString(),
      title: p.title,
      data: typeof p.data === "string" ? JSON.parse(p.data) : p.data,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formattedPlans });
  } catch (error) {
    console.error("GET Study Plans Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch study plans" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/study-plans — নতুন স্টাডি প্ল্যান তৈরি করা
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
    const client = await clientPromise;
    const db = client.db();

    const newPlan = {
      userId: new ObjectId(sessionUser.id),
      title: body.title,
      data: JSON.stringify(body.data),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("studyPlans").insertOne(newPlan);
    return NextResponse.json({
      success: true,
      data: { id: result.insertedId.toString(), ...newPlan },
    });
  } catch (error) {
    console.error("POST Study Plan Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create study plan" },
      { status: 500 },
    );
  }
}

// ============================================================
// PUT /api/study-plans — স্টাডি প্ল্যান আপডেট করা
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id || !ObjectId.isValid(body.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("studyPlans").findOneAndUpdate(
      { _id: new ObjectId(body.id) },
      {
        $set: {
          title: body.title,
          data: JSON.stringify(body.data),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("PUT Study Plan Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update study plan" },
      { status: 500 },
    );
  }
}
