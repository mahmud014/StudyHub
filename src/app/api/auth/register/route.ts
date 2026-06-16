import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone } = body;

    // 1. Validation (Trimming input to prevent accidental whitespace issues)
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();
    const cleanPhone = phone?.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য প্রদান করুন।",
        },
        { status: 400 },
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // 2. Check if the email is already in use
    const existingUser = await db
      .collection("users")
      .findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে।" },
        { status: 400 },
      );
    }

    // 3. Hash the password securely
    const hashedPassword = await bcrypt.hash(cleanPassword, 12);

    // 4. Construct the clean MongoDB user document
    const newUser = {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: role || "student", // Defaults to student
      avatar: null,
      phone: cleanPhone || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 5. Insert document into "users" collection
    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        message: "নিবন্ধন সফল হয়েছে!",
        data: {
          id: result.insertedId.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { success: false, error: "নিবন্ধন সম্পন্ন করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
