import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 401 }
      );
    }
    const userId = sessionUser.id;

    // Get user info
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ব্যবহারকারী পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // Parallel fetch of dashboard data
    const [
      examResults,
      assignmentSubmissions,
      progressRecords,
      notifications,
      leaderboardEntry,
      upcomingAssignments,
    ] = await Promise.all([
      // Exam results
      db.examResult.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: {
          exam: {
            select: { id: true, title: true, titleBn: true, subject: { select: { nameBn: true } } },
          },
        },
      }),
      // Assignment submissions
      db.assignmentSubmission.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        include: {
          assignment: {
            select: { id: true, title: true, titleBn: true },
          },
        },
      }),
      // Progress records
      db.progress.findMany({
        where: { userId },
      }),
      // Unread notifications
      db.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Current leaderboard rank
      db.leaderboardEntry.findFirst({
        where: { userId },
        orderBy: { week: 'desc' },
      }),
      // Upcoming assignments
      db.assignment.findMany({
        where: {
          deadline: { gte: new Date() },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
        include: {
          subject: {
            select: { nameBn: true },
          },
        },
      }),
    ]);

    // Calculate stats
    const totalExams = examResults.length;
    const avgScore = totalExams > 0
      ? Math.round(examResults.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / totalExams)
      : 0;

    const videosWatched = progressRecords.filter((p) => p.type === 'video' && p.progress >= 80).length;
    const notesRead = progressRecords.filter((p) => p.type === 'note' && p.progress >= 80).length;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentProfile: user.studentProfile,
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
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
