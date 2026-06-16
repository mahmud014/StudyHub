'use client';

import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import SearchCommandPalette from '@/components/ui/SearchCommandPalette';
import StudyTimer from '@/components/ui/StudyTimer';
import BookmarkManager from '@/components/ui/BookmarkManager';
import WelcomeOnboarding from '@/components/ui/WelcomeOnboarding';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrated, showOnboarding, setShowOnboarding } = useStudyHub();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      localStorage.setItem('studyhub_onboarding_done', 'true');
    }
    setShowOnboarding(open);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="h-16 border-b bg-background/80 backdrop-blur-sm" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">লোড হচ্ছে...</span>
          </div>
        </main>
      </div>
    );
  }

  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardSidebar>
        <div className="p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </div>
      </DashboardSidebar>

      {/* Role-based floating tools */}
      {isStudent && <StudyTimer />}
      <SearchCommandPalette />
      {isStudent && <BookmarkManager />}
      
      {/* Onboarding Dialog */}
      <WelcomeOnboarding open={showOnboarding} onOpenChange={handleOpenChange} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
