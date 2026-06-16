'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Clock, Trophy, Star, Zap, Users, Calendar,
  ChevronRight, Crown, Medal, Timer, Award, Flame,
  ArrowRight, TrendingUp, CheckCircle2, Target, Sparkles,
  Loader2, BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Helper: Convert digits to Bengali numerals ─────────────────────────────
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Types ───────────────────────────────────────────────────────────────────
type DifficultyLevel = 'সহজ' | 'মাঝারি' | 'কঠিন';

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

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  timeTaken: string;
  isCurrentUser: boolean;
}

interface PastQuiz {
  id: string;
  date: string;
  topic: string;
  winnerName: string;
  participationCount: number;
}

// ─── Animation variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Countdown Timer Hook ───────────────────────────────────────────────────
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getNextQuizTime = () => {
      const now = new Date();
      const nextFriday = new Date(now);
      nextFriday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
      nextFriday.setHours(18, 0, 0, 0);
      if (nextFriday <= now) {
        nextFriday.setDate(nextFriday.getDate() + 7);
      }
      return nextFriday;
    };

    const targetDate = getNextQuizTime();

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

// ─── Difficulty Badge ────────────────────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  const config: Record<DifficultyLevel, { className: string; icon: React.ElementType }> = {
    'সহজ': { className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
    'মাঝারি': { className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Target },
    'কঠিন': { className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: Flame },
  };

  const { className, icon: Icon } = config[difficulty];

  return (
    <Badge variant="outline" className={`${className} gap-1`}>
      <Icon className="w-3 h-3" />
      {difficulty}
    </Badge>
  );
}

// ─── Countdown Display ───────────────────────────────────────────────────────
function CountdownDisplay() {
  const { days, hours, minutes, seconds } = useCountdown();

  const blocks = [
    { label: 'দিন', value: days },
    { label: 'ঘণ্টা', value: hours },
    { label: 'মিনিট', value: minutes },
    { label: 'সেকেন্ড', value: seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {blocks.map((block, i) => (
        <React.Fragment key={block.label}>
          <div className="flex flex-col items-center">
            <motion.div
              className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg sm:text-xl w-12 sm:w-14 h-10 sm:h-12 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20"
              key={`${block.label}-${block.value}`}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {toBengaliNum(block.value)}
            </motion.div>
            <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">{block.label}</span>
          </div>
          {i < blocks.length - 1 && (
            <span className="text-emerald-500 font-bold text-lg -mt-4">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Leaderboard Row ─────────────────────────────────────────────────────────
function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const rankIcons: Record<number, React.ReactNode> = {
    1: <Crown className="w-5 h-5 text-amber-500" />,
    2: <Medal className="w-5 h-5 text-gray-400" />,
    3: <Medal className="w-5 h-5 text-amber-700" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.3 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        entry.isCurrentUser
          ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
          : 'hover:bg-accent/50'
      }`}
    >
      {/* Rank */}
      <div className="w-7 flex-shrink-0 flex items-center justify-center">
        {rankIcons[entry.rank] || (
          <span className="text-sm font-bold text-muted-foreground">{toBengaliNum(entry.rank)}</span>
        )}
      </div>

      {/* Avatar */}
      <Avatar className={`w-8 h-8 ${entry.isCurrentUser ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-background' : ''}`}>
        <AvatarFallback className={`${entry.isCurrentUser ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary'} text-xs font-bold`}>
          {entry.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {/* Name & Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${entry.isCurrentUser ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
          {entry.name}
          {entry.isCurrentUser && (
            <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
              আপনি
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Timer className="w-3 h-3" />
          {entry.timeTaken}
        </p>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {toBengaliNum(entry.score)}
        </p>
        <p className="text-[10px] text-muted-foreground">পয়েন্ট</p>
      </div>
    </motion.div>
  );
}

// ─── Past Quiz Card ──────────────────────────────────────────────────────────
function PastQuizCard({ quiz, index }: { quiz: PastQuiz; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index, duration: 0.3 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-emerald-500/30 hover:shadow-sm hover:shadow-emerald-500/5 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
        <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{quiz.topic}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {quiz.date}
          </span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
          <Crown className="w-3 h-3" />
          {quiz.winnerName}
        </p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
          <Users className="w-3 h-3" />
          {toBengaliNum(quiz.participationCount)} জন
        </p>
      </div>
    </motion.div>
  );
}

// ─── Stats Card ──────────────────────────────────────────────────────────────
function QuizStatsCard({ stats }: { stats: { totalParticipation: number; yourBestRank: number; quizzesCompleted: number } }) {
  const statsList = [
    {
      label: 'মোট অংশগ্রহণ',
      value: toBengaliNum(stats.totalParticipation),
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'আপনার সেরা র‍্যাংক',
      value: `#${toBengaliNum(stats.yourBestRank)}`,
      icon: Award,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'সম্পন্ন কুইজ',
      value: toBengaliNum(stats.quizzesCompleted),
      icon: CheckCircle2,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {statsList.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
            className="text-center p-3 rounded-xl bg-card border border-border/50"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Derive difficulty from exam data ────────────────────────────────────────
function getDifficultyFromExam(exam: ExamSummary): DifficultyLevel {
  const marksPerQuestion = exam._count.questions > 0 ? exam.totalMarks / exam._count.questions : 0;
  if (marksPerQuestion >= 5 || exam.totalMarks >= 80) return 'কঠিন';
  if (marksPerQuestion >= 2 || exam.totalMarks >= 40) return 'মাঝারি';
  return 'সহজ';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Weekly Quiz Section ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function WeeklyQuizSection() {
  const { user, setActiveSection } = useStudyHub();

  // ── API Data State ────────────────────────────────────────────────────────
  const [weeklyExam, setWeeklyExam] = useState<ExamSummary | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [pastQuizzes, setPastQuizzes] = useState<PastQuiz[]>([]);
  const [quizStats, setQuizStats] = useState({
    totalParticipation: 0,
    yourBestRank: 0,
    quizzesCompleted: 0,
  });
  const [dataFetched, setDataFetched] = useState(false);

  // ── Fetch data on mount ───────────────────────────────────────────────────
  useEffect(() => {
    let examsDone = false;
    let lbDone = false;

    const checkDone = () => {
      if (examsDone && lbDone) {
        setDataFetched(true);
      }
    };

    // Fetch exams - feature the most recent active exam
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const activeExams = data.data.filter((e: ExamSummary) => e.isActive);
          // Pick the most recently created active exam as the weekly quiz
          if (activeExams.length > 0) {
            setWeeklyExam(activeExams[0]); // already sorted by createdAt desc
          }

          // Build past quizzes from other exams
          const pastExams = activeExams.slice(1, 4);
          const pasts: PastQuiz[] = pastExams.map((exam: ExamSummary) => ({
            id: exam.id,
            date: new Date(exam.createdAt).toLocaleDateString('bn-BD', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            topic: exam.titleBn || exam.title,
            winnerName: '—',
            participationCount: exam._count?.questions || 0,
          }));
          setPastQuizzes(pasts);
        }
      })
      .catch(() => {
        // Keep empty state
      })
      .finally(() => {
        examsDone = true;
        checkDone();
      });

    // Fetch leaderboard
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.entries) {
          const mapped: LeaderboardEntry[] = data.data.entries.slice(0, 5).map(
            (entry: { rank: number; user: { name: string; id: string }; score: number }) => ({
              rank: entry.rank,
              name: entry.user?.name || 'অজানা',
              score: entry.score,
              timeTaken: '—',
              isCurrentUser: user?.id === entry.user?.id,
            })
          );
          setLeaderboardData(mapped);

          // Derive stats from leaderboard data
          const userEntry = mapped.find((e) => e.isCurrentUser);
          setQuizStats(prev => ({
            ...prev,
            totalParticipation: data.data.entries.length,
            yourBestRank: userEntry?.rank || 0,
          }));
        }
      })
      .catch(() => {
        // Leaderboard is non-critical
      })
      .finally(() => {
        lbDone = true;
        checkDone();
      });

    // Fetch exam history for quiz stats
    if (user?.id) {
      fetch(`/api/exams/history?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.history) {
            const history = data.data.history;
            setQuizStats(prev => ({
              ...prev,
              quizzesCompleted: history.length,
            }));
          }
        })
        .catch(() => {
          // History is non-critical
        });
    }
  }, [user?.id]);

  // ── Derive current quiz info from exam ────────────────────────────────────
  const currentQuiz = weeklyExam ? {
    id: weeklyExam.id,
    topic: weeklyExam.titleBn || weeklyExam.title,
    difficulty: getDifficultyFromExam(weeklyExam),
    questionCount: weeklyExam._count?.questions || 0,
    timeLimit: weeklyExam.duration,
    totalMarks: weeklyExam.totalMarks,
    subjectName: weeklyExam.subject?.nameBn || '',
  } : null;

  // ── Loading State ─────────────────────────────────────────────────────────
  if (!dataFetched) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-4" />
          <p className="text-muted-foreground">সাপ্তাহিক কুইজ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header with Title & Countdown ──────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <motion.div
              className="flex items-center gap-3 mb-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">সাপ্তাহিক কুইজ চ্যালেঞ্জ</h1>
                <p className="text-sm text-muted-foreground">প্রতি শুক্রবার নতুন কুইজ — প্রতিযোগিতা করুন, জিতুন!</p>
              </div>
            </motion.div>
          </div>

          {/* Countdown Timer */}
          <div className="flex flex-col items-start sm:items-end gap-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              পরবর্তী কুইজ শুরু হতে
            </p>
            <CountdownDisplay />
          </div>
        </div>
      </motion.div>

      {/* ── Main Content Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Current Quiz Card ─────────────────────────────────── */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Current Quiz */}
          <Card className="overflow-hidden border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <CardDescription className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                    <Sparkles className="w-4 h-4" />
                    এই সপ্তাহের কুইজ
                  </CardDescription>
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    {currentQuiz?.topic || 'কুইজ উপলব্ধ নেই'}
                  </CardTitle>
                </div>
                {currentQuiz && (
                  <DifficultyBadge difficulty={currentQuiz.difficulty} />
                )}
              </div>
            </CardHeader>
            <CardContent className="relative space-y-5">
              {currentQuiz ? (
                <>
                  {/* Quiz Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{toBengaliNum(currentQuiz.questionCount)}</p>
                        <p className="text-[10px] text-muted-foreground">প্রশ্ন</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{toBengaliNum(currentQuiz.timeLimit)}</p>
                        <p className="text-[10px] text-muted-foreground">মিনিট</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <Award className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{toBengaliNum(currentQuiz.totalMarks)}</p>
                        <p className="text-[10px] text-muted-foreground">মোট নম্বর</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-tight">{currentQuiz.subjectName}</p>
                        <p className="text-[10px] text-muted-foreground">বিষয়</p>
                      </div>
                    </div>
                  </div>

                  {/* Prize Badge Preview */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/15">
                    <motion.div
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Award className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-300">কুইজ চ্যাম্পিয়ন ব্যাজ</p>
                      <p className="text-xs text-muted-foreground">বিজয়ী এই এক্সক্লুসিভ ব্যাজ অর্জন করবে + {toBengaliNum(currentQuiz.totalMarks)} XP</p>
                    </div>
                  </div>

                  {/* Start Button */}
                  {user ? (
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 h-12 text-base font-semibold gap-2"
                      size="lg"
                      onClick={() => setActiveSection('exams')}
                    >
                      <Swords className="w-5 h-5" />
                      শুরু করুন
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 h-12 text-base font-semibold gap-2"
                      size="lg"
                      disabled
                    >
                      <Swords className="w-5 h-5" />
                      লগইন করে শুরু করুন
                    </Button>
                  )}
                </>
              ) : (
                /* No exam available */
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">এই সপ্তাহে কোনো কুইজ উপলব্ধ নেই</p>
                  <p className="text-xs text-muted-foreground mt-1">শীঘ্রই নতুন কুইজ আসছে!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                পূর্বের কুইজসমূহ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pastQuizzes.length > 0 ? (
                pastQuizzes.map((quiz, i) => (
                  <PastQuizCard key={quiz.id} quiz={quiz} index={i} />)
                )
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  পূর্বের কুইজ পাওয়া যায়নি
                </p>
              )}
              {pastQuizzes.length > 0 && (
                <Button variant="ghost" className="w-full text-emerald-600 dark:text-emerald-400 gap-1.5 mt-2">
                  সব দেখুন <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Right: Leaderboard + Stats ──────────────────────────────── */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Leaderboard */}
          <Card className="overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                এই সপ্তাহের লিডারবোর্ড
              </CardTitle>
              <CardDescription>সেরা {toBengaliNum(5)} প্রতিযোগী</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-2">
              {leaderboardData.length > 0 ? (
                leaderboardData.map((entry, i) => (
                  <LeaderboardRow key={entry.rank} entry={entry} index={i} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  লিডারবোর্ড খালি
                </p>
              )}

              {/* View Full Leaderboard */}
              <Button
                variant="outline"
                className="w-full mt-3 gap-1.5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => setActiveSection('leaderboard')}
              >
                <TrendingUp className="w-4 h-4" />
                সম্পূর্ণ লিডারবোর্ড দেখুন
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                আপনার পরিসংখ্যান
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuizStatsCard stats={quizStats} />
            </CardContent>
          </Card>

          {/* Motivation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-emerald-500/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame className="w-8 h-8 text-emerald-500" />
                  </motion.div>
                  <div>
                    <p className="font-semibold">প্রতিযোগিতায় যোগ দিন!</p>
                    <p className="text-xs text-muted-foreground">প্রতি শুক্রবার সন্ধ্যা ৬টায়</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  সাপ্তাহিক কুইজে অংশগ্রহণ করে আপনার জ্ঞান যাচাই করুন এবং এক্সক্লুসিভ ব্যাজ ও XP জিতুন। আপনার বন্ধুদের সাথে প্রতিযোগিতা করুন!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
