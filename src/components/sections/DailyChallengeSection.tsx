'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Clock, Trophy, Zap, Star, Target, BookOpen,
  ChevronRight, CheckCircle, XCircle, Timer, Award,
  RotateCcw, ArrowRight, Sparkles, TrendingUp, Crown,
  Shuffle, Brain, Gauge, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Helper: Convert digits to Bengali numerals ─────────────────────────────
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Types ───────────────────────────────────────────────────────

type ChallengeState = 'idle' | 'loading' | 'active' | 'submitting' | 'completed';

interface ExamSummary {
  id: string;
  subjectId: string;
  chapterId: string | null;
  title: string;
  titleBn: string;
  duration: number;
  totalMarks: number;
  isActive: boolean;
  createdAt: string;
  subject: { id: string; name: string; nameBn: string };
  chapter: { id: string; name: string; nameBn: string } | null;
  _count: { questions: number };
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

interface MappedQuestion {
  id: string;
  text: string;
  options: string[];
  marks: number;
  order: number;
}

interface QuestionResult {
  questionId: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
  explanation: string;
}

interface SubmitResult {
  resultId: string;
  score: number;
  totalMarks: number;
  results: QuestionResult[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isUser: boolean;
}

// ─── Challenge Configs ───────────────────────────────────────────

const challengeConfigs = [
  {
    type: 'mcq',
    title: 'দৈনিক MCQ কুইজ',
    description: 'বিভিন্ন বিষয় থেকে প্রশ্ন, প্রতিটিতে ৩০ সেকেন্ড সময়',
    icon: <Brain className="w-5 h-5" />,
    timePerQuestion: 30,
    basePoints: 100,
    difficulty: 'মাঝারি' as const,
    rules: [
      'বিভিন্ন বিষয় থেকে প্রশ্ন',
      'প্রতিটি প্রশ্নে ৩০ সেকেন্ড সময়',
      'সঠিক উত্তরে পয়েন্ট',
      'ভুল উত্তরে ০ পয়েন্ট',
    ],
  },
  {
    type: 'quickfire',
    title: 'দ্রুত উত্তর',
    description: 'দ্রুত উত্তর দিন, মাত্র ১৫ সেকেন্ড সময়',
    icon: <Gauge className="w-5 h-5" />,
    timePerQuestion: 15,
    basePoints: 150,
    difficulty: 'কঠিন' as const,
    rules: [
      'দ্রুত প্রশ্ন',
      'প্রতিটিতে মাত্র ১৫ সেকেন্ড',
      'যত দ্রুত উত্তর, তত বেশি পয়েন্ট',
      'সর্বোচ্চ স্পিড বোনাস!',
    ],
  },
  {
    type: 'spotlight',
    title: 'বিষয় স্পটলাইট',
    description: 'একটি নির্দিষ্ট বিষয় থেকে গভীর প্রশ্ন',
    icon: <Target className="w-5 h-5" />,
    timePerQuestion: 30,
    basePoints: 120,
    difficulty: 'মাঝারি' as const,
    rules: [
      'একটি নির্দিষ্ট বিষয়ের প্রশ্ন',
      'প্রতিটিতে ৩০ সেকেন্ড সময়',
      'বিষয়ভিত্তিক বোনাস পয়েন্ট',
      'সঠিক উত্তরে পয়েন্ট',
    ],
  },
  {
    type: 'mixed',
    title: 'মিশ্র চ্যালেঞ্জ',
    description: 'মিশ্র কঠিনায়ন, ধারাবাহিকতায় বোনাস',
    icon: <Shuffle className="w-5 h-5" />,
    timePerQuestion: 25,
    basePoints: 200,
    difficulty: 'কঠিন' as const,
    rules: [
      'মিশ্র কঠিনায়নের প্রশ্ন',
      'প্রতিটিতে ২৫ সেকেন্ড সময়',
      'টানা সঠিক উত্তরে স্ট্রিক বোনাস',
      'সর্বোচ্চ পয়েন্টের সুযোগ!',
    ],
  },
];

type Difficulty = 'সহজ' | 'মাঝারি' | 'কঠিন';

// ─── Helper: get today's challenge type based on day ─────────────

function getTodaysChallengeIndex(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % challengeConfigs.length;
}

// ─── Helper: pick exam based on date hash ────────────────────────

function pickExamByDate(exams: ExamSummary[]): ExamSummary | null {
  if (exams.length === 0) return null;
  const now = new Date();
  const dateHash = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = dateHash % exams.length;
  return exams[index];
}

// ─── Helper: time until midnight ─────────────────────────────────

function getTimeUntilReset(): { hours: number; minutes: number; seconds: number; totalMs: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    totalMs: diff,
  };
}

// ─── Circular Countdown SVG ──────────────────────────────────────

function CircularCountdown({ hours, minutes, seconds, totalMs }: {
  hours: number; minutes: number; seconds: number; totalMs: number;
}) {
  const totalDayMs = 24 * 60 * 60 * 1000;
  const progress = totalMs / totalDayMs;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-emerald-900/20 dark:text-emerald-100/10"
        />
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke="url(#countdownGradient)"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
        </span>
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          {String(seconds).padStart(2, '0')} সেকেন্ড
        </span>
      </div>
    </div>
  );
}

// ─── Question Timer Bar ──────────────────────────────────────────

function QuestionTimerBar({ timeLeft, maxTime }: { timeLeft: number; maxTime: number }) {
  const percentage = (timeLeft / maxTime) * 100;
  const isLow = timeLeft <= maxTime * 0.3;

  return (
    <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
        initial={{ width: '100%' }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3, ease: 'linear' }}
      />
      {isLow && (
        <motion.div
          className="h-full rounded-full bg-red-400/30 -mt-2"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ width: `${percentage}%` }}
        />
      )}
    </div>
  );
}

// ─── Streak Calendar ─────────────────────────────────────────────

function StreakCalendar({ streakDays }: { streakDays: boolean[] }) {
  const dayLabels = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];

  return (
    <div className="flex gap-1.5 items-end">
      {streakDays.map((active, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
              active
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-muted-foreground'
            }`}
          >
            {active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-3 h-3" />}
          </div>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">{dayLabels[i]}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Confetti Particle ───────────────────────────────────────────

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const startX = Math.random() * 100;
  const size = 4 + Math.random() * 6;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: `${startX}%`,
        top: 0,
      }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        y: [0, 200 + Math.random() * 200],
        x: [0, (Math.random() - 0.5) * 150],
        scale: [1, 0.2],
        rotate: [0, Math.random() * 720],
      }}
      transition={{
        duration: 2 + Math.random(),
        delay: delay,
        ease: 'easeOut',
      }}
    />
  );
}

// ─── Confetti Animation ──────────────────────────────────────────

function ConfettiAnimation() {
  const particles = Array.from({ length: 40 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <ConfettiParticle key={i} delay={i * 0.04} />
      ))}
    </div>
  );
}

// ─── Gradient Border Wrapper ─────────────────────────────────────

function GradientBorderCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-xl p-[2px] ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669, #34d399, #10b981)',
          backgroundSize: '300% 300%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative rounded-[10px] bg-card">
        {children}
      </div>
    </div>
  );
}

// ─── Difficulty Badge ────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const config = {
    'সহজ': { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: <Star className="w-3 h-3" /> },
    'মাঝারি': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: <TrendingUp className="w-3 h-3" /> },
    'কঠিন': { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: <Flame className="w-3 h-3" /> },
  };
  const c = config[difficulty];

  return (
    <Badge variant="outline" className={`${c.color} border-0 gap-1 text-xs font-medium`}>
      {c.icon}
      {difficulty}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Component ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function DailyChallengeSection() {
  const { user } = useStudyHub();

  // ── State ─────────────────────────────────────────────────────────────────
  const [challengeState, setChallengeState] = useState<ChallengeState>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilReset());
  const [challengeStartTime, setChallengeStartTime] = useState(0);
  const [streak] = useState(5); // simulated streak
  const [questions, setQuestions] = useState<MappedQuestion[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // ── API Data State ────────────────────────────────────────────────────────
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [noExamAvailable, setNoExamAvailable] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const challengeIndex = getTodaysChallengeIndex();
  const challenge = challengeConfigs[challengeIndex];

  // Simulated streak days (last 7 days)
  const streakDays = [true, true, true, false, true, true, true];

  // Streak multiplier
  const getStreakMultiplier = (s: number): { mult: number; label: string } => {
    if (s >= 7) return { mult: 2, label: '2x' };
    if (s >= 3) return { mult: 1.5, label: '1.5x' };
    return { mult: 1, label: '1x' };
  };

  const streakMultiplier = getStreakMultiplier(streak);

  // ── Fetch exams on mount ──────────────────────────────────────────────────
  useEffect(() => {
    setLoadingExam(true);
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const activeExams = data.data.filter((e: ExamSummary) => e.isActive);
          setExams(activeExams);
          const picked = pickExamByDate(activeExams);
          if (picked) {
            setSelectedExam(picked);
          } else {
            setNoExamAvailable(true);
          }
        } else {
          setNoExamAvailable(true);
        }
      })
      .catch(() => {
        setNoExamAvailable(true);
      })
      .finally(() => {
        setLoadingExam(false);
      });
  }, []);

  // ── Fetch leaderboard ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.entries) {
          const mapped: LeaderboardEntry[] = data.data.entries.slice(0, 5).map(
            (entry: { rank: number; user: { name: string; id: string }; score: number }) => ({
              rank: entry.rank,
              name: entry.user?.name || 'অজানা',
              score: entry.score,
              isUser: user?.id === entry.user?.id,
            })
          );
          setLeaderboard(mapped);
        }
      })
      .catch(() => {
        // Leaderboard is non-critical, keep empty
      });
  }, [user?.id]);

  // Countdown timer update
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(getTimeUntilReset());
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Question timer
  useEffect(() => {
    if (challengeState !== 'active' || isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto skip
          setIsAnswered(true);
          setSelectedAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [challengeState, isAnswered, currentQuestion]);

  // ── Start challenge: fetch full exam ──────────────────────────────────────
  const startChallenge = async () => {
    if (!selectedExam) return;

    setChallengeState('loading');
    try {
      const res = await fetch(`/api/exams/${selectedExam.id}`);
      const data = await res.json();

      if (data.success && data.data?.questions) {
        const mappedQuestions: MappedQuestion[] = data.data.questions.map(
          (q: ExamQuestion) => ({
            id: q.id,
            text: q.question,
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            marks: q.marks,
            order: q.order,
          })
        );

        setQuestions(mappedQuestions);
        setAnswers({});
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(challenge.timePerQuestion);
        setChallengeStartTime(Date.now());
        setSubmitResult(null);
        setChallengeState('active');
      } else {
        setChallengeState('idle');
      }
    } catch {
      setChallengeState('idle');
    }
  };

  // ── Answer question ──────────────────────────────────────────────────────
  const handleAnswer = (index: number) => {
    if (isAnswered || challengeState !== 'active') return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (timerRef.current) clearInterval(timerRef.current);

    // Store answer
    const question = questions[currentQuestion];
    if (question) {
      const answerLetter = String.fromCharCode(65 + index); // 0→A, 1→B, 2→C, 3→D
      setAnswers(prev => ({ ...prev, [question.id]: answerLetter }));
    }
  };

  // ── Submit exam answers ──────────────────────────────────────────────────
  const submitExam = useCallback(async (finalAnswers: Record<string, string>) => {
    if (!selectedExam || !user) return;

    setChallengeState('submitting');
    const timeTaken = Math.floor((Date.now() - challengeStartTime) / 1000);

    try {
      const res = await fetch(`/api/exams/${selectedExam.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          answers: finalAnswers,
          timeTaken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitResult(data.data);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        setChallengeState('completed');
      } else {
        // Still show completed state even if submission failed
        setChallengeState('completed');
      }
    } catch {
      setChallengeState('completed');
    }
  }, [selectedExam, user, challengeStartTime]);

  // ── Next question ────────────────────────────────────────────────────────
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(challenge.timePerQuestion);
    } else {
      // All questions answered — submit
      submitExam(answers);
    }
  };

  // ── Reset challenge ──────────────────────────────────────────────────────
  const resetChallenge = () => {
    setChallengeState('idle');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(0);
    setQuestions([]);
    setAnswers({});
    setSubmitResult(null);
  };

  // ── Calculate results ────────────────────────────────────────────────────
  const timeTaken = challengeState === 'completed'
    ? Math.floor((Date.now() - challengeStartTime) / 1000)
    : 0;

  const correctCount = submitResult?.results?.filter(r => r.isCorrect).length ?? 0;
  const scoreFromApi = submitResult?.score ?? 0;
  const finalScore = Math.floor(scoreFromApi * streakMultiplier.mult);
  const accuracy = questions.length > 0
    ? Math.round((correctCount / questions.length) * 100)
    : 0;
  const xpEarned = finalScore + (accuracy === 100 ? 50 : 0);

  // ── Render: No Exam Available ─────────────────────────────────────────────

  if (noExamAvailable && challengeState === 'idle') {
    return (
      <section className="w-full py-8 sm:py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4"
            >
              <Zap className="w-4 h-4" />
              আজকের চ্যালেঞ্জ
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              দৈনিক চ্যালেঞ্জ 🔥
            </h2>
          </div>

          <Card className="border-emerald-200/50 dark:border-emerald-800/30 max-w-lg mx-auto">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
              >
                <BookOpen className="w-8 h-8 text-emerald-500" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">আজ কোনো চ্যালেঞ্জ নেই</h3>
              <p className="text-sm text-muted-foreground">
                আপাতত কোনো সক্রিয় পরীক্ষা উপলব্ধ নেই। পরে আবার চেষ্টা করুন!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    );
  }

  // ── Render: Loading State ─────────────────────────────────────────────────

  if (loadingExam && challengeState === 'idle') {
    return (
      <section className="w-full py-8 sm:py-12 px-4">
        <div className="max-w-5xl mx-auto text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-4" />
          <p className="text-muted-foreground">আজকের চ্যালেঞ্জ লোড হচ্ছে...</p>
        </div>
      </section>
    );
  }

  // ── Render: Idle State ──────────────────────────────────────────────────

  if (challengeState === 'idle') {
    return (
      <section className="w-full py-8 sm:py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4"
            >
              <Zap className="w-4 h-4" />
              আজকের চ্যালেঞ্জ
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              দৈনিক চ্যালেঞ্জ 🔥
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              প্রতিদিন নতুন চ্যালেঞ্জ, প্রতিদিন নতুন শেখা
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Challenge Card */}
            <div className="lg:col-span-2">
              <GradientBorderCard>
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          {challenge.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {selectedExam?.titleBn || challenge.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {selectedExam?.subject?.nameBn ? `${selectedExam.subject.nameBn}` : challenge.description}
                          </CardDescription>
                        </div>
                      </div>
                      <CircularCountdown {...countdown} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Challenge Details */}
                    <div className="flex flex-wrap gap-2">
                      <DifficultyBadge difficulty={challenge.difficulty} />
                      <Badge variant="outline" className="gap-1 text-xs border-emerald-200 dark:border-emerald-800">
                        <BookOpen className="w-3 h-3" />
                        {toBengaliNum(selectedExam?._count?.questions || challenge.basePoints)} প্রশ্ন
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs border-emerald-200 dark:border-emerald-800">
                        <Timer className="w-3 h-3" />
                        {toBengaliNum(challenge.timePerQuestion)} সেকেন্ড/প্রশ্ন
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                        <Trophy className="w-3 h-3" />
                        {toBengaliNum(selectedExam?.totalMarks || challenge.basePoints)}+ পয়েন্ট
                      </Badge>
                    </div>

                    {/* Rules */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-4">
                      <h4 className="text-sm font-semibold mb-3 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        নিয়মাবলী
                      </h4>
                      <ul className="space-y-2">
                        {challenge.rules.map((rule, i) => (
                          <motion.li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                          >
                            <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            {rule}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Streak Info */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Flame className="w-8 h-8 text-amber-500" />
                        </motion.div>
                        <div>
                          <p className="font-bold text-amber-700 dark:text-amber-300">
                            {toBengaliNum(streak)} দিনের স্ট্রিক!
                          </p>
                          <p className="text-xs text-amber-600/70 dark:text-amber-400/60">
                            মাল্টিপ্লায়ার: {streakMultiplier.label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {streakMultiplier.label}
                        </p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/60">বোনাস</p>
                      </div>
                    </div>

                    {/* Start Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={startChallenge}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                        size="lg"
                        disabled={!user}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        {user ? 'চ্যালেঞ্জ শুরু করো' : 'লগইন করে শুরু করো'}
                        {user && <ArrowRight className="w-5 h-5 ml-2" />}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </GradientBorderCard>
            </div>

            {/* Sidebar: Streak Calendar + Leaderboard */}
            <div className="space-y-4">
              {/* Streak Calendar */}
              <Card className="border-emerald-200/50 dark:border-emerald-800/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    স্ট্রিক ক্যালেন্ডার
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StreakCalendar streakDays={streakDays} />
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>গত ৭ দিন</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {toBengaliNum(streakDays.filter(Boolean).length)}/৭ দিন সক্রিয়
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Leaderboard Preview */}
              <Card className="border-emerald-200/50 dark:border-emerald-800/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    আজকের লিডারবোর্ড
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {leaderboard.map((entry, i) => (
                        <motion.div
                          key={entry.rank}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                            entry.isUser
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                              : 'hover:bg-muted/50'
                          }`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry.rank === 1
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : entry.rank === 2
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                : entry.rank === 3
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                                  : 'bg-muted text-muted-foreground'
                          }`}>
                            {toBengaliNum(entry.rank)}
                          </div>
                          <span className={`flex-1 text-sm font-medium ${
                            entry.isUser ? 'text-emerald-700 dark:text-emerald-300' : ''
                          }`}>
                            {entry.name}
                          </span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {toBengaliNum(entry.score)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      লিডারবোর্ড খালি
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Challenge Type Rotation */}
              <Card className="border-emerald-200/50 dark:border-emerald-800/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-500" />
                    চ্যালেঞ্জ রোটেশন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {challengeConfigs.map((c, i) => (
                      <div
                        key={c.type}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-sm ${
                          i === challengeIndex
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          i === challengeIndex
                            ? 'bg-emerald-200 dark:bg-emerald-800'
                            : 'bg-muted'
                        }`}>
                          {c.icon}
                        </div>
                        <span className="flex-1">{c.title}</span>
                        {i === challengeIndex && (
                          <Badge className="bg-emerald-500 text-white text-[10px] px-1.5">আজ</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  // ── Render: Loading/Submitting State ──────────────────────────────────────

  if (challengeState === 'loading' || challengeState === 'submitting') {
    return (
      <section className="w-full py-8 sm:py-12 px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-500 mb-4" />
          <p className="text-muted-foreground">
            {challengeState === 'loading' ? 'চ্যালেঞ্জ প্রস্তুত হচ্ছে...' : 'উত্তর জমা হচ্ছে...'}
          </p>
        </div>
      </section>
    );
  }

  // ── Render: Active Challenge ────────────────────────────────────────────

  if (challengeState === 'active' && questions.length > 0) {
    const question = questions[currentQuestion];

    return (
      <section className="w-full py-8 sm:py-12 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-3xl mx-auto"
        >
          <GradientBorderCard>
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      {challenge.icon}
                    </div>
                    <span className="text-sm font-medium">{selectedExam?.titleBn || challenge.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1 border-emerald-200 dark:border-emerald-800">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">{streakMultiplier.label}</span>
                    </Badge>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>প্রশ্ন {toBengaliNum(currentQuestion + 1)} / {toBengaliNum(questions.length)}</span>
                    <span>{toBengaliNum(Math.round(((currentQuestion + 1) / questions.length) * 100))}%</span>
                  </div>
                  <Progress
                    value={((currentQuestion + 1) / questions.length) * 100}
                    className="h-2 bg-emerald-100 dark:bg-emerald-900/30"
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Timer Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1 ${timeLeft <= challenge.timePerQuestion * 0.3 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      <Clock className="w-3 h-3" />
                      সময় বাকি
                    </span>
                    <span className={`font-mono font-bold ${timeLeft <= challenge.timePerQuestion * 0.3 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {toBengaliNum(timeLeft)}s
                    </span>
                  </div>
                  <QuestionTimerBar timeLeft={timeLeft} maxTime={challenge.timePerQuestion} />
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Subject Badge */}
                    {selectedExam?.subject?.nameBn && (
                      <Badge variant="outline" className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                        {selectedExam.subject.nameBn}
                      </Badge>
                    )}

                    {/* Question Text */}
                    <h3 className="text-lg sm:text-xl font-semibold leading-relaxed">
                      {question.text}
                    </h3>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {question.options.map((option, idx) => {
                        let optionStyle = 'border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10';
                        let iconEl: React.ReactNode = (
                          <span className="w-7 h-7 rounded-full border-2 border-current/30 flex items-center justify-center text-xs font-bold">
                            {String.fromCharCode(2430 + idx)}
                          </span>
                        );

                        if (isAnswered) {
                          if (selectedAnswer === idx) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-500';
                            iconEl = <CheckCircle className="w-7 h-7 text-emerald-500" />;
                          } else {
                            optionStyle = 'opacity-50 border-muted';
                          }
                        } else if (selectedAnswer === idx) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                        }

                        return (
                          <motion.button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={isAnswered}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${optionStyle} ${
                              !isAnswered ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                            }`}
                            whileHover={!isAnswered ? { scale: 1.01 } : undefined}
                            whileTap={!isAnswered ? { scale: 0.99 } : undefined}
                          >
                            {iconEl}
                            <span className="text-sm sm:text-base font-medium">{option}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Answer Feedback */}
                    <AnimatePresence>
                      {isAnswered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-center"
                        >
                          {selectedAnswer === -1 ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                              <Clock className="w-4 h-4" />
                              সময় শেষ! পরবর্তী প্রশ্নে যান
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                              <CheckCircle className="w-4 h-4" />
                              উত্তর নির্বাচিত! পরবর্তী প্রশ্নে যান
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Next Button */}
                    <AnimatePresence>
                      {isAnswered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <Button
                            onClick={nextQuestion}
                            className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                          >
                            {currentQuestion < questions.length - 1 ? (
                              <>
                                পরবর্তী প্রশ্ন
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            ) : (
                              <>
                                ফলাফল দেখো
                                <Trophy className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </GradientBorderCard>
        </motion.div>
      </section>
    );
  }

  // ── Render: Completed ───────────────────────────────────────────────────

  return (
    <section className="w-full py-8 sm:py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto relative"
      >
        {showConfetti && <ConfettiAnimation />}

        <GradientBorderCard>
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                চ্যালেঞ্জ সম্পন্ন! 🎉
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {selectedExam?.titleBn || challenge.title}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30"
              >
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">মোট স্কোর</p>
                <motion.p
                  className="text-5xl font-bold text-emerald-600 dark:text-emerald-400"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                >
                  {toBengaliNum(finalScore)}
                </motion.p>
                {submitResult && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {toBengaliNum(submitResult.score)}/{toBengaliNum(submitResult.totalMarks)} নম্বর
                  </p>
                )}
                {streakMultiplier.mult > 1 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4" />
                    স্ট্রিক বোনাস: {streakMultiplier.label}
                  </p>
                )}
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'সঠিক', value: `${toBengaliNum(correctCount)}/${toBengaliNum(questions.length)}`, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-500' },
                  { label: 'নির্ভুলতা', value: `${toBengaliNum(accuracy)}%`, icon: <Target className="w-4 h-4" />, color: 'text-amber-500' },
                  { label: 'সময়', value: `${toBengaliNum(timeTaken)}s`, icon: <Clock className="w-4 h-4" />, color: 'text-sky-500' },
                  { label: 'XP অর্জন', value: `+${toBengaliNum(xpEarned)}`, icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-center p-3 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <div className={`flex items-center justify-center gap-1 mb-1 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Question Results Breakdown */}
              {submitResult?.results && submitResult.results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    প্রশ্নভিত্তিক ফলাফল
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {submitResult.results.map((result, idx) => (
                      <div
                        key={result.questionId}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                          result.isCorrect
                            ? 'bg-emerald-50/50 dark:bg-emerald-900/10'
                            : 'bg-red-50/50 dark:bg-red-900/10'
                        }`}
                      >
                        {result.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <span className="text-muted-foreground">
                          প্রশ্ন {toBengaliNum(idx + 1)}:
                        </span>
                        <span className={`font-medium ${result.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {result.isCorrect ? 'সঠিক' : `ভুল (সঠিক: ${result.correct})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Rank Display */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/30 dark:border-amber-800/20"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-amber-700 dark:text-amber-300">চমৎকার প্রচেষ্টা!</span>
                </div>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/60">
                  আপনার ফলাফল লিডারবোর্ডে যুক্ত হয়েছে
                </p>
              </motion.div>

              {/* Streak Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/30 dark:border-amber-800/20"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame className="w-8 h-8 text-amber-500" />
                </motion.div>
                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-300">
                    {toBengaliNum(streak + 1)} দিনের স্ট্রিক! 🔥
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/60">
                    আগামীকালও চ্যালেঞ্জ করো, স্ট্রিক বাঁচাও!
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={resetChallenge}
                  variant="outline"
                  className="flex-1 h-11 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  আবার চেষ্টা করো
                </Button>
                <Button
                  onClick={resetChallenge}
                  className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                >
                  <Award className="w-4 h-4 mr-2" />
                  হোমে ফিরে যাও
                </Button>
              </div>
            </CardContent>
          </Card>
        </GradientBorderCard>
      </motion.div>
    </section>
  );
}
