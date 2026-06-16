import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Securely delete the HTTP-only session cookie
    cookieStore.delete("studyhub_session");

    return NextResponse.json({
      success: true,
      message: "লগআউট সফল হয়েছে",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { success: false, error: "লগআউট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
