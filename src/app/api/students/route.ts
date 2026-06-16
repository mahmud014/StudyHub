import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ডেটার ফরম্যাট ডিফাইন করা
interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  class: string;
  roll: number;
  school: string;
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 401 },
      );
    }

    if (sessionUser.role === "student") {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 403 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // টাইপ নির্দিষ্ট করে দেওয়া
    let students: StudentData[] = [];

    if (sessionUser.role === "guardian") {
      const guardian = await db.collection("guardians").findOne({
        userId: sessionUser.id,
      });

      if (guardian && guardian.childrenIds) {
        const childrenProfiles = await db
          .collection("studentProfiles")
          .find({ userId: { $in: guardian.childrenIds } })
          .toArray();

        students = await Promise.all(
          childrenProfiles.map(async (profile) => {
            const user = await db
              .collection("users")
              .findOne({ _id: new ObjectId(profile.userId) });
            return {
              id: user?._id.toString() || "", // ObjectId থেকে String এ রূপান্তর
              name: user?.name || "N/A",
              email: user?.email || "",
              phone: user?.phone,
              avatar: user?.avatar,
              class: profile.class,
              roll: profile.roll,
              school: profile.school,
            };
          }),
        );
      }
    } else {
      const studentProfiles = await db
        .collection("studentProfiles")
        .find({})
        .sort({ roll: 1 })
        .toArray();

      students = await Promise.all(
        studentProfiles.map(async (profile) => {
          const user = await db
            .collection("users")
            .findOne({ _id: new ObjectId(profile.userId) });
          return {
            id: user?._id.toString() || "",
            name: user?.name || "N/A",
            email: user?.email || "",
            phone: user?.phone,
            avatar: user?.avatar,
            class: profile.class,
            roll: profile.roll,
            school: profile.school,
          };
        }),
      );
    }

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    // যেহেতু আপনি toast sonner ব্যবহার করেন, ফ্রন্টএন্ডে toast.error দিয়ে এটি দেখাবেন
    return NextResponse.json(
      { success: false, error: "শিক্ষার্থীদের তালিকা লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
