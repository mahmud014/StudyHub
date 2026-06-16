'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, BookOpen, Video, FileCheck, ClipboardList,
  TrendingUp, Award, Calendar, Trophy, Flame,
  PlayCircle, MessageCircleQuestion, Radio,
  Bell, Target, Zap, CheckCircle2,
  AlertCircle, Timer, BookMarked, Clock,
  ChevronRight, Sparkles, Crown, Eye,
  ArrowUpRight, ArrowDownRight, CircleDot,
  Activity, Star, GraduationCap, ListChecks,
  CalendarCheck, BarChart2, PieChart, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import StudentProfileCard from '@/components/ui/StudentProfileCard';

import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Helper: Convert digits to Bengali numerals ─────────────────────────────
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Bengali date formatter ─────────────────────────────────────────────────
function getBengaliDate(): string {
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const now = new Date();
  return `${days[now.getDay()]}, ${toBengaliNum(now.getDate())} ${months[now.getMonth()]} ${toBengaliNum(now.getFullYear())}`;
}

function getBengaliTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const period = hours >= 12 ? 'পিএম' : 'এএম';
  hours = hours % 12 || 12;
  return `${toBengaliNum(hours)}:${toBengaliNum(minutes.toString().padStart(2, '0'))} ${period}`;
}

// ─── Relative time in Bengali ───────────────────────────────────────────────
function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'এইমাত্র';
  if (diffMin < 60) return `${toBengaliNum(diffMin)} মিনিট আগে`;
  if (diffHr < 24) return `${toBengaliNum(diffHr)} ঘণ্টা আগে`;
  if (diffDay < 7) return `${toBengaliNum(diffDay)} দিন আগে`;
  return `${toBengaliNum(Math.floor(diffDay / 7))} সপ্তাহ আগে`;
}

// ─── Animated counter hook ──────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>();

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };
    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return count;
}

// ─── Daily motivational quotes (Bengali) ────────────────────────────────────
const motivationalQuotes = [
  'শিক্ষাই জাতির মেরুদণ্ড — ড. এ. পি. জে. আব্দুল কালাম',
  'পড়াশোনা করো, তোমার জীবন বদলে যাবে',
  'আজকের পরিশ্রম, আগামীকালের সাফল্য',
  'জ্ঞান অর্জনের কোনো বয়স নেই',
  'সফলতার চাবিকাঠি হলো নিরলস অধ্যবসায়',
  'শিক্ষা হলো আত্মবিশ্বাসের বীজ',
  'যে পড়ে, সে পারে',
  'লক্ষ্য নির্ধারণ করো, পথ খুঁজে নেবে',
  'প্রতিটি দিন নতুন কিছু শেখার সুযোগ',
  'কঠোর পরিশ্রম সফলতার পথ প্রশস্ত করে',
  'বিফলতা সফলতার পাথেয়',
  'জ্ঞানের আলোয় আলোকিত হও',
  'শিক্ষাই শক্তি — নেলসন ম্যান্ডেলা',
  'আজকের চেষ্টা, কালকের সম্মান',
  'অধ্যবসায় সফলতার মূল মন্ত্র',
];

function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
}

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface DashboardData {
  user: { name: string; email: string; role: string };
  stats: {
    totalExams: number;
    avgScore: number;
    videosWatched: number;
    notesRead: number;
    currentRank: number;
    currentScore: number;
  };
  recentActivity: {
    examResults: {
      id: string;
      exam: { titleBn: string; title: string; subject?: { nameBn: string } };
      score: number;
      totalMarks: number;
      completedAt: string;
    }[];
    assignmentSubmissions: {
      id: string;
      assignment: { titleBn: string; title: string };
      marks: number | null;
      feedback: string | null;
      status: string;
      submittedAt: string;
    }[];
  };
  upcoming: unknown[];
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }[];
}

// ─── Animation variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Mock Data Generators ───────────────────────────────────────────────────

function generateHeatmapData(): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < 12; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const isRecent = w >= 9;
      const val = isRecent
        ? Math.min(4, ((idx * 2 + 1) % 5))
        : (idx * 7 + 3) % 11 < 5 ? Math.min(4, ((idx * 3 + 1) % 5)) : 0;
      week.push(val);
    }
    weeks.push(week);
  }
  return weeks;
}

const subjectProgressData = [
  { name: 'বাংলা', completed: 18, total: 24, color: 'emerald', lastStudied: '২ ঘণ্টা আগে', nextTopic: 'সাহিত্যের ইতিহাস' },
  { name: 'ইংরেজি', completed: 15, total: 22, color: 'amber', lastStudied: '১ দিন আগে', nextTopic: 'Grammar - Tenses' },
  { name: 'গণিত', completed: 20, total: 30, color: 'rose', lastStudied: '৩ ঘণ্টা আগে', nextTopic: 'দ্বিঘাত সমীকরণ' },
  { name: 'পদার্থবিজ্ঞান', completed: 12, total: 20, color: 'sky', lastStudied: '৫ ঘণ্টা আগে', nextTopic: 'তাপগতিবিদ্যা' },
  { name: 'রসায়ন', completed: 10, total: 18, color: 'violet', lastStudied: '১ দিন আগে', nextTopic: 'জৈব রসায়ন' },
  { name: 'জীববিজ্ঞান', completed: 14, total: 22, color: 'pink', lastStudied: '২ দিন আগে', nextTopic: 'কোষ বিভাজন' },
  { name: 'তথ্য ও যোগাযোগ প্রযুক্তি', completed: 16, total: 20, color: 'teal', lastStudied: '৪ ঘণ্টা আগে', nextTopic: 'HTML & CSS' },
  { name: 'বাংলাদেশ ও বিশ্বপরিচয়', completed: 11, total: 16, color: 'orange', lastStudied: '১ দিন আগে', nextTopic: 'মুক্তিযুদ্ধের ইতিহাস' },
];

const colorMap: Record<string, { bar: string; bg: string; text: string; ring: string }> = {
  emerald: { bar: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'stroke-emerald-500' },
  amber: { bar: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', ring: 'stroke-amber-500' },
  rose: { bar: 'bg-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', ring: 'stroke-rose-500' },
  sky: { bar: 'bg-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', ring: 'stroke-sky-500' },
  violet: { bar: 'bg-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', ring: 'stroke-violet-500' },
  pink: { bar: 'bg-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', ring: 'stroke-pink-500' },
  teal: { bar: 'bg-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', ring: 'stroke-teal-500' },
  orange: { bar: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', ring: 'stroke-orange-500' },
};

const weeklyStudyHours = [
  { day: 'শনি', hours: 2.5 },
  { day: 'রবি', hours: 3.0 },
  { day: 'সোম', hours: 4.5 },
  { day: 'মঙ্গল', hours: 3.8 },
  { day: 'বুধ', hours: 5.0 },
  { day: 'বৃহ', hours: 2.8 },
  { day: 'শুক্র', hours: 4.2 },
];

const upcomingDeadlines = [
  { id: '1', title: 'গণিত - অধ্যায় ৫ অ্যাসাইনমেন্ট', type: 'assignment' as const, dueLabel: 'আজ', status: 'today' as const, subject: 'গণিত', dueDate: new Date().toISOString() },
  { id: '2', title: 'পদার্থবিজ্ঞান মডেল টেস্ট', type: 'exam' as const, dueLabel: 'আগামীকাল', status: 'tomorrow' as const, subject: 'পদার্থবিজ্ঞান', dueDate: new Date(Date.now() + 86400000).toISOString() },
  { id: '3', title: 'ইংরেজি - রচনা জমা', type: 'assignment' as const, dueLabel: 'বুধবার', status: 'week' as const, subject: 'ইংরেজি', dueDate: new Date(Date.now() + 3 * 86400000).toISOString() },
  { id: '4', title: 'রসায়ন - ল্যাব রিপোর্ট', type: 'assignment' as const, dueLabel: 'বৃহস্পতিবার', status: 'week' as const, subject: 'রসায়ন', dueDate: new Date(Date.now() + 4 * 86400000).toISOString() },
  { id: '5', title: 'জীববিজ্ঞান কুইজ', type: 'exam' as const, dueLabel: 'শুক্রবার', status: 'week' as const, subject: 'জীববিজ্ঞান', dueDate: new Date(Date.now() + 5 * 86400000).toISOString() },
  { id: '6', title: 'বাংলা - সাহিত্য পরীক্ষা', type: 'exam' as const, dueLabel: 'অতীত', status: 'overdue' as const, subject: 'বাংলা', dueDate: new Date(Date.now() - 86400000).toISOString() },
];

const quickActions = [
  { label: 'নোটস পড়ুন', icon: BookOpen, section: 'notes', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'ভিডিও দেখুন', icon: PlayCircle, section: 'videos', color: 'bg-teal-500 hover:bg-teal-600' },
  { label: 'পরীক্ষা দিন', icon: FileCheck, section: 'exams', color: 'bg-amber-500 hover:bg-amber-600' },
  { label: 'অ্যাসাইনমেন্ট', icon: ClipboardList, section: 'assignments', color: 'bg-rose-500 hover:bg-rose-600' },
  { label: 'প্রশ্ন করুন', icon: MessageCircleQuestion, section: 'qa', color: 'bg-violet-500 hover:bg-violet-600' },
  { label: 'লাইভ ক্লাস', icon: Radio, section: 'live', color: 'bg-sky-500 hover:bg-sky-600' },
];

// Activity feed data
const activityFeedData = [
  { id: '1', type: 'exam' as const, title: 'গণিত মডেল টেস্ট', subtitle: 'স্কোর: ৮৫/১০০', time: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', type: 'note' as const, title: 'পদার্থবিজ্ঞান - অধ্যায় ৪', subtitle: 'নোটস সম্পন্ন', time: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '3', type: 'video' as const, title: 'রসায়ন - জৈব যৌগ', subtitle: 'ভিডিও দেখা হয়েছে', time: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '4', type: 'assignment' as const, title: 'ইংরেজি রচনা', subtitle: 'জমা দিয়েছেন', time: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: '5', type: 'exam' as const, title: 'বাংলা কুইজ', subtitle: 'স্কোর: ৯০/১০০', time: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: '6', type: 'video' as const, title: 'জীববিজ্ঞান - কোষ', subtitle: 'ভিডিও দেখা হয়েছে', time: new Date(Date.now() - 26 * 3600000).toISOString() },
  { id: '7', type: 'note' as const, title: 'তথ্য ও যোগাযোগ - অধ্যায় ৩', subtitle: 'নোটস সম্পন্ন', time: new Date(Date.now() - 30 * 3600000).toISOString() },
  { id: '8', type: 'assignment' as const, title: 'গণিত অ্যাসাইনমেন্ট', subtitle: 'চেক হয়েছে - ৮৫/১০০', time: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: '9', type: 'exam' as const, title: 'রসায়ন মডেল টেস্ট', subtitle: 'স্কোর: ৭২/১০০', time: new Date(Date.now() - 52 * 3600000).toISOString() },
  { id: '10', type: 'video' as const, title: 'বাংলাদেশ ও বিশ্বপরিচয়', subtitle: 'ভিডিও দেখা হয়েছে', time: new Date(Date.now() - 72 * 3600000).toISOString() },
];

// ─── NEW: Today's Schedule data ─────────────────────────────────────────────
const todayScheduleData = [
  { id: '1', time: 'সকাল ৬:০০', title: 'গণিত - দ্বিঘাত সমীকরণ', type: 'study' as const, duration: '৪৫ মি.', status: 'completed' as const },
  { id: '2', time: 'সকাল ৭:০০', title: 'বাংলা - সাহিত্য পাঠ', type: 'reading' as const, duration: '৩০ মি.', status: 'completed' as const },
  { id: '3', time: 'সকাল ৯:০০', title: 'পদার্থবিজ্ঞান - লাইভ ক্লাস', type: 'live' as const, duration: '১ ঘণ্টা', status: 'current' as const },
  { id: '4', time: 'দুপুর ১২:০০', title: 'ইংরেজি - Grammar Quiz', type: 'quiz' as const, duration: '৩০ মি.', status: 'upcoming' as const },
  { id: '5', time: 'বিকাল ৪:০০', title: 'রসায়ন - ল্যাব রিপোর্ট', type: 'assignment' as const, duration: '১ ঘণ্টা', status: 'upcoming' as const },
  { id: '6', time: 'সন্ধ্যা ৬:০০', title: 'জীববিজ্ঞান - ভিডিও লেকচার', type: 'video' as const, duration: '৪৫ মি.', status: 'upcoming' as const },
];

// ─── NEW: Study Goals data ──────────────────────────────────────────────────
const studyGoalsData = [
  { id: '1', title: 'দৈনিক পড়াশোনা', target: '৪ ঘণ্টা', current: 2.5, max: 4, unit: 'ঘণ্টা', color: 'emerald' },
  { id: '2', title: 'সাপ্তাহিক কুইজ', target: '৩টি', current: 2, max: 3, unit: 'টি', color: 'amber' },
  { id: '3', title: 'নোটস সম্পন্ন', target: '৫টি', current: 3, max: 5, unit: 'টি', color: 'teal' },
  { id: '4', title: 'ভিডিও দেখা', target: '৪টি', current: 3, max: 4, unit: 'টি', color: 'sky' },
];

// ─── NEW: Subject Performance Comparison data ───────────────────────────────
const subjectPerformanceData = [
  { name: 'বাংলা', score: 85, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'ইংরেজি', score: 72, color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  { name: 'গণিত', score: 90, color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
  { name: 'পদার্থবিজ্ঞান', score: 68, color: 'bg-sky-500', textColor: 'text-sky-600 dark:text-sky-400' },
  { name: 'রসায়ন', score: 75, color: 'bg-violet-500', textColor: 'text-violet-600 dark:text-violet-400' },
  { name: 'জীববিজ্ঞান', score: 82, color: 'bg-pink-500', textColor: 'text-pink-600 dark:text-pink-400' },
  { name: 'তথ্য ও যোগাযোগ', score: 88, color: 'bg-teal-500', textColor: 'text-teal-600 dark:text-teal-400' },
  { name: 'বাংলাদেশ ও বিশ্বপরিচয়', score: 78, color: 'bg-orange-500', textColor: 'text-orange-600 dark:text-orange-400' },
];

// ─── Circular Progress Ring Component ───────────────────────────────────────
function CircularProgressRing({ value, size = 44, strokeWidth = 4, color = 'emerald' }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const colorMapLocal: Record<string, string> = {
    emerald: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    rose: 'stroke-rose-500',
    teal: 'stroke-teal-500',
    sky: 'stroke-sky-500',
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="currentColor"
        className="text-muted/30" strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
        className={colorMapLocal[color] || colorMapLocal.emerald}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

// ─── Large Circular Progress for Goals ──────────────────────────────────────
function GoalProgressRing({ value, max, size = 72, strokeWidth = 6, color = 'emerald', label, unit }: {
  value: number; max: number; size?: number; strokeWidth?: number; color?: string;
  label: string; unit: string;
}) {
  const percentage = Math.round((value / max) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColorMap: Record<string, string> = {
    emerald: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    teal: 'stroke-teal-500',
    sky: 'stroke-sky-500',
    rose: 'stroke-rose-500',
  };

  const textColorMap: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    teal: 'text-teal-600 dark:text-teal-400',
    sky: 'text-sky-600 dark:text-sky-400',
    rose: 'text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="currentColor"
            className="text-muted/20" strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
            className={strokeColorMap[color] || strokeColorMap.emerald}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-sm font-bold ${textColorMap[color] || textColorMap.emerald}`}>
            {toBengaliNum(value)}
          </span>
          <span className="text-[9px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <p className="text-[10px] font-medium text-muted-foreground text-center leading-tight max-w-[72px] truncate">
        {label}
      </p>
    </div>
  );
}

// ─── CSS-only Donut Chart ───────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const cumulativeOffsets: number[] = [];
  let runningTotal = 0;
  for (const seg of segments) {
    cumulativeOffsets.push(-runningTotal);
    runningTotal += (seg.value / total) * 100;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" className="stroke-muted/30" strokeWidth="4" />
          {segments.map((seg, i) => {
            const segPercent = (seg.value / total) * 100;
            const dashArray = `${segPercent} ${100 - segPercent}`;
            const dashOffset = cumulativeOffsets[i];
            return (
              <motion.circle
                key={i}
                cx="18" cy="18" r="14"
                fill="none" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                className={seg.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{toBengaliNum(total)}%</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${seg.color}`} />
            <span className="text-[11px] text-muted-foreground truncate">{seg.label}</span>
            <span className="text-[11px] font-semibold ml-auto">{toBengaliNum(seg.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Countdown Timer Component ──────────────────────────────────────────────
function CountdownTimer({ dueDate }: { dueDate: string }) {
  const due = new Date(dueDate);

  const computeTimeLeft = useCallback((): string => {
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    if (diff <= 0) return 'সময় শেষ';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${toBengaliNum(days)}দিন ${toBengaliNum(hours)}ঘং`;
    if (hours > 0) return `${toBengaliNum(hours)}ঘণ্টা ${toBengaliNum(mins)}মি`;
    return `${toBengaliNum(mins)} মিনিট`;
  }, [due]);

  const [timeLeft, setTimeLeft] = useState(computeTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft());
    }, 60000);
    return () => clearInterval(interval);
  }, [computeTimeLeft]);

  return <span className="text-[10px] tabular-nums">{timeLeft}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Sub-Components ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. Enhanced Welcome Header ──
function WelcomeHeader({ userName, userRole, stats }: { userName: string; userRole: string; stats: DashboardData['stats'] }) {
  const [currentTime, setCurrentTime] = useState(getBengaliTime());
  const dailyQuote = getDailyQuote();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getBengaliTime()), 30000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<string, string> = {
    student: 'শিক্ষার্থী',
    teacher: 'শিক্ষক',
    admin: 'অ্যাডমিন',
    guardian: 'অভিভাবক',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 dark:from-emerald-500/15 dark:via-teal-500/10 dark:to-emerald-500/15 border border-emerald-500/15 p-4 sm:p-6 lg:p-6 shadow-lg shadow-emerald-500/5"
    >
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-teal-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-6">
        <Avatar className="w-14 h-14 lg:w-16 lg:h-16 border-2 border-emerald-500/30 ring-4 ring-emerald-500/10 shrink-0">
          <AvatarFallback className="bg-emerald-500/15 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {userName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold mb-1">
            স্বাগতম,{' '}
            <motion.span
              className="inline-block bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% auto' }}
            >
              {userName}
            </motion.span>
            !
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {getBengaliDate()}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {currentTime}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              {roleLabels[userRole] || 'শিক্ষার্থী'}
            </Badge>
            {stats.currentRank > 0 && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-[11px]">
                  <Trophy className="w-3 h-3 mr-1" />
                  র‍্যাংক #{toBengaliNum(stats.currentRank)}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          {/* Subscription status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">ফ্রি প্ল্যান</span>
          </div>
          {/* Streak */}
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="w-4 h-4 text-orange-500" />
            </motion.div>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {toBengaliNum(7)} দিন স্ট্রিক!
            </span>
          </div>
        </div>
      </div>

      {/* Motivational quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-4 pt-3 border-t border-emerald-500/10 flex items-start gap-2"
      >
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-muted-foreground italic">
          &ldquo;{dailyQuote}&rdquo;
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── 2. Enhanced Stats Card with Animated Counter ──
function EnhancedStatCard({
  label,
  value,
  animatedValue,
  icon: Icon,
  colorClass,
  gradientClass,
  changePercent,
  changeLabel,
  sparkData,
  index,
  circularValue,
  isRank = false,
  rankChange,
  isStreak = false,
}: {
  label: string;
  value: string;
  animatedValue: number;
  icon: React.ElementType;
  colorClass: string;
  gradientClass: string;
  changePercent: string;
  changeLabel: string;
  sparkData: number[];
  index: number;
  circularValue?: number;
  isRank?: boolean;
  rankChange?: number;
  isStreak?: boolean;
}) {
  const maxSpark = Math.max(...sparkData);
  const isPositiveChange = changePercent.startsWith('+');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px -8px rgba(16, 185, 129, 0.15)' }}
      className="transition-shadow duration-300"
    >
      <Card className="card-hover overflow-hidden relative shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
        {/* Gradient accent bar at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${gradientClass}`} />
        <CardContent className="p-4 pt-5">
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${colorClass} mb-2.5`}>
                {isStreak ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </motion.div>
                ) : (
                  <Icon className="w-4.5 h-4.5" />
                )}
              </div>
              <p className="text-2xl font-bold text-gradient">
                {isStreak ? `${toBengaliNum(animatedValue)} দিন` : value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
            {/* Right side: sparkline or circular ring */}
            {circularValue !== undefined ? (
              <div className="relative mt-1">
                <CircularProgressRing value={circularValue} color="emerald" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {toBengaliNum(circularValue)}%
                  </span>
                </div>
              </div>
            ) : isRank && rankChange !== undefined ? (
              <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-medium ${
                rankChange >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                {rankChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {toBengaliNum(Math.abs(rankChange))}
              </div>
            ) : (
              /* Sparkline */
              <div className="flex items-end gap-[2px] h-8 mt-2">
                {sparkData.map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxSpark) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
                    className={`w-[3px] rounded-full ${gradientClass} opacity-60`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Change indicator */}
          <div className="flex items-center gap-1 mt-2.5">
            <TrendingUp className={`w-3 h-3 ${isPositiveChange ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className={`text-[11px] font-medium ${isPositiveChange ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {changePercent}
            </span>
            <span className="text-[10px] text-muted-foreground">{changeLabel}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── 3. Study Streak Calendar (GitHub-style heatmap) ── ENHANCED for desktop
function StreakCalendar() {
  const heatmapData = generateHeatmapData();
  const bengaliDays = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র'];
  const monthLabels = ['ডিসেম্বর', 'জানুয়ারি', 'ফেব্রুয়ারি'];

  const opacityMap: Record<number, string> = {
    0: 'bg-muted/30',
    1: 'bg-emerald-200 dark:bg-emerald-900/50',
    2: 'bg-emerald-400/60 dark:bg-emerald-700/60',
    3: 'bg-emerald-500/75 dark:bg-emerald-600/75',
    4: 'bg-emerald-600 dark:bg-emerald-500',
  };

  const todaysGoal = 65;

  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            পড়াশোনার ক্যালেন্ডার
          </CardTitle>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="w-4 h-4 text-orange-500" />
            </motion.div>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {toBengaliNum(7)} দিন স্ট্রিক!
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Month labels */}
        <div className="flex gap-0 mb-1.5 pl-12">
          {monthLabels.map((m, i) => (
            <div key={i} className="flex-1 text-[10px] text-muted-foreground font-medium">{m}</div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1.5">
            {bengaliDays.map((day, i) => (
              <div key={i} className="w-10 h-[18px] flex items-center justify-end text-[10px] text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          {/* Heatmap grid - larger on desktop */}
          <div className="flex gap-[3px] flex-1">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px] flex-1">
                {week.map((level, di) => (
                  <motion.div
                    key={di}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.01, duration: 0.15 }}
                    className={`w-full aspect-square rounded-[3px] ${opacityMap[level]} transition-colors hover:ring-2 hover:ring-emerald-400 cursor-pointer`}
                    title={`সপ্তাহ ${toBengaliNum(wi + 1)}, ${bengaliDays[di]}: স্তর ${toBengaliNum(level)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-muted-foreground mr-1">কম</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className={`w-3.5 h-3.5 rounded-[3px] ${opacityMap[level]}`} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">বেশি</span>
        </div>
        {/* Today's Goal */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              আজকের লক্ষ্য
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {toBengaliNum(todaysGoal)}% সম্পন্ন
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${todaysGoal}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── 4. Subject Progress Cards (2×4 grid, clickable) ──
function SubjectProgressCards({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          বিষয়ভিত্তিক অগ্রগতি
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          {subjectProgressData.map((subject, index) => {
            const percentage = Math.round((subject.completed / subject.total) * 100);
            const colors = colorMap[subject.color];
            return (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.03, y: -3 }}
                className={`p-3 rounded-xl ${colors.bg} border border-transparent hover:border-current/10 transition-all cursor-pointer group`}
                onClick={() => setActiveSection('notes')}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold truncate pr-1">{subject.name}</p>
                  <span className={`text-xs font-bold ${colors.text}`}>
                    {toBengaliNum(percentage)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colors.bar}`}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-muted-foreground">
                    {toBengaliNum(subject.completed)}/{toBengaliNum(subject.total)} সম্পন্ন
                  </p>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </div>
                {/* Last studied & next topic */}
                <div className="mt-1.5 pt-1.5 border-t border-current/5">
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {subject.lastStudied}
                  </p>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <ArrowUpRight className="w-2.5 h-2.5" />
                    পরবর্তী: {subject.nextTopic}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── 5. Upcoming Deadlines Card (with countdown & view all) ──
function UpcomingDeadlinesCard() {
  const [showAll, setShowAll] = useState(false);
  const statusConfig: Record<string, { color: string; dotColor: string; iconBg: string }> = {
    today: { color: 'text-amber-700 dark:text-amber-300', dotColor: 'bg-amber-500', iconBg: 'bg-amber-500/10' },
    tomorrow: { color: 'text-orange-700 dark:text-orange-300', dotColor: 'bg-orange-500', iconBg: 'bg-orange-500/10' },
    week: { color: 'text-emerald-700 dark:text-emerald-300', dotColor: 'bg-emerald-500', iconBg: 'bg-emerald-500/10' },
    overdue: { color: 'text-red-700 dark:text-red-300', dotColor: 'bg-red-500', iconBg: 'bg-red-500/10' },
  };

  const displayedDeadlines = showAll ? upcomingDeadlines : upcomingDeadlines.slice(0, 4);

  return (
    <Card className="card-hover h-full flex flex-col shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
            </div>
            আসন্ন সময়সূচি
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 h-7 px-2"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'কম দেখুন' : 'সব দেখুন'}
            <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {displayedDeadlines.map((item, index) => {
              const config = statusConfig[item.status] || statusConfig.week;
              const Icon = item.type === 'exam' ? FileCheck : ClipboardList;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.06 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.iconBg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground">{item.subject}</p>
                      <CountdownTimer dueDate={item.dueDate} />
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 border-current/20 ${config.color}`}
                  >
                    {item.dueLabel}
                  </Badge>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

// ── 6. Recent Activity Feed ──
function RecentActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? activityFeedData : activityFeedData.slice(0, 5);

  const activityConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
    exam: { icon: FileCheck, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10' },
    note: { icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500/10' },
    video: { icon: PlayCircle, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-500/10' },
    assignment: { icon: ClipboardList, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-500/10' },
  };

  return (
    <Card className="card-hover h-full flex flex-col shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            সাম্প্রতিক কার্যকলাপ
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 h-7 px-2"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'কম দেখুন' : 'আরও দেখুন'}
            <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="relative max-h-80 overflow-y-auto custom-scrollbar">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-0">
            {displayed.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                  className="flex items-start gap-3 py-2 relative"
                >
                  {/* Timeline dot */}
                  <div className={`shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center ${config.bgColor} relative z-10 border-2 border-background`}>
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] text-muted-foreground">{activity.subtitle}</p>
                      <span className="text-[10px] text-muted-foreground/60">•</span>
                      <p className="text-[10px] text-muted-foreground/80">{getRelativeTime(activity.time)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── 7. Study Analytics Card (with CSS-only donut chart) ──
function StudyAnalyticsCard() {
  const maxHours = Math.max(...weeklyStudyHours.map((d) => d.hours));

  const donutSegments = [
    { label: 'নোটস', value: 35, color: 'stroke-emerald-500' },
    { label: 'ভিডিও', value: 40, color: 'stroke-teal-500' },
    { label: 'পরীক্ষা', value: 25, color: 'stroke-amber-500' },
  ];

  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <BarChart3 className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          পড়াশোনার বিশ্লেষণ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-5">
        {/* Weekly bar chart */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">সাপ্তাহিক অধ্যয়ন (ঘণ্টা)</p>
          <div className="flex items-end gap-1.5 h-24">
            {weeklyStudyHours.map((item, index) => {
              const heightPercent = (item.hours / maxHours) * 100;
              const isMax = item.hours === maxHours;
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {toBengaliNum(item.hours)}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className={`w-full rounded-t-sm min-h-[4px] ${
                      isMax ? 'bg-emerald-500' : 'bg-emerald-300 dark:bg-emerald-700/60'
                    }`}
                  />
                  <span className="text-[9px] text-muted-foreground">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution: CSS-only donut chart */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">অধ্যয়ন সময় বণ্টন</p>
          <DonutChart segments={donutSegments} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Timer className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-muted-foreground">গড় দৈনিক</span>
            </div>
            <p className="text-lg font-bold text-gradient">{toBengaliNum(3.6)} ঘণ্টা</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-muted-foreground">সবচেয়ে কার্যকর</span>
            </div>
            <p className="text-lg font-bold text-gradient">সন্ধ্যা ৬-৯টা</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── 8. Quick Actions Panel (2×3 grid) ──
function QuickActionsPanel({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  return (
    <Card className="card-hover shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          দ্রুত অ্যাকশন
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 lg:gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Button
                  variant="ghost"
                  className="w-full h-auto flex flex-col items-center gap-1.5 lg:gap-2 p-2.5 lg:p-3 rounded-xl hover:bg-muted/80 transition-all group"
                  onClick={() => setActiveSection(action.section)}
                >
                  <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl ${action.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 lg:w-5.5 lg:h-5.5" />
                  </div>
                  <span className="text-[10px] lg:text-[11px] font-medium leading-tight text-center">{action.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── 9. Recent Exam Results Card ──
function RecentExamResultsCard({ examResults }: { examResults: DashboardData['recentActivity']['examResults'] }) {
  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Award className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          সাম্প্রতিক ফলাফল
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {examResults && examResults.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {examResults.slice(0, 5).map((result) => {
              const percentage = Math.round((result.score / result.totalMarks) * 100);
              return (
                <div key={result.id} className="flex items-center gap-3">
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                    percentage >= 60 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}>
                    <Award className={`w-4 h-4 ${percentage >= 60 ? 'text-emerald-500' : 'text-red-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {result.exam?.titleBn || result.exam?.title || 'পরীক্ষা'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {result.exam?.subject?.nameBn || ''} • {new Date(result.completedAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{toBengaliNum(result.score)}/{toBengaliNum(result.totalMarks)}</p>
                    <Progress value={percentage} className="w-14 h-1.5 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">এখনো কোনো পরীক্ষা দেননি</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Assignment Submissions Card ──
function AssignmentSubmissionsCard({ submissions }: { submissions: DashboardData['recentActivity']['assignmentSubmissions'] }) {
  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <ClipboardList className="w-4.5 h-4.5 text-amber-500" />
          </div>
          অ্যাসাইনমেন্ট
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {submissions && submissions.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {submissions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="flex items-center gap-3">
                <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  sub.status === 'reviewed' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${sub.status === 'reviewed' ? 'text-emerald-500' : 'text-amber-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {sub.assignment?.titleBn || sub.assignment?.title || 'অ্যাসাইনমেন্ট'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {sub.marks !== null ? `মার্কস: ${toBengaliNum(sub.marks)}/১০০` : 'পেন্ডিং'}
                  </p>
                </div>
                <Badge
                  variant={sub.status === 'reviewed' ? 'default' : 'secondary'}
                  className="text-[10px]"
                >
                  {sub.status === 'reviewed' ? 'চেক হয়েছে' : 'পেন্ডিং'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">কোনো অ্যাসাইনমেন্ট জমা দেননি</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Notifications Card ──
function NotificationsCard({ notifications }: { notifications: DashboardData['notifications'] }) {
  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Bell className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          নোটিফিকেশন
          {notifications && notifications.length > 0 && (
            <Badge className="bg-emerald-500 text-white text-[10px] ml-auto">
              {toBengaliNum(notifications.filter((n) => !n.isRead).length)} নতুন
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {notifications && notifications.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${
                  notif.isRead ? 'bg-transparent' : 'bg-emerald-500/5'
                }`}
              >
                <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                  notif.type === 'warning' ? 'bg-amber-500' :
                  notif.type === 'info' ? 'bg-teal-500' :
                  notif.type === 'error' ? 'bg-red-500' :
                  'bg-emerald-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs">{notif.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">কোনো বিজ্ঞপ্তি নেই</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NEW Sub-Components ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── Today's Schedule Card ────────────────────────────────────────────────────
function TodayScheduleCard() {
  const scheduleConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
    study: { icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500/10' },
    reading: { icon: BookMarked, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-500/10' },
    live: { icon: Radio, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-500/10' },
    quiz: { icon: FileCheck, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10' },
    assignment: { icon: ClipboardList, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-500/10' },
    video: { icon: PlayCircle, color: 'text-sky-600 dark:text-sky-400', bgColor: 'bg-sky-500/10' },
  };

  const statusStyle: Record<string, { border: string; dot: string; label: string }> = {
    completed: { border: 'border-emerald-500/20', dot: 'bg-emerald-500', label: 'সম্পন্ন' },
    current: { border: 'border-emerald-500/40', dot: 'bg-emerald-500 animate-pulse', label: 'চলছে' },
    upcoming: { border: 'border-border/50', dot: 'bg-muted-foreground/30', label: 'আসন্ন' },
  };

  const completedCount = todayScheduleData.filter(s => s.status === 'completed').length;

  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarCheck className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            আজকের সূচি
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            {toBengaliNum(completedCount)}/{toBengaliNum(todayScheduleData.length)} সম্পন্ন
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
          {todayScheduleData.map((item, index) => {
            const config = scheduleConfig[item.type];
            const style = statusStyle[item.status];
            const Icon = config.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07, duration: 0.3 }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border ${style.border} ${
                  item.status === 'current' ? 'bg-emerald-500/5' : 'hover:bg-muted/30'
                } transition-colors`}
              >
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'transparent' }}>
                  <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`shrink-0 w-5 h-5 rounded flex items-center justify-center ${config.bgColor}`}>
                      <Icon className={`w-3 h-3 ${config.color}`} />
                    </div>
                    <p className={`text-xs font-medium truncate ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 ml-7">
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    <span className="text-[9px] text-muted-foreground/60">•</span>
                    <span className="text-[10px] text-muted-foreground">{item.duration}</span>
                  </div>
                </div>
                {item.status === 'current' && (
                  <Badge className="bg-emerald-500 text-white text-[9px] shrink-0 px-1.5 py-0">
                    চলছে
                  </Badge>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Study Goals Progress Card ────────────────────────────────────────────────
function StudyGoalsProgressCard() {
  const overallProgress = Math.round(
    (studyGoalsData.reduce((sum, g) => sum + g.current, 0) /
      studyGoalsData.reduce((sum, g) => sum + g.max, 0)) * 100
  );

  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Target className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            লক্ষ্য অগ্রগতি
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            {toBengaliNum(overallProgress)}% সামগ্রিক
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
          {studyGoalsData.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <GoalProgressRing
                value={goal.current}
                max={goal.max}
                size={72}
                strokeWidth={6}
                color={goal.color}
                label={goal.title}
                unit={goal.unit}
              />
            </motion.div>
          ))}
        </div>
        {/* Overall progress bar */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">সামগ্রিক অগ্রগতি</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{toBengaliNum(overallProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Subject Performance Comparison Bar Chart ─────────────────────────────────
function SubjectPerformanceChart() {
  const maxScore = 100;

  return (
    <Card className="card-hover h-full shadow-md shadow-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <BarChart2 className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            বিষয়ভিত্তিক পারফরম্যান্স
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            গড়: {toBengaliNum(Math.round(subjectPerformanceData.reduce((s, d) => s + d.score, 0) / subjectPerformanceData.length))}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
          {subjectPerformanceData.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[60%]">{subject.name}</span>
                <span className={`text-[11px] font-bold ${subject.textColor}`}>
                  {toBengaliNum(subject.score)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(subject.score / maxScore) * 100}%` }}
                  transition={{ delay: 0.3 + index * 0.06, duration: 0.7, ease: 'easeOut' }}
                  className={`h-full rounded-full ${subject.color} group-hover:opacity-90 transition-opacity`}
                />
              </div>
            </motion.div>
          ))}
        </div>
        {/* Legend / Summary */}
        <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {toBengaliNum(subjectPerformanceData.filter(s => s.score >= 80).length)}
            </p>
            <p className="text-[9px] text-muted-foreground">চমৎকার</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {toBengaliNum(subjectPerformanceData.filter(s => s.score >= 60 && s.score < 80).length)}
            </p>
            <p className="text-[9px] text-muted-foreground">ভালো</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
              {toBengaliNum(subjectPerformanceData.filter(s => s.score < 60).length)}
            </p>
            <p className="text-[9px] text-muted-foreground">উন্নতি প্রয়োজন</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Dashboard Section ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardSection() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { user, setActiveSection } = useStudyHub();

  useEffect(() => {
    if (!user) return;
    fetch(`/api/dashboard?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => data.success && setDashboardData(data.data))
      .catch(() => {});
  }, [user]);

  // ── Not logged in state ──
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">ড্যাশবোর্ড</h2>
          <p className="text-muted-foreground">ড্যাশবোর্ড দেখতে লগইন করুন</p>
        </motion.div>
      </div>
    );
  }

  // ── Loading state ──
  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats || {
    totalExams: 0,
    avgScore: 0,
    videosWatched: 0,
    notesRead: 0,
    currentRank: 0,
    currentScore: 0,
  };

  // ── 6 Enhanced stat cards config ──
  const enhancedStatCards = [
    {
      label: 'পরীক্ষা দিয়েছে',
      value: toBengaliNum(stats.totalExams),
      rawValue: stats.totalExams,
      icon: FileCheck,
      colorClass: 'text-amber-600 bg-amber-500/10',
      gradientClass: 'bg-gradient-to-r from-amber-400 to-amber-600',
      changePercent: `+${toBengaliNum(12)}%`,
      changeLabel: 'গত সপ্তাহের চেয়ে',
      sparkData: [3, 5, 2, 7, 4, 6, 8],
    },
    {
      label: 'গড় স্কোর',
      value: `${toBengaliNum(stats.avgScore)}%`,
      rawValue: stats.avgScore,
      icon: TrendingUp,
      colorClass: 'text-emerald-600 bg-emerald-500/10',
      gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
      changePercent: `+${toBengaliNum(8)}%`,
      changeLabel: 'গত সপ্তাহের চেয়ে',
      sparkData: [60, 72, 68, 75, 70, 80, 85],
      circularValue: stats.avgScore,
    },
    {
      label: 'ভিডিও দেখেছে',
      value: toBengaliNum(stats.videosWatched),
      rawValue: stats.videosWatched,
      icon: Video,
      colorClass: 'text-teal-600 bg-teal-500/10',
      gradientClass: 'bg-gradient-to-r from-teal-400 to-teal-600',
      changePercent: `+${toBengaliNum(5)}%`,
      changeLabel: 'গত সপ্তাহের চেয়ে',
      sparkData: [2, 4, 3, 5, 4, 6, 5],
    },
    {
      label: 'নোটস পড়েছে',
      value: toBengaliNum(stats.notesRead),
      rawValue: stats.notesRead,
      icon: BookOpen,
      colorClass: 'text-emerald-600 bg-emerald-500/10',
      gradientClass: 'bg-gradient-to-r from-emerald-400 to-teal-600',
      changePercent: `+${toBengaliNum(15)}%`,
      changeLabel: 'গত সপ্তাহের চেয়ে',
      sparkData: [4, 6, 8, 5, 9, 7, 10],
    },
    {
      label: 'বর্তমান র‍্যাংক',
      value: stats.currentRank ? `#${toBengaliNum(stats.currentRank)}` : 'N/A',
      rawValue: stats.currentRank,
      icon: Trophy,
      colorClass: 'text-amber-600 bg-amber-500/10',
      gradientClass: 'bg-gradient-to-r from-amber-400 to-orange-500',
      changePercent: `+${toBengaliNum(3)}`,
      changeLabel: 'গত সপ্তাহের চেয়ে',
      sparkData: [15, 12, 10, 8, 7, 6, 5],
      isRank: true,
      rankChange: 3,
    },
    {
      label: 'স্ট্রিক',
      value: `${toBengaliNum(7)} দিন`,
      rawValue: 7,
      icon: Flame,
      colorClass: 'text-orange-600 bg-orange-500/10',
      gradientClass: 'bg-gradient-to-r from-orange-400 to-red-500',
      changePercent: `+${toBengaliNum(2)} দিন`,
      changeLabel: 'গত সপ্তাহের চেয়ে',
      sparkData: [1, 2, 3, 4, 5, 6, 7],
      isStreak: true,
    },
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Row 0: Welcome Header + Student Profile Card ─────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <div className="lg:col-span-2">
          <WelcomeHeader
            userName={user.name}
            userRole={user.role}
            stats={stats}
          />
        </div>
        <div className="lg:col-span-1">
          <StudentProfileCard />
        </div>
      </motion.div>

      {/* ── Row 1: 6 Enhanced Stats Cards ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 mb-6">
        {enhancedStatCards.map((stat, index) => (
          <StatCardWrapper key={stat.label} stat={stat} index={index} />
        ))}
      </motion.div>

      {/* ── Row 2: Quick Actions ───────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-6">
        <QuickActionsPanel setActiveSection={setActiveSection} />
      </motion.div>

      {/* ── Row 3: Today's Schedule + Study Goals + Subject Performance ──── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <TodayScheduleCard />
        <StudyGoalsProgressCard />
        <SubjectPerformanceChart />
      </motion.div>

      {/* ── Row 4: Streak Calendar + Subject Progress ──────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <StreakCalendar />
        <SubjectProgressCards setActiveSection={setActiveSection} />
      </motion.div>

      {/* ── Row 5: Upcoming Deadlines + Recent Activity + Study Analytics ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <UpcomingDeadlinesCard />
        <RecentActivityFeed />
        <StudyAnalyticsCard />
      </motion.div>

      {/* ── Row 6: Recent Results + Assignment Submissions + Notifications ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <RecentExamResultsCard
          examResults={dashboardData.recentActivity?.examResults || []}
        />
        <AssignmentSubmissionsCard
          submissions={dashboardData.recentActivity?.assignmentSubmissions || []}
        />
        <NotificationsCard
          notifications={dashboardData.notifications || []}
        />
      </motion.div>
    </motion.div>
  );
}

// ── Stat Card Wrapper (uses animated counter hook) ──
function StatCardWrapper({ stat, index }: {
  stat: {
    label: string;
    value: string;
    rawValue: number;
    icon: React.ElementType;
    colorClass: string;
    gradientClass: string;
    changePercent: string;
    changeLabel: string;
    sparkData: number[];
    circularValue?: number;
    isRank?: boolean;
    rankChange?: number;
    isStreak?: boolean;
  };
  index: number;
}) {
  const animatedValue = useAnimatedCounter(stat.rawValue, 1200);

  return (
    <EnhancedStatCard
      label={stat.label}
      value={stat.value}
      animatedValue={animatedValue}
      icon={stat.icon}
      colorClass={stat.colorClass}
      gradientClass={stat.gradientClass}
      changePercent={stat.changePercent}
      changeLabel={stat.changeLabel}
      sparkData={stat.sparkData}
      index={index}
      circularValue={stat.circularValue}
      isRank={stat.isRank}
      rankChange={stat.rankChange}
      isStreak={stat.isStreak}
    />
  );
}
