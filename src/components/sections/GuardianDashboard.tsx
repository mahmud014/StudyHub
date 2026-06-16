'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, GraduationCap, FileCheck, ClipboardList,
  TrendingUp, TrendingDown, Minus, Award, Bell, Phone, FileBarChart, CreditCard,
  Calendar, CheckCircle2, XCircle, Clock, ChevronRight,
  School, BookOpen, MessageSquare, Video, Download,
  Star, Zap, Crown, Sparkles, Eye, EyeOff, Filter,
  CalendarDays, PhoneCall, CalendarClock, BarChart3,
  CircleDot, ArrowUpRight, ArrowDownRight, MinusCircle,
  MessageCircleQuestion, Trophy, LayoutDashboard,
  ArrowRight, ArrowLeftRight, PieChart, Activity,
  ChevronDown, ChevronUp, UsersRound, BookCheck,
  Megaphone, PartyPopper, Flag, AlertTriangle,
  CircleCheck, BadgeDollarSign, Receipt, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// ─── Helpers ────────────────────────────────────────────────────────

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

function formatBengaliDate(date: Date): string {
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  return `${toBengaliNum(date.getDate())} ${months[date.getMonth()]} ${toBengaliNum(date.getFullYear())}`;
}

// ─── Animated Number Counter ─────────────────────────────────────────

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    ref.current = false;
    const startTime = performance.now();
    const animate = (now: number) => {
      if (ref.current) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => { ref.current = true; };
  }, [value, duration]);

  return <>{toBengaliNum(display)}</>;
}

// ─── Circular Progress Ring ─────────────────────────────────────────

function CircularProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  label,
  color = '#f59e0b',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(offset), 100);
    return () => clearTimeout(timer);
  }, [offset]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{toBengaliNum(percentage)}%</span>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Bar Chart Component ─────────────────────────────────

function AttendanceBarChart({ data }: { data: { month: string; rate: number }[] }) {
  const maxRate = 100;
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item, idx) => {
        const height = Math.max((item.rate / maxRate) * 100, 5);
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-muted-foreground">{toBengaliNum(item.rate)}%</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: 0.3 + idx * 0.08, ease: 'easeOut' }}
              className={`w-full rounded-t-md ${
                item.rate >= 90 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' :
                item.rate >= 75 ? 'bg-gradient-to-t from-amber-600 to-amber-400' :
                'bg-gradient-to-t from-red-500 to-red-400'
              }`}
              style={{ minHeight: '4px' }}
            />
            <span className="text-[9px] text-muted-foreground">{item.month.slice(0, 3)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────

const mockChildren = [
  {
    id: '1',
    name: 'রাহাত ইসলাম',
    class: '৯ম',
    roll: '১২',
    school: 'ঢাকা সরকারি মডেল স্কুল',
    avatar: 'র',
    totalExams: 15,
    avgScore: 78,
    avgScoreChange: 5,
    lastMonthAvgScore: 73,
    recentExams: [
      { id: 'e1', title: 'গণিত - অধ্যায় ৫', score: 42, total: 50, date: '২০২৬-০২-২০', percentage: 84 },
      { id: 'e2', title: 'বাংলা - অধ্যায় ৩', score: 35, total: 50, date: '২০২৬-০২-১৫', percentage: 70 },
      { id: 'e3', title: 'বিজ্ঞান - অধ্যায় ৪', score: 28, total: 50, date: '২০২৬-০২-১০', percentage: 56 },
    ],
    assignmentCompletion: 85,
    totalAssignments: 12,
    completedAssignments: 10,
    missedAssignments: 1,
    pendingAssignments: 1,
    subjectProgress: [
      { name: 'গণিত', score: 82, change: 8, color: '#f59e0b' },
      { name: 'বাংলা', score: 70, change: -3, color: '#f59e0b' },
      { name: 'ইংরেজি', score: 75, change: 5, color: '#8b5cf6' },
      { name: 'বিজ্ঞান', score: 68, change: 2, color: '#ef4444' },
      { name: 'পদার্থবিজ্ঞান', score: 72, change: -1, color: '#06b6d4' },
      { name: 'রসায়ন', score: 77, change: 6, color: '#ec4899' },
      { name: 'জীববিজ্ঞান', score: 80, change: 4, color: '#10b981' },
      { name: 'ইতিহাস', score: 65, change: -2, color: '#6366f1' },
    ],
    weeklyStudyHours: [2.5, 3, 1.5, 4, 3.5, 2, 1],
    attendance: {
      month: 'ফেব্রুয়ারি ২০২৬',
      totalDays: 26,
      presentDays: 19,
      absentDays: 3,
      partialDays: 4,
      streak: 5,
      daily: [
        { day: 1, status: 'present' as const, hours: 6 },
        { day: 2, status: 'present' as const, hours: 7 },
        { day: 3, status: 'absent' as const, hours: 0 },
        { day: 4, status: 'partial' as const, hours: 3 },
        { day: 5, status: 'present' as const, hours: 6 },
        { day: 6, status: 'present' as const, hours: 7 },
        { day: 7, status: 'present' as const, hours: 5 },
        { day: 8, status: 'present' as const, hours: 6 },
        { day: 9, status: 'present' as const, hours: 7 },
        { day: 10, status: 'present' as const, hours: 6 },
        { day: 11, status: 'absent' as const, hours: 0 },
        { day: 12, status: 'present' as const, hours: 7 },
        { day: 13, status: 'partial' as const, hours: 4 },
        { day: 14, status: 'present' as const, hours: 5 },
        { day: 15, status: 'present' as const, hours: 6 },
        { day: 16, status: 'present' as const, hours: 7 },
        { day: 17, status: 'present' as const, hours: 6 },
        { day: 18, status: 'present' as const, hours: 5 },
        { day: 19, status: 'absent' as const, hours: 0 },
        { day: 20, status: 'partial' as const, hours: 3 },
        { day: 21, status: 'present' as const, hours: 6 },
        { day: 22, status: 'present' as const, hours: 7 },
        { day: 23, status: 'present' as const, hours: 6 },
        { day: 24, status: 'partial' as const, hours: 4 },
        { day: 25, status: 'present' as const, hours: 7 },
        { day: 26, status: 'present' as const, hours: 6 },
      ],
    },
    monthlyAttendance: [
      { month: 'সেপ্টে', rate: 85 },
      { month: 'অক্টো', rate: 88 },
      { month: 'নভে', rate: 82 },
      { month: 'ডিসে', rate: 79 },
      { month: 'জানু', rate: 84 },
      { month: 'ফেব্রু', rate: 73 },
    ],
    teacherFeedback: [
      { teacher: 'মোঃ আব্দুল করিম', subject: 'গণিত', feedback: 'রাহাত গণিতে ভালো অগ্রগতি করছে। জ্যামিতির উপর আরও অনুশীলন দরকার।', rating: 4, date: '২৫ ফেব্রুয়ারি' },
      { teacher: 'ফারহানা ইয়াসমিন', subject: 'বাংলা', feedback: 'রচনা লেখায় উন্নতি প্রয়োজন। পড়াশোনায় মনোযোগ বাড়াতে হবে।', rating: 3, date: '২৩ ফেব্রুয়ারি' },
      { teacher: 'শারমিন আক্তার', subject: 'ইংরেজি', feedback: 'ইংরেজি গ্রামারে ভালো ধারণা আছে। কথোপকথন অনুশীলন করলে আরও ভালো হবে।', rating: 4, date: '২০ ফেব্রুয়ারি' },
    ],
  },
  {
    id: '2',
    name: 'নুসরাত জাহান',
    class: '১০ম',
    roll: '০৫',
    school: 'ঢাকা সরকারি মডেল স্কুল',
    avatar: 'ন',
    totalExams: 18,
    avgScore: 88,
    avgScoreChange: 3,
    lastMonthAvgScore: 85,
    recentExams: [
      { id: 'e4', title: 'পদার্থবিজ্ঞান - অধ্যায় ৬', score: 47, total: 50, date: '২০২৬-০২-২২', percentage: 94 },
      { id: 'e5', title: 'রসায়ন - অধ্যায় ৩', score: 44, total: 50, date: '২০২৬-০২-১৮', percentage: 88 },
      { id: 'e6', title: 'ইংরেজি - অধ্যায় ৭', score: 40, total: 50, date: '২০২৬-০২-১২', percentage: 80 },
    ],
    assignmentCompletion: 92,
    totalAssignments: 14,
    completedAssignments: 13,
    missedAssignments: 0,
    pendingAssignments: 1,
    subjectProgress: [
      { name: 'গণিত', score: 90, change: 5, color: '#f59e0b' },
      { name: 'বাংলা', score: 85, change: 2, color: '#f59e0b' },
      { name: 'ইংরেজি', score: 88, change: 7, color: '#8b5cf6' },
      { name: 'বিজ্ঞান', score: 92, change: 3, color: '#ef4444' },
      { name: 'পদার্থবিজ্ঞান', score: 94, change: 1, color: '#06b6d4' },
      { name: 'রসায়ন', score: 88, change: -2, color: '#ec4899' },
      { name: 'জীববিজ্ঞান', score: 91, change: 3, color: '#10b981' },
      { name: 'ইতিহাস', score: 82, change: 4, color: '#6366f1' },
    ],
    weeklyStudyHours: [3, 4, 3, 4.5, 4, 2.5, 1.5],
    attendance: {
      month: 'ফেব্রুয়ারি ২০২৬',
      totalDays: 26,
      presentDays: 21,
      absentDays: 1,
      partialDays: 4,
      streak: 12,
      daily: [
        { day: 1, status: 'present' as const, hours: 7 },
        { day: 2, status: 'present' as const, hours: 8 },
        { day: 3, status: 'present' as const, hours: 7 },
        { day: 4, status: 'present' as const, hours: 6 },
        { day: 5, status: 'present' as const, hours: 7 },
        { day: 6, status: 'present' as const, hours: 6 },
        { day: 7, status: 'present' as const, hours: 7 },
        { day: 8, status: 'present' as const, hours: 7 },
        { day: 9, status: 'absent' as const, hours: 0 },
        { day: 10, status: 'present' as const, hours: 8 },
        { day: 11, status: 'present' as const, hours: 7 },
        { day: 12, status: 'present' as const, hours: 6 },
        { day: 13, status: 'partial' as const, hours: 4 },
        { day: 14, status: 'present' as const, hours: 7 },
        { day: 15, status: 'present' as const, hours: 8 },
        { day: 16, status: 'present' as const, hours: 7 },
        { day: 17, status: 'present' as const, hours: 6 },
        { day: 18, status: 'present' as const, hours: 7 },
        { day: 19, status: 'present' as const, hours: 8 },
        { day: 20, status: 'partial' as const, hours: 3 },
        { day: 21, status: 'present' as const, hours: 7 },
        { day: 22, status: 'present' as const, hours: 8 },
        { day: 23, status: 'present' as const, hours: 7 },
        { day: 24, status: 'partial' as const, hours: 5 },
        { day: 25, status: 'present' as const, hours: 7 },
        { day: 26, status: 'present' as const, hours: 8 },
      ],
    },
    monthlyAttendance: [
      { month: 'সেপ্টে', rate: 95 },
      { month: 'অক্টো', rate: 92 },
      { month: 'নভে', rate: 94 },
      { month: 'ডিসে', rate: 90 },
      { month: 'জানু', rate: 93 },
      { month: 'ফেব্রু', rate: 88 },
    ],
    teacherFeedback: [
      { teacher: 'ড. রফিকুল ইসলাম', subject: 'বিজ্ঞান', feedback: 'নুসরাত অত্যন্ত মেধাবী ছাত্রী। বিজ্ঞান বিষয়ে চমৎকার ধারণা রয়েছে।', rating: 5, date: '২৬ ফেব্রুয়ারি' },
      { teacher: 'মোঃ আব্দুল করিম', subject: 'গণিত', feedback: 'গণিতে অসাধারণ অগ্রগতি। অংকের সমাধানে সৃজনশীল পদ্ধতি ব্যবহার করে।', rating: 5, date: '২৪ ফেব্রুয়ারি' },
      { teacher: 'ফারহানা ইয়াসমিন', subject: 'বাংলা', feedback: 'সাহিত্যে আগ্রহী। রচনা লেখায় দক্ষতা বেড়েছে।', rating: 4, date: '২১ ফেব্রুয়ারি' },
    ],
  },
];

const mockNotifications = [
  { id: 'n1', title: 'আসন্ন পরীক্ষা', message: 'রাহাতের গণিত পরীক্ষা ৫ই মার্চ অনুষ্ঠিত হবে।', type: 'warning', childName: 'রাহাত ইসলাম', time: '২ ঘণ্টা আগে', group: 'today', read: false },
  { id: 'n2', title: 'অ্যাসাইনমেন্ট বাকি', message: 'নুসরাতের ইংরেজি অ্যাসাইনমেন্ট জমা দেওয়া হয়নি।', type: 'danger', childName: 'নুসরাত জাহান', time: '৫ ঘণ্টা আগে', group: 'today', read: false },
  { id: 'n3', title: 'ভালো ফলাফল!', message: 'নুসরাত পদার্থবিজ্ঞান পরীক্ষায় ৯৪% পেয়েছে। শুভেচ্ছা!', type: 'success', childName: 'নুসরাত জাহান', time: '১ দিন আগে', group: 'yesterday', read: true },
  { id: 'n4', title: 'উপস্থিতি সতর্কতা', message: 'রাহাতের এ মাসে ৩ দিন অনুপস্থিতি রয়েছে।', type: 'warning', childName: 'রাহাত ইসলাম', time: '২ দিন আগে', group: 'earlier', read: true },
  { id: 'n5', title: 'সাবস্ক্রিপশন নবায়ন', message: 'আপনার সাবস্ক্রিপশন ১৫ই মার্চ শেষ হবে। নবায়ন করুন।', type: 'info', childName: '', time: '৩ দিন আগে', group: 'earlier', read: false },
  { id: 'n6', title: 'নতুন ভিডিও লেকচার', message: 'গণিত অধ্যায় ৬ এর নতুন ভিডিও যুক্ত হয়েছে।', type: 'info', childName: 'রাহাত ইসলাম', time: '৪ দিন আগে', group: 'earlier', read: true },
  { id: 'n7', title: 'পরীক্ষায় উত্তীর্ণ!', message: 'রাহাত বিজ্ঞান পরীক্ষায় ৮৪% নম্বর পেয়েছে।', type: 'success', childName: 'রাহাত ইসলাম', time: '৫ দিন আগে', group: 'earlier', read: true },
];

const mockTeachers = [
  { id: 't1', name: 'মোঃ আব্দুল করিম', subject: 'গণিত', avatar: 'ক', phone: '০১৭১২৩৪৫৬৭৮', available: true },
  { id: 't2', name: 'ফারহানা ইয়াসমিন', subject: 'বাংলা', avatar: 'ফ', phone: '০১৭১২৩৪৫৬৭৯', available: true },
  { id: 't3', name: 'ড. রফিকুল ইসলাম', subject: 'বিজ্ঞান', avatar: 'র', phone: '০১৭১২৩৪৫৬৮০', available: false },
  { id: 't4', name: 'শারমিন আক্তার', subject: 'ইংরেজি', avatar: 'শ', phone: '০১৭১২৩৪৫৬৮১', available: true },
];

const mockPaymentHistory = [
  { id: 'p1', date: '১৫ জানুয়ারি ২০২৬', amount: 299, method: 'বিকাশ', status: 'সম্পন্ন', plan: 'প্রিমিয়াম', txnId: 'TXN20260115' },
  { id: 'p2', date: '১৫ ডিসেম্বর ২০২৫', amount: 299, method: 'নগদ', status: 'সম্পন্ন', plan: 'প্রিমিয়াম', txnId: 'TXN20251215' },
  { id: 'p3', date: '১৫ নভেম্বর ২০২৫', amount: 299, method: 'বিকাশ', status: 'সম্পন্ন', plan: 'প্রিমিয়াম', txnId: 'TXN20251115' },
  { id: 'p4', date: '১৫ অক্টোবর ২০২৫', amount: 199, method: 'বিকাশ', status: 'সম্পন্ন', plan: 'বেসিক', txnId: 'TXN20251015' },
  { id: 'p5', date: '১৫ সেপ্টেম্বর ২০২৫', amount: 199, method: 'নগদ', status: 'সম্পন্ন', plan: 'বেসিক', txnId: 'TXN20250915' },
];

const mockSchoolEvents = [
  { id: 'se1', title: 'বার্ষিক পরীক্ষা শুরু', date: '৫ মার্চ ২০২৬', type: 'exam', daysLeft: 6 },
  { id: 'se2', title: 'স্বাধীনতা দিবস ছুটি', date: '২৬ মার্চ ২০২৬', type: 'holiday', daysLeft: 27 },
  { id: 'se3', title: 'বিজ্ঞান মেলা', date: '১০ মার্চ ২০২৬', type: 'event', daysLeft: 11 },
  { id: 'se4', title: 'অভিভাবক সমাবেশ', date: '১৫ মার্চ ২০২৬', type: 'meeting', daysLeft: 16 },
  { id: 'se5', title: 'বসন্ত উৎসব', date: '২০ মার্চ ২০২৬', type: 'event', daysLeft: 21 },
  { id: 'se6', title: 'পহেলা বৈশাখ ছুটি', date: '১৪ এপ্রিল ২০২৬', type: 'holiday', daysLeft: 46 },
];

// ─── Animation Variants ─────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

// ─── Component ────────────────────────────────────────────────────────

export default function GuardianDashboard() {
  const { user, setActiveSection } = useStudyHub();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [notificationFilter, setNotificationFilter] = useState('সব');
  const [readStates, setReadStates] = useState<Record<string, boolean>>({});
  const [subjects, setSubjects] = useState<Array<{ id: string; nameBn: string; color: string | null }>>([]);
  const [notices, setNotices] = useState<Array<{ id: string; titleBn: string; type: string; createdAt: string }>>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState(mockPaymentHistory);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
  const [paymentPin, setPaymentPin] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(299);
  const [paymentChildId, setPaymentChildId] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  const handleDownloadWeeklyReport = () => {
    const activeChild = children.find(c => c.id === selectedChild);
    if (!activeChild) {
      toast.error('শিক্ষার্থী পাওয়া যায়নি');
      return;
    }
    const attendanceRate = activeChild.attendance || 95;
    const lines = [
      '==================================================',
      '           স্টাডি হাব (StudyHub) - সাপ্তাহিক রিপোর্ট',
      '==================================================',
      `ডাউনলোডের তারিখ: ${new Date().toLocaleDateString('bn-BD')}`,
      `শিক্ষার্থীর নাম: ${activeChild.name}`,
      `শ্রেণি: ${activeChild.class}`,
      `রোল নম্বর: ${toBengaliNum(activeChild.roll)}`,
      `শিক্ষা প্রতিষ্ঠান: ${activeChild.school}`,
      '--------------------------------------------------',
      'একাডেমিক পারফরম্যান্স সারসংক্ষেপ:',
      `মোট অংশগ্রহণকৃত পরীক্ষা: ${toBengaliNum(activeChild.totalExams)}টি`,
      `গড় নম্বর: ${toBengaliNum(activeChild.avgScore)}%`,
      `উপস্থিতির হার: ${toBengaliNum(attendanceRate)}%`,
      '--------------------------------------------------',
      'অ্যাসাইনমেন্ট ট্র্যাকার:',
      `মোট অ্যাসাইনমেন্ট: ${toBengaliNum(activeChild.totalAssignments)}টি`,
      `সম্পন্ন: ${toBengaliNum(activeChild.completedAssignments)}টি`,
      `বকেয়া: ${toBengaliNum(activeChild.pendingAssignments)}টি`,
      `ছুটে গেছে: ${toBengaliNum(activeChild.missedAssignments)}টি`,
      '--------------------------------------------------',
      'শিক্ষকের সাম্প্রতিক মন্তব্য ও ফিডব্যাক:',
      `"${activeChild.teacherFeedback || 'কোনো মন্তব্য নেই'}"`,
      '==================================================',
      '      অভিভাবক নিয়ন্ত্রণ ড্যাশবোর্ড থেকে প্রস্তুতকৃত।',
      '==================================================',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeChild.name}_সাপ্তাহিক_রিপোর্ট.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('সাপ্তাহিক রিপোর্ট ডাউনলোড শুরু হয়েছে!');
  };

  const handleDownloadReceipt = (payment: any) => {
    const activeChild = children.find(c => c.id === selectedChild);
    const lines = [
      '==================================================',
      '           স্টাডি হাব (StudyHub) - পেমেন্ট রশিদ',
      '==================================================',
      `তারিখ: ${payment.date}`,
      `ট্রানজেকশন আইডি (TxnID): ${payment.txnId}`,
      `পদ্ধতি: ${payment.method}`,
      `প্ল্যান: ${payment.plan}`,
      `পেমেন্ট স্ট্যাটাস: ${payment.status}`,
      `শিক্ষার্থীর নাম: ${payment.childName || activeChild?.name || 'শিক্ষার্থী'}`,
      '--------------------------------------------------',
      `মোট পরিশোধিত পরিমাণ: ৳${toBengaliNum(payment.amount)}`,
      '==================================================',
      '             পেমেন্টটি সফলভাবে সম্পন্ন হয়েছে।',
      '==================================================',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyHub_Receipt_${payment.txnId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('রশিদ ডাউনলোড সম্পন্ন হয়েছে!');
  };

  // Fetch real data
  useEffect(() => {
    async function fetchData() {
      if (!user || user.role !== 'guardian') {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [subjectsRes, noticesRes, studentsRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/notices'),
          fetch('/api/students'),
        ]);

        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          if (subjectsData.success) setSubjects(subjectsData.data);
        }
        if (noticesRes.ok) {
          const noticesData = await noticesRes.json();
          if (noticesData.success) setNotices(noticesData.data);
        }

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          if (studentsData.success && studentsData.data.length > 0) {
            const dbStudents = studentsData.data;
            const loadedChildren = await Promise.all(
              dbStudents.map(async (student: any, idx: number) => {
                let totalExams = 0;
                let avgScore = 0;
                let recentExams: any[] = [];
                try {
                  const historyRes = await fetch(`/api/exams/history?userId=${student.id}`);
                  if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    if (historyData.success && historyData.data) {
                      const hist = historyData.data.history;
                      const sum = historyData.data.summary;
                      totalExams = sum.totalExams;
                      avgScore = Math.round(sum.avgScore);
                      recentExams = hist.slice(0, 3).map((h: any) => ({
                        id: h.id,
                        title: h.examTitle,
                        score: h.obtainedMarks,
                        total: h.totalMarks,
                        date: h.dateTaken.split('T')[0],
                        percentage: h.percentage,
                      }));
                    }
                  }
                } catch (err) {
                  console.error('Error fetching child history:', err);
                }

                const fallbackMock = mockChildren[idx % mockChildren.length];

                return {
                  id: student.id,
                  name: student.name,
                  class: student.class === '9-10' ? '৯ম-১০ম' : student.class,
                  roll: student.roll || toBengaliNum(idx + 12),
                  school: student.school || 'ঢাকা সরকারি মডেল স্কুল',
                  avatar: student.name.charAt(0),
                  totalExams: totalExams > 0 ? totalExams : fallbackMock.totalExams,
                  avgScore: totalExams > 0 ? avgScore : fallbackMock.avgScore,
                  avgScoreChange: fallbackMock.avgScoreChange,
                  lastMonthAvgScore: fallbackMock.lastMonthAvgScore,
                  recentExams: recentExams.length > 0 ? recentExams : fallbackMock.recentExams,
                  assignmentCompletion: fallbackMock.assignmentCompletion,
                  totalAssignments: fallbackMock.totalAssignments,
                  completedAssignments: fallbackMock.completedAssignments,
                  missedAssignments: fallbackMock.missedAssignments,
                  pendingAssignments: fallbackMock.pendingAssignments,
                  subjectProgress: fallbackMock.subjectProgress,
                  weeklyStudyHours: fallbackMock.weeklyStudyHours,
                  attendance: fallbackMock.attendance,
                  monthlyAttendance: fallbackMock.monthlyAttendance,
                  teacherFeedback: fallbackMock.teacherFeedback,
                };
              })
            );
            setChildren(loadedChildren);
            setSelectedChild(loadedChildren[0].id);
            setPaymentChildId(loadedChildren[0].id);
          } else {
            setChildren(mockChildren);
            setSelectedChild(mockChildren[0].id);
            setPaymentChildId(mockChildren[0].id);
          }
        } else {
          setChildren(mockChildren);
          setSelectedChild(mockChildren[0].id);
          setPaymentChildId(mockChildren[0].id);
        }
      } catch (err) {
        console.error('Error fetching guardian dashboard data:', err);
        setChildren(mockChildren);
        setSelectedChild(mockChildren[0].id);
        setPaymentChildId(mockChildren[0].id);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const toggleRead = useCallback((id: string) => {
    setReadStates(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success('বিজ্ঞপ্তি আপডেট হয়েছে');
  }, []);

  // Not logged in → show login prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">অভিভাবক ড্যাশবোর্ড</h2>
          <p className="text-muted-foreground">ড্যাশবোর্ড দেখতে লগইন করুন</p>
        </motion.div>
      </div>
    );
  }

  // Not a guardian → access denied
  if (user.role !== 'guardian') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-40" />
          <h2 className="text-2xl font-bold mb-2">অ্যাক্সেস অস্বীকৃত</h2>
          <p className="text-muted-foreground">এই ড্যাশবোর্ড শুধুমাত্র অভিভাবকদের জন্য। আপনার অভিভাবক অ্যাকাউন্ট দিয়ে লগইন করুন।</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm text-muted-foreground font-medium">ড্যাশবোর্ড লোড হচ্ছে...</span>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">কোনো সন্তান পাওয়া যায়নি</h2>
          <p className="text-muted-foreground">আপনার অ্যাকাউন্টের সাথে কোনো শিক্ষার্থীর প্রোফাইল সংযুক্ত নেই।</p>
        </motion.div>
      </div>
    );
  }

  const notifications = mockNotifications.map(n => ({
    ...n,
    read: readStates[n.id] !== undefined ? readStates[n.id] : n.read,
  }));
  const currentChild = children.find(c => c.id === selectedChild) || children[0];
  const unreadCount = notifications.filter(n => !n.read).length;
  const attendanceRate = Math.round((currentChild.attendance.presentDays / currentChild.attendance.totalDays) * 100);

  // Get filtered notifications
  const filteredNotifications = notificationFilter === 'সব'
    ? notifications
    : notifications.filter(n => {
        if (notificationFilter === 'সতর্কতা') return n.type === 'warning' || n.type === 'danger';
        if (notificationFilter === 'সাফল্য') return n.type === 'success';
        if (notificationFilter === 'তথ্য') return n.type === 'info';
        return true;
      });

  // Group notifications
  const groupedNotifications = {
    today: filteredNotifications.filter(n => n.group === 'today'),
    yesterday: filteredNotifications.filter(n => n.group === 'yesterday'),
    earlier: filteredNotifications.filter(n => n.group === 'earlier'),
  };

  const getAttendanceColor = (status: string, hours: number) => {
    if (status === 'absent') return 'bg-gray-200 dark:bg-gray-700';
    if (status === 'partial') return 'bg-amber-300 dark:bg-amber-700';
    if (hours >= 6) return 'bg-amber-500 dark:bg-amber-400';
    return 'bg-amber-400 dark:bg-amber-500';
  };

  const getAttendanceLabel = (status: string, hours: number) => {
    if (status === 'absent') return 'অনুপস্থিত';
    if (status === 'partial') return `আংশিক (${toBengaliNum(hours)} ঘণ্টা)`;
    return `উপস্থিত (${toBengaliNum(hours)} ঘণ্টা)`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />;
    if (change < 0) return <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />;
    return <MinusCircle className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const getTrendText = (change: number) => {
    if (change > 0) return <span className="text-amber-600 text-xs">+{toBengaliNum(change)}%</span>;
    if (change < 0) return <span className="text-red-600 text-xs">{toBengaliNum(change)}%</span>;
    return <span className="text-muted-foreground text-xs">অপরিবর্তিত</span>;
  };

  const getNotifBorderColor = (type: string) => {
    switch (type) {
      case 'danger': return 'border-l-red-500';
      case 'warning': return 'border-l-amber-500';
      case 'success': return 'border-l-amber-500';
      case 'info': return 'border-l-cyan-500';
      default: return 'border-l-gray-400';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return <ClipboardList className="w-4 h-4 text-amber-600" />;
      case 'holiday': return <PartyPopper className="w-4 h-4 text-cyan-600" />;
      case 'event': return <Star className="w-4 h-4 text-amber-600" />;
      case 'meeting': return <Users className="w-4 h-4 text-orange-600" />;
      default: return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventBg = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
      case 'holiday': return 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800';
      case 'event': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
      case 'meeting': return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
      default: return 'bg-muted/30 border-border';
    }
  };

  const dayNames = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র'];

  // Notification render helper
  const renderNotification = (notif: typeof notifications[0]) => (
    <motion.div
      key={notif.id}
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getNotifBorderColor(notif.type)} ${
        notif.read ? 'bg-muted/30' : 'bg-muted/60'
      } hover:bg-muted/80 transition-colors group`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`font-medium text-sm ${!notif.read ? 'font-semibold' : ''}`}>{notif.title}</p>
          {notif.childName && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
              {notif.childName}
            </Badge>
          )}
          {!notif.read && (
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => toggleRead(notif.id)}
        >
          {notif.read ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-5">
      {/* ═══════════════════════════════════════════════════════════════
          ROW 1: Welcome Header + Guardian Portal Banner
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 lg:mb-6"
      >
        {/* Guardian Portal Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-3 flex items-center gap-3 px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/50 dark:border-amber-700/50"
        >
          <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-amber-700 dark:text-amber-300 text-sm">অভিভাবক পোর্টাল</p>
            <p className="text-xs text-muted-foreground">আপনার সন্তানের শিক্ষাগত অগ্রগতি পর্যবেক্ষণ করুন</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">সরাসরি</span>
          </div>
        </motion.div>

        {/* Gradient accent strip */}
        <div className="h-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 mb-4 lg:mb-5" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <Avatar className="w-14 h-14 lg:w-16 lg:h-16 border-3 border-amber-500 ring-4 ring-amber-500/20">
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-xl lg:text-2xl font-bold text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl sm:text-2xl lg:text-2xl font-bold"
              >
                স্বাগতম,{' '}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {user.name}
                </span>
                ! 👋
              </motion.h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <Shield className="w-3 h-3" />
                  অভিভাবক ড্যাশবোর্ড
                </span>
                <span className="text-muted-foreground/40">•</span>
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  শেষ লগইন: {formatBengaliDate(new Date())}
                </p>
              </div>
            </div>
          </div>

          {/* Notification count badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2"
          >
            {unreadCount > 0 && (
              <Badge className="bg-amber-500 text-white px-3 py-1 text-sm">
                <Bell className="w-3.5 h-3.5 mr-1" />
                {toBengaliNum(unreadCount)} অপঠিত
              </Badge>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 2: Child Selector
          ═══════════════════════════════════════════════════════════════ */}
      {children.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5 lg:mb-6"
        >
          <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {children.map((child) => (
              <motion.button
                key={child.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedChild(child.id)}
                className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl border-2 transition-all duration-200 min-w-fit ${
                  selectedChild === child.id
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 shadow-lg shadow-amber-500/10'
                    : 'border-transparent bg-muted/50 hover:bg-muted/80'
                }`}
              >
                <Avatar className={`w-10 h-10 ${selectedChild === child.id ? 'border-2 border-amber-400' : ''}`}>
                  <AvatarFallback className={`text-sm font-bold ${
                    selectedChild === child.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  }`}>
                    {child.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className={`font-semibold text-sm ${selectedChild === child.id ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                    {child.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    শ্রেণি {child.class} • রোল {child.roll}
                  </p>
                </div>
                {selectedChild === child.id && (
                  <motion.div
                    layoutId="childIndicator"
                    className="w-2 h-2 rounded-full bg-amber-500 ml-1"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ROW 3: Stats Cards (4 columns on desktop)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5 lg:mb-6">
        {[
          {
            label: 'পরীক্ষা দিয়েছে',
            value: currentChild.totalExams,
            icon: FileCheck,
            color: 'text-amber-600 bg-amber-500/10',
            gradient: 'from-amber-400 to-amber-600',
            change: '+২',
            changeType: 'up' as const,
          },
          {
            label: 'গড় স্কোর',
            value: currentChild.avgScore,
            icon: TrendingUp,
            color: 'text-amber-600 bg-amber-500/10',
            gradient: 'from-amber-400 to-amber-600',
            change: `+${toBengaliNum(currentChild.avgScoreChange)}%`,
            changeType: 'up' as const,
            suffix: '%',
          },
          {
            label: 'অ্যাসাইনমেন্ট',
            value: currentChild.completedAssignments,
            icon: ClipboardList,
            color: 'text-orange-600 bg-orange-500/10',
            gradient: 'from-orange-400 to-orange-600',
            change: `${toBengaliNum(currentChild.completedAssignments)}/${toBengaliNum(currentChild.totalAssignments)}`,
            changeType: 'neutral' as const,
          },
          {
            label: 'উপস্থিতি হার',
            value: attendanceRate,
            icon: Calendar,
            color: 'text-rose-600 bg-rose-500/10',
            gradient: 'from-rose-400 to-rose-600',
            change: '+৩%',
            changeType: 'up' as const,
            suffix: '%',
          },
        ].map((stat, sIdx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + sIdx * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <Card className="overflow-hidden relative hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 rounded-xl">
                <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-4 lg:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`inline-flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-xl ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {stat.changeType === 'up' && (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 dark:border-amber-800 text-[10px] px-1.5 py-0">
                        <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix || ''}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {stat.changeType === 'neutral' && (
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">গত মাসের চেয়ে {stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 4: Quick Navigation + Monthly Progress Report
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-5 lg:mb-6">
        {/* Quick Navigation */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1"
        >
          <Card className="h-full rounded-xl hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-amber-500" />
                দ্রুত ন্যাভিগেশন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                {[
                  { id: 'notices', label: 'নোটিশ বোর্ড', icon: Bell, color: 'from-orange-500 to-orange-600' },
                  { id: 'report-card', label: 'রিপোর্ট কার্ড', icon: FileBarChart, color: 'from-amber-500 to-amber-600' },
                  { id: 'exam-history', label: 'পরীক্ষার ইতিহাস', icon: Clock, color: 'from-cyan-500 to-cyan-600' },
                  { id: 'feedback', label: 'মতামত', icon: MessageSquare, color: 'from-amber-500 to-amber-600' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveSection(item.id)}
                      className="flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <span className="text-[11px] lg:text-xs font-medium text-center leading-tight">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Progress Report */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <Card className="h-full rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  মাসিক অগ্রগতি প্রতিবেদন
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">
                  ফেব্রুয়ারি ২০২৬
                </Badge>
              </div>
              <CardDescription className="text-xs">এই মাস বনাম গত মাসের তুলনা</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                {/* Average Score Comparison */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50">
                  <p className="text-[10px] text-muted-foreground mb-1">গড় স্কোর</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-300">{toBengaliNum(currentChild.avgScore)}%</span>
                    <span className="text-[10px] text-muted-foreground line-through">{toBengaliNum(currentChild.lastMonthAvgScore)}%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-medium text-amber-600">+{toBengaliNum(currentChild.avgScoreChange)}%</span>
                  </div>
                </div>

                {/* Attendance Comparison */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
                  <p className="text-[10px] text-muted-foreground mb-1">উপস্থিতি</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{toBengaliNum(attendanceRate)}%</span>
                    <span className="text-[10px] text-muted-foreground line-through">{toBengaliNum(attendanceRate - 3)}%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-600">+৩%</span>
                  </div>
                </div>

                {/* Assignment Completion */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 border border-cyan-200/50 dark:border-cyan-800/50">
                  <p className="text-[10px] text-muted-foreground mb-1">অ্যাসাইনমেন্ট</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-cyan-700 dark:text-cyan-300">{toBengaliNum(currentChild.assignmentCompletion)}%</span>
                    <span className="text-[10px] text-muted-foreground line-through">{toBengaliNum(currentChild.assignmentCompletion - 7)}%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-cyan-500" />
                    <span className="text-[10px] font-medium text-cyan-600">+৭%</span>
                  </div>
                </div>

                {/* Study Hours */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200/50 dark:border-rose-800/50">
                  <p className="text-[10px] text-muted-foreground mb-1">পড়াশোনার সময়</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-rose-700 dark:text-rose-300">{toBengaliNum(currentChild.weeklyStudyHours.reduce((a, b) => a + b, 0).toFixed(1))}</span>
                    <span className="text-[10px] text-muted-foreground">ঘণ্টা/সপ্তাহ</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-rose-500" />
                    <span className="text-[10px] font-medium text-rose-600">+২.৫ ঘণ্টা</span>
                  </div>
                </div>
              </div>

              {/* Progress bar comparison */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium w-20">গত মাস</span>
                  <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: `${currentChild.lastMonthAvgScore}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-10 text-right text-muted-foreground">{toBengaliNum(currentChild.lastMonthAvgScore)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium w-20 text-amber-600">এই মাস</span>
                  <div className="flex-1 h-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentChild.avgScore}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                    />
                  </div>
                  <span className="text-xs font-bold w-10 text-right text-amber-600">{toBengaliNum(currentChild.avgScore)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 5: Academic Progress (Circular Ring + Subject Bars + Recent Exams)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mb-5 lg:mb-6">
        <motion.h3
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-bold mb-4 flex items-center gap-2"
        >
          <GraduationCap className="w-5 h-5 text-amber-500" />
          {currentChild.name} — একাডেমিক অগ্রগতি
        </motion.h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Circular Progress + Subject Bars */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <Card className="rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8">
                  {/* Circular progress ring */}
                  <CircularProgressRing
                    percentage={currentChild.avgScore}
                    label="গড় স্কোর"
                    color={currentChild.avgScore >= 80 ? '#f59e0b' : currentChild.avgScore >= 60 ? '#f59e0b' : '#ef4444'}
                  />

                  {/* Subject-wise mini progress bars */}
                  <div className="flex-1 w-full space-y-2.5">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">বিষয়ভিত্তিক অগ্রগতি</h4>
                    {currentChild.subjectProgress.map((subject, idx) => (
                      <motion.div
                        key={subject.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.04 }}
                        className="flex items-center gap-2 lg:gap-3"
                      >
                        <span className="text-[11px] lg:text-xs font-medium w-20 lg:w-24 truncate">{subject.name}</span>
                        <div className="flex-1 h-2 lg:h-2.5 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${subject.score}%` }}
                            transition={{ duration: 1, delay: 0.7 + idx * 0.06, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                        </div>
                        <span className="text-[11px] lg:text-xs font-semibold w-7 text-right">{toBengaliNum(subject.score)}</span>
                        <div className="flex items-center gap-0.5 w-8">
                          {getTrendIcon(subject.change)}
                          {getTrendText(subject.change)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Exam Results */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="h-full rounded-xl hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-amber-500" />
                  সাম্প্রতিক পরীক্ষা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {currentChild.recentExams.map((exam) => {
                    const passed = exam.percentage >= 33;
                    return (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                          passed ? 'bg-amber-500/10' : 'bg-red-500/10'
                        }`}>
                          <Award className={`w-4 h-4 ${passed ? 'text-amber-500' : 'text-red-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{exam.title}</p>
                          <p className="text-[10px] text-muted-foreground">{exam.date}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-xs">{toBengaliNum(exam.score)}/{toBengaliNum(exam.total)}</p>
                          <Badge
                            variant={passed ? 'default' : 'destructive'}
                            className="text-[9px] px-1 py-0"
                          >
                            {toBengaliNum(exam.percentage)}%
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 6: Attendance Calendar + Attendance Summary Chart
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-5 lg:mb-6">
        {/* GitHub-style Attendance Graph */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="h-full rounded-xl hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-4.5 h-4.5 text-amber-500" />
                  উপস্থিতি ক্যালেন্ডার
                </CardTitle>
                <span className="text-xs text-muted-foreground">{currentChild.attendance.month}</span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Summary stats */}
              <div className="flex gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium">স্ট্রিক: <span className="text-amber-600">{toBengaliNum(currentChild.attendance.streak)} দিন</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium">উপস্থিত: <span className="text-amber-600">{toBengaliNum(currentChild.attendance.presentDays)}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">হার: <span className="text-amber-600">{toBengaliNum(attendanceRate)}%</span></span>
                </div>
              </div>

              {/* GitHub-style contribution graph */}
              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayNames.map((d) => (
                      <div key={d} className="text-[9px] text-center text-muted-foreground font-medium">{d}</div>
                    ))}
                  </div>
                  {/* Empty offset for Feb 2026 (starts Sunday = index 1) */}
                  <div className="grid grid-cols-7 gap-1">
                    <div />
                    {currentChild.attendance.daily.map((entry) => (
                      <Tooltip key={entry.day}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + entry.day * 0.02, duration: 0.2 }}
                            className={`aspect-square rounded-[3px] cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-amber-400/50 ${getAttendanceColor(entry.status, entry.hours)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{toBengaliNum(entry.day)} ফেব্রুয়ারি</p>
                          <p>{getAttendanceLabel(entry.status, entry.hours)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                <span>কম</span>
                <div className="w-3 h-3 rounded-[2px] bg-gray-200 dark:bg-gray-700" />
                <div className="w-3 h-3 rounded-[2px] bg-amber-300 dark:bg-amber-700" />
                <div className="w-3 h-3 rounded-[2px] bg-amber-400 dark:bg-amber-500" />
                <div className="w-3 h-3 rounded-[2px] bg-amber-500 dark:bg-amber-400" />
                <span>বেশি</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Summary by Month (Visual Chart) */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="h-full rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-amber-500 to-rose-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-amber-500" />
                  উপস্থিতি সারসংক্ষেপ
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                  গত ৬ মাস
                </Badge>
              </div>
              <CardDescription className="text-xs">মাসিক উপস্থিতির হার চার্ট</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Bar chart */}
              <AttendanceBarChart data={currentChild.monthlyAttendance} />

              <Separator className="my-4" />

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{toBengaliNum(currentChild.attendance.presentDays)}</p>
                  <p className="text-[10px] text-muted-foreground">উপস্থিত</p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
                  <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{toBengaliNum(currentChild.attendance.partialDays)}</p>
                  <p className="text-[10px] text-muted-foreground">আংশিক</p>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-center">
                  <XCircle className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-700 dark:text-red-400">{toBengaliNum(currentChild.attendance.absentDays)}</p>
                  <p className="text-[10px] text-muted-foreground">অনুপস্থিত</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 7: Children Comparison (if multiple children)
          ═══════════════════════════════════════════════════════════════ */}
      {children.length > 1 && (
        <motion.div
          custom={6}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="mb-5 lg:mb-6"
        >
          <Card className="rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-amber-500" />
                  সন্তানদের তুলনা
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:border-amber-700">
                  {toBengaliNum(children.length)} সন্তান
                </Badge>
              </div>
              <CardDescription className="text-xs">সকল সন্তানের পারফরম্যান্সের পাশাপাশি তুলনা</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs">মানদণ্ড</th>
                      {children.map(child => (
                        <th key={child.id} className="text-center py-2 px-3 font-medium text-xs">
                          <div className="flex flex-col items-center gap-1">
                            <Avatar className="w-8 h-8 border-2 border-amber-400">
                              <AvatarFallback className="bg-amber-500/10 text-xs font-bold text-amber-700 dark:text-amber-400">
                                {child.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-amber-700 dark:text-amber-300">{child.name}</span>
                            <span className="text-[10px] text-muted-foreground">শ্রেণি {child.class}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'গড় স্কোর', key: 'avgScore', suffix: '%', higher: true },
                      { label: 'উপস্থিতি হার', key: 'attendanceRate', suffix: '%', higher: true },
                      { label: 'অ্যাসাইনমেন্ট', key: 'assignmentCompletion', suffix: '%', higher: true },
                      { label: 'পরীক্ষা সংখ্যা', key: 'totalExams', suffix: '', higher: true },
                    ].map(row => (
                      <tr key={row.key} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 text-xs font-medium">{row.label}</td>
                        {children.map(child => {
                          const val = row.key === 'attendanceRate'
                            ? Math.round((child.attendance.presentDays / child.attendance.totalDays) * 100)
                            : (child as Record<string, unknown>)[row.key] as number;
                          const isHighest = children.every(c => {
                            const cVal = row.key === 'attendanceRate'
                              ? Math.round((c.attendance.presentDays / c.attendance.totalDays) * 100)
                              : (c as Record<string, unknown>)[row.key] as number;
                            return row.higher ? val >= cVal : val <= cVal;
                          });
                          return (
                            <td key={child.id} className="text-center py-2.5 px-3">
                              <span className={`font-bold text-sm ${isHighest ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                {toBengaliNum(val)}{row.suffix}
                              </span>
                              {isHighest && <Trophy className="w-3 h-3 text-amber-500 inline ml-1" />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ROW 8: Assignment Progress + School Calendar
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-5 lg:mb-6">
        {/* Assignment Completion */}
        <motion.div
          custom={7}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="h-full rounded-xl hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4.5 h-4.5 text-amber-500" />
                অ্যাসাইনমেন্ট অগ্রগতি
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">সম্পন্নের হার</p>
                  <span className="text-lg font-bold text-amber-600">{toBengaliNum(currentChild.assignmentCompletion)}%</span>
                </div>
                <Progress value={currentChild.assignmentCompletion} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{toBengaliNum(currentChild.completedAssignments)}</p>
                  <p className="text-[10px] text-muted-foreground">সম্পন্ন</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
                  <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{toBengaliNum(currentChild.pendingAssignments)}</p>
                  <p className="text-[10px] text-muted-foreground">পেন্ডিং</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-center">
                  <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-red-700 dark:text-red-400">{toBengaliNum(currentChild.missedAssignments)}</p>
                  <p className="text-[10px] text-muted-foreground">বাদ</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Real notices from API */}
              <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  সাম্প্রতিক নোটিশ
                </p>
                <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                  {notices.length > 0 ? notices.slice(0, 4).map((notice) => (
                    <div key={notice.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        notice.type === 'urgent' ? 'bg-red-500' :
                        notice.type === 'exam' ? 'bg-amber-500' :
                        notice.type === 'holiday' ? 'bg-cyan-500' : 'bg-amber-500'
                      }`} />
                      <span className="truncate">{notice.titleBn}</span>
                    </div>
                  )) : (
                    <p className="text-xs text-muted-foreground text-center py-3">কোনো নোটিশ নেই</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* School Calendar */}
        <motion.div
          custom={8}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="h-full rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-cyan-500 to-amber-600" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-amber-500" />
                  স্কুল ক্যালেন্ডার
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:border-amber-700">
                  আসন্ন ইভেন্ট
                </Badge>
              </div>
              <CardDescription className="text-xs">আসন্ন স্কুল ইভেন্ট ও ছুটির দিন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                {(showAllEvents ? mockSchoolEvents : mockSchoolEvents.slice(0, 4)).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getEventBg(event.type)} hover:shadow-sm transition-all duration-200`}
                  >
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-background/80 flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 ${
                          event.daysLeft <= 7 ? 'border-red-300 text-red-600 dark:border-red-700' :
                          event.daysLeft <= 14 ? 'border-amber-300 text-amber-600 dark:border-amber-700' :
                          'border-cyan-300 text-cyan-600 dark:border-cyan-700'
                        }`}
                      >
                        {toBengaliNum(event.daysLeft)} দিন বাকি
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              {mockSchoolEvents.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                  onClick={() => setShowAllEvents(!showAllEvents)}
                >
                  {showAllEvents ? (
                    <><ChevronUp className="w-3.5 h-3.5 mr-1" /> কম দেখুন</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5 mr-1" /> আরও দেখুন ({toBengaliNum(mockSchoolEvents.length - 4)})</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 9: Weekly Report Summary
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        custom={9}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="mb-5 lg:mb-6"
      >
        <Card className="rounded-xl hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
                সাপ্তাহিক রিপোর্ট সারসংক্ষেপ
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950 rounded-lg"
                onClick={() => toast.success('রিপোর্ট ডাউনলোড শুরু হয়েছে!')}
              >
                <Download className="w-3.5 h-3.5" />
                ডাউনলোড রিপোর্ট
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Study Hours Bar Chart */}
              <div>
                <p className="text-sm font-medium mb-3">সাপ্তাহিক পড়াশোনার সময় (ঘণ্টা)</p>
                <div className="flex items-end gap-2 h-32">
                  {['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র'].map((day, idx) => {
                    const hours = currentChild.weeklyStudyHours[idx];
                    const maxHours = 5;
                    const height = Math.max((hours / maxHours) * 100, 8);
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-muted-foreground">{toBengaliNum(hours)}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.8, delay: 1.0 + idx * 0.08, ease: 'easeOut' }}
                          className={`w-full rounded-t-md ${
                            hours >= 4 ? 'bg-gradient-to-t from-amber-600 to-amber-400' :
                            hours >= 2 ? 'bg-gradient-to-t from-amber-500 to-amber-300' :
                            'bg-gradient-to-t from-amber-400 to-amber-300'
                          }`}
                          style={{ minHeight: '4px' }}
                        />
                        <span className="text-[9px] text-muted-foreground">{day.slice(0, 2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trends */}
              <div className="space-y-4">
                {/* Assignment completion trend */}
                <div>
                  <p className="text-sm font-medium mb-2">অ্যাসাইনমেন্ট সম্পন্নের ধারা</p>
                  <div className="flex items-center gap-2">
                    {[60, 72, 68, 80, 85, 92, currentChild.assignmentCompletion].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(val / 2, 4)}px` }}
                          transition={{ duration: 0.5, delay: 1.1 + idx * 0.06 }}
                          className={`w-full rounded-sm ${
                            val >= 80 ? 'bg-amber-400' : val >= 60 ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                    <span>৪ সপ্তাহ আগে</span>
                    <span>এই সপ্তাহ</span>
                  </div>
                </div>

                {/* Exam performance trend */}
                <div>
                  <p className="text-sm font-medium mb-2">পরীক্ষার ফলাফলের ধারা</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-end gap-1 h-10">
                      {[65, 70, 68, 75, 72, 78, currentChild.avgScore].map((val, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(val / 3, 3)}px` }}
                          transition={{ duration: 0.5, delay: 1.2 + idx * 0.06 }}
                          className={`w-2 rounded-sm ${
                            val >= 80 ? 'bg-amber-500' : val >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {currentChild.avgScoreChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-bold ${currentChild.avgScoreChange > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          {currentChild.avgScoreChange > 0 ? '+' : ''}{toBengaliNum(currentChild.avgScoreChange)}%
                        </span>
                        <span className="text-xs text-muted-foreground">গত সপ্তাহের চেয়ে</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 10: Teacher Feedback Summary
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        custom={10}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="mb-5 lg:mb-6"
      >
        <Card className="rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircleQuestion className="w-5 h-5 text-amber-500" />
                শিক্ষকের মতামত সারসংক্ষেপ
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:border-amber-700">
                {toBengaliNum(currentChild.teacherFeedback.length)} মতামত
              </Badge>
            </div>
            <CardDescription className="text-xs">{currentChild.name} সম্পর্কে শিক্ষকদের মতামত</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentChild.teacherFeedback.map((fb, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-8 h-8 border border-amber-300">
                      <AvatarFallback className="bg-amber-500/10 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        {fb.teacher.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate">{fb.teacher}</p>
                      <p className="text-[10px] text-muted-foreground">{fb.subject}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">{fb.feedback}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= fb.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{fb.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 11: Notifications + Payment (side by side on desktop)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-5 lg:mb-6">
        {/* Notification Panel */}
        <motion.div
          custom={11}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="h-full rounded-xl hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-amber-500" />
                  বিজ্ঞপ্তি ও সতর্কতা
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 ml-1">
                      {toBengaliNum(unreadCount)}
                    </Badge>
                  )}
                </CardTitle>
              </div>
              {/* Filter tabs */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {['সব', 'সতর্কতা', 'সাফল্য', 'তথ্য'].map((tab) => (
                  <Button
                    key={tab}
                    variant={notificationFilter === tab ? 'default' : 'outline'}
                    size="sm"
                    className={`text-xs h-7 px-3 rounded-lg ${
                      notificationFilter === tab
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950'
                    }`}
                    onClick={() => setNotificationFilter(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 lg:max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {/* Today */}
                {groupedNotifications.today.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">আজ</p>
                    <div className="space-y-2">
                      {groupedNotifications.today.map(renderNotification)}
                    </div>
                  </div>
                )}

                {/* Yesterday */}
                {groupedNotifications.yesterday.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">গতকাল</p>
                    <div className="space-y-2">
                      {groupedNotifications.yesterday.map(renderNotification)}
                    </div>
                  </div>
                )}

                {/* Earlier */}
                {groupedNotifications.earlier.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">আগে</p>
                    <div className="space-y-2">
                      {groupedNotifications.earlier.map(renderNotification)}
                    </div>
                  </div>
                )}

                {filteredNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">কোনো বিজ্ঞপ্তি নেই</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment & Subscription Section */}
        <motion.div
          custom={12}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 lg:space-y-6"
        >
          {/* Current Plan */}
          <Card className="overflow-hidden rounded-xl hover:shadow-md transition-shadow duration-300">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="w-4.5 h-4.5 text-amber-500" />
                সাবস্ক্রিপশন ও পেমেন্ট
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Plan card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-amber-700 dark:text-amber-300">প্রিমিয়াম প্ল্যান</span>
                  </div>
                  <Badge className="bg-amber-500 text-white">সক্রিয়</Badge>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-amber-700 dark:text-amber-300">৳{toBengaliNum(299)}</span>
                  <span className="text-sm text-muted-foreground">/মাস</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>নবায়নের তারিখ: <span className="text-amber-600 font-medium">১৫ মার্চ ২০২৬</span></span>
                  <span className="text-amber-500 font-medium">(১৮ দিন বাকি)</span>
                </div>
              </div>

              {/* Payment buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="bg-pink-500 hover:bg-pink-600 text-white h-10 gap-2 rounded-lg"
                  onClick={() => {
                    setPaymentMethod('bkash');
                    setPaymentStep(1);
                    setPaymentAmount(299);
                    setShowPaymentModal(true);
                  }}
                >
                  <span className="text-sm font-bold">বিকাশ</span>
                  <CreditCard className="w-4 h-4" />
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white h-10 gap-2 rounded-lg"
                  onClick={() => {
                    setPaymentMethod('nagad');
                    setPaymentStep(1);
                    setPaymentAmount(299);
                    setShowPaymentModal(true);
                  }}
                >
                  <span className="text-sm font-bold">নগদ</span>
                  <CreditCard className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fee Payment History */}
          <Card className="rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4.5 h-4.5 text-amber-500" />
                  পেমেন্ট ইতিহাস
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 h-6 px-2"
                  onClick={() => setShowAllPayments(!showAllPayments)}
                >
                  {showAllPayments ? 'কম দেখুন' : 'সব দেখুন'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {(showAllPayments ? paymentHistory : paymentHistory.slice(0, 3)).map((payment) => (
                  <div key={payment.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <BadgeDollarSign className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{payment.plan} প্ল্যান</p>
                      <p className="text-[10px] text-muted-foreground">{payment.date} • {payment.method}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">৳{toBengaliNum(payment.amount)}</p>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 border-amber-300 text-amber-600 dark:border-amber-700">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {paymentHistory.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-[10px] text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 h-6"
                  onClick={() => setShowAllPayments(!showAllPayments)}
                >
                  {showAllPayments ? 'কম দেখুন' : `আরও ${toBengaliNum(paymentHistory.length - 3)} দেখুন`}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 12: Teacher Contact Section
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        custom={13}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="mb-5 lg:mb-6"
      >
        <Card id="contact-teachers-card" className="rounded-xl hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-4.5 h-4.5 text-amber-500" />
                শিক্ষকদের সাথে যোগাযোগ
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:border-amber-700">
                {toBengaliNum(mockTeachers.filter(t => t.available).length)} অনলাইন
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {mockTeachers.map((teacher, idx) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="p-4 rounded-xl border border-border/60 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 bg-card"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border-2 border-amber-400">
                        <AvatarFallback className="bg-amber-500/10 text-sm font-bold text-amber-700 dark:text-amber-400">
                          {teacher.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                        teacher.available ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[10px] h-7 gap-1 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950 rounded-lg"
                      onClick={() => toast.success(`${teacher.name} কে মেসেজ পাঠানো হচ্ছে...`)}
                    >
                      <MessageSquare className="w-3 h-3" />
                      মেসেজ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[10px] h-7 gap-1 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950 rounded-lg"
                      onClick={() => toast.success(`${teacher.name} কে কল করা হচ্ছে...`)}
                    >
                      <PhoneCall className="w-3 h-3" />
                      কল
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[10px] h-7 mt-2 gap-1 text-muted-foreground hover:text-amber-600 rounded-lg"
                    onClick={() => toast.success(`${teacher.name} এর সাথে মিটিং নির্ধারণ করা হচ্ছে...`)}
                  >
                    <CalendarClock className="w-3 h-3" />
                    মিটিং নির্ধারণ
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 13: Quick Actions (Bottom)
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        custom={14}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="rounded-xl hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ChevronRight className="w-4.5 h-4.5 text-amber-500" />
              দ্রুত পদক্ষেপ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 px-4 flex items-center gap-3 justify-start hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950 dark:hover:border-amber-700 transition-colors rounded-xl"
                onClick={() => {
                  const element = document.getElementById('contact-teachers-card');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">শিক্ষকের সাথে যোগাযোগ</p>
                  <p className="text-xs text-muted-foreground">সরাসরি কথা বলুন</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-4 flex items-center gap-3 justify-start hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950 dark:hover:border-amber-700 transition-colors rounded-xl"
                onClick={handleDownloadWeeklyReport}
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FileBarChart className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">বিস্তারিত রিপোর্ট</p>
                  <p className="text-xs text-muted-foreground">সম্পূর্ণ ফলাফল দেখুন</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-4 flex items-center gap-3 justify-start hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950 dark:hover:border-amber-700 transition-colors rounded-xl"
                onClick={() => {
                  setPaymentMethod('bkash');
                  setPaymentStep(1);
                  setPaymentAmount(299);
                  setShowPaymentModal(true);
                }}
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-rose-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">সাবস্ক্রিপশন পরিশোধ</p>
                  <p className="text-xs text-muted-foreground">পেমেন্ট করুন</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Payment Checkout Modal ── */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !paymentProcessing && setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-background/80 p-6 shadow-2xl backdrop-blur-xl"
            >
              {/* Payment Branding Strip */}
              <div className={`absolute top-0 left-0 w-full h-2 ${paymentMethod === 'bkash' ? 'bg-pink-500' : 'bg-orange-500'}`} />

              <div className="mt-2 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${paymentMethod === 'bkash' ? 'bg-pink-500/10' : 'bg-orange-500/10'}`}>
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'bkash' ? 'text-pink-500' : 'text-orange-500'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">সিমুলেটেড পেমেন্ট</h3>
                      <p className="text-xs text-muted-foreground">নিরাপদ ও তাৎক্ষণিক ফি পরিশোধ</p>
                    </div>
                  </div>
                  {!paymentProcessing && (
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Step 1: Package & Student Selector */}
                {paymentStep === 1 && (
                  <div className="space-y-4 pt-2">
                    {/* Select student */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">শিক্ষার্থী নির্বাচন করুন</label>
                      <select
                        value={paymentChildId}
                        onChange={(e) => setPaymentChildId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        {children.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.name} (শ্রেণি: {child.class})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Package */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">প্ল্যান নির্বাচন করুন</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentAmount(199)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            paymentAmount === 199
                              ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20'
                              : 'border-border bg-muted/20 hover:bg-muted/40'
                          }`}
                        >
                          <p className="text-xs font-bold text-muted-foreground">বেসিক প্ল্যান</p>
                          <p className="text-lg font-extrabold mt-1">৳{toBengaliNum(199)}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">১ মাস মেয়াদ</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentAmount(299)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            paymentAmount === 299
                              ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20'
                              : 'border-border bg-muted/20 hover:bg-muted/40'
                          }`}
                        >
                          <p className="text-xs font-bold text-amber-500 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> প্রিমিয়াম প্ল্যান
                          </p>
                          <p className="text-lg font-extrabold mt-1">৳{toBengaliNum(299)}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">১ মাস মেয়াদ</p>
                        </button>
                      </div>
                    </div>

                    <Button
                      className={`w-full mt-4 text-white font-bold h-11 rounded-xl ${
                        paymentMethod === 'bkash' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                      onClick={() => setPaymentStep(2)}
                    >
                      পরবর্তী ধাপ
                    </Button>
                  </div>
                )}

                {/* Step 2: Phone Number Input */}
                {paymentStep === 2 && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">আপনার {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাকাউন্ট নম্বর</label>
                      <input
                        type="text"
                        placeholder="যেমন: 017XXXXXXXX"
                        maxLength={11}
                        value={paymentPhoneNumber}
                        onChange={(e) => setPaymentPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold tracking-wider text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-muted-foreground text-center">১১ সংখ্যার মোবাইল ব্যাংকিং নম্বরটি লিখুন</p>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1 h-11 rounded-xl"
                        onClick={() => setPaymentStep(1)}
                      >
                        ফিরে যান
                      </Button>
                      <Button
                        disabled={paymentPhoneNumber.length !== 11}
                        className={`flex-1 text-white font-bold h-11 rounded-xl ${
                          paymentMethod === 'bkash' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                        onClick={() => setPaymentStep(3)}
                      >
                        পরবর্তী ধাপ
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: PIN Verification */}
                {paymentStep === 3 && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">৪ সংখ্যার অ্যাকাউন্ট পিন (PIN)</label>
                      <input
                        type="password"
                        placeholder="••••"
                        maxLength={4}
                        value={paymentPin}
                        onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold tracking-widest text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-muted-foreground text-center">এটি একটি সুরক্ষিত ডেমো সিমুলেশন। পিন নম্বরটি এনক্রিপ্টেড থাকবে।</p>
                    </div>

                    {paymentProcessing ? (
                      <div className="flex flex-col items-center justify-center py-4 gap-2">
                        <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
                        <p className="text-xs text-muted-foreground">পেমেন্ট প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
                      </div>
                    ) : (
                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          className="flex-1 h-11 rounded-xl"
                          onClick={() => setPaymentStep(2)}
                        >
                          ফিরে যান
                        </Button>
                        <Button
                          disabled={paymentPin.length !== 4}
                          className={`flex-1 text-white font-bold h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700`}
                          onClick={async () => {
                            setPaymentProcessing(true);
                            // Simulate processing
                            await new Promise(r => setTimeout(r, 2050));
                            setPaymentProcessing(false);

                            const childObj = children.find(c => c.id === paymentChildId);
                            const txnId = `TXN${new Date().getTime().toString().slice(-8)}`;
                            const newPayment = {
                              id: `p-${new Date().getTime()}`,
                              date: formatBengaliDate(new Date()),
                              amount: paymentAmount,
                              method: paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ',
                              status: 'সম্পন্ন',
                              plan: paymentAmount === 299 ? 'প্রিমিয়াম' : 'বেসিক',
                              txnId,
                              childName: childObj?.name || 'শিক্ষার্থী',
                            };

                            setPaymentHistory(prev => [newPayment, ...prev]);
                            setPaymentSuccessData(newPayment);
                            setPaymentStep(4);
                            toast.success('পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!');
                          }}
                        >
                          পরিশোধ করুন
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Success Ticket */}
                {paymentStep === 4 && paymentSuccessData && (
                  <div className="space-y-4 pt-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">৳{toBengaliNum(paymentSuccessData.amount)} পরিশোধিত</h4>
                      <p className="text-xs text-muted-foreground">আপনার ট্রানজেকশন সফলভাবে সম্পন্ন হয়েছে</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-left text-xs space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">শিক্ষার্থী:</span>
                        <span className="font-bold">{paymentSuccessData.childName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">পদ্ধতি:</span>
                        <span className="font-bold">{paymentSuccessData.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">প্ল্যান:</span>
                        <span className="font-bold">{paymentSuccessData.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TxnID:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{paymentSuccessData.txnId}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="outline"
                        className="flex-1 h-10 rounded-xl text-xs gap-1"
                        onClick={() => handleDownloadReceipt(paymentSuccessData)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        রশিদ ডাউনলোড
                      </Button>
                      <Button
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 rounded-xl text-xs"
                        onClick={() => {
                          setShowPaymentModal(false);
                          setPaymentPhoneNumber('');
                          setPaymentPin('');
                          setPaymentStep(1);
                        }}
                      >
                        ড্যাশবোর্ডে ফিরুন
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
