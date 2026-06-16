'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck, Clock, Trophy, TrendingUp, BarChart3,
  Filter, SortAsc, SortDesc, Calendar, BookOpen,
  ChevronDown, ChevronUp, Eye, X, CheckCircle,
  XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
  Timer, Award, Target, PieChart, RotateCcw,
  Search, GraduationCap, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

function getGradeInfo(percentage: number): { grade: string; color: string; bg: string; border: string } {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  if (percentage >= 80) return { grade: 'A', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
  if (percentage >= 70) return { grade: 'B', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  if (percentage >= 60) return { grade: 'C', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
  if (percentage >= 50) return { grade: 'D', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  return { grade: 'F', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
}

function getSubjectColor(color: string): { bg: string; text: string; border: string; light: string } {
  const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30', light: 'bg-emerald-400' },
    amber: { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/30', light: 'bg-amber-400' },
    rose: { bg: 'bg-rose-500/15', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500/30', light: 'bg-rose-400' },
    violet: { bg: 'bg-violet-500/15', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-500/30', light: 'bg-violet-400' },
    sky: { bg: 'bg-sky-500/15', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-500/30', light: 'bg-sky-400' },
    orange: { bg: 'bg-orange-500/15', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500/30', light: 'bg-orange-400' },
    teal: { bg: 'bg-teal-500/15', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-500/30', light: 'bg-teal-400' },
    lime: { bg: 'bg-lime-500/15', text: 'text-lime-700 dark:text-lime-400', border: 'border-lime-500/30', light: 'bg-lime-400' },
  };
  return colorMap[color] || colorMap.emerald;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  return `${toBengaliNum(day)} ${months[month]}, ${toBengaliNum(year)}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${toBengaliNum(minutes)} মিনিট`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${toBengaliNum(h)} ঘণ্টা ${toBengaliNum(m)} মিনিট`;
}

function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${toBengaliNum(m)}:${toBengaliNum(s.toString().padStart(2, '0'))}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  studentAnswer: number;
  explanation: string;
  timeTaken: number;
}

interface ExamHistoryItem {
  id: string;
  examTitle: string;
  subject: string;
  subjectBn: string;
  subjectColor: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  dateTaken: string;
  timeTaken: number;
  totalQuestions: number;
  correctAnswers: number;
  questions: ExamQuestion[];
}

interface HistorySummary {
  totalExams: number;
  avgScore: number;
  bestSubject: { name: string; nameBn: string; avgScore: number };
  improvementRate: number;
}

interface HistoryData {
  history: ExamHistoryItem[];
  summary: HistorySummary;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { duration: 0.2 } },
};

// ─── Circular Progress Ring ──────────────────────────────────────────────────

function ProgressRing({ percentage, size = 80, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) {
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
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-emerald-100 dark:text-emerald-900/40"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="oklch(0.508 0.165 160)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: animatedOffset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 180;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute segment offsets using reduce to avoid mutation
  const segments = data.reduce<Array<{
    label: string; value: number; color: string; percentage: number;
    dashArray: string; dashOffset: number;
  }>>((acc, d, i) => {
    const percentage = total > 0 ? (d.value / total) * 100 : 0;
    const segmentLength = (percentage / 100) * circumference;
    const gap = 2;
    const prevOffset = i === 0 ? 0 : acc[i - 1].dashOffset + (acc[i - 1].percentage / 100) * circumference;
    acc.push({
      label: d.label,
      value: d.value,
      color: d.color,
      percentage,
      dashArray: `${Math.max(0, segmentLength - gap)} ${circumference - Math.max(0, segmentLength - gap)}`,
      dashOffset: -prevOffset,
    });
    return acc;
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={seg.dashArray}
            strokeDashoffset={seg.dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
          {toBengaliNum(data.length)}
        </span>
        <span className="text-xs text-muted-foreground">বিষয়</span>
      </div>
    </div>
  );
}

// ─── Bar Chart (CSS-based) ───────────────────────────────────────────────────

function ScoreTrendChart({ data }: { data: { label: string; score: number; grade: string }[] }) {
  const maxScore = 100;

  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-40 px-2">
      {data.map((item, i) => {
        const height = (item.score / maxScore) * 100;
        const gradeInfo = getGradeInfo(item.score);
        return (
          <motion.div
            key={i}
            className="flex flex-col items-center flex-1 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <span className="text-[10px] font-medium text-muted-foreground mb-1 truncate w-full text-center">
              {toBengaliNum(item.score)}%
            </span>
            <div className="w-full relative" style={{ height: '100px' }}>
              <div className="absolute bottom-0 w-full" style={{ height: `${height}%` }}>
                <motion.div
                  className={`w-full rounded-t-md ${item.score >= 80 ? 'bg-emerald-400 dark:bg-emerald-600' : item.score >= 60 ? 'bg-amber-400 dark:bg-amber-600' : 'bg-rose-400 dark:bg-rose-600'}`}
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.5, ease: 'easeOut' }}
                  style={{ minHeight: '4px' }}
                />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  accent,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
        <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${accent.replace('bg-gradient-to-r', 'bg').replace(/from-\S+/, '').replace(/to-\S+/, '').trim() || 'bg-emerald-500/10'}`}>
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
        <FileCheck className="w-12 h-12 text-emerald-500/50" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">কোনো পরীক্ষার রেকর্ড নেই</h3>
      <p className="text-muted-foreground text-center max-w-md">
        আপনি এখনো কোনো পরীক্ষা দেননি। পরীক্ষা দেওয়া শুরু করুন এবং আপনার অগ্রগতি ট্র্যাক করুন!
      </p>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardContent className="p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex justify-center">
              <Skeleton className="h-44 w-44 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* List skeleton */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full mb-3" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Exam Detail Dialog ──────────────────────────────────────────────────────

function ExamDetailDialog({
  exam,
  open,
  onClose,
}: {
  exam: ExamHistoryItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  if (!exam) return null;

  const gradeInfo = getGradeInfo(exam.percentage);
  const subjectColors = getSubjectColor(exam.subjectColor);
  const correctCount = exam.questions.filter((q) => q.studentAnswer === q.correctAnswer).length;
  const wrongCount = exam.questions.filter((q) => q.studentAnswer !== q.correctAnswer).length;
  const totalTime = exam.questions.reduce((sum, q) => sum + q.timeTaken, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${subjectColors.bg}`}>
              <BookOpen className={`w-5 h-5 ${subjectColors.text}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{exam.examTitle}</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {exam.subjectBn} • {formatDate(exam.dateTaken)}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Score Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-500/5 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">স্কোর</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {toBengaliNum(exam.obtainedMarks)}/{toBengaliNum(exam.totalMarks)}
              </p>
            </div>
            <div className="bg-emerald-500/5 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">গ্রেড</p>
              <Badge className={`text-lg px-3 py-0.5 ${gradeInfo.bg} ${gradeInfo.color} border ${gradeInfo.border}`}>
                {gradeInfo.grade}
              </Badge>
            </div>
            <div className="bg-emerald-500/5 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">সঠিক</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {toBengaliNum(correctCount)}
              </p>
            </div>
            <div className="bg-emerald-500/5 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">ভুল</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {toBengaliNum(wrongCount)}
              </p>
            </div>
          </div>

          {/* Score Breakdown Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">স্কোর বিশ্লেষণ</span>
              <span className={`font-semibold ${gradeInfo.color}`}>{toBengaliNum(exam.percentage)}%</span>
            </div>
            <div className="h-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden flex">
              <motion.div
                className="bg-emerald-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(correctCount / exam.totalQuestions) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <motion.div
                className="bg-rose-400 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(wrongCount / exam.totalQuestions) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                সঠিক: {toBengaliNum(correctCount)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                ভুল: {toBengaliNum(wrongCount)}
              </span>
            </div>
          </div>

          {/* Time Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Timer className="w-4 h-4" />
            <span>মোট সময়: {formatTime(exam.timeTaken)}</span>
            <span className="mx-2">•</span>
            <span>প্রতি প্রশ্নে গড়: {formatSeconds(Math.round(totalTime / exam.totalQuestions))}</span>
          </div>

          {/* Questions */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              প্রশ্ন অনুসারে বিশ্লেষণ ({toBengaliNum(exam.questions.length)}টি প্রশ্ন)
            </h4>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {exam.questions.map((q, idx) => {
                const isCorrect = q.studentAnswer === q.correctAnswer;
                const isExpanded = expandedQuestion === idx;
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate">
                            প্রশ্ন {toBengaliNum(idx + 1)}: {q.question}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatSeconds(q.timeTaken)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className={`p-3 border-x border-b rounded-b-lg ${
                            isCorrect ? 'border-emerald-500/20' : 'border-rose-500/20'
                          } bg-muted/30`}>
                            <div className="space-y-1.5 mb-3">
                              {q.options.map((opt, oi) => {
                                const isCorrectOption = oi === q.correctAnswer;
                                const isStudentOption = oi === q.studentAnswer;
                                let optClass = 'bg-muted/50 border-transparent';
                                if (isCorrectOption) optClass = 'bg-emerald-500/10 border-emerald-500/30';
                                if (isStudentOption && !isCorrect) optClass = 'bg-rose-500/10 border-rose-500/30';

                                return (
                                  <div
                                    key={oi}
                                    className={`flex items-center gap-2 p-2 rounded-md border text-sm ${optClass}`}
                                  >
                                    {isCorrectOption && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                    {isStudentOption && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                                    {!isCorrectOption && !(isStudentOption && !isCorrect) && (
                                      <span className="w-3.5 h-3.5 shrink-0" />
                                    )}
                                    <span>{opt}</span>
                                    {isCorrectOption && (
                                      <Badge className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                        সঠিক
                                      </Badge>
                                    )}
                                    {isStudentOption && !isCorrect && (
                                      <Badge className="ml-auto text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                                        আপনার উত্তর
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-emerald-500/5 rounded-md">
                              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ExamHistorySection() {
  const { user } = useStudyHub();
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<ExamHistoryItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Filters
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Load students if user is admin/teacher/guardian
  useEffect(() => {
    async function loadStudents() {
      if (!user || user.role === 'student') return;
      setStudentsLoading(true);
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        if (data.success && data.data) {
          setStudents(data.data);
          if (data.data.length > 0) {
            setSelectedStudentId(data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        setStudentsLoading(false);
      }
    }
    loadStudents();
  }, [user]);

  // Fetch data
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'student') {
      if (!studentsLoading && students.length === 0) {
        setLoading(false);
        return;
      }
      if (!selectedStudentId) return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const url = user.role === 'student'
          ? `/api/exams/history?userId=${encodeURIComponent(user.id)}`
          : `/api/exams/history?userId=${encodeURIComponent(selectedStudentId)}`;
        const res = await fetch(url);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error('Error fetching exam history:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, selectedStudentId, students, studentsLoading]);

  // Filtered & sorted data
  const filteredHistory = useMemo(() => {
    if (!data) return [];
    let items = [...data.history];

    // Subject filter
    if (subjectFilter !== 'all') {
      items = items.filter((e) => e.subject === subjectFilter);
    }

    // Grade filter
    if (gradeFilter !== 'all') {
      items = items.filter((e) => e.grade === gradeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (e) =>
          e.examTitle.toLowerCase().includes(q) ||
          e.subjectBn.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        items.sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
        break;
      case 'date-asc':
        items.sort((a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime());
        break;
      case 'score-desc':
        items.sort((a, b) => b.percentage - a.percentage);
        break;
      case 'score-asc':
        items.sort((a, b) => a.percentage - b.percentage);
        break;
      case 'subject':
        items.sort((a, b) => a.subject.localeCompare(b.subject));
        break;
    }

    return items;
  }, [data, subjectFilter, gradeFilter, sortBy, searchQuery]);

  // Score trend data (last 10)
  const scoreTrendData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data.history].sort(
      (a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime()
    );
    const last10 = sorted.slice(-10);
    return last10.map((e, i) => ({
      label: `#${toBengaliNum(i + 1)}`,
      score: e.percentage,
      grade: e.grade,
    }));
  }, [data]);

  // Subject-wise distribution
  const subjectDistribution = useMemo(() => {
    if (!data) return [];
    const subjectCounts: Record<string, { count: number; color: string }> = {};
    for (const exam of data.history) {
      if (!subjectCounts[exam.subject]) {
        const colors = getSubjectColor(exam.subjectColor);
        subjectCounts[exam.subject] = { count: 0, color: exam.subjectColor };
      }
      subjectCounts[exam.subject].count += 1;
    }
    const colorMap: Record<string, string> = {
      emerald: '#34d399',
      amber: '#fbbf24',
      rose: '#fb7185',
      violet: '#a78bfa',
      sky: '#38bdf8',
      orange: '#fb923c',
      teal: '#2dd4bf',
      lime: '#a3e635',
    };
    return Object.entries(subjectCounts).map(([name, info]) => ({
      label: name,
      value: info.count,
      color: colorMap[info.color] || '#34d399',
    }));
  }, [data]);

  // Available subjects from data
  const availableSubjects = useMemo(() => {
    if (!data) return [];
    const subjects = new Map<string, string>();
    for (const exam of data.history) {
      if (!subjects.has(exam.subject)) {
        subjects.set(exam.subject, exam.subjectBn);
      }
    }
    return Array.from(subjects.entries()).map(([key, label]) => ({ key, label }));
  }, [data]);

  const openExamDetail = useCallback((exam: ExamHistoryItem) => {
    setSelectedExam(exam);
    setDialogOpen(true);
  }, []);

  if (loading && studentsLoading) return <LoadingSkeleton />;

  const hasData = data && data.history.length > 0;
  const summary = data?.summary || {
    totalExams: 0,
    avgScore: 0,
    bestSubject: { name: '', nameBn: 'নাই', avgScore: 0 },
    improvementRate: 0,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 sm:p-6"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">পরীক্ষার ইতিহাস</h2>
              <p className="text-sm text-muted-foreground">
                {hasData
                  ? `মোট ${toBengaliNum(summary.totalExams)}টি পরীক্ষা • গড় স্কোর ${toBengaliNum(summary.avgScore)}%`
                  : 'কোনো পরীক্ষার রেকর্ড নেই'}
              </p>
            </div>
          </div>

          {user?.role !== 'student' && students.length > 0 && (
            <div className="flex items-center gap-2 print:hidden self-start md:self-auto">
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">শিক্ষার্থী নির্বাচন:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer hover:border-emerald-500"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.class === '9-10' ? '৯ম-১০ম' : student.class} - রোল: {toBengaliNum(student.roll || '')})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="w-full h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full mt-4" />
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <span className="text-sm text-muted-foreground font-medium">পরীক্ষার ইতিহাস লোড হচ্ছে...</span>
        </div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* ── Stats Summary Cards ────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={FileCheck}
          label="মোট পরীক্ষা"
          value={toBengaliNum(summary.totalExams)}
          subtitle="সম্পন্ন পরীক্ষা"
          accent="bg-gradient-to-r from-emerald-500 to-emerald-400"
        />

        <StatCard
          icon={Target}
          label="গড় স্কোর"
          value={`${toBengaliNum(summary.avgScore)}%`}
          subtitle={getGradeInfo(summary.avgScore).grade}
          accent="bg-gradient-to-r from-teal-500 to-teal-400"
        >
          <div className="relative">
            <ProgressRing percentage={summary.avgScore} size={56} strokeWidth={5} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {toBengaliNum(Math.round(summary.avgScore))}
            </span>
          </div>
        </StatCard>

        <StatCard
          icon={Trophy}
          label="সেরা বিষয়"
          value={summary.bestSubject.nameBn}
          subtitle={`গড় ${toBengaliNum(summary.bestSubject.avgScore)}%`}
          accent="bg-gradient-to-r from-amber-500 to-amber-400"
        >
          <div className="p-1.5 rounded-lg bg-amber-500/10">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
        </StatCard>

        <StatCard
          icon={summary.improvementRate >= 0 ? TrendingUp : ArrowDownRight}
          label="উন্নতি হার"
          value={`${summary.improvementRate >= 0 ? '+' : ''}${toBengaliNum(summary.improvementRate)}%`}
          subtitle={summary.improvementRate >= 0 ? 'উন্নতি হচ্ছে' : 'পিছিয়ে পড়ছে'}
          accent={summary.improvementRate >= 0 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-rose-500 to-red-400'}
        >
          <div className={`p-1.5 rounded-lg ${summary.improvementRate >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
            {summary.improvementRate >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-rose-500" />
            )}
          </div>
        </StatCard>
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score Trend Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                স্কোর ট্রেন্ড (সর্বশেষ {toBengaliNum(10)}টি)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreTrendChart data={scoreTrendData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Distribution Donut */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                বিষয়ভিত্তিক পরীক্ষা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <DonutChart data={subjectDistribution} />
                <div className="flex flex-col gap-1.5 text-xs">
                  {subjectDistribution.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-muted-foreground">
                        {d.label === 'বাংলা' ? 'বাংলা' :
                         d.label === 'ইংরেজি' ? 'ইংরেজি' :
                         d.label === 'গণিত' ? 'গণিত' :
                         d.label === 'বিজ্ঞান' ? 'বিজ্ঞান' :
                         d.label === 'ICT' ? 'ICT' :
                         d.label === 'ইতিহাস' ? 'ইতিহাস' :
                         d.label === 'ধর্ম' ? 'ধর্ম' :
                         d.label === 'ভূগোল' ? 'ভূগোল' : d.label}
                      </span>
                      <span className="font-medium">{toBengaliNum(d.value)}টি</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grade Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                গ্রেড বিতরণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['A+', 'A', 'B', 'C', 'D', 'F'].map((grade) => {
                  const count = data.history.filter((e) => e.grade === grade).length;
                  const percentage = (count / data.history.length) * 100;
                  const gradeInfo = getGradeInfo(
                    grade === 'A+' ? 95 : grade === 'A' ? 85 : grade === 'B' ? 75 : grade === 'C' ? 65 : grade === 'D' ? 55 : 30
                  );
                  return (
                    <div key={grade} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge className={`${gradeInfo.bg} ${gradeInfo.color} border ${gradeInfo.border} text-xs px-2`}>
                            {grade}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground">
                          {toBengaliNum(count)}টি ({toBengaliNum(Math.round(percentage))}%)
                        </span>
                      </div>
                      <div className="h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            grade === 'A+' ? 'bg-emerald-500' :
                            grade === 'A' ? 'bg-green-500' :
                            grade === 'B' ? 'bg-amber-500' :
                            grade === 'C' ? 'bg-orange-500' :
                            grade === 'D' ? 'bg-rose-500' : 'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Filters & Exam List ────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                পরীক্ষার তালিকা
                <Badge variant="secondary" className="ml-1">
                  {toBengaliNum(filteredHistory.length)}টি
                </Badge>
              </CardTitle>
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="পরীক্ষা খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
                  <SelectValue placeholder="বিষয় নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব বিষয়</SelectItem>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm">
                  <SelectValue placeholder="গ্রেড" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব গ্রেড</SelectItem>
                  {['A+', 'A', 'B', 'C', 'D', 'F'].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
                  <SelectValue placeholder="সাজানো" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">নতুন → পুরনো</SelectItem>
                  <SelectItem value="date-asc">পুরনো → নতুন</SelectItem>
                  <SelectItem value="score-desc">স্কোর (উচ্চ → নিম্ন)</SelectItem>
                  <SelectItem value="score-asc">স্কোর (নিম্ন → উচ্চ)</SelectItem>
                  <SelectItem value="subject">বিষয় অনুসারে</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10">
                <Search className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">কোনো পরীক্ষা পাওয়া যায়নি</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-emerald-600"
                  onClick={() => {
                    setSubjectFilter('all');
                    setGradeFilter('all');
                    setSearchQuery('');
                  }}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  ফিল্টার রিসেট করুন
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredHistory.map((exam, idx) => {
                  const gradeInfo = getGradeInfo(exam.percentage);
                  const subjectColors = getSubjectColor(exam.subjectColor);
                  return (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover="hover"
                      variants={cardHoverVariants}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
                        {/* Subject Badge */}
                        <div className={`shrink-0 px-3 py-1.5 rounded-lg ${subjectColors.bg} border ${subjectColors.border}`}>
                          <span className={`text-xs font-medium ${subjectColors.text}`}>
                            {exam.subjectBn}
                          </span>
                        </div>

                        {/* Exam Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground truncate">
                            {exam.examTitle}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(exam.dateTaken)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(exam.timeTaken)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileCheck className="w-3 h-3" />
                              {toBengaliNum(exam.correctAnswers)}/{toBengaliNum(exam.totalQuestions)} সঠিক
                            </span>
                          </div>
                        </div>

                        {/* Score & Grade */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              {toBengaliNum(exam.obtainedMarks)}<span className="text-sm text-muted-foreground">/{toBengaliNum(exam.totalMarks)}</span>
                            </p>
                            <div className="w-20 h-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  exam.percentage >= 80 ? 'bg-emerald-500' :
                                  exam.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${exam.percentage}%` }}
                              />
                            </div>
                          </div>
                          <Badge className={`${gradeInfo.bg} ${gradeInfo.color} border ${gradeInfo.border} px-2.5 py-0.5`}>
                            {gradeInfo.grade}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            onClick={() => openExamDetail(exam)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="text-xs">বিস্তারিত</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </>
      )}

      {/* ── Exam Detail Dialog ──────────────────────────────────────── */}
      <ExamDetailDialog
        exam={selectedExam}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </motion.div>
  );
}
