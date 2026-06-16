import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// TYPES & INTERFACES FOR TYPE SAFETY
// ============================================================
interface UserProfile {
  _id: ObjectId;
  name: string;
  avatar?: string | null;
  role: string;
}

interface SubjectProfile {
  _id: ObjectId;
  name: string;
  nameBn: string;
}

// ============================================================
// হেল্পার ফাংশন: রিলেশনশিপ এবং সর্টেড উত্তর সহ প্রশ্ন লোড করা
// ============================================================
async function getQuestionWithRelations(db: any, questionObjectId: ObjectId) {
  const result = await db
    .collection("qaQuestions")
    .aggregate([
      { $match: { _id: questionObjectId } },

      // ১. প্রশ্নকর্তার ইউজার ডাটা জয়েন করা
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // ২. বিষয়ের ডাটা জয়েন করা
      {
        $lookup: {
          from: "Subject",
          localField: "subjectId",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },

      // ৩. সমস্ত উত্তর এবং উত্তরদাতাদের তথ্য জয়েন করা (তৈরির সময় অনুযায়ী সর্টেড)
      {
        $lookup: {
          from: "qaAnswers",
          let: { questionId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$questionId", "$$questionId"] } } },
            { $sort: { createdAt: 1 } }, // orderBy: { createdAt: "asc" }
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          ],
          as: "answers",
        },
      },
    ])
    .toArray();

  const question = result[0];
  if (!question) return null;

  // প্রিজমার রিটার্ন ফরমেটের মতো ডাটা ডেকোরেট করা
  return {
    id: question._id.toString(),
    userId: question.userId ? question.userId.toString() : null,
    subjectId: question.subjectId ? question.subjectId.toString() : null,
    title: question.title,
    content: question.content,
    upvotes: question.upvotes ?? 0,
    isSolved: !!question.isSolved,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
    user: question.user
      ? {
          id: question.user._id.toString(),
          name: question.user.name,
          avatar: question.user.avatar || null,
          role: question.user.role || "student",
        }
      : null,
    subject: question.subject
      ? {
          id: question.subject._id.toString(),
          name: question.subject.name,
          nameBn: question.subject.nameBn,
        }
      : null,
    answers:
      question.answers?.map((ans: any) => ({
        id: ans._id.toString(),
        questionId: ans.questionId ? ans.questionId.toString() : null,
        userId: ans.userId ? ans.userId.toString() : null,
        content: ans.content,
        isAccepted: !!ans.isAccepted,
        createdAt: ans.createdAt,
        updatedAt: ans.updatedAt,
        user: ans.user
          ? {
              id: ans.user._id.toString(),
              name: ans.user.name,
              avatar: ans.user.avatar || null,
              role: ans.user.role || "student",
            }
          : null,
      })) || [],
  };
}

// ============================================================
// GET /api/questions/[id] — নির্দিষ্ট একটি প্রশ্নের বিস্তারিত তথ্য লোড করা
// ============================================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর প্রশ্ন আইডি" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const questionObjectId = new ObjectId(id);

    const question = await getQuestionWithRelations(db, questionObjectId);

    if (!question) {
      return NextResponse.json(
        { success: false, error: "প্রশ্ন পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { success: false, error: "প্রশ্ন লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH /api/questions/[id] — প্রশ্ন ভোট দেওয়া অথবা গ্রহণযোগ্য উত্তর নির্বাচন করা
// ============================================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: questionId } = await params;

    if (!ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর প্রশ্ন আইডি" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as {
      action: "upvote" | "downvote" | "accept-answer";
      answerId?: string;
    };

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

    switch (body.action) {
      // এটোমিক ভোট ইনক্রিমেন্ট করা
      case "upvote": {
        await db.collection("qaQuestions").updateOne(
          { _id: questionObjectId },
          {
            $inc: { upvotes: 1 },
            $set: { updatedAt: new Date() },
          },
        );
        const updated = await getQuestionWithRelations(db, questionObjectId);
        return NextResponse.json({ success: true, data: updated });
      }

      // এটোমিক ভোট ডিক্রিমেন্ট করা
      case "downvote": {
        await db.collection("qaQuestions").updateOne(
          { _id: questionObjectId },
          {
            $inc: { upvotes: -1 },
            $set: { updatedAt: new Date() },
          },
        );
        const updated = await getQuestionWithRelations(db, questionObjectId);
        return NextResponse.json({ success: true, data: updated });
      }

      // সঠিক উত্তর সিলেক্ট করা এবং পূর্বের সঠিক উত্তর থাকলে তা আন-এক্সেপ্ট করা
      case "accept-answer": {
        if (!body.answerId) {
          return NextResponse.json(
            { success: false, error: "answerId প্রয়োজন" },
            { status: 400 },
          );
        }

        if (!ObjectId.isValid(body.answerId)) {
          return NextResponse.json(
            { success: false, error: "অকার্যকর উত্তর আইডি" },
            { status: 400 },
          );
        }

        const answerObjectId = new ObjectId(body.answerId);

        // উত্তরটি ডাটাবেজে আছে কিনা এবং এই প্রশ্নের অধীনে কিনা তা চেক করা
        const answer = await db
          .collection("qaAnswers")
          .findOne({ _id: answerObjectId });
        if (!answer || answer.questionId?.toString() !== questionId) {
          return NextResponse.json(
            { success: false, error: "উত্তর পাওয়া যায়নি" },
            { status: 404 },
          );
        }

        // পূর্বের সঠিক উত্তর থাকলে সেগুলোকে রিজেক্ট করে নতুনটি এক্সেপ্ট করা (Transaction alternatives)
        await db
          .collection("qaAnswers")
          .updateMany(
            { questionId: questionObjectId, isAccepted: true },
            { $set: { isAccepted: false, updatedAt: new Date() } },
          );

        await db
          .collection("qaAnswers")
          .updateOne(
            { _id: answerObjectId },
            { $set: { isAccepted: true, updatedAt: new Date() } },
          );

        // প্রশ্নটিকে সমাধানকৃত হিসেবে চিহ্নিত করা
        await db
          .collection("qaQuestions")
          .updateOne(
            { _id: questionObjectId },
            { $set: { isSolved: true, updatedAt: new Date() } },
          );

        const updatedQuestion = await getQuestionWithRelations(
          db,
          questionObjectId,
        );
        return NextResponse.json({ success: true, data: updatedQuestion });
      }

      default:
        return NextResponse.json(
          { success: false, error: "অবৈধ action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { success: false, error: "আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
