import db from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        subject: {
          select: { id: true, name: true, nameBn: true },
        },
        chapter: {
          select: { id: true, name: true, nameBn: true },
        },
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            marks: true,
            order: true,
            // Note: correctAnswer and explanation are NOT sent to client
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "পরীক্ষা পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { success: false, error: "পরীক্ষা লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

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
    const body = await request.json();
    const {
      title,
      titleBn,
      duration,
      totalMarks,
      isActive,
      subjectId,
      chapterId,
    } = body;

    const exam = await db.exam.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(titleBn !== undefined && { titleBn }),
        ...(duration !== undefined && {
          duration: parseInt(duration) || undefined,
        }),
        ...(totalMarks !== undefined && {
          totalMarks: parseInt(totalMarks) || undefined,
        }),
        ...(isActive !== undefined && { isActive }),
        ...(subjectId !== undefined && { subjectId }),
        ...(chapterId !== undefined && { chapterId: chapterId || null }),
      },
    });

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { success: false, error: "পরীক্ষা আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

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
    await db.exam.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "পরীক্ষা মুছে ফেলা হয়েছে" },
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { success: false, error: "পরীক্ষা মুছতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
