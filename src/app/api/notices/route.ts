import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// ============================================================
// GET /api/notices — নোটিশের তালিকা লোড করা (pinned নোটিশগুলো আগে সর্ট করে)
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");

    const client = await clientPromise;
    const db = client.db();

    // ১. ফিল্টারিং কন্ডিশন তৈরি করা
    const matchStage: any = {};
    if (!showAll) {
      matchStage.isActive = true;
    }
    if (type) {
      matchStage.type = type;
    }
    if (priority) {
      matchStage.priority = priority;
    }
    if (category) {
      matchStage.category = category;
    }

    // ২. মঙ্গোডিবি থেকে ডেটা কুয়েরি ও সর্ট করা
    // এখানে ইন-মেমোরি সর্ট করার চেয়ে ডেটাবেজ লেভেলেই সর্ট করা অনেক বেশি অপ্টিমাইজড।
    // MongoDB-তে boolean সর্টিং করার সময় -1 দিলে true সবার আগে আসে।
    const notices = await db
      .collection("Notice")
      .find(matchStage)
      .sort({
        pinned: -1, // Pinned নোটিশগুলো আগে দেখাবে
        createdAt: -1, // একই ক্যাটাগরিতে নতুন নোটিশগুলো আগে থাকবে
      })
      .toArray();

    // ৩. রেসপন্স ডাটা ফরম্যাট করা (id কনভার্সন সহ)
    const formattedNotices = notices.map((notice: any) => ({
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
    }));

    return NextResponse.json({ success: true, data: formattedNotices });
  } catch (error) {
    console.error("Error fetching notices:", error);
    return NextResponse.json(
      { success: false, error: "নোটিশ লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/notices — নতুন নোটিশ তৈরি করা (admin/teacher)
// ============================================================
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
      title: string;
      titleBn: string;
      content: string;
      type?: string;
      priority?: string;
      category?: string;
      pinned?: boolean;
      isActive?: boolean;
    };

    if (!title || !titleBn || !content) {
      return NextResponse.json(
        { success: false, error: "শিরোনাম ও বিষয়বস্তু প্রয়োজন" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // ১. নতুন নোটিশ অবজেক্ট তৈরি
    const newNotice = {
      title,
      titleBn,
      content,
      type: type || "general",
      priority: priority || "সাধারণ",
      category: category || "সাধারণ",
      pinned: pinned ?? false,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ২. মঙ্গোডিবি-তে ডেটা ইনসার্ট করা
    const result = await db.collection("Notice").insertOne(newNotice);

    // ৩. প্রিজমা ফরমেট অনুযায়ী রেসপন্স পাঠানো
    const noticeWithId = {
      id: result.insertedId.toString(),
      ...newNotice,
    };

    return NextResponse.json({ success: true, data: noticeWithId });
  } catch (error) {
    console.error("Error creating notice:", error);
    return NextResponse.json(
      { success: false, error: "নোটিশ তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
