'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import DashboardSection from '@/components/sections/DashboardSection';

export default function DashboardIndexPage() {
  const { user, setActiveSection } = useStudyHub();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    
    // Redirect admin/teacher or guardian to their specific dashboard paths
    if (user.role === 'admin' || user.role === 'teacher') {
      router.replace('/dashboard/admin');
    } else if (user.role === 'guardian') {
      router.replace('/dashboard/guardian');
    } else {
      setActiveSection('dashboard');
    }
  }, [user, router, setActiveSection]);

  if (!user || user.role === 'admin' || user.role === 'teacher' || user.role === 'guardian') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">ড্যাশবোর্ড লোড হচ্ছে...</span>
      </div>
    );
  }

  // Student dashboard view
  return <DashboardSection />;
}
