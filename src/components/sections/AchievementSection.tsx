'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import {
  Trophy, Award, Flame, Star, Crown, Target, Zap, BookOpen,
  GraduationCap, Brain, Calendar, Users, HelpCircle, Sun, Moon,
  Lock, Unlock, Sparkles, ChevronRight, TrendingUp, Medal,
  BookMarked, Video, PenTool, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeCategory = 'study' | 'exam' | 'streak' | 'social' | 'special';

interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: BadgeCategory;
  points: number;
  colorFrom: string;
  colorTo: string;
  iconColor: string;
  progress: number; // 0-100
  earned: boolean;
  earnedDate?: string;
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, duration, count, rounded]);

  return <span>{display}</span>;
}

// ─── Progress Ring (SVG) ─────────────────────────────────────────────────────

function ProgressRing({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(offset), 100);
    return () => clearTimeout(timer);
  }, [offset]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-emerald-100 dark:text-emerald-900/40"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#emeraldGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={animatedOffset}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Confetti Particle ───────────────────────────────────────────────────────

function ConfettiParticles({ active }: { active: boolean }) {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * 360,
      distance: 30 + Math.random() * 40,
      size: 3 + Math.random() * 4,
      delay: i * 0.05,
      color: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b', '#a78bfa'][i % 6],
    })),
    []
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0],
              x: [0, x, x * 0.8],
              y: [0, y, y * 0.8 + 10],
            }}
            transition={{
              duration: 1.2,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 2.5,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Badge Data ──────────────────────────────────────────────────────────────

function getBadges(userEarnedIds: string[]): AchievementBadge[] {
  const allBadges: Omit<AchievementBadge, 'earned' | 'earnedDate' | 'progress'>[] = [
    // পড়াশোনা (Study)
    {
      id: 'bookworm',
      name: 'বইপোকা',
      description: '১০টি নোট পড়ে শেষ করুন',
      icon: BookOpen,
      category: 'study',
      points: 50,
      colorFrom: 'from-emerald-400',
      colorTo: 'to-emerald-600',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'notes-ninja',
      name: 'নোটস নিনজা',
      description: 'একটি বিষয়ের সব নোট পড়ুন',
      icon: BookMarked,
      category: 'study',
      points: 100,
      colorFrom: 'from-teal-400',
      colorTo: 'to-teal-600',
      iconColor: 'text-teal-500',
    },
    {
      id: 'video-viper',
      name: 'ভিডিও ভাইপার',
      description: '২০টি ভিডিও দেখুন',
      icon: Video,
      category: 'study',
      points: 75,
      colorFrom: 'from-cyan-400',
      colorTo: 'to-cyan-600',
      iconColor: 'text-cyan-500',
    },

    // পরীক্ষা (Exam)
    {
      id: 'examinee',
      name: 'পরীক্ষার্থী',
      description: '৫টি পরীক্ষা দিন',
      icon: PenTool,
      category: 'exam',
      points: 60,
      colorFrom: 'from-amber-400',
      colorTo: 'to-amber-600',
      iconColor: 'text-amber-500',
    },
    {
      id: 'top-five',
      name: 'পঞ্চমী',
      description: 'শীর্ষ ৫-এ স্থান পান',
      icon: Trophy,
      category: 'exam',
      points: 150,
      colorFrom: 'from-yellow-400',
      colorTo: 'to-yellow-600',
      iconColor: 'text-yellow-500',
    },
    {
      id: 'perfect-score',
      name: 'পূর্ণমার্ক',
      description: '১০০% নম্বর পান',
      icon: Crown,
      category: 'exam',
      points: 200,
      colorFrom: 'from-orange-400',
      colorTo: 'to-orange-600',
      iconColor: 'text-orange-500',
    },

    // স্ট্রিক (Streak)
    {
      id: 'streak-3',
      name: '৩ দিন স্ট্রিক',
      description: 'টানা ৩ দিন পড়াশোনা করুন',
      icon: Flame,
      category: 'streak',
      points: 30,
      colorFrom: 'from-red-400',
      colorTo: 'to-red-500',
      iconColor: 'text-red-500',
    },
    {
      id: 'streak-7',
      name: '৭ দিন স্ট্রিক',
      description: 'টানা ৭ দিন পড়াশোনা করুন',
      icon: Flame,
      category: 'streak',
      points: 80,
      colorFrom: 'from-rose-400',
      colorTo: 'to-rose-600',
      iconColor: 'text-rose-500',
    },
    {
      id: 'streak-30',
      name: '৩০ দিন স্ট্রিক',
      description: 'টানা ৩০ দিন পড়াশোনা করুন',
      icon: Flame,
      category: 'streak',
      points: 300,
      colorFrom: 'from-pink-400',
      colorTo: 'to-pink-600',
      iconColor: 'text-pink-500',
    },

    // সামাজিক (Social)
    {
      id: 'helper',
      name: 'সাহায্যকারী',
      description: '৫টি প্রশ্নের উত্তর দিন',
      icon: Users,
      category: 'social',
      points: 70,
      colorFrom: 'from-violet-400',
      colorTo: 'to-violet-600',
      iconColor: 'text-violet-500',
    },
    {
      id: 'inquisitive',
      name: 'জিজ্ঞাসু',
      description: '১০টি প্রশ্ন করুন',
      icon: HelpCircle,
      category: 'social',
      points: 50,
      colorFrom: 'from-purple-400',
      colorTo: 'to-purple-600',
      iconColor: 'text-purple-500',
    },

    // বিশেষ (Special)
    {
      id: 'early-bird',
      name: 'প্রাতঃকালিক',
      description: 'সকাল ৭টার আগে পড়াশোনা করুন',
      icon: Sun,
      category: 'special',
      points: 40,
      colorFrom: 'from-amber-300',
      colorTo: 'to-yellow-500',
      iconColor: 'text-amber-400',
    },
    {
      id: 'night-owl',
      name: 'রাত্রিকালীন',
      description: 'রাত ১০টার পর পড়াশোনা করুন',
      icon: Moon,
      category: 'special',
      points: 40,
      colorFrom: 'from-indigo-400',
      colorTo: 'to-slate-600',
      iconColor: 'text-slate-500',
    },
  ];

  return allBadges.map((badge) => {
    const earned = userEarnedIds.includes(badge.id);
    // Simulate varied progress for unearned badges
    let progress = 0;
    if (earned) {
      progress = 100;
    } else {
      const progressMap: Record<string, number> = {
        'bookworm': 60,
        'notes-ninja': 35,
        'video-viper': 45,
        'examinee': 80,
        'top-five': 20,
        'perfect-score': 10,
        'streak-3': 100,
        'streak-7': 70,
        'streak-30': 23,
        'helper': 40,
        'inquisitive': 60,
        'early-bird': 50,
        'night-owl': 30,
      };
      progress = progressMap[badge.id] || 0;
    }

    return {
      ...badge,
      earned,
      progress,
      earnedDate: earned ? '২ দিন আগে' : undefined,
    };
  });
}

// ─── Category Labels ─────────────────────────────────────────────────────────

const categoryLabels: Record<string, string> = {
  all: 'সব',
  study: 'পড়াশোনা',
  exam: 'পরীক্ষা',
  streak: 'স্ট্রিক',
  social: 'সামাজিক',
  special: 'বিশেষ',
};

// ─── Single Badge Card ───────────────────────────────────────────────────────

function BadgeCard({ badge, index }: { badge: AchievementBadge; index: number }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const Icon = badge.icon;

  useEffect(() => {
    if (badge.earned) {
      const timer = setTimeout(() => setShowConfetti(true), index * 100 + 300);
      return () => clearTimeout(timer);
    }
  }, [badge.earned, index]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="relative"
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 h-full ${
          badge.earned
            ? 'border-emerald-200 dark:border-emerald-800/60 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20'
            : 'border-muted/50 opacity-70 dark:opacity-60'
        }`}
      >
        {/* Glow effect for earned */}
        {badge.earned && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/30 dark:to-teal-950/20 pointer-events-none" />
        )}

        {/* Confetti */}
        <ConfettiParticles active={showConfetti} />

        <CardContent className="p-4 flex flex-col items-center text-center gap-3 relative z-10">
          {/* Icon Container */}
          <motion.div
            className={`relative w-16 h-16 rounded-2xl flex items-center justify-center ${
              badge.earned
                ? `bg-gradient-to-br ${badge.colorFrom} ${badge.colorTo} shadow-lg`
                : 'bg-muted/50 dark:bg-muted/30'
            }`}
            animate={
              badge.earned
                ? { scale: [1, 1.1, 1] }
                : {}
            }
            transition={
              badge.earned
                ? { duration: 0.5, delay: index * 0.05 + 0.3, ease: 'easeOut' }
                : {}
            }
          >
            <Icon
              className={`w-8 h-8 ${
                badge.earned ? 'text-white' : 'text-muted-foreground/40 dark:text-muted-foreground/30'
              }`}
            />
            {/* Lock overlay */}
            {!badge.earned && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl">
                <Lock className="w-5 h-5 text-muted-foreground/50" />
              </div>
            )}
            {/* Earned sparkle */}
            {badge.earned && (
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.6, type: 'spring', stiffness: 300 }}
              >
                <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
                  <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Badge Name */}
          <div>
            <h3 className={`font-bold text-sm ${badge.earned ? 'text-foreground' : 'text-muted-foreground/60'}`}>
              {badge.name}
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${badge.earned ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
              {badge.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className={badge.earned ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground/50'}>
                {badge.earned ? 'অর্জিত!' : `${badge.progress}%`}
              </span>
              <span className="text-muted-foreground/50 flex items-center gap-0.5">
                <Zap className="w-3 h-3" />
                {badge.points}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/50 dark:bg-muted/30 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  badge.earned
                    ? `bg-gradient-to-r ${badge.colorFrom} ${badge.colorTo}`
                    : 'bg-muted-foreground/20'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${badge.progress}%` }}
                transition={{ duration: 1, delay: index * 0.05 + 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Earned Date */}
          {badge.earned && badge.earnedDate && (
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">
              {badge.earnedDate}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Featured Badge Showcase ─────────────────────────────────────────────────

function FeaturedShowcase({ badges }: { badges: AchievementBadge[] }) {
  const earnedBadges = badges.filter((b) => b.earned).slice(0, 3);

  if (earnedBadges.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted/40 bg-muted/5">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
          <Trophy className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground/60 text-sm">এখনো কোনো ব্যাজ অর্জন হয়নি</p>
          <p className="text-muted-foreground/40 text-xs mt-1">পড়াশোনা চালিয়ে যান এবং ব্যাজ অর্জন করুন!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {earnedBadges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
          >
            <Card className="relative overflow-hidden border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-emerald-950/40 dark:via-card dark:to-teal-950/30">
              {/* Glow background */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${badge.colorFrom} ${badge.colorTo} opacity-10 blur-xl`} />

              <CardContent className="p-5 flex items-center gap-4 relative z-10">
                <motion.div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${badge.colorFrom} ${badge.colorTo} flex items-center justify-center shadow-lg shrink-0`}
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: index * 0.5 }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">+{badge.points} পয়েন্ট</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Achievement Section ────────────────────────────────────────────────

export default function AchievementSection() {
  const { user } = useStudyHub();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [apiData, setApiData] = useState<{
    totalExams: number; avgScore: number; notesRead: number; videosWatched: number; currentRank: number | null; currentScore: number;
  } | null>(null);

  // Fetch real data from dashboard API
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/dashboard?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setApiData({
              totalExams: data.data.stats.totalExams || 0,
              avgScore: data.data.stats.avgScore || 0,
              notesRead: data.data.stats.notesRead || 0,
              videosWatched: data.data.stats.videosWatched || 0,
              currentRank: data.data.stats.currentRank || null,
              currentScore: data.data.stats.currentScore || 0,
            });
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  // Derive earned badges from real API data
  const earnedIds = useMemo(() => {
    if (!apiData) return ['bookworm', 'early-bird']; // defaults while loading
    const earned: string[] = [];
    if (apiData.totalExams >= 1) earned.push('examinee');
    if (apiData.totalExams >= 5) earned.push('exam-master');
    if (apiData.notesRead >= 1) earned.push('bookworm');
    if (apiData.videosWatched >= 1) earned.push('viewer');
    if (apiData.currentRank && apiData.currentRank <= 3) earned.push('top-3');
    if (apiData.currentRank === 1) earned.push('champion');
    if (apiData.avgScore >= 80) earned.push('high-scorer');
    if (apiData.currentScore >= 100) earned.push('centurion');
    if (apiData.totalExams >= 3) earned.push('streak-3');
    if (apiData.notesRead >= 5) earned.push('scholar');
    // Always include some defaults for demo feel
    if (!earned.includes('early-bird')) earned.push('early-bird');
    if (!earned.includes('helper')) earned.push('helper');
    return earned;
  }, [apiData]);

  const badges = useMemo(() => getBadges(earnedIds), [earnedIds]);

  const filteredBadges = useMemo(() => {
    if (activeCategory === 'all') return badges;
    return badges.filter((b) => b.category === activeCategory);
  }, [badges, activeCategory]);

  const earnedCount = useMemo(() => badges.filter((b) => b.earned).length, [badges]);
  const totalPoints = useMemo(() => badges.filter((b) => b.earned).reduce((sum, b) => sum + b.points, 0), [badges]);
  const maxPoints = useMemo(() => badges.reduce((sum, b) => sum + b.points, 0), [badges]);
  const completionPercent = useMemo(() => Math.round((earnedCount / badges.length) * 100), [earnedCount, badges.length]);

  return (
    <section className="w-full space-y-6 py-6">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-7 h-7 text-emerald-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">অর্জন ও ব্যাজ</h2>
          <Sparkles className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          পড়াশোনা চালিয়ে যান এবং বিশেষ ব্যাজ অর্জন করুন!
        </p>
      </motion.div>

      {/* ─── Stats Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-emerald-950/30 dark:via-card dark:to-teal-950/20 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* Progress Ring */}
              <div className="relative shrink-0">
                <ProgressRing percentage={completionPercent} size={120} strokeWidth={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    <AnimatedCounter value={completionPercent} duration={1.5} />%
                  </span>
                  <span className="text-[10px] text-muted-foreground">সম্পন্ন</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 w-full">
                {/* Badges Earned */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground font-medium">ব্যাজ অর্জিত</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    <AnimatedCounter value={earnedCount} duration={1} />
                    <span className="text-sm font-normal text-muted-foreground">/{badges.length}</span>
                  </p>
                </div>

                {/* Achievement Points */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-muted-foreground font-medium">অর্জন পয়েন্ট</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    <AnimatedCounter value={totalPoints} duration={1.5} />
                    <span className="text-sm font-normal text-muted-foreground">/{maxPoints}</span>
                  </p>
                </div>

                {/* Current Streak */}
                <div className="text-center md:text-left col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-muted-foreground font-medium">বর্তমান স্ট্রিক</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    <AnimatedCounter value={5} duration={0.8} />
                    <span className="text-sm font-normal text-muted-foreground"> দিন</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Featured Earned Showcase ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-foreground">সাম্প্রতিক অর্জন</h3>
        </div>
        <FeaturedShowcase badges={badges} />
      </motion.div>

      {/* ─── Category Filter Tabs ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-auto p-1 gap-1">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const count = key === 'all'
                  ? badges.filter((b) => b.earned).length
                  : badges.filter((b) => b.category === key && b.earned).length;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/50 dark:data-[state=active]:text-emerald-300"
                  >
                    {label}
                    <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] text-[10px] px-1">
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Badge Grid - one TabsContent that switches content */}
          <TabsContent value={activeCategory} className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
              >
                {filteredBadges.map((badge, index) => (
                  <BadgeCard key={badge.id} badge={badge} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ─── Motivational Footer ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-2"
      >
        <Card className="inline-block border-dashed border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardContent className="p-3 md:p-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              আরও <span className="font-semibold text-emerald-600 dark:text-emerald-400">{badges.length - earnedCount}টি</span> ব্যাজ অর্জন করুন এবং শীর্ষে পৌঁছান!
            </p>
            <ChevronRight className="w-4 h-4 text-emerald-500" />
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
