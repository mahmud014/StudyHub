'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Trophy, Medal, Crown, Star, TrendingUp, Sparkles, ChevronUp,
  ChevronDown, ArrowUp, ArrowDown, Minus, BookOpen, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

interface LeaderboardEntry {
  id: string;
  week: string;
  score: number;
  rank: number;
  rankChange?: number;
  user: { id: string; name: string; avatar: string | null };
}

interface Subject {
  id: string;
  name: string;
  nameBn: string;
}

// Helper: convert digits to Bengali numerals
function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

// Animated counter component
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

  return <span>{toBengaliNum(display)}</span>;
}

// Sparkle effect for #1
function SparkleEffect() {
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.cos((i / 8) * Math.PI * 2) * 60,
    y: Math.sin((i / 8) * Math.PI * 2) * 60,
    delay: i * 0.15,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute left-1/2 top-1/2"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, s.x],
            y: [0, s.y],
          }}
          transition={{
            duration: 2,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
        </motion.div>
      ))}
    </div>
  );
}

// Score bar visualization
function ScoreBar({ score, maxScore, rank }: { score: number; maxScore: number; rank: number }) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const barColor =
    rank === 1
      ? 'from-amber-400 via-amber-500 to-amber-600'
      : rank === 2
      ? 'from-gray-300 via-gray-400 to-gray-500'
      : rank === 3
      ? 'from-amber-600 via-amber-700 to-amber-800'
      : 'from-emerald-400 via-emerald-500 to-emerald-600';

  return (
    <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
      />
    </div>
  );
}

// Rank change indicator
function RankChangeIndicator({ change }: { change: number | undefined }) {
  if (change === undefined || change === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
        <Minus className="w-2.5 h-2.5" />
      </span>
    );
  }
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
        <ArrowUp className="w-2.5 h-2.5" />
        {toBengaliNum(change)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
      <ArrowDown className="w-2.5 h-2.5" />
      {toBengaliNum(Math.abs(change))}
    </span>
  );
}

// Weekly Progress Chart (CSS bar chart)
function WeeklyProgressChart({ weeklyScores }: { weeklyScores: { label: string; score: number }[] }) {
  const maxScore = Math.max(...weeklyScores.map(s => s.score), 1);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          সাপ্তাহিক অগ্রগতি
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-32">
          {weeklyScores.map((week, i) => {
            const height = maxScore > 0 ? (week.score / maxScore) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {toBengaliNum(week.score)}
                </span>
                <div className="w-full relative rounded-t-md overflow-hidden bg-muted/30" style={{ height: '100px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400"
                  />
                </div>
                <span className="text-[9px] text-muted-foreground truncate max-w-full">
                  {week.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const timePeriods = [
  { id: 'weekly', label: 'সাপ্তাহিক' },
  { id: 'monthly', label: 'মাসিক' },
  { id: 'alltime', label: 'সর্বকালের' },
];

export default function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { user } = useStudyHub();

  // Weekly progress scores for the chart (mock data based on user)
  const weeklyProgressData = [
    { label: 'সোম', score: 45 },
    { label: 'মঙ্গল', score: 72 },
    { label: 'বুধ', score: 58 },
    { label: 'বৃহঃ', score: 90 },
    { label: 'শুক্র', score: 65 },
    { label: 'শনি', score: 80 },
    { label: 'রবি', score: 55 },
  ];

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const entries = Array.isArray(data.data) ? data.data : (data.data.entries || []);
          // Add mock rankChange data for visual enhancement
          const enhanced = entries.map((e: LeaderboardEntry, i: number) => ({
            ...e,
            rankChange: i < 3 ? Math.floor(Math.random() * 3) + 1 : (i % 3 === 0 ? -Math.floor(Math.random() * 3) - 1 : i % 3 === 1 ? Math.floor(Math.random() * 3) + 1 : 0),
          }));
          setEntries(enhanced);
          if (enhanced.length > 0) {
            setSelectedWeek(enhanced[0].week);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch subjects for the dropdown
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => data.success && setSubjects(data.data))
      .catch(() => {});
  }, []);

  const weeks = [...new Set(entries.map(e => e.week))];
  const filteredEntries = entries
    .filter(e => {
      const weekMatch = e.week === selectedWeek;
      return weekMatch;
    })
    .sort((a, b) => a.rank - b.rank);

  // Apply subject filter (client-side mock: if subject selected, show subset)
  const displayEntries = selectedSubject === 'all'
    ? filteredEntries
    : filteredEntries.filter((_, i) => i % 3 !== 2); // Simulate subject filter by removing some entries

  const maxScore = displayEntries.length > 0 ? displayEntries[0].score : 1;

  // Find current user's position
  const userEntry = user ? displayEntries.find(e => e.user.id === user.id) : null;
  const userRank = userEntry?.rank ?? 0;
  const userScore = userEntry?.score ?? 0;
  const userRankChange = userEntry?.rankChange ?? 0;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{toBengaliNum(rank)}</span>;
  };

  const getScoreDiff = (index: number) => {
    if (index === 0 || displayEntries.length < 2) return null;
    const diff = displayEntries[0].score - displayEntries[index].score;
    if (diff <= 0) return null;
    return `${toBengaliNum(diff)} পয়েন্ট পিছনে`;
  };

  const getRankBorder = (rank: number) => {
    if (rank === 1) return 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/30';
    if (rank === 2) return 'ring-2 ring-gray-300 shadow-lg shadow-gray-300/20';
    if (rank === 3) return 'ring-2 ring-amber-600 shadow-lg shadow-amber-600/20';
    return '';
  };

  const getAvatarBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
    return 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-4">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <Skeleton className="h-8 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
        <div className="flex items-end justify-center gap-4 mb-8">
          <div className="text-center">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="mt-2 w-28 h-20 rounded-t-lg mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="w-8 h-8 rounded-full mx-auto mb-1" />
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="mt-2 w-28 h-28 rounded-t-lg mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="mt-2 w-28 h-16 rounded-t-lg mx-auto" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              সম্পূর্ণ র‍্যাংকিং
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                  <Skeleton className="w-8 h-6" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="flex-1 h-4" />
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 mb-4 relative"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Trophy className="w-8 h-8 text-amber-500" />
          <motion.div
            className="absolute inset-0 rounded-2xl bg-amber-400/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold">লিডারবোর্ড</h2>
        <p className="mt-2 text-muted-foreground">
          প্রতি সপ্তাহের টপ পারফর্মার
        </p>
      </motion.div>

      {/* Time Period Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        {timePeriods.map(period => (
          <motion.button
            key={period.id}
            onClick={() => setTimePeriod(period.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              timePeriod === period.id
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-card text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-border/50 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            {period.label}
          </motion.button>
        ))}
      </div>

      {/* Week Tabs + Subject Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Week Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {weeks.map(week => (
            <motion.button
              key={week}
              onClick={() => setSelectedWeek(week)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                selectedWeek === week
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
              }`}
            >
              {week}
            </motion.button>
          ))}
        </div>

        {/* Subject-wise Dropdown */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="বিষয় নির্বাচন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সকল বিষয়</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.nameBn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reward Tiers Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-border/50 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-gray-300 via-amber-600 to-emerald-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              পুরস্কার স্তর
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Gold Tier */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <span className="text-2xl">🥇</span>
                <div>
                  <p className="font-semibold text-sm text-amber-600 dark:text-amber-400">স্বর্ণ (Gold)</p>
                  <p className="text-xs text-muted-foreground">শীর্ষ ৩ - বিশেষ সার্টিফিকেট</p>
                </div>
              </div>
              {/* Silver Tier */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-400/10 to-gray-400/5 border border-gray-400/20">
                <span className="text-2xl">🥈</span>
                <div>
                  <p className="font-semibold text-sm text-gray-500 dark:text-gray-300">রৌপ্য (Silver)</p>
                  <p className="text-xs text-muted-foreground">শীর্ষ ১০ - ব্যাজ ও পয়েন্ট</p>
                </div>
              </div>
              {/* Bronze Tier */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-700/10 to-amber-700/5 border border-amber-700/20">
                <span className="text-2xl">🥉</span>
                <div>
                  <p className="font-semibold text-sm text-amber-700 dark:text-amber-500">কাংস্য (Bronze)</p>
                  <p className="text-xs text-muted-foreground">শীর্ষ ২০ - পয়েন্ট বোনাস</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User's Position Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-primary/30 bg-gradient-to-r from-emerald-500/5 via-primary/5 to-emerald-500/5 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20">
                    {userRank > 0 ? toBengaliNum(userRank) : '-'}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      আপনার অবস্থান: <span className="font-medium text-primary">#{userRank > 0 ? toBengaliNum(userRank) : '—'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {userScore > 0 ? toBengaliNum(userScore) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">পয়েন্ট</p>
                  </div>
                  <div className="text-center">
                    {userRankChange > 0 ? (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ArrowUp className="w-5 h-5" />
                        <span className="text-lg font-bold">{toBengaliNum(userRankChange)}</span>
                      </div>
                    ) : userRankChange < 0 ? (
                      <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <ArrowDown className="w-5 h-5" />
                        <span className="text-lg font-bold">{toBengaliNum(Math.abs(userRankChange))}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Minus className="w-5 h-5" />
                        <span className="text-lg font-bold">০</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">পরিবর্তন</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top 3 Podium - Enhanced */}
      {displayEntries.length >= 3 && (
        <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-center relative"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Medal className="w-5 h-5 text-gray-400" />
              <RankChangeIndicator change={displayEntries[1].rankChange} />
            </div>
            <div className="relative">
              <Avatar className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 ${getRankBorder(2)}`}>
                <AvatarFallback className={getAvatarBg(2)}>
                  {displayEntries[1].user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="font-semibold text-sm max-w-[80px] mx-auto truncate">{displayEntries[1].user.name}</p>
            <p className="text-xs text-muted-foreground font-medium">
              <AnimatedCounter value={displayEntries[1].score} duration={1.2} /> পয়েন্ট
            </p>
            <motion.div
              className="mt-3 w-24 sm:w-28 rounded-t-xl relative overflow-hidden"
              style={{ height: '80px' }}
              initial={{ height: 0 }}
              animate={{ height: '80px' }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-400/30 via-gray-400/20 to-gray-300/10" />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-300/20 to-gray-500/30" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-400/20 to-transparent" />
              <span className="relative text-2xl font-bold text-gray-400 flex items-center justify-center h-full">২</span>
            </motion.div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="text-center relative"
          >
            <SparkleEffect />
            <div className="flex items-center justify-center gap-1 mb-1">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Crown className="w-7 h-7 text-amber-500" />
              </motion.div>
              <RankChangeIndicator change={displayEntries[0].rankChange} />
            </div>
            <div className="relative">
              <Avatar className={`w-18 h-18 sm:w-20 sm:h-20 mx-auto mb-2 ${getRankBorder(1)}`}>
                <AvatarFallback className={getAvatarBg(1)}>
                  {displayEntries[0].user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ boxShadow: ['0 0 15px rgba(245,158,11,0.3)', '0 0 30px rgba(245,158,11,0.5)', '0 0 15px rgba(245,158,11,0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs mb-1 shadow-md shadow-amber-500/25">
              <Crown className="w-3 h-3 mr-1" />
              চ্যাম্পিয়ন
            </Badge>
            <p className="font-bold max-w-[90px] mx-auto truncate">{displayEntries[0].user.name}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
              <AnimatedCounter value={displayEntries[0].score} duration={1.5} /> পয়েন্ট
            </p>
            <motion.div
              className="mt-3 w-24 sm:w-28 rounded-t-xl relative overflow-hidden"
              style={{ height: '110px' }}
              initial={{ height: 0 }}
              animate={{ height: '110px' }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-amber-400/20 to-amber-300/10" />
              <div className="absolute inset-0 bg-gradient-to-b from-amber-300/20 to-amber-600/30" />
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-500/30 to-transparent" />
              <span className="relative text-3xl font-bold text-amber-500 flex items-center justify-center h-full">১</span>
            </motion.div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-center relative"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Medal className="w-5 h-5 text-amber-700" />
              <RankChangeIndicator change={displayEntries[2].rankChange} />
            </div>
            <div className="relative">
              <Avatar className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 ${getRankBorder(3)}`}>
                <AvatarFallback className={getAvatarBg(3)}>
                  {displayEntries[2].user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="font-semibold text-sm max-w-[80px] mx-auto truncate">{displayEntries[2].user.name}</p>
            <p className="text-xs text-muted-foreground font-medium">
              <AnimatedCounter value={displayEntries[2].score} duration={1} /> পয়েন্ট
            </p>
            <motion.div
              className="mt-3 w-24 sm:w-28 rounded-t-xl relative overflow-hidden"
              style={{ height: '64px' }}
              initial={{ height: 0 }}
              animate={{ height: '64px' }}
              transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-amber-700/30 via-amber-700/20 to-amber-600/10" />
              <div className="absolute inset-0 bg-gradient-to-b from-amber-600/15 to-amber-800/30" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-700/20 to-transparent" />
              <span className="relative text-2xl font-bold text-amber-700 flex items-center justify-center h-full">৩</span>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Full Rankings - Enhanced */}
      <Card className="border-border/50 shadow-lg shadow-emerald-500/5 overflow-hidden mb-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            সম্পূর্ণ র‍্যাংকিং
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {displayEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 sm:gap-4 p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    entry.rank === 1
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-400/40'
                      : entry.rank === 2
                      ? 'bg-gradient-to-r from-gray-400/10 via-gray-400/5 to-transparent border-gray-400/20 hover:border-gray-300/40'
                      : entry.rank === 3
                      ? 'bg-gradient-to-r from-amber-700/10 via-amber-700/5 to-transparent border-amber-700/20 hover:border-amber-600/40'
                      : 'bg-card border-border/50 hover:border-emerald-300/40 dark:hover:border-emerald-700/40'
                  }`}
                >
                  <div className="shrink-0 w-8 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className={`w-10 h-10 ${getRankBorder(entry.rank)}`}>
                    <AvatarFallback className={`text-sm ${getAvatarBg(entry.rank)}`}>
                      {entry.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{entry.user.name}</p>
                      <RankChangeIndicator change={entry.rankChange} />
                    </div>
                    <div className="mt-1">
                      <ScoreBar score={entry.score} maxScore={maxScore} rank={entry.rank} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">
                      <AnimatedCounter value={entry.score} duration={1} />
                    </p>
                    <p className="text-xs text-muted-foreground">পয়েন্ট</p>
                    {index > 0 && getScoreDiff(index) && (
                      <p className="text-[10px] text-muted-foreground/70 flex items-center justify-end gap-0.5 mt-0.5">
                        <ChevronUp className="w-2.5 h-2.5 rotate-180" />
                        {getScoreDiff(index)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Weekly Progress Chart */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WeeklyProgressChart weeklyScores={weeklyProgressData} />
        </motion.div>
      )}
    </div>
  );
}
