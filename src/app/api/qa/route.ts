import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// ============================================================
// TYPES & INTERFACES FOR TYPE SAFETY
// ============================================================
interface SubjectDocument {
  _id: ObjectId;
  name: string;
  nameBn: string;
  icon?: string | null;
  color?: string | null;
}

interface UserDocument {
  _id: ObjectId;
  name: string;
  avatar?: string | null;
  email?: string;
}

// ============================================================
// GET /api/questions — List Q&A questions with pagination
// ============================================================
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const client = await clientPromise;
    const db = client.db();

    // ১. ফিল্টারিং কন্ডিশন তৈরি করা
    const matchStage: any = {};
    if (subjectId) {
      if (ObjectId.isValid(subjectId)) {
        matchStage.subjectId = new ObjectId(subjectId);
      } else {
        return NextResponse.json(
          { success: false, error: "অকার্যকর বিষয় আইডি" },
          { status: 400 },
        );
      }
    }

    const skip = (page - 1) * limit;

    // ২. মোট প্রশ্নের সংখ্যা এবং রিলেশনসহ প্রশ্ন তালিকা সমান্তরালে কুয়েরি করা (Parallel Execution)
    const [total, questions] = await Promise.all([
      db.collection("qaQuestions").countDocuments(matchStage),
      db
        .collection("qaQuestions")
        .aggregate([
          { $match: matchStage },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },

          // User কালেকশন জয়েন
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

          // Subject কালেকশন জয়েন
          {
            $lookup: {
              from: "Subject",
              localField: "subjectId",
              foreignField: "_id",
              as: "subject",
            },
          },
          { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },

          // উত্তর বা উত্তরের সংখ্যা হিসেব করতে qaAnswers জয়েন
          {
            $lookup: {
              from: "qaAnswers",
              localField: "_id",
              foreignField: "questionId",
              as: "answers",
            },
          },

          // প্রয়োজনীয় ফিল্ড প্রজেক্ট করা এবং উত্তরের কাউন্ট বের করা
          {
            $project: {
              _id: 1,
              userId: 1,
              subjectId: 1,
              title: 1,
              content: 1,
              createdAt: 1,
              updatedAt: 1,
              user: {
                _id: "$user._id",
                name: "$user.name",
                avatar: "$user.avatar",
              },
              subject: {
                _id: "$subject._id",
                name: "$subject.name",
                nameBn: "$subject.nameBn",
              },
              _count: {
                answers: { $size: "$answers" },
              },
            },
          },
        ])
        .toArray(),
    ]);

    // ৩. রেসপন্স ডাটা ফরমেট করা (_id কে স্ট্রিং id-তে রূপান্তর)
    const formattedQuestions = questions.map((q: any) => ({
      id: q._id.toString(),
      userId: q.userId ? q.userId.toString() : null,
      subjectId: q.subjectId ? q.subjectId.toString() : null,
      title: q.title,
      content: q.content,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      user: q.user?._id
        ? {
            id: q.user._id.toString(),
            name: q.user.name,
            avatar: q.user.avatar || null,
          }
        : null,
      subject: q.subject?._id
        ? {
            id: q.subject._id.toString(),
            name: q.subject.name,
            nameBn: q.subject.nameBn,
          }
        : null,
      _count: q._count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        questions: formattedQuestions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching QA questions:", error);
    return NextResponse.json(
      { success: false, error: "প্রশ্ন লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/questions — নতুন প্রশ্ন তৈরি করা
// ============================================================
export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত অ্যাক্সেস" },
        { status: 401 },
      );
    }
    const userId = sessionUser.id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "অকার্যকর ব্যবহারকারী আইডি" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as {
      subjectId?: string;
      title: string;
      content: string;
    };
    const { subjectId, title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "title এবং content প্রয়োজন" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const userObjectId = new ObjectId(userId);
    const subjectObjectId =
      subjectId && ObjectId.isValid(subjectId) ? new ObjectId(subjectId) : null;

    // ১. বিষয়ের অস্তিত্ব চেক করা এবং টাইপ অ্যাসাইনমেন্ট নিরাপদ করা
    let subjectDoc: SubjectDocument | null = null;
    if (subjectObjectId) {
      const foundSubject = await db
        .collection("Subject")
        .findOne({ _id: subjectObjectId });
      if (!foundSubject) {
        return NextResponse.json(
          { success: false, error: "বিষয় পাওয়া যায়নি" },
          { status: 404 },
        );
      }
      subjectDoc = foundSubject as unknown as SubjectDocument;
    }

    // ২. ব্যবহারকারীর তথ্য চেক করা এবং টাইপ অ্যাসাইনমেন্ট নিরাপদ করা
    const foundUser = await db
      .collection("users")
      .findOne({ _id: userObjectId }, { projection: { name: 1, avatar: 1 } });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: "ব্যবহারকারী পাওয়া যায়নি" },
        { status: 404 },
      );
    }
    const userDoc = foundUser as unknown as UserDocument;

    // ৩. নতুন প্রশ্নের ডকুমেন্ট তৈরি
    const newQuestion = {
      userId: userObjectId,
      subjectId: subjectObjectId,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("qaQuestions").insertOne(newQuestion);

    // ৪. প্রিজমা ফরমেট অনুযায়ী রিলেশনাল ডাটা স্ট্রাকচার রেডি করে রেসপন্স পাঠানো
    const questionWithRelations = {
      id: result.insertedId.toString(),
      userId: userId,
      subjectId: subjectId || null,
      title: newQuestion.title,
      content: newQuestion.content,
      createdAt: newQuestion.createdAt,
      updatedAt: newQuestion.updatedAt,
      user: {
        id: userDoc._id.toString(),
        name: userDoc.name,
        avatar: userDoc.avatar || null,
      },
      subject: subjectDoc
        ? {
            id: subjectDoc._id.toString(),
            name: subjectDoc.name,
            nameBn: subjectDoc.nameBn,
          }
        : null,
      _count: {
        answers: 0,
      },
    };

    return NextResponse.json(
      { success: true, data: questionWithRelations },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, error: "প্রশ্ন তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
