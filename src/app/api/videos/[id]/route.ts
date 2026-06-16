import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(
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

    const updateData: any = {};
    if (body.subjectId !== undefined)
      updateData.subjectId = new ObjectId(body.subjectId);
    if (body.chapterId !== undefined)
      updateData.chapterId = body.chapterId
        ? new ObjectId(body.chapterId)
        : null;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.titleBn !== undefined) updateData.titleBn = body.titleBn;
    if (body.youtubeId !== undefined) updateData.youtubeId = body.youtubeId;
    if (body.duration !== undefined)
      updateData.duration = body.duration || null;
    if (body.order !== undefined) updateData.order = body.order;

    const client = await clientPromise;
    const db = client.db();

    // নতুন ভার্সনে findOneAndUpdate সরাসরি ডকুমেন্ট রিটার্ন করে
    const updatedDocument = await db
      .collection("videos")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
      );

    // যদি ডকুমেন্ট না পাওয়া যায় তবে null আসবে
    if (!updatedDocument) {
      return NextResponse.json(
        { success: false, error: "ভিডিও পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedDocument });
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { success: false, error: "ভিডিও আপডেট করতে সমস্যা হয়েছে" },
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
    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection("videos")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "ভিডিও পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "ভিডিও মুছে ফেলা হয়েছে" },
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { success: false, error: "ভিডিও মুছতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
