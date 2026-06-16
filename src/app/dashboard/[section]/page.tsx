'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import NotesSection from '@/components/sections/NotesSection';
import VideosSection from '@/components/sections/VideosSection';
import LiveClassSection from '@/components/sections/LiveClassSection';
import ExamsSection from '@/components/sections/ExamsSection';
import AssignmentsSection from '@/components/sections/AssignmentsSection';
import QASection from '@/components/sections/QASection';
import LeaderboardSection from '@/components/sections/LeaderboardSection';
import AchievementSection from '@/components/sections/AchievementSection';
import DailyChallengeSection from '@/components/sections/DailyChallengeSection';
import StudyPlannerSection from '@/components/sections/StudyPlannerSection';
import CertificateSection from '@/components/sections/CertificateSection';
import AITutorSection from '@/components/sections/AITutorSection';
import ExamHistorySection from '@/components/sections/ExamHistorySection';
import StudyGroupSection from '@/components/sections/StudyGroupSection';
import NoticeBoardSection from '@/components/sections/NoticeBoardSection';
import ReportCardSection from '@/components/sections/ReportCardSection';
import ResourcesSection from '@/components/sections/ResourcesSection';
import FeedbackSection from '@/components/sections/FeedbackSection';
import WeeklyQuizSection from '@/components/sections/WeeklyQuizSection';
import AdminDashboard from '@/components/sections/AdminDashboard';
import GuardianDashboard from '@/components/sections/GuardianDashboard';
import SubjectDetailSection from '@/components/sections/SubjectDetailSection';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SECTION_ACCESS: Record<string, string[]> = {
  admin: ['admin', 'teacher'],
  guardian: ['guardian'],
  dashboard: ['student'],
  assignments: ['student', 'admin', 'teacher'],
  'exam-history': ['student', 'admin', 'teacher', 'guardian'],
  'report-card': ['student', 'admin', 'teacher', 'guardian'],
  'study-group': ['student'],
  planner: ['student'],
  certificate: ['student'],
  achievements: ['student'],
  'daily-challenge': ['student'],
  'weekly-quiz': ['student'],
  notes: ['student', 'admin', 'teacher'],
  videos: ['student', 'admin', 'teacher'],
  live: ['student', 'admin', 'teacher'],
  exams: ['student', 'admin', 'teacher'],
  qa: ['student', 'admin', 'teacher'],
  leaderboard: ['student', 'admin', 'teacher'],
  'ai-tutor': ['student'],
  'subject-detail': ['student', 'admin', 'teacher'],
  resources: ['student', 'admin', 'teacher'],
  feedback: ['student', 'admin', 'teacher', 'guardian'],
  notices: ['student', 'admin', 'teacher', 'guardian'],
};

function UnauthorizedAccess({ section, userRole }: { section: string; userRole?: string }) {
  const router = useRouter();
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'guardian': return 'অভিভাবক';
      case 'admin': return 'অ্যাডমিন';
      case 'teacher': return 'শিক্ষক';
      case 'student': return 'শিক্ষার্থী';
      default: return role;
    }
  };

  const getDashboardForRole = () => {
    if (!userRole) return '/';
    if (userRole === 'admin' || userRole === 'teacher') return '/dashboard/admin';
    if (userRole === 'guardian') return '/dashboard/guardian';
    return '/dashboard';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mb-6">
        <Shield className="w-10 h-10 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">অ্যাক্সেস সীমিত</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {userRole
          ? `আপনার "${getRoleLabel(userRole)}" অ্যাকাউন্টে এই সেকশনে প্রবেশাধিকার নেই।`
          : 'এই সেকশনে প্রবেশ করতে লগইন করুন।'}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push('/')}>হোমপেজে যান</Button>
        {userRole && (
          <Button onClick={() => router.push(getDashboardForRole())}>ড্যাশবোর্ডে যান</Button>
        )}
      </div>
    </div>
  );
}

export default function DashboardSectionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, activeSection, setActiveSection, selectedSubject } = useStudyHub();

  const section = (params.section as string) || 'dashboard';

  if (!user) {
    return null; // Let middleware redirect
  }

  // Check role-based access
  const allowedRoles = SECTION_ACCESS[section];
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <UnauthorizedAccess section={section} userRole={user.role} />;
  }

  // Render correct component
  switch (section) {
    case 'notes': return <NotesSection />;
    case 'videos': return <VideosSection />;
    case 'live': return <LiveClassSection />;
    case 'exams': return <ExamsSection />;
    case 'assignments': return <AssignmentsSection />;
    case 'qa': return <QASection />;
    case 'leaderboard': return <LeaderboardSection />;
    case 'achievements': return <AchievementSection />;
    case 'daily-challenge': return <DailyChallengeSection />;
    case 'planner': return <StudyPlannerSection />;
    case 'certificate': return <CertificateSection />;
    case 'ai-tutor': return <AITutorSection />;
    case 'exam-history': return <ExamHistorySection />;
    case 'study-group': return <StudyGroupSection />;
    case 'notices': return <NoticeBoardSection />;
    case 'report-card': return <ReportCardSection />;
    case 'resources': return <ResourcesSection />;
    case 'feedback': return <FeedbackSection />;
    case 'weekly-quiz': return <WeeklyQuizSection />;
    case 'admin': return <AdminDashboard />;
    case 'guardian': return <GuardianDashboard />;
    case 'subject-detail':
      if (selectedSubject) {
        return <SubjectDetailSection />;
      }
      router.push('/dashboard');
      return null;
    default:
      return <div className="p-4 text-center text-muted-foreground">সেকশন পাওয়া যায়নি</div>;
  }
}
