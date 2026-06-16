import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "ইমেইল ও পাসওয়ার্ড প্রয়োজন" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Replicate Prisma's deep relations join using a single aggregation query
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

        // 4. Join Guardian with nested Children & user accounts
        {
          $lookup: {
            from: "guardians",
            let: { userId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
              // Join children (student profiles) linked to this guardian
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
                    // For each student, lookup their User profile credentials
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
        { success: false, error: "ইমেইল বা পাসওয়ার্ড ভুল" },
        { status: 401 },
      );
    }

    // Validate the password using bcryptjs against the fetched user hash
    const isPasswordValid = await bcrypt.compare(password, rawUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "ইমেইল বা পাসওয়ার্ড ভুল" },
        { status: 401 },
      );
    }

    // Standardize database documents to look like Prisma payloads (convert ObjectIds to string IDs)
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

    // Generate secure JWT token using your local auth configuration
    const token = await signJWT({
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
      role: userWithoutPassword.role,
    });

    // Set secure HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set("studyhub_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { success: false, error: "লগইন করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
