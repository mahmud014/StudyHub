'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Award, TrendingUp, FileCheck, BarChart3,
  ChevronRight, Crown, Zap, Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Helper: Convert digits to Bengali numerals ─────────────────────────────
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Types ───────────────────────────────────────────────────────────────────
type SubscriptionPlan = 'ফ্রি' | 'স্ট্যান্ডার্ড' | 'প্রিমিয়াম';

interface SubjectCompletion {
  name: string;
  completed: number;
  total: number;
  color: string;
}

// ─── Subscription Plan Config ────────────────────────────────────────────────
const planConfig: Record<SubscriptionPlan, { className: string; icon: React.ElementType; gradient: string }> = {
  'ফ্রি': {
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    icon: Zap,
    gradient: 'from-gray-400 to-gray-500',
  },
  'স্ট্যান্ডার্ড': {
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: Star,
    gradient: 'from-emerald-400 to-teal-500',
  },
  'প্রিমিয়াম': {
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Crown,
    gradient: 'from-amber-400 to-orange-500',
  },
};

// ─── Mock Data (used as fallback when user data is available) ────────────────
const mockSubjectCompletions: SubjectCompletion[] = [
  { name: 'গণিত', completed: 20, total: 30, color: 'emerald' },
  { name: 'বাংলা', completed: 18, total: 24, color: 'teal' },
  { name: 'ইংরেজি', completed: 15, total: 22, color: 'amber' },
];

const subjectColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
};

// ─── Animation Variants ─────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── StudentProfileCard Component ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function StudentProfileCard() {
  const { user } = useStudyHub();

  // Determine subscription plan (mock)
  const plan: SubscriptionPlan = user?.role === 'admin' ? 'প্রিমিয়াম' : 'স্ট্যান্ডার্ড';
  const currentPlanConfig = planConfig[plan];
  const PlanIcon = currentPlanConfig.icon;

  // Mock data (would come from context/API in production)
  const streak = 7;
  const examsTaken = 24;
  const avgScore = 82;
  const rank = 5;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <Card className="overflow-hidden border-emerald-500/20 shadow-lg shadow-emerald-500/5">
        {/* Glass Morphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/3 to-emerald-500/5 pointer-events-none" />

        {/* Decorative top accent */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400" />

        <CardContent className="relative p-5 space-y-5">
          {/* ── Avatar + Name + Plan ─────────────────────────────── */}
          <motion.div variants={childVariants} className="flex items-center gap-4">
            {/* Avatar with gradient border ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-400 animate-pulse opacity-75" />
              <Avatar className="w-16 h-16 border-2 border-background relative z-10">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl font-bold">
                  {user?.name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold truncate">
                {user?.name || 'ছাত্র/ছাত্রী'}
              </h3>
              <p className="text-xs text-muted-foreground">
                শ্রেণি: ৯-১০ • রোল: {toBengaliNum(12)}
              </p>
              <Badge variant="outline" className={`${currentPlanConfig.className} gap-1 mt-1.5 text-[10px]`}>
                <PlanIcon className="w-3 h-3" />
                {plan} প্ল্যান
              </Badge>
            </div>
          </motion.div>

          {/* ── Streak Counter ───────────────────────────────────── */}
          <motion.div variants={childVariants}>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 border border-orange-500/15">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex-shrink-0"
              >
                <Flame className="w-7 h-7 text-orange-500" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {toBengaliNum(streak)}
                  </span>
                  <span className="text-sm text-muted-foreground">দিনের স্ট্রিক</span>
                </div>
                <p className="text-[10px] text-muted-foreground">প্রতিদিন পড়াশোনা চালিয়ে যান!</p>
              </div>
              <div className="flex -space-x-1">
                {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 border border-background"
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Quick Stats Row ──────────────────────────────────── */}
          <motion.div variants={childVariants} className="grid grid-cols-3 gap-2">
            <div className="text-center p-2.5 rounded-xl bg-card border border-border/50">
              <FileCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-base font-bold">{toBengaliNum(examsTaken)}</p>
              <p className="text-[10px] text-muted-foreground">পরীক্ষা</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-card border border-border/50">
              <BarChart3 className="w-4 h-4 text-teal-500 mx-auto mb-1" />
              <p className="text-base font-bold">{toBengaliNum(avgScore)}%</p>
              <p className="text-[10px] text-muted-foreground">গড় স্কোর</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-card border border-border/50">
              <TrendingUp className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-base font-bold">#{toBengaliNum(rank)}</p>
              <p className="text-[10px] text-muted-foreground">র‍্যাংক</p>
            </div>
          </motion.div>

          {/* ── Subject Completion Mini Progress Bars ────────────── */}
          <motion.div variants={childVariants} className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              বিষয়ভিত্তিক অগ্রগতি
            </p>
            {mockSubjectCompletions.map((subject, i) => {
              const percentage = Math.round((subject.completed / subject.total) * 100);
              const barColor = subjectColorMap[subject.color] || 'bg-emerald-500';

              return (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{subject.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {toBengaliNum(subject.completed)}/{toBengaliNum(subject.total)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── View Full Profile Button ─────────────────────────── */}
          <motion.div variants={childVariants}>
            <Button
              variant="outline"
              className="w-full gap-1.5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-200"
            >
              প্রোফাইল সম্পূর্ণ দেখুন
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
