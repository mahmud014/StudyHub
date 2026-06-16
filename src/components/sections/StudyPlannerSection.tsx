'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarPlus, Clock, BookOpen, Trash2, CheckCircle2,
  TrendingUp, Target, Zap, Award, BarChart3,
  ChevronLeft, ChevronRight, Plus, Sparkles,
  FileText, Video, ClipboardCheck, RotateCcw, PenTool,
  Star, Flame, X, LogIn, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Helper: Convert digits to Bengali numerals ─────────────────────────────
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: 'bangla', name: 'বাংলা', color: 'rose', bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-700', ring: 'ring-rose-200 dark:ring-rose-800' },
  { id: 'english', name: 'ইংরেজি', color: 'sky', bg: 'bg-sky-100 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-700', ring: 'ring-sky-200 dark:ring-sky-800' },
  { id: 'math', name: 'গণিত', color: 'amber', bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700', ring: 'ring-amber-200 dark:ring-amber-800' },
  { id: 'physics', name: 'পদার্থবিজ্ঞান', color: 'violet', bg: 'bg-violet-100 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-300 dark:border-violet-700', ring: 'ring-violet-200 dark:ring-violet-800' },
  { id: 'chemistry', name: 'রসায়ন', color: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  { id: 'biology', name: 'জীববিজ্ঞান', color: 'lime', bg: 'bg-lime-100 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-300 dark:border-lime-700', ring: 'ring-lime-200 dark:ring-lime-800' },
  { id: 'ict', name: 'আইসিটি', color: 'cyan', bg: 'bg-cyan-100 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-300 dark:border-cyan-700', ring: 'ring-cyan-200 dark:ring-cyan-800' },
  { id: 'bgs', name: 'বাংলাদেশ ও বিশ্বপরিচয়', color: 'orange', bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700', ring: 'ring-orange-200 dark:ring-orange-800' },
] as const;

const DAYS = [
  { id: 'saturday', name: 'শনিবার', short: 'শনি' },
  { id: 'sunday', name: 'রবিবার', short: 'রবি' },
  { id: 'monday', name: 'সোমবার', short: 'সোম' },
  { id: 'tuesday', name: 'মঙ্গলবার', short: 'মঙ্গল' },
  { id: 'wednesday', name: 'বুধবার', short: 'বুধ' },
  { id: 'thursday', name: 'বৃহস্পতিবার', short: 'বৃহঃ' },
  { id: 'friday', name: 'শুক্রবার', short: 'শুক্র' },
] as const;

const STUDY_TYPES = [
  { id: 'notes', name: 'নোটস পড়া', icon: FileText },
  { id: 'video', name: 'ভিডিও দেখা', icon: Video },
  { id: 'exam', name: 'পরীক্ষা দেওয়া', icon: ClipboardCheck },
  { id: 'revision', name: 'রিভিশন', icon: RotateCcw },
  { id: 'assignment', name: 'অ্যাসাইনমেন্ট', icon: PenTool },
] as const;

const PRIORITIES = [
  { id: 'high', name: 'উচ্চ', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/40' },
  { id: 'medium', name: 'মাঝারি', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/40' },
  { id: 'low', name: 'নিম্ন', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
] as const;

// Time slots: 6:00 AM to 10:00 PM (every hour)
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6;
  return {
    hour,
    label12: hour < 12 ? `${hour}:০০ AM` : hour === 12 ? '১২:০০ PM' : `${hour - 12}:০০ PM`,
    labelBn: `${toBengaliNum(hour)}:০০`,
  };
});

// ─── Types ──────────────────────────────────────────────────────────────────

interface StudyBlock {
  id: string;
  subjectId: string;
  dayId: string;
  startHour: number;
  endHour: number;
  studyType: string;
  priority: string;
  notes: string;
  completed: boolean;
}

interface StudyTemplate {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  blocks: Omit<StudyBlock, 'id' | 'completed'>[];
}

// ─── Templates ──────────────────────────────────────────────────────────────

const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    id: 'balanced',
    nameBn: 'ভারসাম্যমূলক প্ল্যান',
    name: 'Balanced Plan',
    description: 'সকল বিষয়ে সমান সময় বরাদ্দ',
    icon: Target,
    gradient: 'from-emerald-500 to-teal-600',
    blocks: [
      { subjectId: 'bangla', dayId: 'saturday', startHour: 7, endHour: 9, studyType: 'notes', priority: 'medium', notes: '' },
      { subjectId: 'english', dayId: 'saturday', startHour: 9, endHour: 11, studyType: 'notes', priority: 'medium', notes: '' },
      { subjectId: 'math', dayId: 'sunday', startHour: 7, endHour: 10, studyType: 'notes', priority: 'high', notes: '' },
      { subjectId: 'physics', dayId: 'sunday', startHour: 10, endHour: 12, studyType: 'video', priority: 'medium', notes: '' },
      { subjectId: 'chemistry', dayId: 'monday', startHour: 7, endHour: 9, studyType: 'notes', priority: 'medium', notes: '' },
      { subjectId: 'biology', dayId: 'monday', startHour: 9, endHour: 11, studyType: 'video', priority: 'medium', notes: '' },
      { subjectId: 'ict', dayId: 'tuesday', startHour: 7, endHour: 9, studyType: 'notes', priority: 'low', notes: '' },
      { subjectId: 'bgs', dayId: 'tuesday', startHour: 9, endHour: 11, studyType: 'revision', priority: 'low', notes: '' },
      { subjectId: 'bangla', dayId: 'wednesday', startHour: 7, endHour: 9, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'english', dayId: 'wednesday', startHour: 9, endHour: 11, studyType: 'assignment', priority: 'medium', notes: '' },
      { subjectId: 'math', dayId: 'thursday', startHour: 7, endHour: 10, studyType: 'exam', priority: 'high', notes: '' },
      { subjectId: 'physics', dayId: 'thursday', startHour: 10, endHour: 12, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'chemistry', dayId: 'friday', startHour: 8, endHour: 10, studyType: 'video', priority: 'medium', notes: '' },
      { subjectId: 'biology', dayId: 'friday', startHour: 10, endHour: 12, studyType: 'revision', priority: 'low', notes: '' },
    ],
  },
  {
    id: 'exam',
    nameBn: 'পরীক্ষার প্রস্তুতি',
    name: 'Exam Prep',
    description: 'দুর্বল বিষয়ে বেশি ফোকাস',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-600',
    blocks: [
      { subjectId: 'math', dayId: 'saturday', startHour: 6, endHour: 10, studyType: 'exam', priority: 'high', notes: 'গণিত - অধ্যায় ১-৫' },
      { subjectId: 'physics', dayId: 'saturday', startHour: 10, endHour: 12, studyType: 'revision', priority: 'high', notes: '' },
      { subjectId: 'math', dayId: 'sunday', startHour: 6, endHour: 10, studyType: 'notes', priority: 'high', notes: '' },
      { subjectId: 'chemistry', dayId: 'sunday', startHour: 10, endHour: 12, studyType: 'video', priority: 'high', notes: '' },
      { subjectId: 'physics', dayId: 'monday', startHour: 6, endHour: 10, studyType: 'exam', priority: 'high', notes: '' },
      { subjectId: 'math', dayId: 'monday', startHour: 10, endHour: 12, studyType: 'revision', priority: 'high', notes: '' },
      { subjectId: 'chemistry', dayId: 'tuesday', startHour: 6, endHour: 10, studyType: 'exam', priority: 'high', notes: '' },
      { subjectId: 'english', dayId: 'tuesday', startHour: 10, endHour: 12, studyType: 'notes', priority: 'medium', notes: '' },
      { subjectId: 'bangla', dayId: 'wednesday', startHour: 6, endHour: 9, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'math', dayId: 'wednesday', startHour: 9, endHour: 12, studyType: 'exam', priority: 'high', notes: '' },
      { subjectId: 'biology', dayId: 'thursday', startHour: 6, endHour: 9, studyType: 'notes', priority: 'medium', notes: '' },
      { subjectId: 'ict', dayId: 'thursday', startHour: 9, endHour: 12, studyType: 'revision', priority: 'low', notes: '' },
      { subjectId: 'bgs', dayId: 'friday', startHour: 8, endHour: 11, studyType: 'revision', priority: 'low', notes: '' },
    ],
  },
  {
    id: 'revision',
    nameBn: 'দ্রুত রিভিশন',
    name: 'Quick Revision',
    description: 'ছোট ছোট সেশনে রিভিশন',
    icon: RotateCcw,
    gradient: 'from-violet-500 to-purple-600',
    blocks: [
      { subjectId: 'bangla', dayId: 'saturday', startHour: 7, endHour: 8, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'english', dayId: 'saturday', startHour: 8, endHour: 9, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'math', dayId: 'saturday', startHour: 9, endHour: 10, studyType: 'revision', priority: 'high', notes: '' },
      { subjectId: 'physics', dayId: 'sunday', startHour: 7, endHour: 8, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'chemistry', dayId: 'sunday', startHour: 8, endHour: 9, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'biology', dayId: 'sunday', startHour: 9, endHour: 10, studyType: 'revision', priority: 'low', notes: '' },
      { subjectId: 'ict', dayId: 'monday', startHour: 7, endHour: 8, studyType: 'revision', priority: 'low', notes: '' },
      { subjectId: 'bgs', dayId: 'monday', startHour: 8, endHour: 9, studyType: 'revision', priority: 'low', notes: '' },
      { subjectId: 'bangla', dayId: 'tuesday', startHour: 7, endHour: 8, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'math', dayId: 'tuesday', startHour: 8, endHour: 9, studyType: 'revision', priority: 'high', notes: '' },
      { subjectId: 'english', dayId: 'wednesday', startHour: 7, endHour: 8, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'physics', dayId: 'wednesday', startHour: 8, endHour: 9, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'chemistry', dayId: 'thursday', startHour: 7, endHour: 8, studyType: 'revision', priority: 'medium', notes: '' },
      { subjectId: 'biology', dayId: 'thursday', startHour: 8, endHour: 9, studyType: 'revision', priority: 'low', notes: '' },
      { subjectId: 'math', dayId: 'friday', startHour: 8, endHour: 10, studyType: 'revision', priority: 'high', notes: '' },
    ],
  },
];

// ─── Animation variants ─────────────────────────────────────────────────────

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

const blockVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

// ─── Utility ────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getSubjectById(id: string) {
  return SUBJECTS.find(s => s.id === id);
}

function getDayById(id: string) {
  return DAYS.find(d => d.id === id);
}

function getStudyTypeById(id: string) {
  return STUDY_TYPES.find(t => t.id === id);
}

function getPriorityById(id: string) {
  return PRIORITIES.find(p => p.id === id);
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

// Subject chip/badge
function SubjectChip({ subjectId, size = 'sm' }: { subjectId: string; size?: 'sm' | 'xs' }) {
  const subject = getSubjectById(subjectId);
  if (!subject) return null;
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${subject.bg} ${subject.text} ${subject.border} border ${sizeClass}`}>
      {subject.name}
    </span>
  );
}

// Priority dot indicator
function PriorityDot({ priorityId }: { priorityId: string }) {
  const priority = getPriorityById(priorityId);
  if (!priority) return null;
  const dotColor = priorityId === 'high' ? 'bg-red-500' : priorityId === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} title={priority.name} />
  );
}

// Empty state illustration (CSS art)
function EmptyStateIllustration() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <div className="relative w-24 h-24 mb-4">
        {/* Calendar CSS art */}
        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20" />
        <div className="absolute top-0 left-0 right-0 h-6 rounded-t-xl bg-emerald-200 dark:bg-emerald-800/50" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-1 h-3 bg-emerald-400 dark:bg-emerald-600 rounded-full" />
          <div className="w-1 h-3 bg-emerald-400 dark:bg-emerald-600 rounded-full" />
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-emerald-400 dark:text-emerald-600">
          <CalendarPlus className="w-8 h-8" />
        </div>
      </div>
      <p className="text-sm font-medium">কোনো স্টাডি ব্লক নেই</p>
      <p className="text-xs mt-1">নতুন ব্লক যোগ করুন বা টেমপ্লেট ব্যবহার করুন</p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function StudyPlannerSection() {
  const { user } = useStudyHub();

  // State
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [planId, setPlanId] = useState<string | null>(null); // DB plan ID for updates
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0].id);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form state for add dialog
  const [formSubject, setFormSubject] = useState('');
  const [formDay, setFormDay] = useState('');
  const [formStartHour, setFormStartHour] = useState('7');
  const [formEndHour, setFormEndHour] = useState('9');
  const [formStudyType, setFormStudyType] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [formNotes, setFormNotes] = useState('');

  // ─── Fetch plans from API on mount ────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      // Not logged in — try loading from localStorage as fallback
      try {
        const saved = localStorage.getItem('studyhub_planner_blocks');
        if (saved) setStudyBlocks(JSON.parse(saved));
      } catch { /* ignore */ }
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/study-plans?userId=${user.id}`);
        const json = await res.json();
        if (cancelled) return;

        if (json.success && json.data && json.data.length > 0) {
          // Use the most recent plan
          const latestPlan = json.data[0];
          setPlanId(latestPlan.id);
          try {
            const parsed = JSON.parse(latestPlan.data);
            if (Array.isArray(parsed)) {
              setStudyBlocks(parsed);
              // Cache to localStorage
              localStorage.setItem('studyhub_planner_blocks', JSON.stringify(parsed));
            }
          } catch { /* ignore corrupt JSON */ }
        } else {
          // No plan in DB — try localStorage cache
          try {
            const saved = localStorage.getItem('studyhub_planner_blocks');
            if (saved) setStudyBlocks(JSON.parse(saved));
          } catch { /* ignore */ }
        }
      } catch {
        // API failed — fall back to localStorage
        try {
          const saved = localStorage.getItem('studyhub_planner_blocks');
          if (saved) setStudyBlocks(JSON.parse(saved));
        } catch { /* ignore */ }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  // ─── Save to API helper ──────────────────────────────────────────────────
  const saveToAPI = useCallback(async (blocks: StudyBlock[]) => {
    if (!user) return; // Not logged in — only localStorage
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (planId) {
        // Update existing plan
        await fetch('/api/study-plans', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: planId,
            title: 'Weekly Planner',
            data: blocks,
          }),
        });
      } else {
        // Create new plan
        const res = await fetch('/api/study-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            title: 'Weekly Planner',
            data: blocks,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setPlanId(json.data.id);
        }
      }
    } catch { /* silently fail — localStorage is the fallback */ } finally {
      setIsSaving(false);
    }
  }, [user, planId, isSaving]);

  // ─── Persist study blocks to localStorage (always) ──────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('studyhub_planner_blocks', JSON.stringify(studyBlocks));
    } catch { /* ignore */ }
  }, [studyBlocks]);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get current day and hour
  const currentDayId = useMemo(() => {
    const jsDay = currentTime.getDay(); // 0=Sun
    const mapping: Record<number, string> = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
    return mapping[jsDay] || 'saturday';
  }, [currentTime]);

  const currentHour = currentTime.getHours();

  // ─── Computed values ────────────────────────────────────────────────────

  const weekBlocks = useMemo(() => {
    return studyBlocks.filter(b => b.dayId === selectedDay);
  }, [studyBlocks, selectedDay]);

  const todayBlocks = useMemo(() => {
    return studyBlocks
      .filter(b => b.dayId === currentDayId)
      .sort((a, b) => a.startHour - b.startHour);
  }, [studyBlocks, currentDayId]);

  const stats = useMemo(() => {
    const totalPlannedHours = studyBlocks.reduce((sum, b) => sum + (b.endHour - b.startHour), 0);
    const completedHours = studyBlocks.filter(b => b.completed).reduce((sum, b) => sum + (b.endHour - b.startHour), 0);
    
    // Most studied subject
    const subjectHours: Record<string, number> = {};
    studyBlocks.forEach(b => {
      subjectHours[b.subjectId] = (subjectHours[b.subjectId] || 0) + (b.endHour - b.startHour);
    });
    const mostStudiedId = Object.entries(subjectHours).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const mostStudied = getSubjectById(mostStudiedId);

    // Consistency: how many unique days have blocks
    const activeDays = new Set(studyBlocks.map(b => b.dayId)).size;
    const consistency = Math.round((activeDays / 7) * 100);

    return { totalPlannedHours, completedHours, mostStudied, consistency };
  }, [studyBlocks]);

  const todayProgress = useMemo(() => {
    if (todayBlocks.length === 0) return 0;
    const completed = todayBlocks.filter(b => b.completed).length;
    return Math.round((completed / todayBlocks.length) * 100);
  }, [todayBlocks]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setFormSubject('');
    setFormDay(selectedDay);
    setFormStartHour('7');
    setFormEndHour('9');
    setFormStudyType('');
    setFormPriority('medium');
    setFormNotes('');
  }, [selectedDay]);

  const addStudyBlock = useCallback(() => {
    if (!formSubject || !formDay || !formStudyType) return;
    const start = parseInt(formStartHour);
    const end = parseInt(formEndHour);
    if (end <= start) return;

    const newBlock: StudyBlock = {
      id: generateId(),
      subjectId: formSubject,
      dayId: formDay,
      startHour: start,
      endHour: end,
      studyType: formStudyType,
      priority: formPriority,
      notes: formNotes,
      completed: false,
    };
    const updated = [...studyBlocks, newBlock];
    setStudyBlocks(updated);
    saveToAPI(updated);
    setDialogOpen(false);
    resetForm();
  }, [formSubject, formDay, formStartHour, formEndHour, formStudyType, formPriority, formNotes, resetForm, studyBlocks, saveToAPI]);

  const removeBlock = useCallback((id: string) => {
    setStudyBlocks(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveToAPI(updated);
      return updated;
    });
  }, [saveToAPI]);

  const toggleComplete = useCallback((id: string) => {
    setStudyBlocks(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b);
      saveToAPI(updated);
      return updated;
    });
  }, [saveToAPI]);

  const applyTemplate = useCallback((template: StudyTemplate) => {
    const newBlocks: StudyBlock[] = template.blocks.map(b => ({
      ...b,
      id: generateId(),
      completed: false,
    }));
    setStudyBlocks(newBlocks);
    saveToAPI(newBlocks);
    setTemplateDialogOpen(false);
  }, [saveToAPI]);

  // ─── Get blocks for a specific day and hour ────────────────────────────

  const getBlocksForSlot = useCallback((dayId: string, hour: number) => {
    return studyBlocks.filter(b => b.dayId === dayId && b.startHour <= hour && b.endHour > hour);
  }, [studyBlocks]);

  // ─── Today's upcoming/completed tasks ──────────────────────────────────

  const upcomingTasks = useMemo(() => {
    return todayBlocks.filter(b => !b.completed && b.startHour >= currentHour);
  }, [todayBlocks, currentHour]);

  const completedTasks = useMemo(() => {
    return todayBlocks.filter(b => b.completed);
  }, [todayBlocks]);

  // ─── Time options for selects ──────────────────────────────────────────

  const timeOptions = useMemo(() => {
    return Array.from({ length: 17 }, (_, i) => {
      const h = i + 6;
      const label = h < 12 ? `${toBengaliNum(h)}:০০ AM` : h === 12 ? '১২:০০ PM' : `${toBengaliNum(h - 12)}:০০ PM`;
      return { value: String(h), label };
    });
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20 py-6 px-4 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Login required */}
        {!user && (
          <motion.div variants={itemVariants}>
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <CardContent className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-4">
                  <LogIn className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-1">লগইন প্রয়োজন</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  স্টাডি প্ল্যানার ব্যবহার করতে এবং আপনার পরিকল্পনা সংরক্ষণ করতে অনুগ্রহ করে লগইন করুন।
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && user && (
          <motion.div variants={itemVariants}>
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="py-10 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">প্ল্যান লোড হচ্ছে...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main content — only show when not loading */}
        {!isLoading && (
        <>
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CalendarPlus className="w-8 h-8" />
              স্টাডি প্ল্যানার
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              আপনার পড়াশোনার সময়সূচী পরিকল্পনা করুন
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                  <Sparkles className="w-4 h-4 mr-2" />
                  টেমপ্লেট
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-emerald-200 dark:border-emerald-800">
                <DialogHeader>
                  <DialogTitle className="text-emerald-800 dark:text-emerald-300">স্টাডি টেমপ্লেট</DialogTitle>
                  <DialogDescription>প্রস্তুত প্ল্যান থেকে বেছে নিন বা কাস্টম প্ল্যান তৈরি করুন</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2 max-h-[60vh] overflow-y-auto">
                  {STUDY_TEMPLATES.map(template => {
                    const IconComp = template.icon;
                    return (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applyTemplate(template)}
                        className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white dark:bg-gray-800/50 text-left transition-colors"
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center`}>
                          <IconComp className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">{template.nameBn}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            {toBengaliNum(template.blocks.length)}টি ব্লক • {toBengaliNum(template.blocks.reduce((s, b) => s + (b.endHour - b.startHour), 0))} ঘন্টা
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setTemplateDialogOpen(false);
                      setDialogOpen(true);
                      resetForm();
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">কাস্টম প্ল্যান</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">নিজে ব্লক তৈরি করুন</p>
                    </div>
                  </motion.button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  ব্লক যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-emerald-200 dark:border-emerald-800">
                <DialogHeader>
                  <DialogTitle className="text-emerald-800 dark:text-emerald-300">নতুন স্টাডি ব্লক</DialogTitle>
                  <DialogDescription>পড়াশোনার জন্য নতুন সময় ব্লক তৈরি করুন</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  {/* Subject */}
                  <div className="grid gap-2">
                    <Label className="text-emerald-700 dark:text-emerald-400">বিষয়</Label>
                    <Select value={formSubject} onValueChange={setFormSubject}>
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                        <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${s.bg}`} />
                              {s.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Day */}
                  <div className="grid gap-2">
                    <Label className="text-emerald-700 dark:text-emerald-400">দিন</Label>
                    <Select value={formDay} onValueChange={setFormDay}>
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                        <SelectValue placeholder="দিন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label className="text-emerald-700 dark:text-emerald-400">শুরুর সময়</Label>
                      <Select value={formStartHour} onValueChange={setFormStartHour}>
                        <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-emerald-700 dark:text-emerald-400">শেষের সময়</Label>
                      <Select value={formEndHour} onValueChange={setFormEndHour}>
                        <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Study type */}
                  <div className="grid gap-2">
                    <Label className="text-emerald-700 dark:text-emerald-400">পড়ার ধরন</Label>
                    <Select value={formStudyType} onValueChange={setFormStudyType}>
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDY_TYPES.map(t => {
                          const IconComp = t.icon;
                          return (
                            <SelectItem key={t.id} value={t.id}>
                              <span className="flex items-center gap-2">
                                <IconComp className="w-3.5 h-3.5" />
                                {t.name}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="grid gap-2">
                    <Label className="text-emerald-700 dark:text-emerald-400">অগ্রাধিকার</Label>
                    <div className="flex gap-2">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setFormPriority(p.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-all ${
                            formPriority === p.id
                              ? `${p.bg} ${p.color} border-current ring-2 ring-current/20`
                              : 'border-gray-200 dark:border-gray-700 text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <PriorityDot priorityId={p.id} />
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="grid gap-2">
                    <Label className="text-emerald-700 dark:text-emerald-400">নোটস</Label>
                    <Input
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      placeholder="ঐচ্ছিক নোট..."
                      className="border-emerald-200 dark:border-emerald-800"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-emerald-200 dark:border-emerald-700">
                    বাতিল
                  </Button>
                  <Button
                    onClick={addStudyBlock}
                    disabled={!formSubject || !formDay || !formStudyType || parseInt(formEndHour) <= parseInt(formStartHour)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    যোগ করুন
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Top Row: Stats + Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Study Statistics */}
          <motion.div variants={itemVariants}>
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  স্টাডি পরিসংখ্যান
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-muted-foreground">পরিকল্পিত ঘন্টা</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{toBengaliNum(stats.totalPlannedHours)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                    <p className="text-xs text-muted-foreground">সম্পন্ন ঘন্টা</p>
                    <p className="text-xl font-bold text-teal-700 dark:text-teal-300">{toBengaliNum(stats.completedHours)}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800/50 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">সবচেয়ে বেশি পড়া</p>
                    {stats.mostStudied ? <SubjectChip subjectId={stats.mostStudied.id} size="xs" /> : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800/50 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      ধারাবাহিকতা
                    </p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{toBengaliNum(stats.consistency)}%</p>
                  </div>
                  <Progress value={stats.consistency} className="h-2 bg-emerald-100 dark:bg-emerald-950 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Schedule Card */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    আজকের সূচি
                  </CardTitle>
                  <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                    {getDayById(currentDayId)?.name}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>অগ্রগতি</span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">{toBengaliNum(todayProgress)}%</span>
                  </div>
                  <Progress value={todayProgress} className="h-2 bg-emerald-100 dark:bg-emerald-950 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                {todayBlocks.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-emerald-300 dark:text-emerald-700" />
                    আজকে কোনো পড়াশোনা নেই
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Completed tasks */}
                    {completedTasks.map(block => {
                      const subject = getSubjectById(block.subjectId);
                      const studyType = getStudyTypeById(block.studyType);
                      if (!subject || !studyType) return null;
                      return (
                        <motion.div
                          key={block.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center gap-3 p-2.5 rounded-lg ${subject.bg} border ${subject.border} opacity-60`}
                        >
                          <button onClick={() => toggleComplete(block.id)} className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-through text-muted-foreground">{subject.name}</p>
                            <p className="text-xs text-muted-foreground">{studyType.name} • {toBengaliNum(block.startHour)}:০০ - {toBengaliNum(block.endHour)}:০০</p>
                          </div>
                        </motion.div>
                      );
                    })}
                    {/* Upcoming tasks */}
                    {upcomingTasks.map(block => {
                      const subject = getSubjectById(block.subjectId);
                      const studyType = getStudyTypeById(block.studyType);
                      if (!subject || !studyType) return null;
                      const isActive = currentHour >= block.startHour && currentHour < block.endHour;
                      const hoursUntil = block.startHour - currentHour;
                      return (
                        <motion.div
                          key={block.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                            isActive
                              ? `${subject.bg} ${subject.border} ring-2 ring-emerald-400/50 shadow-sm`
                              : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                          }`}
                        >
                          <button onClick={() => toggleComplete(block.id)} className="flex-shrink-0">
                            <div className={`w-5 h-5 rounded-full border-2 ${isActive ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900' : 'border-gray-300 dark:border-gray-600'}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{subject.name}</p>
                              <SubjectChip subjectId={block.subjectId} size="xs" />
                              {isActive && (
                                <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">চলছে</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground">
                                {studyType.name} • {toBengaliNum(block.startHour)}:০০ - {toBengaliNum(block.endHour)}:০০
                              </p>
                              {!isActive && hoursUntil > 0 && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                  {toBengaliNum(hoursUntil)} ঘন্টা পরে
                                </span>
                              )}
                            </div>
                            {block.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{block.notes}</p>
                            )}
                          </div>
                          <PriorityDot priorityId={block.priority} />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Weekly Schedule View */}
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5" />
                  সাপ্তাহিক সূচি
                </CardTitle>
                {/* Day navigation for mobile */}
                <div className="flex items-center gap-2 sm:hidden">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                    const idx = DAYS.findIndex(d => d.id === selectedDay);
                    if (idx > 0) setSelectedDay(DAYS[idx - 1].id);
                  }}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 min-w-[80px] text-center">
                    {getDayById(selectedDay)?.name}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                    const idx = DAYS.findIndex(d => d.id === selectedDay);
                    if (idx < DAYS.length - 1) setSelectedDay(DAYS[idx + 1].id);
                  }}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop: Full grid view */}
              <div className="hidden sm:block overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px mb-px">
                    <div className="p-2 text-xs text-muted-foreground font-medium">সময়</div>
                    {DAYS.map(day => (
                      <div
                        key={day.id}
                        className={`p-2 text-center text-xs font-semibold rounded-t-lg cursor-pointer transition-colors ${
                          day.id === currentDayId
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-50 dark:bg-gray-800/50 text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                        onClick={() => setSelectedDay(day.id)}
                      >
                        {day.name}
                      </div>
                    ))}
                  </div>

                  {/* Time slots grid */}
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-gray-100 dark:bg-gray-800 rounded-b-lg overflow-hidden">
                    {TIME_SLOTS.map(slot => (
                      <React.Fragment key={slot.hour}>
                        {/* Time label */}
                        <div className="p-1.5 text-[10px] text-muted-foreground bg-white dark:bg-gray-900 flex items-start justify-end pr-2 pt-2">
                          {slot.labelBn}
                        </div>
                        {/* Day cells */}
                        {DAYS.map(day => {
                          const blocksInSlot = getBlocksForSlot(day.id, slot.hour);
                          const isCurrentSlot = day.id === currentDayId && slot.hour === currentHour;
                          const isPast = day.id === currentDayId && slot.hour < currentHour;
                          // Only render block at its start hour to avoid duplicates
                          const blockStartingHere = blocksInSlot.filter(b => b.startHour === slot.hour);

                          return (
                            <div
                              key={`${day.id}-${slot.hour}`}
                              className={`relative min-h-[36px] p-0.5 transition-colors ${
                                isCurrentSlot
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-inset ring-emerald-300 dark:ring-emerald-700'
                                  : isPast
                                  ? 'bg-gray-50/50 dark:bg-gray-800/30'
                                  : 'bg-white dark:bg-gray-900'
                              }`}
                            >
                              {/* Current time indicator */}
                              {isCurrentSlot && (
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 z-10" />
                              )}
                              <AnimatePresence>
                                {blockStartingHere.map(block => {
                                  const subject = getSubjectById(block.subjectId);
                                  if (!subject) return null;
                                  const spanHours = block.endHour - block.startHour;
                                  return (
                                    <motion.div
                                      key={block.id}
                                      variants={blockVariants}
                                      initial="initial"
                                      animate="animate"
                                      exit="exit"
                                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium border cursor-pointer ${subject.bg} ${subject.text} ${subject.border} ${
                                        block.completed ? 'opacity-50 line-through' : ''
                                      }`}
                                      style={{
                                        minHeight: `${spanHours * 36 - 4}px`,
                                      }}
                                      onClick={() => toggleComplete(block.id)}
                                      title={`${subject.name} - ${block.notes || ''}`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <PriorityDot priorityId={block.priority} />
                                        <span className="truncate">{subject.name}</span>
                                      </div>
                                      {spanHours > 1 && (
                                        <div className="mt-0.5 text-[9px] opacity-75">
                                          {getStudyTypeById(block.studyType)?.name}
                                        </div>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile: Single day view */}
              <div className="sm:hidden">
                <div className="space-y-1">
                  {TIME_SLOTS.map(slot => {
                    const blocksInSlot = getBlocksForSlot(selectedDay, slot.hour);
                    const isCurrentSlot = selectedDay === currentDayId && slot.hour === currentHour;
                    const blockStartingHere = blocksInSlot.filter(b => b.startHour === slot.hour);

                    return (
                      <div key={slot.hour}>
                        <div className={`flex items-stretch gap-2 rounded-lg ${
                          isCurrentSlot ? 'bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-300 dark:ring-emerald-700' : ''
                        }`}>
                          <div className="w-14 flex-shrink-0 py-2 text-xs text-muted-foreground text-right pr-2">
                            {slot.labelBn}
                          </div>
                          <div className="flex-1 py-1 min-h-[40px] relative">
                            {isCurrentSlot && (
                              <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 z-10" />
                            )}
                            <AnimatePresence>
                              {blockStartingHere.map(block => {
                                const subject = getSubjectById(block.subjectId);
                                const studyType = getStudyTypeById(block.studyType);
                                if (!subject) return null;
                                return (
                                  <motion.div
                                    key={block.id}
                                    variants={blockVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className={`flex items-center gap-2 p-2 rounded-lg border ${subject.bg} ${subject.border} ${
                                      block.completed ? 'opacity-50' : ''
                                    }`}
                                  >
                                    <button onClick={() => toggleComplete(block.id)} className="flex-shrink-0">
                                      {block.completed
                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        : <div className={`w-4 h-4 rounded-full border-2 ${subject.border}`} />
                                      }
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <PriorityDot priorityId={block.priority} />
                                        <span className={`text-xs font-medium ${subject.text} ${block.completed ? 'line-through' : ''}`}>
                                          {subject.name}
                                        </span>
                                        {studyType && (
                                          <span className="text-[10px] text-muted-foreground">{studyType.name}</span>
                                        )}
                                      </div>
                                      {block.notes && (
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{block.notes}</p>
                                      )}
                                    </div>
                                    <button onClick={() => removeBlock(block.id)} className="flex-shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                    </button>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Empty state */}
              {studyBlocks.length === 0 && <EmptyStateIllustration />}
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Color Legend + Block List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Subject Legend */}
          <motion.div variants={itemVariants}>
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  বিষয়ের রং নির্দেশিকা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map(subject => {
                    const hours = studyBlocks.filter(b => b.subjectId === subject.id).reduce((s, b) => s + (b.endHour - b.startHour), 0);
                    return (
                      <div
                        key={subject.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${subject.bg} ${subject.border}`}
                      >
                        <div className={`w-3 h-3 rounded-sm ${subject.bg} border ${subject.border}`} />
                        <span className={`text-xs font-medium ${subject.text}`}>{subject.name}</span>
                        {hours > 0 && (
                          <span className="text-[10px] text-muted-foreground ml-auto">{toBengaliNum(hours)} ঘণ্টা</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* All Study Blocks List */}
          <motion.div variants={itemVariants}>
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    সকল ব্লক
                  </CardTitle>
                  {studyBlocks.length > 0 && (
                    <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                      {toBengaliNum(studyBlocks.length)}টি
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {studyBlocks.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    কোনো ব্লক নেই। উপরে থেকে ব্লক যোগ করুন বা টেমপ্লেট ব্যবহার করুন।
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {studyBlocks.map(block => {
                      const subject = getSubjectById(block.subjectId);
                      const studyType = getStudyTypeById(block.studyType);
                      const day = getDayById(block.dayId);
                      if (!subject || !studyType || !day) return null;
                      return (
                        <motion.div
                          key={block.id}
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${subject.bg} ${subject.border} ${
                            block.completed ? 'opacity-50' : ''
                          }`}
                        >
                          <button onClick={() => toggleComplete(block.id)} className="flex-shrink-0">
                            {block.completed
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              : <div className={`w-4 h-4 rounded-full border-2 ${subject.border}`} />
                            }
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-medium ${subject.text} ${block.completed ? 'line-through' : ''}`}>
                                {subject.name}
                              </span>
                              <span className="text-muted-foreground">{day.short}</span>
                              <span className="text-muted-foreground">
                                {toBengaliNum(block.startHour)}:০০-{toBengaliNum(block.endHour)}:০০
                              </span>
                              <span className="text-muted-foreground">{studyType.name}</span>
                            </div>
                            {block.notes && (
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{block.notes}</p>
                            )}
                          </div>
                          <PriorityDot priorityId={block.priority} />
                          <button
                            onClick={() => removeBlock(block.id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Tips Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 backdrop-blur-sm">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">পড়াশোনার টিপস</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    প্রতিটি পড়ার সেশন ২৫-৩০ মিনিট রাখুন, তারপর ৫ মিনিট বিরতি নিন। একে পমোডোরো টেকনিক বলে। নিয়মিত রিভিশন করলে মনে রাখার ক্ষমতা {toBengaliNum(80)}% বাড়ে!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #059669;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #047857;
        }
      `}</style>
    </motion.div>
  );
}
