'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BookOpen, Video, FileCheck, Menu,
  Radio, ClipboardList, MessageCircleQuestion,
  Bell, Bot, Users, Trophy, Zap, CalendarDays, Award,
  FileText, Download, LayoutDashboard,
  MessageSquare, Brain, BarChart3
} from 'lucide-react';
import {
  Sheet, SheetContent, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import { useStudyHub } from './StudyHubProvider';

type UserRole = 'student' | 'admin' | 'teacher' | 'guardian' | 'guest';

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const mainNavItems: NavItem[] = [
  { id: 'home', label: 'হোম', icon: Home, roles: ['student', 'admin', 'teacher', 'guardian', 'guest'] },
  { id: 'notes', label: 'নোটস', icon: BookOpen, roles: ['student', 'admin', 'teacher'] },
  { id: 'videos', label: 'ভিডিও', icon: Video, roles: ['student', 'admin', 'teacher'] },
  { id: 'exams', label: 'পরীক্ষা', icon: FileCheck, roles: ['student', 'admin', 'teacher'] },
  { id: 'notices', label: 'নোটিশ বোর্ড', icon: Bell, roles: ['guardian'] },
  { id: 'report-card', label: 'রিপোর্ট কার্ড', icon: FileText, roles: ['guardian'] },
];

const moreItems: NavItem[] = [
  { id: 'live', label: 'লাইভ ক্লাস', icon: Radio, roles: ['student', 'admin', 'teacher'] },
  { id: 'assignments', label: 'অ্যাসাইনমেন্ট', icon: ClipboardList, roles: ['student', 'admin', 'teacher'] },
  { id: 'qa', label: 'প্রশ্নোত্তর', icon: MessageCircleQuestion, roles: ['student', 'admin', 'teacher'] },
  { id: 'notices', label: 'নোটিশ বোর্ড', icon: Bell, roles: ['student', 'admin', 'teacher'] },
  { id: 'ai-tutor', label: 'AI শিক্ষক', icon: Bot, roles: ['student'] },
  { id: 'study-group', label: 'স্টাডি গ্রুপ', icon: Users, roles: ['student'] },
  { id: 'leaderboard', label: 'লিডারবোর্ড', icon: BarChart3, roles: ['admin', 'teacher'] },
  { id: 'exam-history', label: 'পরীক্ষার ইতিহাস', icon: FileCheck, roles: ['student', 'admin', 'teacher', 'guardian'] },
  { id: 'achievements', label: 'অর্জন', icon: Trophy, roles: ['student'] },
  { id: 'daily-challenge', label: 'দৈনিক চ্যালেঞ্জ', icon: Zap, roles: ['student'] },
  { id: 'planner', label: 'প্ল্যানার', icon: CalendarDays, roles: ['student'] },
  { id: 'certificate', label: 'সার্টিফিকেট', icon: Award, roles: ['student'] },
  { id: 'report-card', label: 'রিপোর্ট কার্ড', icon: FileText, roles: ['student', 'admin', 'teacher'] },
  { id: 'resources', label: 'রিসোর্স', icon: Download, roles: ['student', 'admin', 'teacher'] },
  { id: 'feedback', label: 'মতামত', icon: MessageSquare, roles: ['student', 'admin', 'teacher', 'guardian'] },
  { id: 'weekly-quiz', label: 'সাপ্তাহিক কুইজ', icon: Brain, roles: ['student'] },
  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, roles: ['student', 'admin', 'teacher', 'guardian'] },
];

// Helper to get dashboard section based on role
function getDashboardSection(role: string): string {
  if (role === 'admin' || role === 'teacher') return 'admin';
  if (role === 'guardian') return 'guardian';
  return 'dashboard';
}

function getEffectiveRole(role: string | undefined): UserRole {
  if (!role) return 'guest';
  if (role === 'admin' || role === 'teacher') return 'admin'; // treat admin & teacher the same
  if (role === 'guardian') return 'guardian';
  return 'student';
}

// Role-specific accent color config (full Tailwind class strings to avoid purging)
const roleAccentConfig: Record<string, {
  gradientVia: string;
  activeBg: string;
  activeDot: string;
  activeText: string;
  sheetActiveBg: string;
  sheetHeaderAccent: string;
}> = {
  admin: {
    gradientVia: 'via-violet-400/50',
    activeBg: 'bg-violet-500/15 dark:bg-violet-500/20',
    activeDot: 'bg-violet-500',
    activeText: 'text-violet-600 dark:text-violet-400',
    sheetActiveBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    sheetHeaderAccent: 'text-violet-600 dark:text-violet-400',
  },
  guardian: {
    gradientVia: 'via-amber-400/50',
    activeBg: 'bg-amber-500/15 dark:bg-amber-500/20',
    activeDot: 'bg-amber-500',
    activeText: 'text-amber-600 dark:text-amber-400',
    sheetActiveBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    sheetHeaderAccent: 'text-amber-600 dark:text-amber-400',
  },
  student: {
    gradientVia: 'via-emerald-400/50',
    activeBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    activeDot: 'bg-emerald-500',
    activeText: 'text-emerald-600 dark:text-emerald-400',
    sheetActiveBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    sheetHeaderAccent: 'text-emerald-600 dark:text-emerald-400',
  },
};

export default function MobileBottomNav() {
  const { activeSection, setActiveSection, user } = useStudyHub();
  const [moreOpen, setMoreOpen] = useState(false);

  const effectiveRole = getEffectiveRole(user?.role);
  const accent = roleAccentConfig[effectiveRole] || roleAccentConfig.student;

  const filteredMainItems = useMemo(
    () => mainNavItems.filter(item => item.roles.includes(effectiveRole)),
    [effectiveRole]
  );

  const filteredMoreItems = useMemo(
    () => moreItems.filter(item => item.roles.includes(effectiveRole)),
    [effectiveRole]
  );

  const isMoreActive = filteredMoreItems.some(item => item.id === activeSection) ||
    activeSection === 'dashboard' ||
    activeSection === 'admin' ||
    activeSection === 'guardian';

  const handleNavClick = (id: string) => {
    // If clicking dashboard, route to the correct dashboard based on role
    if (id === 'dashboard' && user) {
      setActiveSection(getDashboardSection(user.role));
    } else {
      setActiveSection(id);
    }
    setMoreOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Gradient top border */}
        <div className={`h-px bg-gradient-to-r from-transparent ${accent.gradientVia} to-transparent`} />

        {/* Glass morphism nav bar */}
        <nav className="bg-background/80 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-around px-2 pt-1.5 pb-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
            {filteredMainItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-1 relative"
                  aria-label={item.label}
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="relative"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className={`absolute -inset-1.5 rounded-xl ${accent.activeBg}`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                        isActive ? accent.activeText : 'text-muted-foreground'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-[10px] font-medium leading-tight transition-colors duration-200 ${
                      isActive ? accent.activeText : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavDot"
                      className={`absolute -top-0.5 w-1 h-1 rounded-full ${accent.activeDot}`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {/* More button - only show when there are more items for this role */}
            {filteredMoreItems.length > 0 && (
            <button
              onClick={() => setMoreOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-1 relative"
              aria-label="আরও"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="relative"
              >
                {isMoreActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className={`absolute -inset-1.5 rounded-xl ${accent.activeBg}`}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Menu
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isMoreActive ? accent.activeText : 'text-muted-foreground'
                  }`}
                />
              </motion.div>
              <span
                className={`text-[10px] font-medium leading-tight transition-colors duration-200 ${
                  isMoreActive ? accent.activeText : 'text-muted-foreground'
                }`}
              >
                আরও
              </span>
              {isMoreActive && (
                <motion.div
                  layoutId="bottomNavDot"
                  className={`absolute -top-0.5 w-1 h-1 rounded-full ${accent.activeDot}`}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
            )}
          </div>
        </nav>
      </div>

      {/* More Items Sheet (from bottom) */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
          <SheetTitle className="sr-only">আরও ন্যাভিগেশন</SheetTitle>
          <SheetDescription className="sr-only">অতিরিক্ত ন্যাভিগেশন আইটেম</SheetDescription>
          <div className="px-2 pb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>
            <h3 className={`text-lg font-semibold text-center mb-4 ${accent.sheetHeaderAccent}`}>আরও</h3>
            <div className="grid grid-cols-4 gap-3">
              {filteredMoreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                      isActive
                        ? accent.sheetActiveBg
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium leading-tight text-center">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
