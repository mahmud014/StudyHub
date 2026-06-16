import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

interface AnswerRequestBody {
  content: string;
}

// ============================================================
// POST /api/questions/[id]/answers — উত্তর তৈরি করা
// ============================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 401 },
      );
    }

    const { id: questionId } = await params;
    const body = (await request.json()) as AnswerRequestBody;
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "content প্রয়োজন" },
        { status: 400 },
      );
    }

    if (!ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর প্রশ্ন আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const questionObjectId = new ObjectId(questionId);

    // ১. প্রশ্নটি ডাটাবেজে আছে কিনা তা চেক করা
    const question = await db
      .collection("qaQuestions")
      .findOne({ _id: questionObjectId });
    if (!question) {
      return NextResponse.json(
        { success: false, error: "প্রশ্ন পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ২. নতুন উত্তর তৈরি করা
    const newAnswer = {
      questionId: questionObjectId,
      userId: new ObjectId(sessionUser.id),
      content,
      upvotes: 0,
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("qaAnswers").insertOne(newAnswer);

    // ৩. ইউজারের তথ্যসহ রিটার্ন করা (Lookup)
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(sessionUser.id) });

    const finalAnswer = {
      id: result.insertedId.toString(),
      ...newAnswer,
      questionId: newAnswer.questionId.toString(),
      userId: newAnswer.userId.toString(),
      user: user
        ? {
            id: user._id.toString(),
            name: user.name,
            avatar: user.avatar || null,
            role: user.role || "student",
          }
        : null,
    };

    return NextResponse.json(
      { success: true, data: finalAnswer },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { success: false, error: "উত্তর তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH /api/questions/[id]/answers — উত্তর ভোট দেওয়া
// ============================================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 401 },
      );
    }

    const { id: questionId } = await params;
    const body = (await request.json()) as {
      answerId: string;
      action: "upvote" | "downvote";
    };

    if (!body.answerId || !ObjectId.isValid(body.answerId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর বা অনুপস্থিত answerId" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const answerObjectId = new ObjectId(body.answerId);

    // ১. উত্তরটি বিদ্যমান কি না চেক করা
    const answer = await db.collection("qaAnswers").findOne({
      _id: answerObjectId,
      questionId: new ObjectId(questionId),
    });

    if (!answer) {
      return NextResponse.json(
        { success: false, error: "উত্তর পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ২. ভোট আপডেট করা (এটোমিক অপারেশন)
    const increment = body.action === "upvote" ? 1 : -1;
    await db
      .collection("qaAnswers")
      .updateOne(
        { _id: answerObjectId },
        { $inc: { upvotes: increment }, $set: { updatedAt: new Date() } },
      );

    // ৩. আপডেট হওয়া ডাটা রিটার্ন করা
    const updatedAnswer = await db
      .collection("qaAnswers")
      .findOne({ _id: answerObjectId });
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(answer.userId) });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedAnswer,
        id: updatedAnswer?._id.toString(),
        user: user
          ? {
              id: user._id.toString(),
              name: user.name,
              avatar: user.avatar || null,
              role: user.role || "student",
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating answer:", error);
    return NextResponse.json(
      { success: false, error: "আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
