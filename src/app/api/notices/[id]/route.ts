import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// GET /api/notices/[id] — একটি নির্দিষ্ট নোটিশের তথ্য লোড করা
// ============================================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // ১. আইডি ভ্যালিডেশন
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর নোটিশ আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const noticeObjectId = new ObjectId(id);

    // ২. নোটিশ খোঁজা
    const notice = await db
      .collection("Notice")
      .findOne({ _id: noticeObjectId });

    if (!notice) {
      return NextResponse.json(
        { success: false, error: "নোটিশ পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ৩. রেসপন্স ডাটা ফরম্যাট করা
    const formattedNotice = {
      id: notice._id.toString(),
      title: notice.title,
      titleBn: notice.titleBn,
      content: notice.content,
      type: notice.type,
      priority: notice.priority,
      category: notice.category,
      pinned: !!notice.pinned,
      isActive: !!notice.isActive,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt,
    };

    return NextResponse.json({ success: true, data: formattedNotice });
  } catch (error) {
    console.error("Error fetching notice:", error);
    return NextResponse.json(
      { success: false, error: "নোটিশ লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH /api/notices/[id] — নোটিশের তথ্য আপডেট করা (admin/teacher)
// ============================================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর নোটিশ আইডি" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      title,
      titleBn,
      content,
      type,
      priority,
      category,
      pinned,
      isActive,
    } = body as {
      title?: string;
      titleBn?: string;
      content?: string;
      type?: string;
      priority?: string;
      category?: string;
      pinned?: boolean;
      isActive?: boolean;
    };

    const client = await clientPromise;
    const db = client.db();
    const noticeObjectId = new ObjectId(id);

    // ১. নোটিশটি ডাটাবেজে আছে কিনা তা চেক করা
    const existing = await db
      .collection("Notice")
      .findOne({ _id: noticeObjectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "নোটিশ পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ২. ডাইনামিক আপডেট ডেটা অবজেক্ট তৈরি করা
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (titleBn !== undefined) updateData.titleBn = titleBn;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (pinned !== undefined) updateData.pinned = pinned;
    if (isActive !== undefined) updateData.isActive = isActive;

    // ৩. ডকুমেন্ট আপডেট করা এবং নতুন ডেটা ফেরত নেওয়া
    const result = await db
      .collection("Notice")
      .findOneAndUpdate(
        { _id: noticeObjectId },
        { $set: updateData },
        { returnDocument: "after" },
      );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "নোটিশ আপডেট করতে সমস্যা হয়েছে" },
        { status: 500 },
      );
    }

    // ৪. রেসপন্স ডাটা ফরম্যাট করা
    const updatedNotice = {
      id: result._id.toString(),
      title: result.title,
      titleBn: result.titleBn,
      content: result.content,
      type: result.type,
      priority: result.priority,
      category: result.category,
      pinned: !!result.pinned,
      isActive: !!result.isActive,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return NextResponse.json({ success: true, data: updatedNotice });
  } catch (error) {
    console.error("Error updating notice:", error);
    return NextResponse.json(
      { success: false, error: "নোটিশ আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/notices/[id] — নোটিশ মুছে ফেলা (admin/teacher)
// ============================================================
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর নোটিশ আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const noticeObjectId = new ObjectId(id);

    // ১. নোটিশটি ডাটাবেজে আছে কিনা তা চেক করা
    const existing = await db
      .collection("Notice")
      .findOne({ _id: noticeObjectId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "নোটিশ পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ২. মঙ্গোডিবি থেকে নোটিশটি মুছে ফেলা
    await db.collection("Notice").deleteOne({ _id: noticeObjectId });

    return NextResponse.json({
      success: true,
      data: { message: "নোটিশ মুছে ফেলা হয়েছে" },
    });
  } catch (error) {
    console.error("Error deleting notice:", error);
    return NextResponse.json(
      { success: false, error: "নোটিশ মুছতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
