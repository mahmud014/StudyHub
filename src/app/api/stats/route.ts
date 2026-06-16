import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// ============================================================
// GET /api/stats — ড্যাশবোর্ড পরিসংখ্যান
// ============================================================
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // একসাথে সব ডাটা ফেচ করার জন্য Promise.all ব্যবহার করা হয়েছে
    const [
      studentCount,
      videoCount,
      noteCount,
      examCount,
      teacherCount,
      subjectCount,
    ] = await Promise.all([
      db.collection("users").countDocuments({ role: "student" }),
      db.collection("videos").countDocuments({}),
      db.collection("notes").countDocuments({}),
      db.collection("exams").countDocuments({}),
      db
        .collection("users")
        .countDocuments({ role: { $in: ["admin", "teacher"] } }),
      db.collection("subjects").countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        students: studentCount,
        videos: videoCount,
        notes: noteCount,
        exams: examCount,
        teachers: teacherCount,
        subjects: subjectCount,
        satisfaction: 98, // স্ট্যাটিক স্যাটিসফেকশন রেট
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "পরিসংখ্যান লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
