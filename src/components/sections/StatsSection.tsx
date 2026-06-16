'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Users, Video, FileText, ClipboardCheck, GraduationCap,
  Heart, TrendingUp, Award, BookOpen, Star, Target,
  Flame, Crown, Zap, Medal, Trophy
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ─── Animated Counter Hook ───────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration: number = 2, isInView: boolean) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const end = target;
    const durationMs = duration * 1000;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return display;
}

// ─── Bengali Number Helper ───────────────────────────────────────────────────
function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? bengaliDigits[parseInt(ch)] : ch))
    .join('');
}

// ─── Stats data type ────────────────────────────────────────────────────────
interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

// ─── Default (fallback) data ─────────────────────────────────────────────────
const defaultStatsData: StatItem[] = [
  {
    icon: Users,
    value: 0,
    suffix: '+',
    label: 'শিক্ষার্থী',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Video,
    value: 0,
    suffix: '+',
    label: 'ভিডিও লেকচার',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    icon: FileText,
    value: 0,
    suffix: '+',
    label: 'নোটস ও পিডিএফ',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: ClipboardCheck,
    value: 0,
    suffix: '+',
    label: 'অনলাইন পরীক্ষা',
    color: 'from-sky-500 to-cyan-500',
    bgColor: 'bg-sky-500/10',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    icon: GraduationCap,
    value: 0,
    suffix: '+',
    label: 'শিক্ষক',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Heart,
    value: 98,
    suffix: '%',
    label: 'সন্তুষ্টি',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

// ─── Map API stats to display stats ─────────────────────────────────────────
function buildStatsData(apiData: {
  students: number;
  videos: number;
  notes: number;
  exams: number;
  teachers: number;
  satisfaction: number;
}): StatItem[] {
  return [
    {
      icon: Users,
      value: apiData.students,
      suffix: '+',
      label: 'শিক্ষার্থী',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Video,
      value: apiData.videos,
      suffix: '+',
      label: 'ভিডিও লেকচার',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      icon: FileText,
      value: apiData.notes,
      suffix: '+',
      label: 'নোটস ও পিডিএফ',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      icon: ClipboardCheck,
      value: apiData.exams,
      suffix: '+',
      label: 'অনলাইন পরীক্ষা',
      color: 'from-sky-500 to-cyan-500',
      bgColor: 'bg-sky-500/10',
      textColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      icon: GraduationCap,
      value: apiData.teachers,
      suffix: '+',
      label: 'শিক্ষক',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-500/10',
      textColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      icon: Heart,
      value: apiData.satisfaction,
      suffix: '%',
      label: 'সন্তুষ্টি',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];
}

const subjectProgress = [
  { name: 'গণিত', progress: 85, color: 'bg-emerald-500' },
  { name: 'পদার্থবিজ্ঞান', progress: 72, color: 'bg-sky-500' },
  { name: 'রসায়ন', progress: 68, color: 'bg-amber-500' },
  { name: 'জীববিজ্ঞান', progress: 78, color: 'bg-rose-500' },
  { name: 'বাংলা', progress: 90, color: 'bg-teal-500' },
  { name: 'ইংরেজি', progress: 82, color: 'bg-violet-500' },
];

const weeklyActivity = [
  { day: 'সোম', value: 75, label: 'সোমবার' },
  { day: 'মঙ্গল', value: 90, label: 'মঙ্গলবার' },
  { day: 'বুধ', value: 60, label: 'বুধবার' },
  { day: 'বৃহঃ', value: 85, label: 'বৃহস্পতিবার' },
  { day: 'শুক্র', value: 95, label: 'শুক্রবার' },
  { day: 'শনি', value: 45, label: 'শনিবার' },
  { day: 'রবি', value: 30, label: 'রবিবার' },
];

const subjectDistribution = [
  { name: 'গণিত', percentage: 28, color: '#10b981' },
  { name: 'পদার্থবিজ্ঞান', percentage: 22, color: '#0ea5e9' },
  { name: 'রসায়ন', percentage: 18, color: '#f59e0b' },
  { name: 'জীববিজ্ঞান', percentage: 15, color: '#f43f5e' },
  { name: 'ভাষা', percentage: 17, color: '#8b5cf6' },
];

const achievements = [
  {
    icon: Flame,
    title: '৭ দিন স্ট্রিক',
    description: 'টানা ৭ দিন পড়াশোনা',
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    icon: Crown,
    title: 'টপ স্কোরার',
    description: 'পরীক্ষায় সর্বোচ্চ নম্বর',
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: Zap,
    title: 'দ্রুত শিক্ষার্থী',
    description: '১০০+ অধ্যায় সম্পন্ন',
    color: 'from-sky-400 to-blue-500',
    bgColor: 'bg-sky-500/10 border-sky-500/20',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    icon: Medal,
    title: 'নিয়মিত পরীক্ষার্থী',
    description: '৫০+ পরীক্ষা দিয়েছেন',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Trophy,
    title: 'লিডারবোর্ড চ্যাম্পিয়ন',
    description: 'শীর্ষ ৩-এ স্থান',
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-500/10 border-violet-500/20',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Star,
    title: 'সক্রিয় সদস্য',
    description: '৩০ দিন সক্রিয়',
    color: 'from-rose-400 to-pink-500',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
    textColor: 'text-rose-600 dark:text-rose-400',
  },
];

// ─── Animated Stat Card ───────────────────────────────────────────────────────
function AnimatedStatCard({
  stat,
  index,
  isInView,
}: {
  stat: StatItem;
  index: number;
  isInView: boolean;
}) {
  const count = useAnimatedCounter(stat.value, 2, isInView);
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group relative overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-border/40">
        {/* Gradient accent top bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
        <CardContent className="p-4 text-center">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${stat.bgColor} mb-3 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`w-6 h-6 ${stat.textColor}`} />
          </div>
          <div className="text-3xl font-bold tracking-tight mb-1">
            {toBengaliNum(count)}
            <span className="text-2xl">{stat.suffix}</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Progress Bar Item ────────────────────────────────────────────────────────
function ProgressBar({
  subject,
  index,
  isInView,
}: {
  subject: (typeof subjectProgress)[0];
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{subject.name}</span>
        <span className="text-muted-foreground font-semibold">{toBengaliNum(subject.progress)}%</span>
      </div>
      <div className="h-3 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${subject.progress}%` } : { width: 0 }}
          transition={{ duration: 1, delay: 0.3 + index * 0.12, ease: 'easeOut' }}
          className={`h-full rounded-full ${subject.color} relative overflow-hidden`}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────
function WeeklyChart({ isInView }: { isInView: boolean }) {
  const maxValue = Math.max(...weeklyActivity.map((d) => d.value));

  return (
    <Card className="h-full border-border/40 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-base">সাপ্তাহিক কার্যক্রম</h3>
            <p className="text-xs text-muted-foreground">সপ্তাহের প্রতিটি দিনের পড়াশোনার পরিমাণ</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 sm:gap-3 h-44">
          {weeklyActivity.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            const isHighest = item.value === maxValue;
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                {/* Value label */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  className="text-[10px] sm:text-xs font-semibold text-muted-foreground"
                >
                  {toBengaliNum(item.value)}%
                </motion.span>
                {/* Bar */}
                <div className="w-full flex justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={isInView ? { height: `${heightPercent}%` } : { height: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.08, ease: 'easeOut' }}
                    className={`w-full max-w-[40px] rounded-t-lg relative overflow-hidden ${
                      isHighest
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        : 'bg-gradient-to-t from-emerald-500/60 to-emerald-400/40 dark:from-emerald-600/50 dark:to-emerald-400/30'
                    }`}
                    title={item.label}
                  >
                    {isHighest && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2.5s_infinite]" />
                    )}
                  </motion.div>
                </div>
                {/* Day label */}
                <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CSS Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ isInView }: { isInView: boolean }) {
  // Build conic-gradient string using reduce to avoid reassignment
  const gradientStops = subjectDistribution.reduce<string[]>(
    (acc, subject, i) => {
      const prevEnd = i === 0 ? 0 : subjectDistribution.slice(0, i).reduce((sum, s) => sum + s.percentage, 0);
      const end = prevEnd + subject.percentage;
      acc.push(`${subject.color} ${prevEnd}% ${end}%`);
      return acc;
    },
    []
  );
  const conicGradient = `conic-gradient(${gradientStops.join(', ')})`;

  return (
    <Card className="h-full border-border/40 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/10">
            <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-base">জনপ্রিয় বিষয়সমূহ</h3>
            <p className="text-xs text-muted-foreground">শিক্ষার্থীদের পছন্দের বিষয়</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Donut */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative w-28 h-28 shrink-0"
          >
            <div
              className="w-full h-full rounded-full"
              style={{ background: conicGradient }}
            />
            {/* Inner circle to create donut */}
            <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <span className="text-xs font-medium text-muted-foreground">বিষয়</span>
              </div>
            </div>
          </motion.div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5 w-full">
            {subjectDistribution.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="text-sm font-medium">{subject.name}</span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {toBengaliNum(subject.percentage)}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Achievement Badge ────────────────────────────────────────────────────────
function AchievementBadge({
  achievement,
  index,
  isInView,
}: {
  achievement: (typeof achievements)[0];
  index: number;
  isInView: boolean;
}) {
  const Icon = achievement.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="cursor-default"
    >
      <Card className={`border ${achievement.bgColor} hover:shadow-lg transition-shadow duration-300 overflow-hidden`}>
        <CardContent className="p-3 text-center">
          <div
            className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br ${achievement.color} mb-2 shadow-lg`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-sm font-bold mb-0.5">{achievement.title}</h4>
          <p className="text-[11px] text-muted-foreground leading-tight">{achievement.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main StatsSection ────────────────────────────────────────────────────────
export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [statsData, setStatsData] = useState<StatItem[]>(defaultStatsData);

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setStatsData(buildStatsData(json.data));
          }
        }
      } catch {
        // Silently fail — use default fallback data
      }
    };
    fetchStats();
  }, []);

  return (
    <section ref={sectionRef} className="py-10 sm:py-14 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-10"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            📊 প্ল্যাটফর্ম পরিসংখ্যান
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">আমাদের অর্জন</h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            স্টাডি হাব পরিবারের সদস্যদের সাফল্য ও অগ্রগতির পরিসংখ্যান
          </p>
        </motion.div>

        {/* ── Animated Counter Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 lg:mb-10">
          {statsData.map((stat, index) => (
            <AnimatedStatCard
              key={stat.label}
              stat={stat}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* ── Charts Row: Progress + Bar Chart + Donut ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mb-8 lg:mb-10">
          {/* Subject Progress Bars */}
          <Card className="border-border/40 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/10">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">বিষয়ভিত্তিক অগ্রগতি</h3>
                  <p className="text-xs text-muted-foreground">প্রতিটি বিষয়ে শিক্ষার্থীদের সম্পন্নের হার</p>
                </div>
              </div>
              <div className="space-y-3">
                {subjectProgress.map((subject, index) => (
                  <ProgressBar
                    key={subject.name}
                    subject={subject}
                    index={index}
                    isInView={isInView}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity Bar Chart */}
          <WeeklyChart isInView={isInView} />

          {/* Donut Chart */}
          <DonutChart isInView={isInView} />
        </div>

        {/* ── Achievement Badges ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">অর্জন ব্যাজ</h3>
              <p className="text-sm text-muted-foreground">শিক্ষার্থীদের বিশেষ মাইলফলক ও সাফল্য</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {achievements.map((achievement, index) => (
            <AchievementBadge
              key={achievement.title}
              achievement={achievement}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>

      {/* Shimmer keyframe (injected via style tag) */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
