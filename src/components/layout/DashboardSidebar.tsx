'use client';

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Home, BookOpen, Video, FileCheck, Radio, ClipboardList,
  MessageCircleQuestion, Bot, Users, Trophy, Zap, CalendarDays,
  Award, BarChart3, Bell, FileText, MessageSquare, Brain,
  LayoutDashboard, Shield, CreditCard, Settings, Eye,
  GraduationCap, LogOut, ChevronRight, Swords, Download,
  BookMarked, Clock, Star, Sparkles, Search
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStudyHub } from './StudyHubProvider';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// ─── Types ──────────────────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// ─── Navigation definitions per role ────────────────────────────────────

const studentNavGroups: NavGroup[] = [
  {
    title: 'প্রধান',
    items: [
      { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
      { id: 'home', label: 'হোম', icon: Home },
    ],
  },
  {
    title: 'পড়াশোনা',
    items: [
      { id: 'notes', label: 'নোটস', icon: BookOpen },
      { id: 'videos', label: 'ভিডিও', icon: Video },
      { id: 'live', label: 'লাইভ ক্লাস', icon: Radio },
      { id: 'exams', label: 'পরীক্ষা', icon: FileCheck },
      { id: 'assignments', label: 'অ্যাসাইনমেন্ট', icon: ClipboardList },
      { id: 'weekly-quiz', label: 'সাপ্তাহিক কুইজ', icon: Swords },
    ],
  },
  {
    title: 'সম্প্রদায়',
    items: [
      { id: 'qa', label: 'প্রশ্নোত্তর', icon: MessageCircleQuestion },
      { id: 'study-group', label: 'স্টাডি গ্রুপ', icon: Users },
      { id: 'leaderboard', label: 'লিডারবোর্ড', icon: BarChart3 },
    ],
  },
  {
    title: 'অগ্রগতি',
    items: [
      { id: 'achievements', label: 'অর্জন', icon: Trophy },
      { id: 'daily-challenge', label: 'দৈনিক চ্যালেঞ্জ', icon: Zap },
      { id: 'planner', label: 'প্ল্যানার', icon: CalendarDays },
      { id: 'certificate', label: 'সার্টিফিকেট', icon: Award },
      { id: 'exam-history', label: 'পরীক্ষার ইতিহাস', icon: Clock },
      { id: 'report-card', label: 'রিপোর্ট কার্ড', icon: FileText },
    ],
  },
  {
    title: 'টুলস',
    items: [
      { id: 'ai-tutor', label: 'AI শিক্ষক', icon: Bot, badge: 'নতুন' },
      { id: 'resources', label: 'রিসোর্স', icon: Download },
      { id: 'notices', label: 'নোটিশ বোর্ড', icon: Bell },
      { id: 'feedback', label: 'মতামত', icon: MessageSquare },
    ],
  },
];

const guardianNavGroups: NavGroup[] = [
  {
    title: 'প্রধান',
    items: [
      { id: 'guardian', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
      { id: 'home', label: 'হোম', icon: Home },
    ],
  },
  {
    title: 'পর্যবেক্ষণ',
    items: [
      { id: 'notices', label: 'নোটিশ বোর্ড', icon: Bell },
      { id: 'report-card', label: 'রিপোর্ট কার্ড', icon: FileText },
      { id: 'exam-history', label: 'পরীক্ষার ইতিহাস', icon: Clock },
    ],
  },
  {
    title: 'যোগাযোগ',
    items: [
      { id: 'feedback', label: 'মতামত', icon: MessageSquare },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    title: 'প্রধান',
    items: [
      { id: 'admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
      { id: 'home', label: 'হোম', icon: Home },
    ],
  },
  {
    title: 'কন্টেন্ট',
    items: [
      { id: 'notes', label: 'নোটস', icon: BookOpen },
      { id: 'videos', label: 'ভিডিও', icon: Video },
      { id: 'live', label: 'লাইভ ক্লাস', icon: Radio },
    ],
  },
  {
    title: 'পরীক্ষা',
    items: [
      { id: 'exams', label: 'পরীক্ষা', icon: FileCheck },
      { id: 'assignments', label: 'অ্যাসাইনমেন্ট', icon: ClipboardList },
      { id: 'leaderboard', label: 'লিডারবোর্ড', icon: BarChart3 },
    ],
  },
  {
    title: 'ব্যবস্থাপনা',
    items: [
      { id: 'notices', label: 'নোটিশ বোর্ড', icon: Bell },
      { id: 'qa', label: 'প্রশ্নোত্তর', icon: MessageCircleQuestion },
      { id: 'feedback', label: 'মতামত', icon: MessageSquare },
    ],
  },
];

// ─── Theme configs ─────────────────────────────────────────────────────

const roleThemeConfig = {
  student: {
    accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBorder: 'border-emerald-500/30',
    accentGradientFrom: 'from-emerald-500',
    activeBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    activeText: 'text-emerald-700 dark:text-emerald-400',
    activeIconBg: 'bg-emerald-500/20',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    hoverBg: 'hover:bg-emerald-500/10',
    dotColor: 'bg-emerald-500',
    label: 'শিক্ষার্থী',
  },
  guardian: {
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBorder: 'border-amber-500/30',
    accentGradientFrom: 'from-amber-500',
    activeBg: 'bg-amber-500/15 dark:bg-amber-500/20',
    activeText: 'text-amber-700 dark:text-amber-400',
    activeIconBg: 'bg-amber-500/20',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
    hoverBg: 'hover:bg-amber-500/10',
    dotColor: 'bg-amber-500',
    label: 'অভিভাবক',
  },
  admin: {
    accentBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentBorder: 'border-violet-500/30',
    accentGradientFrom: 'from-violet-500',
    activeBg: 'bg-violet-500/15 dark:bg-violet-500/20',
    activeText: 'text-violet-700 dark:text-violet-400',
    activeIconBg: 'bg-violet-500/20',
    badgeBg: 'bg-violet-100 dark:bg-violet-900/30',
    badgeText: 'text-violet-700 dark:text-violet-300',
    hoverBg: 'hover:bg-violet-500/10',
    dotColor: 'bg-violet-500',
    label: 'অ্যাডমিন',
  },
};

// ─── Main Component ─────────────────────────────────────────────────────

function DashboardSidebarContent() {
  const { activeSection, setActiveSection, user, logout } = useStudyHub();

  const effectiveRole = user?.role === 'teacher' ? 'admin' : (user?.role || 'student') as keyof typeof roleThemeConfig;
  const theme = roleThemeConfig[effectiveRole] || roleThemeConfig.student;

  const navGroups = effectiveRole === 'guardian'
    ? guardianNavGroups
    : effectiveRole === 'admin'
    ? adminNavGroups
    : studentNavGroups;

  const handleNavClick = (id: string) => {
    setActiveSection(id);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <SidebarHeader className="p-3">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${theme.accentBg} border ${theme.accentBorder} transition-colors`}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${theme.accentGradientFrom} to-transparent shadow-sm shrink-0`}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm truncate">স্টাডি হাব</span>
            <Badge variant="outline" className={`w-fit text-[10px] px-1.5 py-0 ${theme.badgeBg} ${theme.badgeText} border-0`}>
              {theme.label}
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ─── Navigation ─────────────────────────────────────────── */}
      <SidebarContent className="px-2">
        {navGroups.map((group, groupIdx) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => handleNavClick(item.id)}
                        tooltip={item.label}
                        className={`
                          relative transition-all duration-200 group/item
                          ${isActive ? `${theme.activeBg} ${theme.activeText} font-semibold` : theme.hoverBg}
                          hover:translate-x-0.5 hover:shadow-sm
                        `}
                      >
                        {isActive && (
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-6 rounded-r-full ${theme.dotColor} shadow-[0_0_8px_var(--tw-shadow-color)]`} style={{ ['--tw-shadow-color' as string]: effectiveRole === 'admin' ? 'rgba(139,92,246,0.4)' : effectiveRole === 'guardian' ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)' }} />
                        )}
                        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? theme.accentText : 'group-hover/item:scale-110'}`} />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge className={`ml-auto text-[9px] px-1.5 py-0 h-4 ${theme.badgeBg} ${theme.badgeText} border-0`}>
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {groupIdx < navGroups.length - 1 && <SidebarSeparator className="my-1" />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-2" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex items-center gap-3 w-full p-2 rounded-lg border transition-colors group-data-[collapsible=icon]:justify-center ${theme.accentBg} ${theme.accentBorder} hover:shadow-sm`}>
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className={`text-xs font-semibold bg-gradient-to-br ${theme.accentGradientFrom} to-transparent text-white`}>
                  {user ? getInitials(user.name) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium truncate w-full text-left">{user?.name || 'ব্যবহারকারী'}</span>
                <div className="flex items-center gap-1.5">
                  <Badge className={`text-[9px] px-1 py-0 h-3.5 ${theme.badgeBg} ${theme.badgeText} border-0`}>{theme.label}</Badge>
                  <span className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <Badge className={`text-[9px] px-1 py-0 h-4 ${theme.badgeBg} ${theme.badgeText} border-0`}>{theme.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActiveSection('home')}>
              <Home className="mr-2 h-4 w-4" />
              হোম পৃষ্ঠা
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              লগআউট
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}

// ─── Dashboard Top Bar (for when sidebar is shown) ──────────────────────

function DashboardTopBar() {
  const { activeSection, user, logout } = useStudyHub();
  const { theme, setTheme } = useTheme();

  const effectiveRole = user?.role === 'teacher' ? 'admin' : (user?.role || 'student') as keyof typeof roleThemeConfig;
  const themeConfig = roleThemeConfig[effectiveRole] || roleThemeConfig.student;

  const sectionLabels: Record<string, string> = {
    home: 'হোম পৃষ্ঠা',
    dashboard: 'শিক্ষার্থী ড্যাশবোর্ড',
    admin: 'অ্যাডমিন প্যানেল',
    guardian: 'অভিভাবক ড্যাশবোর্ড',
    notes: 'নোটস',
    videos: 'ভিডিও',
    live: 'লাইভ ক্লাস',
    exams: 'পরীক্ষা',
    assignments: 'অ্যাসাইনমেন্ট',
    qa: 'প্রশ্নোত্তর',
    leaderboard: 'লিডারবোর্ড',
    achievements: 'অর্জন',
    'daily-challenge': 'দৈনিক চ্যালেঞ্জ',
    planner: 'প্ল্যানার',
    certificate: 'সার্টিফিকেট',
    'ai-tutor': 'AI শিক্ষক',
    'exam-history': 'পরীক্ষার ইতিহাস',
    'study-group': 'স্টাডি গ্রুপ',
    notices: 'নোটিশ বোর্ড',
    'report-card': 'রিপোর্ট কার্ড',
    resources: 'রিসোর্স',
    feedback: 'মতামত',
    'weekly-quiz': 'সাপ্তাহিক কুইজ',
    'subject-detail': 'বিষয়ের বিস্তারিত',
  };

  // Section icons for breadcrumb
  const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    dashboard: LayoutDashboard,
    admin: Shield,
    guardian: GraduationCap,
    notes: BookOpen,
    videos: Video,
    live: Radio,
    exams: FileCheck,
    assignments: ClipboardList,
    qa: MessageCircleQuestion,
    leaderboard: BarChart3,
    achievements: Trophy,
    'daily-challenge': Zap,
    planner: CalendarDays,
    certificate: Award,
    'ai-tutor': Bot,
    'exam-history': Clock,
    'study-group': Users,
    notices: Bell,
    'report-card': FileText,
    resources: Download,
    feedback: MessageSquare,
    'weekly-quiz': Swords,
  };

  const SectionIcon = sectionIcons[activeSection];

  return (
    <header className="flex h-12 lg:h-14 items-center gap-2 lg:gap-3 border-b bg-background/80 backdrop-blur-sm px-3 lg:px-6 sticky top-0 z-30">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 lg:h-5" />
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
        <button
          onClick={() => setActiveSection('home')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">স্টাডি হাব</span>
        </button>
        {activeSection !== 'home' && (
          <>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            {SectionIcon && (
              <SectionIcon className={`w-3.5 h-3.5 shrink-0 ${themeConfig.accentText}`} />
            )}
            <span className={`font-semibold truncate ${themeConfig.accentText}`}>
              {sectionLabels[activeSection] || 'স্টাডি হাব'}
            </span>
          </>
        )}
      </nav>
      <div className="ml-auto flex items-center gap-1 lg:gap-1.5">
        {/* Search shortcut */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex h-8 gap-2 text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2.5"
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            document.dispatchEvent(event);
          }}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-[11px]">সার্চ</span>
          <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 't', altKey: true });
            document.dispatchEvent(event);
          }}
        >
          <Bell className="h-4 w-4" />
          <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${themeConfig.dotColor} ring-2 ring-background`} />
        </Button>
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8"
        >
          {theme === 'dark' ? (
            <Sparkles className="h-4 w-4" />
          ) : (
            <Star className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}

// ─── Exported Layout Component ──────────────────────────────────────────

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <DashboardSidebarContent />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <DashboardTopBar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
