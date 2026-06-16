import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// POST /api/study-groups/[id]/members — গ্রুপে জয়েন করা
// ============================================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id))
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 },
      );

    const client = await clientPromise;
    const db = client.db();
    const groupId = new ObjectId(id);
    const userId = new ObjectId(sessionUser.id);

    // ১. অলরেডি মেম্বার কিনা চেক
    const existing = await db
      .collection("groupMembers")
      .findOne({ groupId, userId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already a member" },
        { status: 400 },
      );
    }

    // ২. গ্রুপ ফুল কিনা চেক
    const group = await db.collection("studyGroups").findOne({ _id: groupId });
    const currentCount = await db
      .collection("groupMembers")
      .countDocuments({ groupId });

    if (group && currentCount >= (group.maxMembers || 10)) {
      return NextResponse.json(
        { success: false, error: "Group is full" },
        { status: 400 },
      );
    }

    // ৩. মেম্বার ইনসার্ট
    const result = await db.collection("groupMembers").insertOne({
      groupId,
      userId,
      role: "member",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { id: result.insertedId, groupId, userId },
    });
  } catch (error) {
    console.error("Join Group Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join group" },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/study-groups/[id]/members — গ্রুপ থেকে বের হওয়া
// ============================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const groupId = new ObjectId(id);
    const userId = new ObjectId(sessionUser.id);

    const client = await clientPromise;
    const db = client.db();

    const existing = await db
      .collection("groupMembers")
      .findOne({ groupId, userId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Not a member" },
        { status: 400 },
      );
    }

    // অ্যাডমিন চেক
    if (existing.role === "admin") {
      const adminCount = await db
        .collection("groupMembers")
        .countDocuments({ groupId, role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error:
              "একমাত্র অ্যাডমিন গ্রুপ ছেড়ে দিতে পারবেন না। প্রথমে অন্য কাউকে অ্যাডমিন করুন অথবা গ্রুপ মুছে ফেলুন।",
          },
          { status: 400 },
        );
      }
    }

    await db.collection("groupMembers").deleteOne({ _id: existing._id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave Group Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to leave group" },
      { status: 500 },
    );
  }
}
