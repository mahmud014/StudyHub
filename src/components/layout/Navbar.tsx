'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  GraduationCap, Menu, X, Sun, Moon, LogIn, LogOut, User,
  BookOpen, Video, FileCheck, ClipboardList, MessageCircleQuestion, MessageSquare, Home,
  LayoutDashboard, Radio, Shield, ChevronDown, Trophy, Zap, CalendarDays, Award, Bot, Users, Bell, FileText, Download, Swords, BarChart3,
  Search, Lock, Eye, EyeOff, ChevronRight, Settings, BookmarkPlus, HelpCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { useStudyHub } from './StudyHubProvider';
import { toast } from 'sonner';
import ProfileDialog from '@/components/ui/ProfileDialog';
import NotificationCenter from '@/components/ui/NotificationCenter';

// ─── Types ────────────────────────────────────────────────────────────────

type NavItemRole = string[] | null;

type NavItemDef = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  roles: NavItemRole;
  mainForRoles?: string[];
  group?: string; // for mobile menu section grouping
};

// ─── Navigation items ─────────────────────────────────────────────────────

const navItems: NavItemDef[] = [
  { id: 'home', label: 'হোম', icon: Home, shortcut: '1', roles: null, group: 'প্রধান' },
  { id: 'notes', label: 'নোটস', icon: BookOpen, shortcut: '2', roles: ['student', 'admin', 'teacher'], group: 'পড়াশোনা' },
  { id: 'videos', label: 'ভিডিও', icon: Video, shortcut: '3', roles: ['student', 'admin', 'teacher'], group: 'পড়াশোনা' },
  { id: 'live', label: 'লাইভ ক্লাস', icon: Radio, shortcut: '4', roles: ['student', 'admin', 'teacher'], group: 'পড়াশোনা' },
  { id: 'exams', label: 'পরীক্ষা', icon: FileCheck, shortcut: '5', roles: ['student', 'admin', 'teacher'], group: 'পরীক্ষা' },
  { id: 'assignments', label: 'অ্যাসাইনমেন্ট', icon: ClipboardList, shortcut: '6', roles: ['student', 'admin', 'teacher'], group: 'পরীক্ষা' },
  { id: 'qa', label: 'প্রশ্নোত্তর', icon: MessageCircleQuestion, shortcut: '7', roles: ['student', 'admin', 'teacher'], group: 'সম্প্রদায়' },
];

const moreNavItems: NavItemDef[] = [
  { id: 'notices', label: 'নোটিশ বোর্ড', icon: Bell, roles: ['student', 'admin', 'teacher', 'guardian'], mainForRoles: ['guardian'], group: 'সম্প্রদায়' },
  { id: 'ai-tutor', label: 'AI শিক্ষক', icon: Bot, roles: ['student'], group: 'টুলস' },
  { id: 'study-group', label: 'স্টাডি গ্রুপ', icon: Users, roles: ['student'], group: 'সম্প্রদায়' },
  { id: 'exam-history', label: 'পরীক্ষার ইতিহাস', icon: FileCheck, roles: ['student', 'admin', 'teacher', 'guardian'], group: 'পরীক্ষা' },
  { id: 'achievements', label: 'অর্জন', icon: Trophy, roles: ['student'], group: 'অগ্রগতি' },
  { id: 'daily-challenge', label: 'দৈনিক চ্যালেঞ্জ', icon: Zap, roles: ['student'], group: 'অগ্রগতি' },
  { id: 'planner', label: 'প্ল্যানার', icon: CalendarDays, roles: ['student'], group: 'টুলস' },
  { id: 'certificate', label: 'সার্টিফিকেট', icon: Award, roles: ['student'], group: 'অগ্রগতি' },
  { id: 'report-card', label: 'রিপোর্ট কার্ড', icon: FileText, roles: ['student', 'admin', 'teacher', 'guardian'], mainForRoles: ['guardian'], group: 'পরীক্ষা' },
  { id: 'resources', label: 'রিসোর্স', icon: Download, roles: ['student', 'admin', 'teacher'], group: 'টুলস' },
  { id: 'feedback', label: 'মতামত', icon: MessageSquare, roles: ['student', 'admin', 'teacher', 'guardian'], group: 'সম্প্রদায়' },
  { id: 'weekly-quiz', label: 'সাপ্তাহিক কুইজ', icon: Swords, roles: ['student'], group: 'পরীক্ষা' },
  { id: 'leaderboard', label: 'লিডারবোর্ড', icon: BarChart3, roles: ['admin', 'teacher'], group: 'অগ্রগতি' },
];

// ─── Helper: visible for role ─────────────────────────────────────────────

function isVisibleForRole(item: NavItemDef, role: string | null): boolean {
  if (item.roles === null) return true;
  if (role === null) return false;
  return item.roles.includes(role);
}

// ─── Section label map ────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  'home': 'হোম পৃষ্ঠা',
  'notes': 'নোটস',
  'videos': 'ভিডিও',
  'live': 'লাইভ ক্লাস',
  'exams': 'পরীক্ষা',
  'assignments': 'অ্যাসাইনমেন্ট',
  'qa': 'প্রশ্নোত্তর',
  'dashboard': 'ড্যাশবোর্ড',
  'admin': 'অ্যাডমিন প্যানেল',
  'guardian': 'অভিভাবক ড্যাশবোর্ড',
  'notices': 'নোটিশ বোর্ড',
  'ai-tutor': 'AI শিক্ষক',
  'study-group': 'স্টাডি গ্রুপ',
  'exam-history': 'পরীক্ষার ইতিহাস',
  'achievements': 'অর্জন',
  'daily-challenge': 'দৈনিক চ্যালেঞ্জ',
  'planner': 'প্ল্যানার',
  'certificate': 'সার্টিফিকেট',
  'report-card': 'রিপোর্ট কার্ড',
  'resources': 'রিসোর্স',
  'feedback': 'মতামত',
  'weekly-quiz': 'সাপ্তাহিক কুইজ',
  'leaderboard': 'লিডারবোর্ড',
  'subject-detail': 'বিষয়ের বিস্তারিত',
};

// ─── Active nav underline animation ──────────────────────────────────────

const activeUnderlineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1 },
  exit: { scaleX: 0, opacity: 0 },
};

// ─── Main Navbar component ────────────────────────────────────────────────

export default function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, login, logout, activeSection, setActiveSection, hydrated } = useStudyHub();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrolledProgress, setScrolledProgress] = useState(0);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [unreadCount] = useState(3); // Simulated unread notifications

  const userRole = user?.role ?? null;

  // ─── Scroll detection with progress ───────────────────────────────────
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const hasScrolled = latest > 10;
    setScrolled(hasScrolled);
    setScrolledProgress(Math.min(latest / 100, 1));
  });

  // ─── Role-based nav filtering ─────────────────────────────────────────
  const filteredNavItems = useMemo(() => {
    const mainItems = navItems.filter(item => isVisibleForRole(item, userRole));
    const promotedItems = moreNavItems.filter(
      item => isVisibleForRole(item, userRole) && item.mainForRoles && userRole && item.mainForRoles.includes(userRole)
    );
    return [...mainItems, ...promotedItems];
  }, [userRole]);

  const filteredMoreNavItems = useMemo(() => {
    return moreNavItems.filter(item => {
      if (!isVisibleForRole(item, userRole)) return false;
      if (item.mainForRoles && userRole && item.mainForRoles.includes(userRole)) return false;
      return true;
    });
  }, [userRole]);

  // ─── Mobile menu: group moreNavItems by group ────────────────────────
  const mobileMoreGroups = useMemo(() => {
    const groups: Record<string, NavItemDef[]> = {};
    filteredMoreNavItems.forEach(item => {
      const g = item.group || 'অন্যান্য';
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return groups;
  }, [filteredMoreNavItems]);

  // ─── Section label for breadcrumb ──────────────────────────────────────
  // Only show after hydration to avoid SSR/client mismatch
  const sectionLabel = hydrated ? (SECTION_LABELS[activeSection] || activeSection) : '';

  // ─── Quick search trigger ─────────────────────────────────────────────
  const openSearch = useCallback(() => {
    // Dispatch Ctrl+K to open SearchCommandPalette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }, []);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (filteredNavItems[idx]) {
          setActiveSection(filteredNavItems[idx].id);
        }
      }

      if (e.altKey && e.key === 'd' && user) {
        e.preventDefault();
        if (user.role === 'admin' || user.role === 'teacher') setActiveSection('admin');
        else if (user.role === 'guardian') setActiveSection('guardian');
        else setActiveSection('dashboard');
      }

      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        setActiveSection('home');
      }

      if (e.altKey && e.key === 'p' && user) {
        e.preventDefault();
        setProfileOpen(true);
      }

      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, userRole, filteredNavItems, setActiveSection]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    toast.success('সফলভাবে লগআউট হয়েছে');
  };

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  const getDashboardLabel = () => {
    if (!user) return 'ড্যাশবোর্ড';
    if (user.role === 'admin' || user.role === 'teacher') return 'অ্যাডমিন';
    if (user.role === 'guardian') return 'অভিভাবক';
    return 'ড্যাশবোর্ড';
  };

  const getDashboardSection = () => {
    if (!user) return 'dashboard';
    if (user.role === 'admin' || user.role === 'teacher') return 'admin';
    if (user.role === 'guardian') return 'guardian';
    return 'dashboard';
  };

  const isDashboardActive = activeSection === 'dashboard' || activeSection === 'admin' || activeSection === 'guardian';

  // ─── Role color helper ────────────────────────────────────────────────
  const roleColor = user?.role === 'admin' || user?.role === 'teacher'
    ? 'red' : user?.role === 'guardian' ? 'amber' : 'emerald';

  const roleBadgeClasses = roleColor === 'red'
    ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
    : roleColor === 'amber'
    ? 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
    : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30';

  const roleDotClasses = roleColor === 'red'
    ? 'bg-red-500' : roleColor === 'amber' ? 'bg-amber-500' : 'bg-emerald-500';

  const roleTextClasses = roleColor === 'red'
    ? 'text-red-600 dark:text-red-400' : roleColor === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/10 border-b border-border/80'
            : 'glass border-b border-border/50'
        }`}
      >
        {/* Scroll progress bar at the top */}
        <motion.div
          className="h-0.5 bg-gradient-to-r from-emerald-500 to-primary origin-left"
          style={{ scaleX: scrolledProgress }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ─── Logo / Brand ─────────────────────────────────────────── */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => handleNavClick('home')}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/35 transition-shadow"
              >
                <GraduationCap className="w-5.5 h-5.5 text-primary-foreground" />
              </motion.div>
              <div className="flex flex-col">
                <motion.span
                  className="text-xl font-extrabold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent leading-tight"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  স্টাডি হাব
                </motion.span>
                {/* ─── Breadcrumb / Section indicator (desktop) ─── */}
                {hydrated && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                      transition={{ duration: 0.25 }}
                      className="hidden md:flex items-center gap-1"
                    >
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {sectionLabel}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* ─── Desktop Nav ──────────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isHovered = hoveredNavId === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    onHoverStart={() => setHoveredNavId(item.id)}
                    onHoverEnd={() => setHoveredNavId(null)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden ${
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {/* Animated background pill */}
                    <AnimatePresence>
                      {(isActive || isHovered) && (
                        <motion.div
                          className={`absolute inset-0 rounded-lg ${
                            isActive
                              ? 'bg-gradient-to-r from-primary to-emerald-600 shadow-md shadow-primary/25'
                              : 'bg-accent'
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Active underline */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-foreground/80 rounded-full"
                          variants={activeUnderlineVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      )}
                    </AnimatePresence>

                    <span className="relative z-10 flex items-center gap-1.5">
                      <motion.div
                        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.35 }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                      {item.label}
                      {item.shortcut && (
                        <kbd className={`hidden xl:inline-flex items-center justify-center w-5 h-5 text-[10px] rounded font-mono ${
                          isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.shortcut}
                        </kbd>
                      )}
                    </span>
                  </motion.button>
                );
              })}

              {/* More nav items dropdown */}
              {filteredMoreNavItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        filteredMoreNavItems.some(item => activeSection === item.id)
                          ? 'bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      আরও
                      <ChevronDown className="w-3 h-3" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {filteredMoreNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`cursor-pointer ${isActive ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                          {isActive && (
                            <motion.div
                              layoutId="more-active-dot"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Dashboard button */}
              {user && (
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveSection(getDashboardSection())}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden ${
                    isDashboardActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AnimatePresence>
                    {isDashboardActive && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-emerald-600 shadow-md shadow-primary/25"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10 flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    {getDashboardLabel()}
                    <kbd className={`hidden xl:inline-flex items-center justify-center w-5 h-5 text-[10px] rounded font-mono ${
                      isDashboardActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      D
                    </kbd>
                  </span>
                </motion.button>
              )}
            </nav>

            {/* ─── Right Side ───────────────────────────────────────────── */}
            <div className="flex items-center gap-1.5">
              {/* Quick Search Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openSearch}
                  className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground px-3 h-9 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                  aria-label="দ্রুত সার্চ"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="text-xs">সার্চ</span>
                  <kbd className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    <span className="text-[9px]">⌘</span>K
                  </kbd>
                </Button>
              </motion.div>

              {/* Mobile search icon */}
              <motion.div whileTap={{ scale: 0.9 }} className="sm:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openSearch}
                  className="rounded-full h-9 w-9"
                  aria-label="সার্চ"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>

              {/* Notification Center with badge */}
              <div className="relative">
                <NotificationCenter />
                {/* Unread badge overlay - shows on the bell icon area */}
                {user && unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 z-10"
                  >
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-sm shadow-red-500/30">
                      {unreadCount}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Theme Toggle */}
              <motion.div whileTap={{ scale: 0.9, rotate: 180 }} transition={{ duration: 0.3 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-full hover:bg-primary/10 transition-colors relative overflow-hidden h-9 w-9"
                  aria-label="থিম পরিবর্তন"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
                </Button>
              </motion.div>

              {/* User / Login */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-accent/80 transition-all duration-200 border border-transparent hover:border-border/50"
                      >
                        <div className="relative">
                          <Avatar className="w-9 h-9 border-2 border-primary/30 ring-2 ring-background">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-sm font-bold text-primary">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online indicator */}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${roleDotClasses}`}>
                            <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current" />
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-semibold max-w-[100px] truncate block leading-tight">{user.name}</span>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${roleBadgeClasses}`}>
                            {user.role === 'admin' || user.role === 'teacher' ? 'অ্যাডমিন' :
                             user.role === 'guardian' ? 'অভিভাবক' : 'শিক্ষার্থী'}
                          </Badge>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2">
                      {/* User info header */}
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-emerald-500/5 dark:from-primary/10 dark:to-emerald-500/10 mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 border-2 border-primary/30">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-lg font-bold text-primary">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <Badge variant="outline" className={`mt-1 text-[9px] px-1.5 py-0 h-4 ${roleBadgeClasses}`}>
                              {user.role === 'admin' || user.role === 'teacher' ? 'অ্যাডমিন' :
                               user.role === 'guardian' ? 'অভিভাবক' : 'শিক্ষার্থী'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        <button
                          onClick={() => { setProfileOpen(true); }}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground">প্রোফাইল</span>
                        </button>
                        <button
                          onClick={() => setActiveSection(getDashboardSection())}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground">ড্যাশবোর্ড</span>
                        </button>
                        <button
                          onClick={() => { setProfileOpen(true); }}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Settings className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground">সেটিংস</span>
                        </button>
                      </div>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer rounded-lg py-2">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        প্রোফাইল দেখুন
                        <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">Alt+P</kbd>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveSection(getDashboardSection())} className="cursor-pointer rounded-lg py-2">
                        <LayoutDashboard className="w-4 h-4 mr-2 text-muted-foreground" />
                        {getDashboardLabel()} ড্যাশবোর্ড
                        <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">Alt+D</kbd>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openSearch} className="cursor-pointer rounded-lg py-2">
                        <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                        দ্রুত সার্চ
                        <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 rounded-lg py-2 focus:bg-red-50 dark:focus:bg-red-950/30">
                        <LogOut className="w-4 h-4 mr-2" />
                        লগআউট
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    onClick={() => router.push('/login')}
                    className="gap-1.5 bg-gradient-to-r from-primary to-emerald-600 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 shadow-md shadow-primary/20"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>লগইন</span>
                  </Button>
                </motion.div>
              )}

              {/* ─── Mobile Menu ────────────────────────────────────────── */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <SheetTitle className="sr-only">ন্যাভিগেশন মেনু</SheetTitle>

                  <div className="flex flex-col h-full">
                    {/* User profile card in mobile */}
                    <div className="border-b">
                      {user ? (
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => { setProfileOpen(true); setMobileOpen(false); }}
                        >
                          <Avatar className="w-12 h-12 border-2 border-primary/30 ring-2 ring-background">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-lg font-bold text-primary">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <Badge variant="outline" className={`mt-1 text-[9px] px-1.5 py-0 h-4 ${roleBadgeClasses}`}>
                              {user.role === 'admin' || user.role === 'teacher' ? 'অ্যাডমিন' :
                               user.role === 'guardian' ? 'অভিভাবক' : 'শিক্ষার্থী'}
                            </Badge>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">স্টাডি হাব</p>
                              <p className="text-[11px] text-muted-foreground">শিখুন, বাড়ুন, সফল হন</p>
                            </div>
                          </div>
                          <Button
                            className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-600 shadow-md shadow-primary/20"
                            onClick={() => { router.push('/login'); setMobileOpen(false); }}
                          >
                            <LogIn className="w-4 h-4" />
                            লগইন করুন
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Navigation items with groups - scrollable */}
                    <ScrollArea className="flex-1">
                      <div className="p-3 space-y-1">
                        {/* Main nav items */}
                        {filteredNavItems.map((item, idx) => {
                          const Icon = item.icon;
                          const isActive = activeSection === item.id;
                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => handleNavClick(item.id)}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03, duration: 0.2 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/20'
                                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isActive ? 'bg-primary-foreground/20' : 'bg-accent'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="flex-1">{item.label}</span>
                              {item.shortcut && (
                                <kbd className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                  Alt+{item.shortcut}
                                </kbd>
                              )}
                            </motion.button>
                          );
                        })}

                        {/* Dashboard button */}
                        {user && (
                          <motion.button
                            onClick={() => handleNavClick(getDashboardSection())}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: filteredNavItems.length * 0.03, duration: 0.2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              isDashboardActive
                                ? 'bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/20'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isDashboardActive ? 'bg-primary-foreground/20' : 'bg-accent'
                            }`}>
                              <LayoutDashboard className="w-4 h-4" />
                            </div>
                            <span className="flex-1">{getDashboardLabel()} ড্যাশবোর্ড</span>
                            <kbd className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              isDashboardActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              Alt+D
                            </kbd>
                          </motion.button>
                        )}

                        {/* Grouped "More" items */}
                        {Object.keys(mobileMoreGroups).length > 0 && (
                          <div className="mt-3 space-y-3">
                            {Object.entries(mobileMoreGroups).map(([group, items], groupIdx) => (
                              <div key={group}>
                                <div className="flex items-center gap-2 px-3 py-1.5">
                                  <Separator className="flex-1 bg-border/40" />
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</span>
                                  <Separator className="flex-1 bg-border/40" />
                                </div>
                                {items.map((item, itemIdx) => {
                                  const Icon = item.icon;
                                  const isActive = activeSection === item.id;
                                  return (
                                    <motion.button
                                      key={item.id}
                                      onClick={() => handleNavClick(item.id)}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: (groupIdx * 3 + itemIdx) * 0.03 + 0.1, duration: 0.2 }}
                                      whileTap={{ scale: 0.98 }}
                                      className={`relative flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive
                                          ? 'bg-primary/10 text-primary'
                                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                      }`}
                                    >
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                        isActive ? 'bg-primary/20' : 'bg-accent/50'
                                      }`}>
                                        <Icon className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="flex-1">{item.label}</span>
                                      {isActive && (
                                        <motion.div
                                          layoutId="mobile-active-dot"
                                          className="w-1.5 h-1.5 rounded-full bg-primary"
                                        />
                                      )}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Footer actions */}
                    {user && (
                      <div className="border-t p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 rounded-xl h-9"
                            onClick={() => { setProfileOpen(true); setMobileOpen(false); }}
                          >
                            <User className="w-3.5 h-3.5" />
                            প্রোফাইল
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 rounded-xl h-9"
                            onClick={() => { openSearch(); setMobileOpen(false); }}
                          >
                            <Search className="w-3.5 h-3.5" />
                            সার্চ
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl h-9"
                          onClick={() => { handleLogout(); setMobileOpen(false); }}
                        >
                          <LogOut className="w-4 h-4" />
                          লগআউট
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─── Breadcrumb bar (visible below navbar on desktop) ────── */}
      {hydrated && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="hidden md:block border-b border-border/30 bg-muted/20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 py-1.5">
                <Home className="w-3 h-3 text-muted-foreground" />
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-medium text-primary"
                >
                  {sectionLabel}
                </motion.span>

                {/* Show keyboard shortcut hint */}
                {activeSection !== 'home' && (
                  <span className="ml-auto text-[10px] text-muted-foreground hidden lg:flex items-center gap-1">
                    <kbd className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-background px-1 py-0.5 font-mono text-[9px]">
                      Alt
                    </kbd>
                    <span>+</span>
                    <kbd className="inline-flex items-center justify-center rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[9px]">
                      H
                    </kbd>
                    <span className="text-muted-foreground/60">হোমে যেতে</span>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Profile Dialog */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
