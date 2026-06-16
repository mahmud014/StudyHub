'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck, Clock, CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw,
  ChevronLeft, ChevronRight, Download, Sparkles, Star, BookOpen,
  MinusCircle, AlertCircle, Eye, EyeOff, Timer, Zap, Plus, Trash2, Edit3,
  GraduationCap, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// --- Helpers ---
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

function getDifficulty(totalMarks: number): { label: string; color: string; bg: string; gradient: string } {
  if (totalMarks < 20) return { label: 'সহজ', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', gradient: 'from-emerald-500 to-emerald-600' };
  if (totalMarks <= 40) return { label: 'মাঝারি', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', gradient: 'from-amber-500 to-amber-600' };
  return { label: 'কঠিন', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/20', gradient: 'from-red-500 to-red-600' };
}

function getGrade(percentage: number): { grade: string; color: string; bg: string } {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
  if (percentage >= 80) return { grade: 'A', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
  if (percentage >= 70) return { grade: 'B', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' };
  if (percentage >= 60) return { grade: 'C', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
  return { grade: 'D', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' };
}

function getTimerColor(timeLeft: number, totalTime: number): string {
  const ratio = totalTime > 0 ? timeLeft / totalTime : 1;
  if (ratio > 0.5) return 'text-emerald-500';
  if (ratio > 0.2) return 'text-amber-500';
  return 'text-red-500';
}

function getTimerStroke(timeLeft: number, totalTime: number): string {
  const ratio = totalTime > 0 ? timeLeft / totalTime : 1;
  if (ratio > 0.5) return 'oklch(0.508 0.165 160)';
  if (ratio > 0.2) return 'oklch(0.769 0.188 70.08)';
  return 'oklch(0.577 0.245 27.325)';
}

function getExamStatusInfo(status: 'new' | 'attempted' | 'completed') {
  switch (status) {
    case 'new': return { label: 'নতুন', color: 'text-primary', bg: 'bg-primary/10 border-primary/20', icon: Sparkles };
    case 'attempted': return { label: 'চেষ্টা করেছেন', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock };
    case 'completed': return { label: 'সম্পন্ন', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle };
  }
}

// --- Celebration Sparkles ---
function CelebrationSparkles() {
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    size: 4 + Math.random() * 8,
    duration: 1.5 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: s.left, top: s.top }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
            y: [0, -30, -60],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <Star
            className="text-amber-400"
            style={{ width: s.size, height: s.size }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// --- Circular Timer ---
function CircularTimer({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const strokeColor = getTimerStroke(timeLeft, totalTime);
  const textColor = getTimerColor(timeLeft, totalTime);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${toBengaliNum(minutes.toString().padStart(2, '0'))}:${toBengaliNum(seconds.toString().padStart(2, '0'))}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" className="transform -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/30"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke={strokeColor}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'linear' }}
          style={{ filter: `drop-shadow(0 0 6px ${strokeColor})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-mono text-xl font-bold ${textColor}`}>
          {display}
        </span>
        <span className="text-[10px] text-muted-foreground">বাকি সময়</span>
      </div>
    </div>
  );
}

// --- Compact Timer for mobile sticky bar ---
function CompactTimer({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const textColor = getTimerColor(timeLeft, totalTime);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1.5">
      <Timer className={`w-4 h-4 ${textColor}`} />
      <span className={`font-mono text-sm font-bold ${textColor}`}>
        {display}
      </span>
    </div>
  );
}

// --- Circular Score Chart ---
function CircularScoreChart({ percentage, size = 140 }: { percentage: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);
  const grade = getGrade(percentage);

  let strokeColor = 'oklch(0.508 0.165 160)';
  if (percentage < 60) strokeColor = 'oklch(0.577 0.245 27.325)';
  else if (percentage < 80) strokeColor = 'oklch(0.769 0.188 70.08)';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-muted/20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gradient">{toBengaliNum(percentage)}%</span>
        <span className={`text-sm font-semibold ${grade.color}`}>{grade.grade}</span>
      </div>
    </div>
  );
}

// --- Question Navigation Pills ---
function QuestionNav({
  questions,
  answers,
  currentIndex,
  onSelect,
}: {
  questions: ExamQuestion[];
  answers: Record<string, string>;
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mb-4 sm:mb-6">
      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" />
        প্রশ্ন নেভিগেশন
      </p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = idx === currentIndex;
          let pillClass = 'border-muted bg-muted/30 text-muted-foreground';
          if (isCurrent) pillClass = 'border-primary bg-primary text-primary-foreground shadow-sm';
          else if (isAnswered) pillClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

          return (
            <motion.button
              key={q.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(idx)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-xs sm:text-sm font-semibold flex items-center justify-center transition-colors ${pillClass}`}
            >
              {toBengaliNum(idx + 1)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// --- Interfaces ---
interface Exam {
  id: string;
  title: string;
  titleBn: string;
  duration: number;
  totalMarks: number;
  isActive: boolean;
  subjectId: string;
  chapterId?: string | null;
  subject?: { id: string; name: string; nameBn: string };
  chapter?: { id: string; name: string; nameBn: string } | null;
  _count?: { questions: number };
}

interface ExamQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
  order: number;
}

interface ExamResult {
  score: number;
  totalMarks: number;
  results: {
    questionId: string;
    selected: string;
    correct: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

interface Subject {
  id: string;
  name: string;
  nameBn: string;
  chapters: { id: string; name: string; nameBn: string }[];
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// --- Question Form Interface ---
interface QuestionFormInput {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  marks: number;
}

const emptyQuestionForm: QuestionFormInput = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
  marks: 1,
};

// --- Main Component ---
export default function ExamsSection() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examStartingId, setExamStartingId] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [examHistory, setExamHistory] = useState<Record<string, { score: number; totalMarks: number }>>({});
  const { user } = useStudyHub();

  // --- Create Exam State ---
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newExam, setNewExam] = useState({
    title: '',
    titleBn: '',
    subjectId: '',
    chapterId: '',
    duration: 30,
  });
  const [questionForms, setQuestionForms] = useState<QuestionFormInput[]>([
    { ...emptyQuestionForm },
  ]);

  // --- Edit/Delete Exam State ---
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [updatingExam, setUpdatingExam] = useState(false);
  const [editExamForm, setEditExamForm] = useState({
    title: '',
    titleBn: '',
    subjectId: '',
    chapterId: '',
    duration: 30,
    isActive: true,
  });

  // Chart size ref for SSR safety
  const chartSizeRef = useRef(140);

  useEffect(() => {
    chartSizeRef.current = window.innerWidth < 640 ? 120 : 140;
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/exams');
      if (!res.ok) throw new Error('পরীক্ষা লোড করতে সমস্যা হয়েছে');
      const data = await res.json();
      if (data.success) {
        setExams(data.data);
      } else {
        setError(data.error || 'পরীক্ষা লোড করতে সমস্যা হয়েছে');
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch exams
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleOpenEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setEditExamForm({
      title: exam.title,
      titleBn: exam.titleBn || '',
      subjectId: exam.subjectId || '',
      chapterId: exam.chapterId || '',
      duration: exam.duration || 30,
      isActive: exam.isActive !== undefined ? exam.isActive : true,
    });
    setEditOpen(true);
  };

  const handleOpenDeleteExam = (exam: Exam) => {
    setSelectedExam(exam);
    setDeleteOpen(true);
  };

  const handleUpdateExam = async () => {
    if (!selectedExam) return;
    if (!editExamForm.title || !editExamForm.titleBn || !editExamForm.subjectId) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }
    setUpdatingExam(true);
    try {
      const res = await fetch(`/api/exams/${selectedExam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editExamForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('পরীক্ষা সফলভাবে আপডেট করা হয়েছে');
        setEditOpen(false);
        fetchExams();
      } else {
        toast.error(data.error || 'পরীক্ষা আপডেট করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সংযোগে সমস্যা হয়েছে');
    } finally {
      setUpdatingExam(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;
    setUpdatingExam(true);
    try {
      const res = await fetch(`/api/exams/${selectedExam.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('পরীক্ষা মুছে ফেলা হয়েছে');
        setDeleteOpen(false);
        fetchExams();
      } else {
        toast.error(data.error || 'পরীক্ষা মুছতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সংযোগে সমস্যা হয়েছে');
    } finally {
      setUpdatingExam(false);
    }
  };

  // Fetch exam history for best scores
  useEffect(() => {
    if (!user) return;
    fetch(`/api/exams/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.history) {
          const historyMap: Record<string, { score: number; totalMarks: number }> = {};
          data.data.history.forEach((result: { examId: string; score: number; totalMarks: number; obtainedMarks: number }) => {
            const examId = result.examId;
            const score = result.obtainedMarks ?? result.score;
            const existing = historyMap[examId];
            if (!existing || score > existing.score) {
              historyMap[examId] = { score, totalMarks: result.totalMarks };
            }
          });
          setExamHistory(historyMap);
        }
      })
      .catch(() => {});
  }, [user]);

  // Fetch subjects for create exam dialog
  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'teacher') return;
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubjects(data.data);
        }
      })
      .catch(() => {});
  }, [user]);

  // Real best score from exam history
  const getBestScore = (examId: string): number | null => {
    const record = examHistory[examId];
    return record ? record.score : null;
  };

  // Real exam status from history
  const getExamStatus = (examId: string): 'new' | 'attempted' | 'completed' => {
    const record = examHistory[examId];
    if (!record) return 'new';
    return 'completed';
  };

  const startExam = async (exam: Exam) => {
    if (!user) {
      toast.error('পরীক্ষা দিতে লগইন করুন');
      return;
    }
    setExamStartingId(exam.id);
    try {
      const res = await fetch(`/api/exams/${exam.id}`);
      const data = await res.json();
      if (data.success) {
        setActiveExam(exam);
        setQuestions(data.data.questions);
        setAnswers({});
        setExamResult(null);
        setCurrentQuestionIdx(0);
        setExpandedExplanations({});
        const t = exam.duration * 60;
        setTimeLeft(t);
        setTotalTime(t);
      } else {
        toast.error(data.error || 'পরীক্ষা লোড করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setExamStartingId(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!activeExam || !user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const timeTaken = totalTime - timeLeft;
      const res = await fetch(`/api/exams/${activeExam.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, answers, timeTaken }),
      });
      const data = await res.json();
      if (data.success) {
        setExamResult(data.data);
        toast.success('পরীক্ষা সম্পন্ন হয়েছে!');
        // Refresh exam history
        fetch(`/api/exams/history?userId=${user.id}`)
          .then(r => r.json())
          .then(d => {
            if (d.success && d.data?.history) {
              const historyMap: Record<string, { score: number; totalMarks: number }> = {};
              d.data.history.forEach((result: { examId: string; obtainedMarks: number; totalMarks: number }) => {
                const existing = historyMap[result.examId];
                if (!existing || result.obtainedMarks > existing.score) {
                  historyMap[result.examId] = { score: result.obtainedMarks, totalMarks: result.totalMarks };
                }
              });
              setExamHistory(historyMap);
            }
          })
          .catch(() => {});
      } else {
        toast.error(data.error || 'পরীক্ষা জমা দিতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeExam, user, answers, isSubmitting, timeLeft, totalTime]);

  useEffect(() => {
    if (!activeExam || timeLeft <= 0 || examResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeExam, timeLeft, examResult, handleSubmit]);

  const resetExam = () => {
    setActiveExam(null);
    setQuestions([]);
    setAnswers({});
    setExamResult(null);
    setTimeLeft(0);
    setTotalTime(0);
    setCurrentQuestionIdx(0);
    setExpandedExplanations({});
  };

  const handleDownloadAnswerSheet = () => {
    if (!examResult) return;
    const lines = [
      '========================================',
      `        উত্তরপত্র: ${examResult.examTitle}`,
      '========================================',
      `বিষয়: ${examResult.subjectBn}`,
      `মোট প্রশ্ন: ${toBengaliNum(examResult.totalQuestions)}টি`,
      `সদস্য প্রাপ্ত স্কোর: ${toBengaliNum(examResult.score)}/${toBengaliNum(examResult.totalMarks)} (${toBengaliNum(examResult.percentage)}%)`,
      '----------------------------------------',
      'প্রশ্ন ও সমাধানসমূহ:',
      ''
    ];

    examResult.results.forEach((res, idx) => {
      lines.push(`${toBengaliNum(idx + 1)}. ${res.questionText}`);
      res.options.forEach((opt, oi) => {
        const prefix = oi === res.correctAnswer ? '  [✓] ' : oi === res.studentAnswer ? '  [✗] ' : '  [ ] ';
        lines.push(`${prefix}${opt}`);
      });
      lines.push(`আপনার উত্তর: ${res.studentAnswer !== -1 ? res.options[res.studentAnswer] : 'উত্তর দেওয়া হয়নি'}`);
      lines.push(`সঠিক উত্তর: ${res.options[res.correctAnswer]}`);
      lines.push(`ব্যাখ্যা: ${res.explanation}`);
      lines.push('----------------------------------------');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${examResult.examTitle}_answer_sheet.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('উত্তরপত্র সফলভাবে ডাউনলোড হয়েছে!');
  };

  const toggleExplanation = (questionId: string) => {
    setExpandedExplanations(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // --- Create Exam Handlers ---
  const handleCreateExam = async () => {
    if (!newExam.title || !newExam.titleBn || !newExam.subjectId) {
      toast.error('সব প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }
    // Validate questions
    const validQuestions = questionForms.filter(q => q.question && q.optionA && q.optionB && q.optionC && q.optionD);
    if (validQuestions.length === 0) {
      toast.error('কমপক্ষে একটি প্রশ্ন যোগ করুন');
      return;
    }

    setCreating(true);
    try {
      // Step 1: Create exam
      const examRes = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: newExam.subjectId,
          chapterId: newExam.chapterId || null,
          title: newExam.title,
          titleBn: newExam.titleBn,
          duration: newExam.duration,
        }),
      });
      const examData = await examRes.json();
      if (!examData.success) {
        toast.error(examData.error || 'পরীক্ষা তৈরি করতে সমস্যা হয়েছে');
        setCreating(false);
        return;
      }

      // Step 2: Create questions
      const questionsRes = await fetch('/api/exams/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: examData.data.id,
          questions: validQuestions.map((q, idx) => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || undefined,
            marks: q.marks,
            order: idx + 1,
          })),
        }),
      });
      const questionsData = await questionsRes.json();
      if (!questionsData.success) {
        toast.error(questionsData.error || 'প্রশ্ন তৈরি করতে সমস্যা হয়েছে');
        setCreating(false);
        return;
      }

      toast.success('পরীক্ষা সফলভাবে তৈরি হয়েছে!');
      setShowCreateDialog(false);
      // Reset form
      setNewExam({ title: '', titleBn: '', subjectId: '', chapterId: '', duration: 30 });
      setQuestionForms([{ ...emptyQuestionForm }]);
      // Refresh exam list
      fetch('/api/exams')
        .then(r => r.json())
        .then(d => { if (d.success) setExams(d.data); })
        .catch(() => {});
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setCreating(false);
    }
  };

  const addQuestionForm = () => {
    setQuestionForms(prev => [...prev, { ...emptyQuestionForm }]);
  };

  const removeQuestionForm = (index: number) => {
    setQuestionForms(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestionForm = (index: number, field: keyof QuestionFormInput, value: string | number) => {
    setQuestionForms(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const selectedSubjectChapters = subjects.find(s => s.id === newExam.subjectId)?.chapters || [];

  // ============== RESULT VIEW ==============
  if (examResult && activeExam) {
    const percentage = activeExam.totalMarks > 0 ? Math.round((examResult.score / examResult.totalMarks) * 100) : 0;
    const grade = getGrade(percentage);
    const correctCount = examResult.results.filter(r => r.isCorrect).length;
    const wrongCount = examResult.results.filter(r => !r.isCorrect && r.selected).length;
    const unansweredCount = examResult.results.filter(r => !r.selected).length;
    const isCelebrating = percentage >= 80;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Result Header Card */}
          <Card className="mb-6 relative overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-primary via-emerald-500 to-primary" />

            {isCelebrating && <CelebrationSparkles />}

            <CardContent className="p-4 sm:p-8 text-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <Trophy className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${percentage >= 60 ? 'text-amber-500' : 'text-muted-foreground'}`} />
              </motion.div>

              <motion.h2
                className="text-xl sm:text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                পরীক্ষার ফলাফল
              </motion.h2>

              <motion.p
                className="text-sm sm:text-base text-muted-foreground mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {activeExam.titleBn || activeExam.title}
              </motion.p>

              {/* Circular Score Chart + Grade */}
              <motion.div
                className="flex flex-col items-center mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <CircularScoreChart percentage={percentage} size={chartSizeRef.current} />
              </motion.div>

              {/* Grade Badge */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${grade.bg} ${grade.color}`}>
                  <Star className="w-4 h-4" />
                  গ্রেড: {grade.grade}
                </span>
              </motion.div>

              {/* Score display */}
              <motion.div
                className="flex items-center justify-center gap-4 sm:gap-8 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div>
                  <p className="text-2xl sm:text-4xl font-bold text-gradient">{toBengaliNum(examResult.score)}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">প্রাপ্ত নম্বর</p>
                </div>
                <div className="text-2xl text-muted-foreground">/</div>
                <div>
                  <p className="text-2xl sm:text-4xl font-bold">{toBengaliNum(examResult.totalMarks)}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">মোট নম্বর</p>
                </div>
              </motion.div>

              {/* Gradient Progress Bar */}
              <div className="max-w-xs mx-auto mb-3">
                <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.9 }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {toBengaliNum(percentage)}% নম্বর পেয়েছেন
              </p>

              {/* Breakdown Stats */}
              <motion.div
                className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2 sm:p-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{toBengaliNum(correctCount)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">সঠিক</p>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-2 sm:p-3">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">{toBengaliNum(wrongCount)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">ভুল</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2 sm:p-3">
                  <MinusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">{toBengaliNum(unansweredCount)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">উত্তরহীন</p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-wrap justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <Button onClick={resetExam} variant="outline" className="gap-2 h-10 sm:h-auto">
                  <RotateCcw className="w-4 h-4" />
                  আবার চেষ্টা করুন
                </Button>
                <Button variant="outline" className="gap-2 h-10 sm:h-auto" onClick={handleDownloadAnswerSheet}>
                  <Download className="w-4 h-4" />
                  উত্তর পত্র ডাউনলোড
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          {/* Answer Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              উত্তর পর্যালোচনা
            </h3>
            <div className="space-y-3">
              {examResult.results.map((result, idx) => {
                const isExpanded = expandedExplanations[result.questionId];
                return (
                  <motion.div
                    key={result.questionId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <Card className={`overflow-hidden ${result.isCorrect ? 'border-emerald-500/30' : result.selected ? 'border-red-500/30' : 'border-amber-500/30'}`}>
                      <div className={`h-[2px] ${result.isCorrect ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : result.selected ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`} />
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={() => toggleExplanation(result.questionId)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold text-white ${result.isCorrect ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : result.selected ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`}>
                              {toBengaliNum(idx + 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {result.isCorrect ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : result.selected ? (
                                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                )}
                                <span className="font-medium text-sm">প্রশ্ন {toBengaliNum(idx + 1)}</span>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-0.5">
                                {!result.selected && (
                                  <p className="text-amber-600 dark:text-amber-400">উত্তরহীন</p>
                                )}
                                {result.selected && (
                                  <p>আপনার উত্তর: <span className={result.isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>{result.selected}</span></p>
                                )}
                                {!result.isCorrect && (
                                  <p>সঠিক উত্তর: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{result.correct}</span></p>
                                )}
                              </div>

                              {result.explanation && (
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="mt-2 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
                                    {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {isExpanded ? 'ব্যাখ্যা লুকান' : 'ব্যাখ্যা দেখুন'}
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                            </div>
                          </div>

                          {result.explanation && (
                            <CollapsibleContent>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 ml-7 sm:ml-11 text-sm bg-muted/50 p-3 rounded-lg border border-muted"
                              >
                                <p className="font-medium text-xs text-primary mb-1">ব্যাখ্যা:</p>
                                {result.explanation}
                              </motion.div>
                            </CollapsibleContent>
                          )}
                        </CardContent>
                      </Collapsible>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ============== ACTIVE EXAM VIEW ==============
  if (activeExam && questions.length > 0) {
    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Mobile Sticky Timer Bar */}
          <div className="sm:hidden sticky top-0 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b flex items-center justify-between mb-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{activeExam.titleBn || activeExam.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {toBengaliNum(answeredCount)}/{toBengaliNum(questions.length)} উত্তর
              </p>
            </div>
            <CompactTimer timeLeft={timeLeft} totalTime={totalTime} />
          </div>

          {/* Exam Header - Desktop */}
          <div className="hidden sm:flex sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{activeExam.titleBn || activeExam.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {toBengaliNum(questions.length)} টি প্রশ্ন • মোট {toBengaliNum(activeExam.totalMarks)} নম্বর
              </p>
            </div>
            <CircularTimer timeLeft={timeLeft} totalTime={totalTime} />
          </div>

          {/* Gradient Progress Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="h-2 sm:h-2.5 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {toBengaliNum(answeredCount)} / {toBengaliNum(questions.length)} উত্তর দিয়েছেন
            </p>
          </div>

          {/* Question Navigation */}
          <QuestionNav
            questions={questions}
            answers={answers}
            currentIndex={currentQuestionIdx}
            onSelect={setCurrentQuestionIdx}
          />

          {/* Current Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const q = questions[currentQuestionIdx];
                return (
                  <Card className="overflow-hidden">
                    <div className="h-[2px] bg-gradient-to-r from-primary to-emerald-500" />
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-5">
                        <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{toBengaliNum(currentQuestionIdx + 1)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium leading-relaxed text-sm sm:text-base">{q.question}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {toBengaliNum(q.marks)} নম্বর
                          </p>
                        </div>
                      </div>

                      <RadioGroup
                        value={answers[q.id] || ''}
                        onValueChange={(value) => setAnswers(prev => ({ ...prev, [q.id]: value }))}
                        className="space-y-2 sm:space-y-3"
                      >
                        {[
                          { value: 'A', label: q.optionA },
                          { value: 'B', label: q.optionB },
                          { value: 'C', label: q.optionC },
                          { value: 'D', label: q.optionD },
                        ].map((option) => {
                          const isSelected = answers[q.id] === option.value;
                          return (
                            <motion.div
                              key={option.value}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`flex items-center space-x-3 p-3 sm:p-3.5 rounded-xl border transition-colors cursor-pointer min-h-[48px] ${
                                isSelected
                                  ? 'border-primary/40 bg-primary/5'
                                  : 'border-transparent hover:border-muted hover:bg-muted/30'
                              }`}
                              onClick={() => setAnswers(prev => ({ ...prev, [q.id]: option.value }))}
                            >
                              <RadioGroupItem value={option.value} id={`${q.id}-${option.value}`} />
                              <Label htmlFor={`${q.id}-${option.value}`} className="cursor-pointer flex-1 text-sm">
                                <span className={`font-semibold mr-2 ${isSelected ? 'text-primary' : ''}`}>{option.value}.</span>
                                {option.label}
                              </Label>
                            </motion.div>
                          );
                        })}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                );
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation + Submit */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="gap-1 h-10 sm:h-9"
              >
                <ChevronLeft className="w-4 h-4" />
                পূর্ববর্তী
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIdx === questions.length - 1}
                className="gap-1 h-10 sm:h-9"
              >
                পরবর্তী
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <p className="text-sm text-muted-foreground">
                {toBengaliNum(answeredCount)} / {toBengaliNum(questions.length)} উত্তর
              </p>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 h-10 sm:h-auto"
              >
                {isSubmitting ? 'জমা হচ্ছে...' : 'পরীক্ষা শেষ করুন'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============== EXAM LIST VIEW ==============
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
      {/* Enhanced Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <FileCheck className="w-7 h-7 text-primary" />
              অনলাইন পরীক্ষা
            </h2>
            <div className="mt-2 h-[3px] w-32 rounded-full bg-gradient-to-r from-primary via-emerald-500 to-primary/40" />
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              অধ্যায়ভিত্তিক MCQ পরীক্ষা দিন এবং সাথে সাথে ফলাফল দেখুন
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!loading && exams.length > 0 && (
              <Badge variant="secondary" className="text-sm gap-1.5 shrink-0">
                <FileCheck className="w-3.5 h-3.5" />
                মোট: {toBengaliNum(exams.length)} টি পরীক্ষা
              </Badge>
            )}
            {/* Create Exam Button - Admin/Teacher only */}
            {isAdminOrTeacher && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 h-10">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">নতুন পরীক্ষা</span>
                    <span className="sm:hidden">তৈরি</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      নতুন পরীক্ষা তৈরি করুন
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* Exam Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">শিরোনাম (ইংরেজি) *</Label>
                        <Input
                          placeholder="e.g., Bangla - Chapter 1 Test"
                          value={newExam.title}
                          onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">শিরোনাম (বাংলা) *</Label>
                        <Input
                          placeholder="যেমন: বাংলা - অধ্যায় ১ পরীক্ষা"
                          value={newExam.titleBn}
                          onChange={(e) => setNewExam(prev => ({ ...prev, titleBn: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">বিষয় *</Label>
                        <Select
                          value={newExam.subjectId}
                          onValueChange={(val) => setNewExam(prev => ({ ...prev, subjectId: val, chapterId: '' }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="বিষয় নির্বাচন" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.nameBn}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">অধ্যায়</Label>
                        <Select
                          value={newExam.chapterId}
                          onValueChange={(val) => setNewExam(prev => ({ ...prev, chapterId: val }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="অধ্যায় নির্বাচন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">সকল অধ্যায়</SelectItem>
                            {selectedSubjectChapters.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.nameBn}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">সময় (মিনিট)</Label>
                        <Input
                          type="number"
                          min={5}
                          max={180}
                          value={newExam.duration}
                          onChange={(e) => setNewExam(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                        />
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-primary" />
                          প্রশ্নসমূহ ({toBengaliNum(questionForms.length)})
                        </Label>
                        <Button variant="outline" size="sm" onClick={addQuestionForm} className="gap-1 text-xs h-8">
                          <Plus className="w-3 h-3" />
                          প্রশ্ন যোগ করুন
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {questionForms.map((qForm, qIdx) => (
                          <Card key={qIdx} className="overflow-hidden">
                            <div className="h-[2px] bg-gradient-to-r from-primary to-emerald-500" />
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                                  {toBengaliNum(qIdx + 1)}
                                </span>
                                {questionForms.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeQuestionForm(qIdx)}
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                              <div className="space-y-2.5">
                                <Textarea
                                  placeholder="প্রশ্ন লিখুন..."
                                  value={qForm.question}
                                  onChange={(e) => updateQuestionForm(qIdx, 'question', e.target.value)}
                                  className="min-h-[60px] text-sm"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="shrink-0 text-xs font-semibold text-emerald-600 w-5">ক)</span>
                                    <Input
                                      placeholder="বিকল্প ক"
                                      value={qForm.optionA}
                                      onChange={(e) => updateQuestionForm(qIdx, 'optionA', e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="shrink-0 text-xs font-semibold text-emerald-600 w-5">খ)</span>
                                    <Input
                                      placeholder="বিকল্প খ"
                                      value={qForm.optionB}
                                      onChange={(e) => updateQuestionForm(qIdx, 'optionB', e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="shrink-0 text-xs font-semibold text-emerald-600 w-5">গ)</span>
                                    <Input
                                      placeholder="বিকল্প গ"
                                      value={qForm.optionC}
                                      onChange={(e) => updateQuestionForm(qIdx, 'optionC', e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="shrink-0 text-xs font-semibold text-emerald-600 w-5">ঘ)</span>
                                    <Input
                                      placeholder="বিকল্প ঘ"
                                      value={qForm.optionD}
                                      onChange={(e) => updateQuestionForm(qIdx, 'optionD', e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-[10px]">সঠিক উত্তর</Label>
                                    <Select
                                      value={qForm.correctAnswer}
                                      onValueChange={(val) => updateQuestionForm(qIdx, 'correctAnswer', val)}
                                    >
                                      <SelectTrigger className="w-24 h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="A">ক (A)</SelectItem>
                                        <SelectItem value="B">খ (B)</SelectItem>
                                        <SelectItem value="C">গ (C)</SelectItem>
                                        <SelectItem value="D">ঘ (D)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px]">নম্বর</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={qForm.marks}
                                      onChange={(e) => updateQuestionForm(qIdx, 'marks', parseInt(e.target.value) || 1)}
                                      className="w-20 h-8 text-sm"
                                    />
                                  </div>
                                </div>
                                <Textarea
                                  placeholder="ব্যাখ্যা (ঐচ্ছিক)..."
                                  value={qForm.explanation}
                                  onChange={(e) => updateQuestionForm(qIdx, 'explanation', e.target.value)}
                                  className="min-h-[40px] text-sm"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button variant="outline" className="h-10">বাতিল</Button>
                    </DialogClose>
                    <Button
                      onClick={handleCreateExam}
                      disabled={creating}
                      className="gap-2 bg-gradient-to-r from-primary to-emerald-600 h-10"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          তৈরি হচ্ছে...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-4 h-4" />
                          পরীক্ষা তৈরি করুন
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </motion.div>

      {/* Login Warning */}
      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                পরীক্ষা দিতে প্রথমে লগইন করুন
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="mb-6 border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetch('/api/exams')
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) setExams(data.data);
                      else setError(data.error || 'পরীক্ষা লোড করতে সমস্যা হয়েছে');
                    })
                    .catch(() => setError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।'))
                    .finally(() => setLoading(false));
                }}
                className="gap-1 text-xs h-8"
              >
                <RotateCcw className="w-3 h-3" />
                আবার চেষ্টা
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-lg border p-6">
              <div className="h-[2px] bg-muted/50 rounded-full mb-4" />
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : exams.length === 0 && !error ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-dashed">
            <CardContent className="p-8 sm:p-12 text-center">
              <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোনো পরীক্ষা নেই</h3>
              <p className="text-sm text-muted-foreground mb-4">
                এখনো কোনো পরীক্ষা তৈরি করা হয়নি।
              </p>
              {isAdminOrTeacher && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-emerald-600"
                >
                  <Plus className="w-4 h-4" />
                  নতুন পরীক্ষা তৈরি করুন
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Exam Cards */
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {exams.map((exam) => {
            const difficulty = getDifficulty(exam.totalMarks);
            const bestScore = getBestScore(exam.id);
            const examStatus = getExamStatus(exam.id);
            const statusInfo = getExamStatusInfo(examStatus);
            const questionCount = exam._count?.questions || 0;

            return (
              <motion.div key={exam.id} variants={itemVariants}>
                <Card className="card-hover overflow-hidden group transition-all duration-300 hover:shadow-lg">
                  <div className={`h-[2px] bg-gradient-to-r ${difficulty.gradient}`} />
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors`}>
                        <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusInfo.bg} ${statusInfo.color} border-0 gap-0.5`}>
                          <statusInfo.icon className="w-2.5 h-2.5" />
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          {toBengaliNum(exam.duration)} মিনিট
                        </Badge>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficulty.bg} ${difficulty.color}`}>
                          {difficulty.label}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-1 line-clamp-2 text-sm sm:text-base">{exam.titleBn || exam.title}</h3>

                    {/* Subject Badge */}
                    {exam.subject && (
                      <Badge variant="outline" className="text-xs mb-2 gap-1 border-primary/20 text-primary">
                        <BookOpen className="w-3 h-3" />
                        {exam.subject.nameBn}
                      </Badge>
                    )}

                    <p className="text-sm text-muted-foreground mb-1">
                      মোট নম্বর: {toBengaliNum(exam.totalMarks)}
                    </p>

                    {/* Question Count */}
                    {questionCount > 0 && (
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                        প্রশ্ন সংখ্যা: {toBengaliNum(questionCount)}
                      </p>
                    )}

                    {/* Best Score Badge */}
                    {bestScore !== null && (
                      <div className="flex items-center gap-1.5 mb-3 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-muted-foreground">সেরা স্কোর:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{toBengaliNum(bestScore)}</span>
                        <span className="text-muted-foreground">/ {toBengaliNum(exam.totalMarks)}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 h-10 sm:h-11"
                        onClick={() => startExam(exam)}
                        disabled={!user || !!examStartingId}
                      >
                        {examStartingId === exam.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            লোড হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            পরীক্ষা শুরু
                            <ArrowRight className="w-4 h-4 hidden sm:inline" />
                          </>
                        )}
                      </Button>
                      {isAdminOrTeacher && (
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 sm:w-11 sm:h-11 border-border/60 hover:text-primary hover:bg-primary/10 rounded-xl"
                            onClick={() => handleOpenEditExam(exam)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 sm:w-11 sm:h-11 border-border/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                            onClick={() => handleOpenDeleteExam(exam)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Edit Exam Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              পরীক্ষা সম্পাদন করুন
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">শিরোনাম (ইংরেজি) *</Label>
              <Input
                placeholder="e.g., Bangla - Chapter 1 Test"
                value={editExamForm.title}
                onChange={(e) => setEditExamForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">শিরোনাম (বাংলা) *</Label>
              <Input
                placeholder="যেমন: বাংলা - অধ্যায় ১ পরীক্ষা"
                value={editExamForm.titleBn}
                onChange={(e) => setEditExamForm(prev => ({ ...prev, titleBn: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">বিষয় *</Label>
                <Select
                  value={editExamForm.subjectId}
                  onValueChange={(val) => setEditExamForm(prev => ({ ...prev, subjectId: val, chapterId: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="বিষয় নির্বাচন" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.nameBn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">অধ্যায়</Label>
                <Select
                  value={editExamForm.chapterId || 'none'}
                  onValueChange={(val) => setEditExamForm(prev => ({ ...prev, chapterId: val === 'none' ? '' : val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="অধ্যায় নির্বাচন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">সকল অধ্যায়</SelectItem>
                    {subjects.find(s => s.id === editExamForm.subjectId)?.chapters?.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nameBn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">সময় (মিনিট) *</Label>
              <Input
                type="number"
                min={5}
                max={180}
                value={editExamForm.duration}
                onChange={(e) => setEditExamForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-accent/50">
              <div className="space-y-0.5">
                <Label className="text-sm cursor-pointer" htmlFor="active-exam-edit">সক্রিয় স্ট্যাটাস</Label>
                <p className="text-xs text-muted-foreground">শিক্ষার্থীরা পরীক্ষাটি দিতে পারবে</p>
              </div>
              <input
                id="active-exam-edit"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                checked={editExamForm.isActive}
                onChange={(e) => setEditExamForm(prev => ({ ...prev, isActive: e.target.checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updatingExam}>
              বাতিল
            </Button>
            <Button onClick={handleUpdateExam} disabled={updatingExam} className="gap-2 bg-gradient-to-r from-primary to-emerald-600">
              {updatingExam && <Loader2 className="w-4 h-4 animate-spin" />}
              আপডেট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Exam Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              পরীক্ষা মুছে ফেলুন
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              আপনি কি নিশ্চিতভাবে এই পরীক্ষাটি মুছে ফেলতে চান? এর সাথে সম্পর্কিত সকল শিক্ষার্থীর রেজাল্ট এবং প্রশ্নসমূহ মুছে যাবে।
            </p>
            <p className="text-sm font-semibold mt-2 text-foreground">
              {selectedExam?.titleBn || selectedExam?.title}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={updatingExam}>
              বাতিল
            </Button>
            <Button variant="destructive" onClick={handleDeleteExam} disabled={updatingExam} className="gap-2">
              {updatingExam && <Loader2 className="w-4 h-4 animate-spin" />}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
