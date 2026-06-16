'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Languages, Calculator, Atom,
  FlaskConical, Leaf, Monitor, Globe, Target, TrendingUp,
  Lightbulb, Award, ChevronRight, ChevronLeft, Sparkles,
  CheckCircle2, Rocket, Heart, Star
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Data ───────────────────────────────────────────────

const SUBJECTS = [
  { id: 'bangla', label: 'বাংলা', icon: BookOpen, color: 'from-emerald-400 to-emerald-600' },
  { id: 'english', label: 'ইংরেজি', icon: Languages, color: 'from-teal-400 to-teal-600' },
  { id: 'math', label: 'গণিত', icon: Calculator, color: 'from-green-400 to-green-600' },
  { id: 'physics', label: 'পদার্থবিজ্ঞান', icon: Atom, color: 'from-lime-400 to-lime-600' },
  { id: 'chemistry', label: 'রসায়ন', icon: FlaskConical, color: 'from-emerald-500 to-teal-500' },
  { id: 'biology', label: 'জীববিজ্ঞান', icon: Leaf, color: 'from-green-500 to-emerald-500' },
  { id: 'ict', label: 'তথ্য ও যোগাযোগ প্রযুক্তি', icon: Monitor, color: 'from-teal-500 to-green-500' },
  { id: 'bd-world', label: 'বাংলাদেশ ও বিশ্বপরিচয়', icon: Globe, color: 'from-lime-500 to-emerald-600' },
] as const;

const GOALS = [
  { id: 'exam', label: 'পরীক্ষায় ভালো করা', icon: Target, desc: 'সিলেবাস অনুযায়ী প্রস্তুতি নিন' },
  { id: 'weak', label: 'দুর্বল বিষয় শক্তিশালী করা', icon: TrendingUp, desc: 'যে বিষয়ে কঠিন, সেটা সহজ করুন' },
  { id: 'new', label: 'নতুন বিষয় শেখা', icon: Lightbulb, desc: 'নতুন বিষয়ে জ্ঞান অর্জন করুন' },
  { id: 'competitive', label: 'প্রতিযোগিতামূলক পরীক্ষার প্রস্তুতি', icon: Award, desc: 'বোর্ড ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি' },
] as const;

// Guardian-specific goals
const GUARDIAN_GOALS = [
  { id: 'track-progress', label: 'সন্তানের অগ্রগতি ট্র্যাক করা', icon: TrendingUp, desc: 'পড়াশোনার অগ্রগতি নিয়মিত দেখুন' },
  { id: 'exam-results', label: 'পরীক্ষার ফলাফল দেখা', icon: Target, desc: 'পরীক্ষার রেজাল্ট ও রিপোর্ট কার্ড' },
  { id: 'teacher-contact', label: 'শিক্ষকের সাথে যোগাযোগ', icon: Lightbulb, desc: 'সরাসরি শিক্ষকের সাথে কথা বলুন' },
  { id: 'fee-payment', label: 'ফি প্রদান ও সাবস্ক্রিপশন', icon: Award, desc: 'অনলাইনে ফি প্রদান করুন' },
] as const;

const STUDENT_TOTAL_STEPS = 4;
const GUARDIAN_TOTAL_STEPS = 3;
const ADMIN_TOTAL_STEPS = 2;

// ─── Slide variants ────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
};

const slideTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// ─── Component ─────────────────────────────────────────

interface WelcomeOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WelcomeOnboarding({ open, onOpenChange }: WelcomeOnboardingProps) {
  const { user, setActiveSection } = useStudyHub();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());

  const userRole = user?.role || 'student';
  const isGuardian = userRole === 'guardian';
  const isAdmin = userRole === 'admin' || userRole === 'teacher';
  const isStudent = userRole === 'student';

  const totalSteps = isGuardian ? GUARDIAN_TOTAL_STEPS : isAdmin ? ADMIN_TOTAL_STEPS : STUDENT_TOTAL_STEPS;

  const userName = user?.name?.split(' ')[0] || (isGuardian ? 'অভিভাবক' : isAdmin ? 'শিক্ষক' : 'শিক্ষার্থী');
  const roleGreeting = isGuardian ? 'অভিভাবক পোর্টালে' : isAdmin ? 'অ্যাডমিন প্যানেলে' : 'স্টাডি হাবে';

  const progress = (step / totalSteps) * 100;

  // ─── Handlers ──────────────────────────────────────────

  const goNext = useCallback(() => {
    if (step < totalSteps) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, totalSteps]);

  const goPrev = useCallback(() => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const toggleSubject = useCallback((id: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleGoal = useCallback((id: string) => {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleComplete = useCallback(() => {
    localStorage.setItem('studyhub_onboarding_done', 'true');
    onOpenChange(false);
    // Route to correct dashboard based on role
    if (user?.role === 'admin' || user?.role === 'teacher') {
      setActiveSection('admin');
    } else if (user?.role === 'guardian') {
      setActiveSection('guardian');
    } else {
      setActiveSection('dashboard');
    }
  }, [onOpenChange, setActiveSection, user]);

  // For students: step 2 = subjects, step 3 = goals
  // For guardians: step 2 = goals (no subject selection)
  // For admins: no selection steps
  const canProceed = (() => {
    if (isAdmin) return true;
    if (isGuardian) {
      return step === 2 ? selectedGoals.size > 0 : true;
    }
    // Student
    return step === 2 ? selectedSubjects.size > 0 : step === 3 ? selectedGoals.size > 0 : true;
  })();

  // ─── Step Renderers ────────────────────────────────────

  const renderStep1 = () => {
    // Role-specific feature highlights
    const studentFeatures = [
      { icon: BookOpen, text: 'নোটস' },
      { icon: Atom, text: 'ভিডিও' },
      { icon: Target, text: 'পরীক্ষা' },
      { icon: Lightbulb, text: 'AI শিক্ষক' },
    ];
    const guardianFeatures = [
      { icon: TrendingUp, text: 'অগ্রগতি' },
      { icon: Target, text: 'ফলাফল' },
      { icon: Lightbulb, text: 'যোগাযোগ' },
      { icon: Award, text: 'রিপোর্ট' },
    ];
    const adminFeatures = [
      { icon: BookOpen, text: 'কন্টেন্ট' },
      { icon: TrendingUp, text: 'বিশ্লেষণ' },
      { icon: Target, text: 'ব্যবহারকারী' },
      { icon: Lightbulb, text: 'নোটিশ' },
    ];
    const features = isGuardian ? guardianFeatures : isAdmin ? adminFeatures : studentFeatures;

    // Role-specific descriptions
    const descriptions: Record<string, string> = {
      student: 'ক্লাস ৯-১০ এর জন্য সবচেয়ে সম্পূর্ণ শিক্ষা প্ল্যাটফর্ম। নোট, ভিডিও, পরীক্ষা এবং আরও অনেক কিছু এক জায়গায়।',
      guardian: 'আপনার সন্তানের পড়াশোনার অগ্রগতি, পরীক্ষার ফলাফল, রিপোর্ট কার্ড এবং শিক্ষকের সাথে যোগাযোগ — সব এক জায়গায়।',
      admin: 'কন্টেন্ট ম্যানেজমেন্ট, শিক্ষার্থী বিশ্লেষণ, নোটিশ প্রকাশ এবং প্ল্যাটফর্ম পরিচালনা — সব এক জায়গায়।',
    };
    const desc = descriptions[isGuardian ? 'guardian' : isAdmin ? 'admin' : 'student'];

    // Role-specific gradient colors
    const gradientColors = isGuardian
      ? 'from-amber-400 to-orange-600'
      : isAdmin
      ? 'from-violet-400 to-purple-600'
      : 'from-emerald-400 to-emerald-600';

    return (
      <div className="flex flex-col items-center text-center py-4 sm:py-6">
        {/* Animated illustration */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center shadow-xl ${isGuardian ? 'shadow-amber-500/30' : isAdmin ? 'shadow-violet-500/30' : 'shadow-emerald-500/30'}`}>
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <GraduationCap className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
            </motion.div>
          </div>
          {/* Floating sparkles */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-3"
            animate={{ scale: [1, 1.2, 1], y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="w-5 h-5 text-emerald-300" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className={`bg-gradient-to-r ${isGuardian ? 'from-amber-500 to-orange-700' : isAdmin ? 'from-violet-500 to-purple-700' : 'from-emerald-500 to-emerald-700'} bg-clip-text text-transparent`}>স্বাগতম!</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-2">
            <span className="font-semibold text-foreground">{userName}</span>, {roleGreeting} আপনাকে স্বাগতম
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {desc}
          </p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {features.map((feature) => (
            <Badge
              key={feature.text}
              variant="secondary"
              className={`gap-1.5 px-3 py-1.5 text-xs ${isGuardian ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800' : isAdmin ? 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-violet-200 dark:border-violet-800' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'}`}
            >
              <feature.icon className="w-3.5 h-3.5" />
              {feature.text}
            </Badge>
          ))}
        </motion.div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="py-4 sm:py-6">
      <div className="text-center mb-6">
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 mb-3"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <h3 className="text-xl sm:text-2xl font-bold mb-1">আপনার বিষয় বেছে নিন</h3>
        <p className="text-sm text-muted-foreground">আপনি কোন কোন বিষয়ে পড়তে চান? (কমপক্ষে ১টি নির্বাচন করুন)</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUBJECTS.map((subject, i) => {
          const Icon = subject.icon;
          const isSelected = selectedSubjects.has(subject.id);
          return (
            <motion.button
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleSubject(subject.id)}
              className={`relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 group ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-md shadow-emerald-500/10'
                  : 'border-border hover:border-emerald-300 dark:hover:border-emerald-700 bg-card hover:bg-accent/50'
              }`}
            >
              {isSelected && (
                <motion.div
                  className="absolute -top-1.5 -right-1.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500 stroke-white" />
                </motion.div>
              )}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-110`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className={`text-xs sm:text-sm font-medium text-center leading-tight ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'}`}>
                {subject.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selectedSubjects.size > 0 && (
        <motion.p
          className="text-center text-sm text-emerald-600 dark:text-emerald-400 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle2 className="w-4 h-4 inline mr-1" />
          {selectedSubjects.size}টি বিষয় নির্বাচিত
        </motion.p>
      )}
    </div>
  );

  const renderStep3 = () => {
    // Guardians get different goals
    const goals = isGuardian ? GUARDIAN_GOALS : GOALS;
    const stepTitle = isGuardian ? 'আপনার প্রয়োজন বেছে নিন' : 'আপনার লক্ষ্য বেছে নিন';
    const stepDesc = isGuardian ? 'অভিভাবক হিসেবে আপনি কী কী করতে চান? (কমপক্ষে ১টি নির্বাচন করুন)' : 'পড়াশোনার মূল লক্ষ্য কী? (কমপক্ষে ১টি নির্বাচন করুন)';
    const accentColor = isGuardian ? 'amber' : 'emerald';

    return (
      <div className="py-4 sm:py-6">
        <div className="text-center mb-6">
          <motion.div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${isGuardian ? 'bg-amber-100 dark:bg-amber-950' : 'bg-emerald-100 dark:bg-emerald-950'} mb-3`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Target className={`w-7 h-7 ${isGuardian ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
          </motion.div>
          <h3 className="text-xl sm:text-2xl font-bold mb-1">{stepTitle}</h3>
          <p className="text-sm text-muted-foreground">{stepDesc}</p>
        </div>

        <div className="grid gap-3">
          {goals.map((goal, i) => {
            const Icon = goal.icon;
            const isSelected = selectedGoals.has(goal.id);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => toggleGoal(goal.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGoal(goal.id); } }}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                  isSelected
                    ? isGuardian
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 shadow-md shadow-amber-500/10'
                      : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-md shadow-emerald-500/10'
                    : 'border-border hover:border-emerald-300 dark:hover:border-emerald-700 bg-card hover:bg-accent/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? isGuardian
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-500 text-white'
                    : isGuardian
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm sm:text-base ${isSelected ? (isGuardian ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300') : 'text-foreground'}`}>
                    {goal.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{goal.desc}</p>
                </div>
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={isSelected}
                    className={`pointer-events-none ${isSelected ? isGuardian ? 'data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500' : 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500' : ''}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {selectedGoals.size > 0 && (
          <motion.p
            className={`text-center text-sm mt-4 ${isGuardian ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CheckCircle2 className="w-4 h-4 inline mr-1" />
            {selectedGoals.size}টি লক্ষ্য নির্বাচিত
          </motion.p>
        )}
      </div>
    );
  };

  const renderFinalStep = () => {
    const subjectNames = isStudent ? SUBJECTS
      .filter((s) => selectedSubjects.has(s.id))
      .map((s) => s.label) : [];
    const goalNames = (isGuardian ? GUARDIAN_GOALS : GOALS)
      .filter((g) => selectedGoals.has(g.id))
      .map((g) => g.label);

    const completionMessage = isGuardian
      ? 'আপনার পছন্দ অনুযায়ী সবকিছু সাজিয়ে নিচ্ছি। এবার সন্তানের অগ্রগতি দেখুন!'
      : isAdmin
      ? 'অ্যাডমিন প্যানেলে আপনাকে স্বাগতম। প্ল্যাটফর্ম পরিচালনা শুরু করুন!'
      : 'আপনার পছন্দ অনুযায়ী সবকিছু সাজিয়ে নিচ্ছি। এবার পড়াশোনা শুরু করুন!';

    const gradientColors = isGuardian
      ? 'from-amber-400 via-orange-500 to-amber-600'
      : isAdmin
      ? 'from-violet-400 via-purple-500 to-violet-600'
      : 'from-emerald-400 via-green-500 to-teal-600';

    const accentBg = isGuardian
      ? 'border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30'
      : isAdmin
      ? 'border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/80 to-purple-50/80 dark:from-violet-950/30 dark:to-purple-950/30'
      : 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30';

    const accentText = isGuardian ? 'text-amber-600 dark:text-amber-400' : isAdmin ? 'text-violet-600 dark:text-violet-400' : 'text-emerald-600 dark:text-emerald-400';

    return (
      <div className="flex flex-col items-center text-center py-4 sm:py-6">
        {/* Celebration animation */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center shadow-xl ${isGuardian ? 'shadow-amber-500/30' : isAdmin ? 'shadow-violet-500/30' : 'shadow-emerald-500/30'}`}>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Rocket className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
            </motion.div>
          </div>
          {/* Floating celebrations */}
          <motion.div
            className="absolute -top-3 -left-3"
            animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            <Heart className="w-6 h-6 text-red-400 fill-red-400" />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-4"
            animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
          >
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-5"
            animate={{ y: [0, -5, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
          >
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className={`bg-gradient-to-r ${isGuardian ? 'from-amber-500 to-orange-600' : isAdmin ? 'from-violet-500 to-purple-600' : 'from-emerald-500 to-teal-600'} bg-clip-text text-transparent`}>
              চমৎকার, {userName}!
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {completionMessage}
          </p>
        </motion.div>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <Card className={`${accentBg} backdrop-blur-sm`}>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Selected subjects - only for students */}
              {isStudent && subjectNames.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold ${accentText} uppercase tracking-wide mb-2`}>
                    নির্বাচিত বিষয়
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {subjectNames.map((name) => (
                      <Badge
                        key={name}
                        className={`${isGuardian ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-700' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'} text-xs`}
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* Selected goals */}
              {goalNames.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold ${accentText} uppercase tracking-wide mb-2`}>
                    {isGuardian ? 'প্রয়োজনীয়তা' : 'লক্ষ্যসমূহ'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {goalNames.map((name) => (
                      <Badge
                        key={name}
                        variant="outline"
                        className={`${isGuardian ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300' : 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300'} text-xs`}
                      >
                        <Target className="w-3 h-3 mr-1" />
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg p-0 overflow-hidden border-emerald-200/50 dark:border-emerald-800/50"
      >
        <DialogTitle className="sr-only">স্বাগতম উইজার্ড</DialogTitle>
        <DialogDescription className="sr-only">স্টাডি হাবে আপনার পছন্দ সেট করুন</DialogDescription>
        {/* Progress bar */}
        <div className="relative">
          <Progress
            value={progress}
            className="h-1.5 rounded-none bg-emerald-100 dark:bg-emerald-950"
          />
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-none transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-4 px-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <React.Fragment key={s}>
              <motion.div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors duration-300 ${
                  s < step
                    ? 'bg-emerald-500 text-white'
                    : s === step
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-muted text-muted-foreground'
                }`}
                animate={s === step ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </motion.div>
              {s < totalSteps && (
                <div className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${
                  s < step ? 'bg-emerald-500' : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step title */}
        <div className="px-6 pt-2 pb-0 text-center">
          <p className="text-xs text-muted-foreground">
            ধাপ {step} / {totalSteps}
          </p>
        </div>

        {/* Animated step content */}
        <div className="px-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              {step === 1 && renderStep1()}
              {isStudent && step === 2 && renderStep2()}
              {((isStudent && step === 3) || (isGuardian && step === 2)) && renderStep3()}
              {((isStudent && step === 4) || (isGuardian && step === 3) || (isAdmin && step === 2)) && renderFinalStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={step === 1}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            পেছনে
          </Button>

          {step < totalSteps ? (
            <Button
              size="sm"
              onClick={goNext}
              disabled={!canProceed}
              className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/25 disabled:opacity-50 disabled:shadow-none"
            >
              পরবর্তী
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleComplete}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
            >
              <Rocket className="w-4 h-4" />
              পড়াশোনা শুরু করুন
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
