import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "email প্রয়োজন" },
        { status: 400 },
      );
    }

    // Permit only if user is admin/teacher, or is fetching their own profile
    if (
      sessionUser.role !== "admin" &&
      sessionUser.role !== "teacher" &&
      sessionUser.email !== email
    ) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 403 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Use MongoDB aggregation to construct the nested relations
    const aggregationResult = await db
      .collection("users")
      .aggregate([
        // 1. Find user by email
        { $match: { email } },

        // 2. Join Student Profile
        {
          $lookup: {
            from: "studentProfiles",
            localField: "_id",
            foreignField: "userId",
            as: "studentProfile",
          },
        },
        {
          $unwind: {
            path: "$studentProfile",
            preserveNullAndEmptyArrays: true,
          },
        },

        // 3. Join Teacher Profile
        {
          $lookup: {
            from: "teacherProfiles",
            localField: "_id",
            foreignField: "userId",
            as: "teacherProfile",
          },
        },
        {
          $unwind: {
            path: "$teacherProfile",
            preserveNullAndEmptyArrays: true,
          },
        },

        // 4. Join Guardian with nested Children & user data
        {
          $lookup: {
            from: "guardians",
            let: { userId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
              // Join children (student profiles that list this guardian)
              {
                $lookup: {
                  from: "studentProfiles",
                  let: { guardianId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$guardianId", "$$guardianId"] },
                      },
                    },
                    // For each child's student profile, fetch their underlying User profile
                    {
                      $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                      },
                    },
                    {
                      $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                  ],
                  as: "children",
                },
              },
            ],
            as: "guardian",
          },
        },
        { $unwind: { path: "$guardian", preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    const rawUser = aggregationResult[0];

    if (!rawUser) {
      return NextResponse.json(
        { success: false, error: "ব্যবহারকারী পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // Helper to format MongoDB database structures to Prisma-like outputs (mapping _id to id)
    const formatUser = (userDoc: any) => {
      const { _id, password, ...rest } = userDoc;

      const formatted: any = {
        id: _id.toString(),
        ...rest,
      };

      if (formatted.studentProfile) {
        const { _id: sId, ...sRest } = formatted.studentProfile;
        formatted.studentProfile = { id: sId.toString(), ...sRest };
      }

      if (formatted.teacherProfile) {
        const { _id: tId, ...tRest } = formatted.teacherProfile;
        formatted.teacherProfile = { id: tId.toString(), ...tRest };
      }

      if (formatted.guardian) {
        const { _id: gId, children, ...gRest } = formatted.guardian;
        formatted.guardian = {
          id: gId.toString(),
          ...gRest,
          children:
            children?.map((child: any) => {
              const { _id: cId, user: childUser, ...cRest } = child;
              return {
                id: cId.toString(),
                ...cRest,
                user: childUser
                  ? {
                      id: childUser._id.toString(),
                      name: childUser.name,
                      email: childUser.email,
                    }
                  : null,
              };
            }) || [],
        };
      }

      return formatted;
    };

    const userWithoutPassword = formatUser(rawUser);

    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "ব্যবহারকারী খুঁজতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
