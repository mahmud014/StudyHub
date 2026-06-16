import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    // Auth Guard: Only admins and teachers can access the general user list
    if (
      !sessionUser ||
      (sessionUser.role !== "admin" && sessionUser.role !== "teacher")
    ) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const client = await clientPromise;
    const db = client.db();

    // 1. Build the Match conditions for filtering (equivalent to Prisma's 'where')
    const matchStage: any = {};

    if (role) {
      matchStage.role = role;
    }

    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Aggregate users along with relation counts to avoid pulling all nested records
    const users = await db
      .collection("users")
      .aggregate([
        // Filter users first for performance
        { $match: matchStage },

        // Join with examResults collection
        {
          $lookup: {
            from: "examResults",
            localField: "_id",
            foreignField: "userId",
            as: "examResults",
          },
        },

        // Join with progress collection
        {
          $lookup: {
            from: "progress",
            localField: "_id",
            foreignField: "userId",
            as: "progressRecords",
          },
        },

        // Join with qaQuestions collection
        {
          $lookup: {
            from: "qaQuestions",
            localField: "_id",
            foreignField: "userId",
            as: "qaQuestions",
          },
        },

        // Project fields and calculate relation sizes (similar to Prisma's _count select)
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            avatar: 1,
            phone: 1,
            createdAt: 1,
            _count: {
              examResults: { $size: "$examResults" },
              progressRecords: { $size: "$progressRecords" },
              qaQuestions: { $size: "$qaQuestions" },
            },
          },
        },

        // Sort by creation date descending
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // 3. Format MongoDB output to align with the application's string 'id' expectations
    const formattedUsers = users.map((user: any) => {
      const { _id, ...rest } = user;
      return {
        id: _id.toString(),
        ...rest,
      };
    });

    return NextResponse.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error("Error fetching users list:", error);
    return NextResponse.json(
      { success: false, error: "ব্যবহারকারী তালিকা লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
