import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
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

    const client = await clientPromise;
    const db = client.db();
    const userObjectId = new ObjectId(userId);

    // 1. Get user info and their student profile in parallel
    const [userDoc, studentProfileDoc] = await Promise.all([
      db.collection("users").findOne({ _id: userObjectId }),
      db.collection("studentProfiles").findOne({ userId: userObjectId }),
    ]);

    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "ব্যবহারকারী পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // 2. Parallel fetch of dashboard data using native MongoDB queries
    const [
      examResultsRaw,
      assignmentSubmissionsRaw,
      progressRecords,
      notificationsRaw,
      leaderboardEntry,
      upcomingAssignmentsRaw,
    ] = await Promise.all([
      // Exam results (sorted by completedAt desc, limit 5, with nested Exam & Subject lookup)
      db
        .collection("examResults")
        .aggregate([
          { $match: { userId: userObjectId } },
          { $sort: { completedAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "Exam",
              localField: "examId",
              foreignField: "_id",
              pipeline: [
                {
                  $lookup: {
                    from: "Subject",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subject",
                  },
                },
                {
                  $unwind: {
                    path: "$subject",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: "exam",
            },
          },
          { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
        ])
        .toArray(),

      // Assignment submissions (sorted by submittedAt desc, limit 5, with nested Assignment lookup)
      db
        .collection("AssignmentSubmission")
        .aggregate([
          { $match: { userId: userObjectId } },
          { $sort: { submittedAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "Assignment",
              localField: "assignmentId",
              foreignField: "_id",
              as: "assignment",
            },
          },
          {
            $unwind: { path: "$assignment", preserveNullAndEmptyArrays: true },
          },
        ])
        .toArray(),

      // Progress records
      db.collection("progress").find({ userId: userObjectId }).toArray(),

      // Unread notifications (sorted by createdAt desc, limit 5)
      db
        .collection("notifications")
        .find({
          userId: userObjectId,
          isRead: false,
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),

      // Current leaderboard rank (latest week entry)
      db
        .collection("leaderboardEntries")
        .findOne({ userId: userObjectId }, { sort: { week: -1 } }),

      // Upcoming assignments (deadline >= current time, sorted by deadline asc, limit 5, with Subject lookup)
      db
        .collection("Assignment")
        .aggregate([
          { $match: { deadline: { $gte: new Date() } } },
          { $sort: { deadline: 1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "Subject",
              localField: "subjectId",
              foreignField: "_id",
              as: "subject",
            },
          },
          { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
        ])
        .toArray(),
    ]);

    // 3. Format raw results to ensure string IDs for client-side compatibility
    const examResults = examResultsRaw.map((r: any) => ({
      id: r._id.toString(),
      examId: r.examId ? r.examId.toString() : null,
      userId: r.userId ? r.userId.toString() : null,
      score: r.score,
      totalMarks: r.totalMarks,
      answers: r.answers,
      timeTaken: r.timeTaken,
      completedAt: r.completedAt,
      exam: r.exam
        ? {
            id: r.exam._id.toString(),
            title: r.exam.title,
            titleBn: r.exam.titleBn,
            subject: r.exam.subject
              ? {
                  nameBn: r.exam.subject.nameBn,
                }
              : null,
          }
        : null,
    }));

    const assignmentSubmissions = assignmentSubmissionsRaw.map((s: any) => ({
      id: s._id.toString(),
      assignmentId: s.assignmentId ? s.assignmentId.toString() : null,
      userId: s.userId ? s.userId.toString() : null,
      fileUrl: s.fileUrl,
      fileName: s.fileName,
      marks: s.marks,
      feedback: s.feedback,
      status: s.status,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      assignment: s.assignment
        ? {
            id: s.assignment._id.toString(),
            title: s.assignment.title,
            titleBn: s.assignment.titleBn,
          }
        : null,
    }));

    const notifications = notificationsRaw.map((n: any) => ({
      id: n._id.toString(),
      userId: n.userId ? n.userId.toString() : null,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    const upcomingAssignments = upcomingAssignmentsRaw.map((a: any) => ({
      id: a._id.toString(),
      title: a.title,
      titleBn: a.titleBn,
      description: a.description,
      deadline: a.deadline,
      maxMarks: a.maxMarks,
      subjectId: a.subjectId ? a.subjectId.toString() : null,
      subject: a.subject
        ? {
            nameBn: a.subject.nameBn,
          }
        : null,
    }));

    // 4. Calculate stats (exact same math as your Prisma version)
    const totalExams = examResults.length;
    const avgScore =
      totalExams > 0
        ? Math.round(
            examResults.reduce(
              (sum, r) => sum + (r.score / r.totalMarks) * 100,
              0,
            ) / totalExams,
          )
        : 0;

    const videosWatched = progressRecords.filter(
      (p) => p.type === "video" && p.progress >= 80,
    ).length;
    const notesRead = progressRecords.filter(
      (p) => p.type === "note" && p.progress >= 80,
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          studentProfile: studentProfileDoc
            ? {
                id: studentProfileDoc._id.toString(),
                class: studentProfileDoc.class,
                roll: studentProfileDoc.roll,
                school: studentProfileDoc.school,
              }
            : null,
        },
        stats: {
          totalExams,
          avgScore,
          videosWatched,
          notesRead,
          currentRank: leaderboardEntry?.rank || null,
          currentScore: leaderboardEntry?.score || 0,
        },
        recentActivity: {
          examResults: examResults.slice(0, 3),
          assignmentSubmissions: assignmentSubmissions.slice(0, 3),
        },
        upcoming: upcomingAssignments,
        notifications,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { success: false, error: "ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
