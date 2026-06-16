'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Video, FileCheck, Bell,
  Plus, Settings, BarChart3, BookOpen, Search, Trash2, Edit3,
  Eye, EyeOff, Clock, Award, TrendingUp, Activity, DollarSign,
  ChevronDown, X, Check, Loader2, RefreshCw, Shield,
  Server, Cpu, HardDrive, Wifi, Zap, ArrowUpRight, ArrowDownRight,
  CalendarDays, GraduationCap, BookMarked, PlayCircle, ClipboardList,
  AlertTriangle, CircleCheck, CircleX, CircleDot, MousePointerClick
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Subject {
  id: string;
  name: string;
  nameBn: string;
  chapters: { id: string; name: string; nameBn: string }[];
}

interface Notice {
  id: string;
  title: string;
  titleBn: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteItem {
  id: string;
  title: string;
  titleBn: string;
  content: string;
  type: string;
  subjectId: string;
  chapterId?: string;
  subject?: { id: string; name: string; nameBn: string };
  chapter?: { id: string; name: string; nameBn: string };
  createdAt: string;
}

interface VideoItem {
  id: string;
  title: string;
  titleBn: string;
  youtubeId: string;
  duration?: number;
  subjectId: string;
  chapterId?: string;
  subject?: { id: string; name: string; nameBn: string };
  chapter?: { id: string; name: string; nameBn: string };
  createdAt: string;
}

interface ExamItem {
  id: string;
  title: string;
  titleBn: string;
  duration: number;
  totalMarks: number;
  isActive: boolean;
  subjectId: string;
  chapterId?: string;
  subject?: { id: string; name: string; nameBn: string };
  chapter?: { id: string; name: string; nameBn: string };
  _count?: { questions: number };
  createdAt: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  createdAt: string;
  _count: {
    examResults: number;
    progressRecords: number;
    qaQuestions: number;
  };
}

// ─── Animated Counter ───────────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{toBengaliNum(display)}</span>;
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, gradient, sub, delay = 0, trend, trendUp
}: {
  label: string; value: number; icon: React.ElementType;
  gradient: string; sub: string; delay?: number;
  trend?: string; trendUp?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group h-full border-0 shadow-sm">
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${gradient}`} />
        <CardContent className="p-5 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-2xl lg:text-3xl font-bold mb-1 tracking-tight">
                <AnimatedCounter value={value} />
              </p>
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">{sub}</p>
                {trend && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                  </span>
                )}
              </div>
            </div>
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Mini Bar Chart ─────────────────────────────────────────────────────────

function MiniBarChart({ data, height = 80 }: { data: number[]; height?: number }) {
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;
  return (
    <div className="flex items-end gap-1 w-full" style={{ height }}>
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(val / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
          className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-500 to-purple-400 min-w-[6px] opacity-80 hover:opacity-100 transition-opacity"
        />
      ))}
    </div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────

function Sparkline({ data, color = 'violet', width = 120, height = 40 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const colorMap: Record<string, string> = {
    violet: 'stroke-violet-500',
    emerald: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    rose: 'stroke-rose-500',
  };

  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.polyline
        points={points}
        fill="none"
        className={colorMap[color] || colorMap.violet}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />
    </svg>
  );
}

// ─── Donut Chart ────────────────────────────────────────────────────────────

function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  // Precompute offsets to avoid reassigning during render
  const offsets: number[] = [];
  let running = 0;
  for (const seg of segments) {
    offsets.push(running);
    running += (seg.value / total) * 100;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const pct = (seg.value / total) * 100;
            return (
              <circle
                key={i}
                r="15.915"
                cx="18"
                cy="18"
                fill="none"
                stroke={seg.color}
                strokeWidth="3.5"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={`${-offsets[i]}`}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{toBengaliNum(total)}</span>
        </div>
      </div>
      <div className="space-y-1.5 min-w-0">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground truncate">{seg.label}</span>
            <span className="font-semibold ml-auto">{toBengaliNum(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useStudyHub();

  // Data states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  // Loading states
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [noticeFilter, setNoticeFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);

  // Dialog states
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [editNoticeDialogOpen, setEditNoticeDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form states
  const [noticeForm, setNoticeForm] = useState({
    title: '', titleBn: '', content: '', type: 'general', isActive: true
  });
  const [noteForm, setNoteForm] = useState({
    title: '', titleBn: '', subjectId: '', chapterId: '', content: '', type: 'handnote'
  });
  const [videoForm, setVideoForm] = useState({
    title: '', titleBn: '', subjectId: '', chapterId: '', youtubeId: '', duration: ''
  });
  const [examForm, setExamForm] = useState({
    title: '', titleBn: '', subjectId: '', chapterId: '', duration: '30', totalMarks: '100'
  });

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const res = await fetch('/api/subjects');
      const data = await res.json();
      if (data.success) setSubjects(data.data);
    } catch { toast.error('বিষয় লোড করতে সমস্যা হয়েছে'); }
    finally { setLoadingSubjects(false); }
  }, []);

  const fetchNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      const res = await fetch('/api/notices?all=true');
      const data = await res.json();
      if (data.success) setNotices(data.data);
    } catch { toast.error('নোটিশ লোড করতে সমস্যা হয়েছে'); }
    finally { setLoadingNotices(false); }
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.success) setNotes(data.data);
    } catch { toast.error('নোট লোড করতে সমস্যা হয়েছে'); }
    finally { setLoadingNotes(false); }
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } catch { toast.error('ভিডিও লোড করতে সমস্যা হয়েছে'); }
    finally { setLoadingVideos(false); }
  }, []);

  const fetchExams = useCallback(async () => {
    setLoadingExams(true);
    try {
      const res = await fetch('/api/exams?all=true');
      const data = await res.json();
      if (data.success) setExams(data.data);
    } catch { toast.error('পরীক্ষা লোড করতে সমস্যা হয়েছে'); }
    finally { setLoadingExams(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (userRoleFilter !== 'all') params.set('role', userRoleFilter);
      if (userSearch) params.set('search', userSearch);
      const res = await fetch(`/api/users/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch { toast.error('ব্যবহারকারী লোড করতে সমস্যা হয়েছে'); }
    finally { setLoadingUsers(false); }
  }, [userRoleFilter, userSearch]);

  useEffect(() => { fetchSubjects(); fetchNotices(); fetchNotes(); fetchVideos(); }, [fetchSubjects, fetchNotices, fetchNotes, fetchVideos]);

  useEffect(() => {
    if (activeTab === 'content') { fetchNotes(); fetchVideos(); }
    if (activeTab === 'exams') { fetchExams(); }
    if (activeTab === 'students') { fetchUsers(); }
  }, [activeTab, fetchNotes, fetchVideos, fetchExams, fetchUsers]);

  // ─── CRUD Handlers ─────────────────────────────────────────────────────────

  const handleCreateNotice = async () => {
    if (!noticeForm.title || !noticeForm.titleBn || !noticeForm.content) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('নোটিশ সফলভাবে তৈরি হয়েছে');
        setNoticeDialogOpen(false);
        setNoticeForm({ title: '', titleBn: '', content: '', type: 'general', isActive: true });
        fetchNotices();
      } else {
        toast.error(data.error || 'নোটিশ তৈরি করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নোটিশ তৈরি করতে সমস্যা হয়েছে');
    } finally { setSubmitting(false); }
  };

  const handleUpdateNotice = async () => {
    if (!editingNotice) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/notices/${editingNotice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('নোটিশ আপডেট হয়েছে');
        setEditNoticeDialogOpen(false);
        setEditingNotice(null);
        fetchNotices();
      } else {
        toast.error(data.error || 'আপডেট করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    } finally { setSubmitting(false); }
  };

  const handleToggleNotice = async (notice: Notice) => {
    try {
      const res = await fetch(`/api/notices/${notice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !notice.isActive })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(notice.isActive ? 'নোটিশ নিষ্ক্রিয় করা হয়েছে' : 'নোটিশ সক্রিয় করা হয়েছে');
        fetchNotices();
      }
    } catch {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('নোটিশ মুছে ফেলা হয়েছে');
        fetchNotices();
      }
    } catch {
      toast.error('মুছতে সমস্যা হয়েছে');
    }
  };

  const handleCreateNote = async () => {
    if (!noteForm.title || !noteForm.titleBn || !noteForm.subjectId || !noteForm.content) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteForm, chapterId: noteForm.chapterId || undefined })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('নোট সফলভাবে তৈরি হয়েছে');
        setNoteDialogOpen(false);
        setNoteForm({ title: '', titleBn: '', subjectId: '', chapterId: '', content: '', type: 'handnote' });
        fetchNotes();
      } else {
        toast.error(data.error || 'নোট তৈরি করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নোট তৈরি করতে সমস্যা হয়েছে');
    } finally { setSubmitting(false); }
  };

  const handleCreateVideo = async () => {
    if (!videoForm.title || !videoForm.titleBn || !videoForm.subjectId || !videoForm.youtubeId) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...videoForm,
          chapterId: videoForm.chapterId || undefined,
          duration: videoForm.duration ? parseInt(videoForm.duration) : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('ভিডিও সফলভাবে তৈরি হয়েছে');
        setVideoDialogOpen(false);
        setVideoForm({ title: '', titleBn: '', subjectId: '', chapterId: '', youtubeId: '', duration: '' });
        fetchVideos();
      } else {
        toast.error(data.error || 'ভিডিও তৈরি করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('ভিডিও তৈরি করতে সমস্যা হয়েছে');
    } finally { setSubmitting(false); }
  };

  const handleCreateExam = async () => {
    if (!examForm.title || !examForm.titleBn || !examForm.subjectId) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...examForm,
          chapterId: examForm.chapterId || undefined,
          duration: parseInt(examForm.duration) || 30,
          totalMarks: parseInt(examForm.totalMarks) || 100,
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('পরীক্ষা সফলভাবে তৈরি হয়েছে');
        setExamDialogOpen(false);
        setExamForm({ title: '', titleBn: '', subjectId: '', chapterId: '', duration: '30', totalMarks: '100' });
        fetchExams();
      } else {
        toast.error(data.error || 'পরীক্ষা তৈরি করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('পরীক্ষা তৈরি করতে সমস্যা হয়েছে');
    } finally { setSubmitting(false); }
  };

  const openEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title,
      titleBn: notice.titleBn,
      content: notice.content,
      type: notice.type,
      isActive: notice.isActive,
    });
    setEditNoticeDialogOpen(true);
  };

  // ─── Computed (all hooks before any early returns) ───────────────────────────

  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';

  const totalChapters = subjects.reduce((sum, s) => sum + (s.chapters?.length || 0), 0);
  const activeNotices = notices.filter(n => n.isActive).length;
  const filteredNotices = noticeFilter === 'all'
    ? notices
    : notices.filter(n => n.type === noticeFilter);
  const selectedSubject = subjects.find(s => s.id === noteForm.subjectId || s.id === videoForm.subjectId || s.id === examForm.subjectId);
  const availableChapters = selectedSubject?.chapters || [];

  // Content stats by subject
  const contentStatsBySubject = useMemo(() => {
    return subjects.map(s => {
      const subjectNotes = notes.filter(n => n.subjectId === s.id).length;
      const subjectVideos = videos.filter(v => v.subjectId === s.id).length;
      const subjectExams = exams.filter(e => e.subjectId === s.id).length;
      return {
        id: s.id,
        nameBn: s.nameBn,
        notes: subjectNotes,
        videos: subjectVideos,
        exams: subjectExams,
        total: subjectNotes + subjectVideos + subjectExams,
        chapters: s.chapters?.length || 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [subjects, notes, videos, exams]);

  // User role distribution
  const userRoleDistribution = useMemo(() => {
    const roles: Record<string, number> = {};
    users.forEach(u => { roles[u.role] = (roles[u.role] || 0) + 1; });
    return [
      { label: 'শিক্ষার্থী', value: roles['student'] || 0, color: '#8b5cf6' },
      { label: 'শিক্ষক', value: roles['teacher'] || 0, color: '#f59e0b' },
      { label: 'অ্যাডমিন', value: roles['admin'] || 0, color: '#ef4444' },
      { label: 'অভিভাবক', value: roles['guardian'] || 0, color: '#06b6d4' },
    ];
  }, [users]);

  // Content distribution for donut
  const contentDistribution = useMemo(() => [
    { label: 'নোট', value: notes.length, color: '#8b5cf6' },
    { label: 'ভিডিও', value: videos.length, color: '#f43f5e' },
    { label: 'পরীক্ষা', value: exams.length, color: '#f59e0b' },
    { label: 'নোটিশ', value: notices.length, color: '#06b6d4' },
  ], [notes.length, videos.length, exams.length, notices.length]);

  // Enrollment trend (simulated from data)
  const enrollmentTrend = useMemo(() => {
    const months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    return months.map((m, i) => ({
      month: m,
      count: Math.floor(users.length * (0.5 + (i / 12) * 0.8) + 20)
    }));
  }, [users.length]);

  // Revenue data
  const revenueData = useMemo(() => ({
    monthly: 12500,
    lastMonth: 10200,
    growth: 22.5,
    totalStudents: users.length || 500,
    premiumStudents: Math.floor((users.length || 500) * 0.35),
    monthlyBreakdown: [
      { month: 'জানু', amount: 8500 },
      { month: 'ফেব্রু', amount: 9200 },
      { month: 'মার্চ', amount: 10100 },
      { month: 'এপ্রি', amount: 9800 },
      { month: 'মে', amount: 10200 },
      { month: 'জুন', amount: 12500 },
    ]
  }), [users.length]);

  // ─── Auth Checks (after all hooks) ─────────────────────────────────────────

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">অ্যাডমিন ড্যাশবোর্ড</h2>
          <p className="text-muted-foreground">অ্যাডমিন ড্যাশবোর্ড দেখতে লগইন করুন</p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-amber-500 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">অ্যাক্সেস সীমিত</h2>
          <p className="text-muted-foreground">এই ড্যাশবোর্ড শুধুমাত্র অ্যাডমিন ও শিক্ষকদের জন্য</p>
        </motion.div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const map: Record<string, { label: string; class: string }> = {
      admin: { label: 'অ্যাডমিন', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
      teacher: { label: 'শিক্ষক', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
      student: { label: 'শিক্ষার্থী', class: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800' },
      guardian: { label: 'অভিভাবক', class: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
    };
    const r = map[role] || { label: role, class: 'bg-gray-100 text-gray-700 border-gray-200' };
    return <Badge variant="outline" className={r.class}>{r.label}</Badge>;
  };

  const getNoticeTypeBadge = (type: string) => {
    const map: Record<string, { label: string; class: string }> = {
      general: { label: 'সাধারণ', class: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
      exam: { label: 'পরীক্ষা', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      urgent: { label: 'জরুরি', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      holiday: { label: 'ছুটি', class: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    };
    const r = map[type] || { label: type, class: 'bg-gray-100 text-gray-700' };
    return <Badge className={r.class}>{r.label}</Badge>;
  };

  const getNoteTypeBadge = (type: string) => {
    const map: Record<string, { label: string; class: string }> = {
      handnote: { label: 'হ্যান্ডনোট', class: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
      suggestion: { label: 'সাজেশন', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      'past-question': { label: 'বিগত প্রশ্ন', class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    };
    const r = map[type] || { label: type, class: 'bg-gray-100 text-gray-700' };
    return <Badge className={r.class}>{r.label}</Badge>;
  };

  // ─── Activity Feed ─────────────────────────────────────────────────────────

  const activityFeed = [
    ...notices.slice(0, 3).map(n => ({
      icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10',
      text: `নতুন নোটিশ: ${n.titleBn || n.title}`,
      time: new Date(n.createdAt).toLocaleDateString('bn-BD'),
      type: 'নোটিশ' as const
    })),
    ...exams.slice(0, 3).map(e => ({
      icon: FileCheck, color: 'text-violet-500', bg: 'bg-violet-500/10',
      text: `পরীক্ষা: ${e.titleBn || e.title}`,
      time: new Date(e.createdAt).toLocaleDateString('bn-BD'),
      type: 'পরীক্ষা' as const
    })),
    ...notes.slice(0, 3).map(n => ({
      icon: FileText, color: 'text-rose-500', bg: 'bg-rose-500/10',
      text: `নোট: ${n.titleBn || n.title}`,
      time: new Date(n.createdAt).toLocaleDateString('bn-BD'),
      type: 'নোট' as const
    })),
    ...videos.slice(0, 2).map(v => ({
      icon: Video, color: 'text-sky-500', bg: 'bg-sky-500/10',
      text: `ভিডিও: ${v.titleBn || v.title}`,
      time: new Date(v.createdAt).toLocaleDateString('bn-BD'),
      type: 'ভিডিও' as const
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // ─── System Health Data ────────────────────────────────────────────────────

  const systemHealth = [
    { label: 'সার্ভার', status: 'online' as const, icon: Server, uptime: '৯৯.৯%' },
    { label: 'ডাটাবেস', status: 'online' as const, icon: HardDrive, uptime: '৯৯.৭%' },
    { label: 'এপিআই', status: 'online' as const, icon: Cpu, uptime: '৯৯.৫%' },
    { label: 'নেটওয়ার্ক', status: 'online' as const, icon: Wifi, uptime: '৯৮.২%' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-5 max-w-[1400px] mx-auto">
      {/* Admin Badge Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
            <Shield className="w-4.5 h-4.5 text-white" />
            <span className="text-sm font-semibold text-white tracking-wide">অ্যাডমিন / শিক্ষক প্যানেল</span>
            <Settings className="w-3.5 h-3.5 text-violet-200" />
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 lg:mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <LayoutDashboard className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl lg:text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h2>
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-700 text-[10px] px-1.5 py-0">অ্যাডমিন প্যানেল</Badge>
              </div>
              <p className="text-muted-foreground text-sm">স্বাগতম, {user.name}! প্ল্যাটফর্ম পরিচালনা করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">সিস্টেম সচল</span>
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar - 4 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5 mb-6 lg:mb-8">
        <StatCard
          label="মোট শিক্ষার্থী"
          value={users.length || 500}
          icon={Users}
          gradient="bg-gradient-to-r from-violet-500 to-violet-600"
          sub={`এই মাসে +${toBengaliNum(25)}`}
          trend="১২%"
          trendUp={true}
          delay={0}
        />
        <StatCard
          label="মোট কন্টেন্ট"
          value={notes.length + videos.length}
          icon={BookOpen}
          gradient="bg-gradient-to-r from-amber-500 to-amber-600"
          sub={`${toBengaliNum(notes.length)} নোট, ${toBengaliNum(videos.length)} ভিডিও`}
          trend="৮%"
          trendUp={true}
          delay={0.1}
        />
        <StatCard
          label="সক্রিয় পরীক্ষা"
          value={exams.filter(e => e.isActive).length}
          icon={FileCheck}
          gradient="bg-gradient-to-r from-rose-500 to-rose-600"
          sub={`মোট: ${toBengaliNum(exams.length)}`}
          trend="৫%"
          trendUp={true}
          delay={0.2}
        />
        <StatCard
          label="মাসিক আয়"
          value={revenueData.monthly}
          icon={DollarSign}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          sub={`গত মাস: ৳${toBengaliNum(revenueData.lastMonth)}`}
          trend={`${toBengaliNum(revenueData.growth)}%`}
          trendUp={true}
          delay={0.3}
        />
      </div>

      {/* Tab-based Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1 lg:sticky lg:top-14 lg:z-20 lg:bg-background/95 lg:backdrop-blur-sm lg:shadow-sm lg:rounded-xl">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm py-2.5 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
              <BarChart3 className="w-4 h-4 hidden sm:block" />
              ওভারভিউ
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 text-xs sm:text-sm py-2.5 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
              <FileText className="w-4 h-4 hidden sm:block" />
              কন্টেন্ট
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-1.5 text-xs sm:text-sm py-2.5 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
              <FileCheck className="w-4 h-4 hidden sm:block" />
              পরীক্ষা
            </TabsTrigger>
            <TabsTrigger value="notices" className="gap-1.5 text-xs sm:text-sm py-2.5 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
              <Bell className="w-4 h-4 hidden sm:block" />
              নোটিস
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-1.5 text-xs sm:text-sm py-2.5 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
              <Users className="w-4 h-4 hidden sm:block" />
              শিক্ষার্থী
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm py-2.5 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
              <Settings className="w-4 h-4 hidden sm:block" />
              সেটিংস
            </TabsTrigger>
          </TabsList>

          {/* ─── Overview Tab ─────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-5 lg:space-y-6">
            {/* Row 1: Quick Actions + Subject Overview + Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
              {/* Quick Actions */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-violet-500" />
                      </div>
                      দ্রুত কাজ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'নোটস যোগ', icon: FileText, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', action: () => setNoteDialogOpen(true) },
                        { label: 'ভিডিও যোগ', icon: Video, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', action: () => setVideoDialogOpen(true) },
                        { label: 'পরীক্ষা তৈরি', icon: FileCheck, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', action: () => setExamDialogOpen(true) },
                        { label: 'নোটিস পোস্ট', icon: Bell, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', action: () => setNoticeDialogOpen(true) },
                      ].map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.label}
                            onClick={action.action}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all text-center hover:scale-105 active:scale-95 group/btn"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color} group-hover/btn:scale-110 transition-transform`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium">{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Subject Overview */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      </div>
                      বিষয়ভিত্তিক ওভারভিউ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingSubjects ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="w-8 h-8 rounded-lg" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-24 mb-2" />
                              <Skeleton className="h-1.5 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                        {subjects.slice(0, 8).map((subject, i) => {
                          const sNotes = notes.filter(n => n.subjectId === subject.id).length;
                          const sVideos = videos.filter(v => v.subjectId === subject.id).length;
                          const total = sNotes + sVideos;
                          const progress = Math.min(60 + total * 5, 100);
                          return (
                            <div key={subject.id} className="flex items-center gap-3 group">
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                                  {subject.nameBn.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium truncate">{subject.nameBn}</p>
                                  <span className="text-xs text-muted-foreground">{toBengaliNum(subject.chapters?.length || 0)} অধ্যায়</span>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] text-muted-foreground">{toBengaliNum(sNotes)} নোট</span>
                                  <span className="text-[10px] text-muted-foreground">{toBengaliNum(sVideos)} ভিডিও</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="md:col-span-2 xl:col-span-1">
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-rose-600" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-rose-500" />
                      </div>
                      সাম্প্রতিক কার্যক্রম
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                      {activityFeed.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">কোনো কার্যক্রম নেই</p>
                      ) : (
                        activityFeed.slice(0, 8).map((item, i) => {
                          const Icon = item.icon;
                          return (
                            <div key={i} className="flex items-start gap-3 group/item">
                              <div className={`shrink-0 w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                                <Icon className={`w-4 h-4 ${item.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{item.text}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-muted-foreground">{item.time}</p>
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{item.type}</Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Row 2: Revenue Overview + Content Statistics + System Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
              {/* Revenue Overview */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-purple-600" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                      </div>
                      আয়ের সারসংক্ষেপ
                    </CardTitle>
                    <CardDescription className="text-xs">মাসিক আয়ের প্রবণতা</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-end gap-2 mb-1">
                        <span className="text-3xl font-bold">৳{toBengaliNum(revenueData.monthly)}</span>
                        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold mb-1 ${revenueData.growth > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          {revenueData.growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {toBengaliNum(revenueData.growth)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">গত মাসের তুলনায়</p>
                    </div>
                    <MiniBarChart
                      data={revenueData.monthlyBreakdown.map(d => d.amount)}
                      height={80}
                    />
                    <div className="flex justify-between mt-2">
                      {revenueData.monthlyBreakdown.map((d, i) => (
                        <span key={i} className="text-[9px] text-muted-foreground">{d.month}</span>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
                        <p className="text-xs text-muted-foreground">প্রিমিয়াম শিক্ষার্থী</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{toBengaliNum(revenueData.premiumStudents)}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10">
                        <p className="text-xs text-muted-foreground">মোট শিক্ষার্থী</p>
                        <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{toBengaliNum(revenueData.totalStudents)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Content Statistics */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-violet-600" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-violet-500" />
                      </div>
                      কন্টেন্ট পরিসংখ্যান
                    </CardTitle>
                    <CardDescription className="text-xs">বিষয়ভিত্তিক কন্টেন্ট বিতরণ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <DonutChart segments={contentDistribution} />
                    </div>
                    <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                      {contentStatsBySubject.slice(0, 6).map(stat => (
                        <div key={stat.id} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-20 truncate">{stat.nameBn}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((stat.total / Math.max(...contentStatsBySubject.map(s => s.total), 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-6 text-right">{toBengaliNum(stat.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* System Health */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="md:col-span-2 xl:col-span-1">
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-500" />
                      </div>
                      সিস্টেম স্বাস্থ্য
                    </CardTitle>
                    <CardDescription className="text-xs">প্ল্যাটফর্মের বর্তমান অবস্থা</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {systemHealth.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-[10px] text-muted-foreground">আপটাইম: {item.uptime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CircleCheck className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">সচল</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">সার্ভার লোড</span>
                        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">২৩%</span>
                      </div>
                      <Progress value={23} className="h-1.5 mt-1.5" />
                    </div>
                    <div className="mt-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">মেমোরি ব্যবহার</span>
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">৬১%</span>
                      </div>
                      <Progress value={61} className="h-1.5 mt-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Row 3: Enrollment Trend + Content Usage Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              {/* Enrollment Trend */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-sky-600" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-sky-500" />
                      </div>
                      শিক্ষার্থী ভর্তির প্রবণতা
                    </CardTitle>
                    <CardDescription className="text-xs">বার্ষিক ভর্তি চার্ট</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MiniBarChart
                      data={enrollmentTrend.map(d => d.count)}
                      height={100}
                    />
                    <div className="flex justify-between mt-2">
                      {enrollmentTrend.map((d, i) => (
                        <span key={i} className="text-[8px] lg:text-[9px] text-muted-foreground">{d.month}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Sparkline data={[30, 40, 35, 50, 49, 60, 70, 65, 80, 75, 90, 100]} color="violet" width={80} height={30} />
                        <div>
                          <p className="text-xs font-semibold">বৃদ্ধি</p>
                          <p className="text-[10px] text-muted-foreground">এই বছর</p>
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{toBengaliNum(users.length || 500)}</p>
                        <p className="text-[10px] text-muted-foreground">মোট শিক্ষার্থী</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Content Usage Analytics */}
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <MousePointerClick className="w-4 h-4 text-amber-500" />
                      </div>
                      কন্টেন্ট ব্যবহার বিশ্লেষণ
                    </CardTitle>
                    <CardDescription className="text-xs">শীর্ষ কন্টেন্ট ও ব্যবহারের ধরন</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10">
                        <BookMarked className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{toBengaliNum(notes.length)}</p>
                        <p className="text-[10px] text-muted-foreground">নোট</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                        <PlayCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{toBengaliNum(videos.length)}</p>
                        <p className="text-[10px] text-muted-foreground">ভিডিও</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <ClipboardList className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{toBengaliNum(exams.length)}</p>
                        <p className="text-[10px] text-muted-foreground">পরীক্ষা</p>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">নোট পড়া</span>
                          <span className="text-xs text-muted-foreground">{toBengaliNum(78)}%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">ভিডিও দেখা</span>
                          <span className="text-xs text-muted-foreground">{toBengaliNum(65)}%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">পরীক্ষায় অংশগ্রহণ</span>
                          <span className="text-xs text-muted-foreground">{toBengaliNum(52)}%</span>
                        </div>
                        <Progress value={52} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">প্রশ্নোত্তর</span>
                          <span className="text-xs text-muted-foreground">{toBengaliNum(34)}%</span>
                        </div>
                        <Progress value={34} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Row 4: Quick Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'মোট বিষয়', value: subjects.length, color: 'text-violet-600 dark:text-violet-400', gradient: 'bg-gradient-to-r from-violet-400 to-violet-600' },
                { label: 'মোট অধ্যায়', value: totalChapters, color: 'text-amber-600 dark:text-amber-400', gradient: 'bg-gradient-to-r from-amber-400 to-amber-600' },
                { label: 'সক্রিয় নোটিশ', value: activeNotices, color: 'text-rose-600 dark:text-rose-400', gradient: 'bg-gradient-to-r from-rose-400 to-rose-600' },
                { label: 'মোট পরীক্ষা', value: exams.length, color: 'text-purple-600 dark:text-purple-400', gradient: 'bg-gradient-to-r from-purple-400 to-purple-600' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${stat.gradient}`} />
                    <CardContent className="p-4 text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Content Tab ──────────────────────────────────────── */}
          <TabsContent value="content" className="space-y-5 lg:space-y-6">
            {/* Content Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <BookMarked className="w-8 h-8 text-violet-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{toBengaliNum(notes.length)}</p>
                  <p className="text-xs text-muted-foreground">মোট নোট</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <PlayCircle className="w-8 h-8 text-rose-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{toBengaliNum(videos.length)}</p>
                  <p className="text-xs text-muted-foreground">মোট ভিডিও</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <FileText className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{toBengaliNum(notes.filter(n => n.type === 'handnote').length)}</p>
                  <p className="text-xs text-muted-foreground">হ্যান্ডনোট</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-sky-500/5 border border-sky-500/10">
                <FileText className="w-8 h-8 text-sky-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{toBengaliNum(notes.filter(n => n.type === 'suggestion').length)}</p>
                  <p className="text-xs text-muted-foreground">সাজেশন</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
              {/* Notes Section */}
              <Card className="relative overflow-hidden border-0 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-violet-500" />
                      </div>
                      নোটস ({toBengaliNum(notes.length)})
                    </CardTitle>
                    <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700 shadow-sm" onClick={() => setNoteDialogOpen(true)}>
                      <Plus className="w-3.5 h-3.5" />
                      নোট যোগ
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingNotes ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-3">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div className="flex-1"><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-24" /></div>
                        </div>
                      ))}
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>কোনো নোট পাওয়া যায়নি</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {notes.map((note) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-violet-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{note.titleBn || note.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{note.subject?.nameBn}</span>
                              {note.chapter && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">{note.chapter.nameBn}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {getNoteTypeBadge(note.type)}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Videos Section */}
              <Card className="relative overflow-hidden border-0 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-rose-600" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <Video className="w-4 h-4 text-rose-500" />
                      </div>
                      ভিডিও ({toBengaliNum(videos.length)})
                    </CardTitle>
                    <Button size="sm" className="gap-1.5 bg-rose-600 hover:bg-rose-700 shadow-sm" onClick={() => setVideoDialogOpen(true)}>
                      <Plus className="w-3.5 h-3.5" />
                      ভিডিও যোগ
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingVideos ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-3">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div className="flex-1"><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-24" /></div>
                        </div>
                      ))}
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>কোনো ভিডিও পাওয়া যায়নি</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {videos.map((video) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                            <Video className="w-5 h-5 text-rose-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{video.titleBn || video.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{video.subject?.nameBn}</span>
                              {video.duration && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />{toBengaliNum(video.duration)} মি.
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">YouTube</Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Exams Tab ────────────────────────────────────────── */}
          <TabsContent value="exams" className="space-y-5 lg:space-y-6">
            {/* Exam Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <ClipboardList className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{toBengaliNum(exams.length)}</p>
                  <p className="text-xs text-muted-foreground">মোট পরীক্ষা</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <CircleCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{toBengaliNum(exams.filter(e => e.isActive).length)}</p>
                  <p className="text-xs text-muted-foreground">সক্রিয়</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <CircleX className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{toBengaliNum(exams.filter(e => !e.isActive).length)}</p>
                  <p className="text-xs text-muted-foreground">নিষ্ক্রিয়</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <Award className="w-8 h-8 text-violet-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{toBengaliNum(exams.reduce((s, e) => s + (e._count?.questions || 0), 0))}</p>
                  <p className="text-xs text-muted-foreground">মোট প্রশ্ন</p>
                </div>
              </div>
            </div>

            <Card className="relative overflow-hidden border-0 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-amber-500" />
                    </div>
                    পরীক্ষা তালিকা ({toBengaliNum(exams.length)})
                  </CardTitle>
                  <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 shadow-sm" onClick={() => setExamDialogOpen(true)}>
                    <Plus className="w-3.5 h-3.5" />
                    পরীক্ষা তৈরি
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingExams ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 p-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1"><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-32" /></div>
                      </div>
                    ))}
                  </div>
                ) : exams.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>কোনো পরীক্ষা পাওয়া যায়নি</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {exams.map((exam) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <FileCheck className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{exam.titleBn || exam.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">{exam.subject?.nameBn}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />{toBengaliNum(exam.duration)} মি.
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Award className="w-3 h-3" />{toBengaliNum(exam.totalMarks)} নম্বর
                            </span>
                            {exam._count && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{toBengaliNum(exam._count.questions)} প্রশ্ন</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant={exam.isActive ? 'default' : 'secondary'} className="text-xs">
                          {exam.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Notices Tab ──────────────────────────────────────── */}
          <TabsContent value="notices" className="space-y-5 lg:space-y-6">
            <Card className="relative overflow-hidden border-0 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-sky-600" />
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-sky-500" />
                    </div>
                    নোটিশ ব্যবস্থাপনা ({toBengaliNum(notices.length)})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={noticeFilter} onValueChange={setNoticeFilter}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব ধরন</SelectItem>
                        <SelectItem value="general">সাধারণ</SelectItem>
                        <SelectItem value="exam">পরীক্ষা</SelectItem>
                        <SelectItem value="urgent">জরুরি</SelectItem>
                        <SelectItem value="holiday">ছুটি</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="gap-1.5 bg-sky-600 hover:bg-sky-700 shadow-sm" onClick={() => setNoticeDialogOpen(true)}>
                      <Plus className="w-3.5 h-3.5" />
                      নতুন নোটিশ
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingNotices ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 p-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1"><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-24" /></div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>কোনো নোটিশ পাওয়া যায়নি</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {filteredNotices.map((notice) => (
                      <motion.div
                        key={notice.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${notice.isActive ? 'bg-violet-500' : 'bg-muted-foreground/40'}`} />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notice.titleBn || notice.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notice.createdAt).toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {getNoticeTypeBadge(notice.type)}

                          <Badge variant={notice.isActive ? 'default' : 'secondary'} className="text-xs">
                            {notice.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </Badge>

                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleNotice(notice)}
                            className={`p-1.5 rounded-md transition-colors ${
                              notice.isActive
                                ? 'text-violet-500 hover:bg-violet-500/10'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title={notice.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                          >
                            {notice.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditNotice(notice)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="সম্পাদনা"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>নোটিশ মুছে ফেলুন</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &quot;{notice.titleBn || notice.title}&quot; নোটিশটি মুছে ফেলতে চান? এই কাজ আর ফেরানো যাবে না।
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteNotice(notice.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  মুছে ফেলুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Students Tab ─────────────────────────────────────── */}
          <TabsContent value="students" className="space-y-5 lg:space-y-6">
            {/* User Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <Users className="w-8 h-8 text-violet-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{toBengaliNum(users.length)}</p>
                  <p className="text-xs text-muted-foreground">মোট ব্যবহারকারী</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <GraduationCap className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{toBengaliNum(users.filter(u => u.role === 'student').length)}</p>
                  <p className="text-xs text-muted-foreground">শিক্ষার্থী</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <Award className="w-8 h-8 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{toBengaliNum(users.filter(u => u.role === 'teacher').length)}</p>
                  <p className="text-xs text-muted-foreground">শিক্ষক</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-sky-500/5 border border-sky-500/10">
                <Shield className="w-8 h-8 text-sky-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{toBengaliNum(users.filter(u => u.role === 'guardian').length)}</p>
                  <p className="text-xs text-muted-foreground">অভিভাবক</p>
                </div>
              </div>
            </div>

            <Card className="relative overflow-hidden border-0 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-500" />
                    </div>
                    শিক্ষার্থী ও ব্যবহারকারী ({toBengaliNum(users.length)})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="নাম বা ইমেইল খুঁজুন..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-8 h-8 w-48 lg:w-56 text-xs"
                      />
                    </div>
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব ভূমিকা</SelectItem>
                        <SelectItem value="admin">অ্যাডমিন</SelectItem>
                        <SelectItem value="teacher">শিক্ষক</SelectItem>
                        <SelectItem value="student">শিক্ষার্থী</SelectItem>
                        <SelectItem value="guardian">অভিভাবক</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={fetchUsers}>
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center gap-4 p-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1"><Skeleton className="h-4 w-40 mb-2" /><Skeleton className="h-3 w-28" /></div>
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>কোনো ব্যবহারকারী পাওয়া যায়নি</p>
                  </div>
                ) : (
                  /* Desktop: Table layout; Mobile: Card layout */
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">অবতার</TableHead>
                            <TableHead>নাম</TableHead>
                            <TableHead>ইমেইল</TableHead>
                            <TableHead className="text-center">পরীক্ষা</TableHead>
                            <TableHead className="text-center">অগ্রগতি</TableHead>
                            <TableHead className="text-center">প্রশ্ন</TableHead>
                            <TableHead>ভূমিকা</TableHead>
                            <TableHead>যোগদান</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id} className="group">
                              <TableCell>
                                <Avatar className="w-9 h-9">
                                  <AvatarFallback className="bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-medium">
                                    {u.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-medium">{u.name}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <Award className="w-3.5 h-3.5 text-amber-500" />{toBengaliNum(u._count.examResults)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />{toBengaliNum(u._count.progressRecords)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center gap-1 text-xs">
                                  <FileText className="w-3.5 h-3.5 text-violet-500" />{toBengaliNum(u._count.qaQuestions)}
                                </span>
                              </TableCell>
                              <TableCell>{getRoleBadge(u.role)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {users.map((u) => (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-medium">
                              {u.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1" title="পরীক্ষার ফলাফল">
                                <Award className="w-3.5 h-3.5" />{toBengaliNum(u._count.examResults)}
                              </span>
                              <span className="flex items-center gap-1" title="অগ্রগতি">
                                <TrendingUp className="w-3.5 h-3.5" />{toBengaliNum(u._count.progressRecords)}
                              </span>
                              <span className="flex items-center gap-1" title="প্রশ্ন">
                                <FileText className="w-3.5 h-3.5" />{toBengaliNum(u._count.qaQuestions)}
                              </span>
                            </div>
                          </div>
                          {getRoleBadge(u.role)}
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* User Distribution */}
                {users.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">ব্যবহারকারী বিতরণ</p>
                    <DonutChart segments={userRoleDistribution} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Settings Tab ─────────────────────────────────────── */}
          <TabsContent value="settings" className="space-y-5 lg:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-violet-500" />
                      </div>
                      সাধারণ সেটিংস
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">নোটিফিকেশন</p>
                        <p className="text-xs text-muted-foreground">ব্যবহারকারীদের নোটিফিকেশন পাঠান</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">নিবন্ধন খোলা</p>
                        <p className="text-xs text-muted-foreground">নতুন শিক্ষার্থী নিবন্ধন করতে পারবে</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">রক্ষণাবেক্ষণ মোড</p>
                        <p className="text-xs text-muted-foreground">সাইট অস্থায়ীভাবে বন্ধ রাখুন</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">ইমেইল রিপোর্ট</p>
                        <p className="text-xs text-muted-foreground">সাপ্তাহিক রিপোর্ট ইমেইল করুন</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                      </div>
                      প্ল্যাটফর্ম তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {[
                      { label: 'মোট বিষয়', value: subjects.length, color: 'text-violet-600 dark:text-violet-400' },
                      { label: 'মোট অধ্যায়', value: totalChapters, color: 'text-violet-600 dark:text-violet-400' },
                      { label: 'মোট নোট', value: notes.length, color: 'text-amber-600 dark:text-amber-400' },
                      { label: 'মোট ভিডিও', value: videos.length, color: 'text-rose-600 dark:text-rose-400' },
                      { label: 'মোট পরীক্ষা', value: exams.length, color: 'text-purple-600 dark:text-purple-400' },
                      { label: 'মোট নোটিশ', value: notices.length, color: 'text-sky-600 dark:text-sky-400' },
                      { label: 'মোট ব্যবহারকারী', value: users.length, color: 'text-emerald-600 dark:text-emerald-400' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center p-2.5 rounded-lg bg-muted/30">
                        <span className="text-sm">{item.label}</span>
                        <span className={`text-sm font-bold ${item.color}`}>{toBengaliNum(item.value)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Danger Zone */}
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="relative overflow-hidden border border-red-200 dark:border-red-900/50 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-red-600" />
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    ঝুঁকিপূর্ণ এলাকা
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div>
                      <p className="text-sm font-medium">সব ক্যাশ মুছুন</p>
                      <p className="text-xs text-muted-foreground">প্ল্যাটফর্মের সব ক্যাশড ডেটা মুছে ফেলুন</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                      ক্যাশ মুছুন
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div>
                      <p className="text-sm font-medium">ডাটাবেস রিসেট</p>
                      <p className="text-xs text-muted-foreground">সতর্কতা: এই কাজ ফেরানো যাবে না</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20" disabled>
                      রিসেট
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ─── Dialog: Add/Edit Notice ──────────────────────────────────────── */}
      <Dialog open={noticeDialogOpen} onOpenChange={setNoticeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-500" />
              নতুন নোটিশ তৈরি করুন
            </DialogTitle>
            <DialogDescription>নোটিশ বোর্ডে নতুন নোটিশ যোগ করুন</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>শিরোনাম (ইংরেজি)</Label>
                <Input
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Notice title"
                />
              </div>
              <div className="space-y-2">
                <Label>শিরোনাম (বাংলা)</Label>
                <Input
                  value={noticeForm.titleBn}
                  onChange={(e) => setNoticeForm(p => ({ ...p, titleBn: e.target.value }))}
                  placeholder="নোটিশের শিরোনাম"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>বিষয়বস্তু</Label>
              <Textarea
                value={noticeForm.content}
                onChange={(e) => setNoticeForm(p => ({ ...p, content: e.target.value }))}
                placeholder="নোটিশের বিস্তারিত লিখুন..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ধরন</Label>
                <Select value={noticeForm.type} onValueChange={(v) => setNoticeForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">সাধারণ</SelectItem>
                    <SelectItem value="exam">পরীক্ষা</SelectItem>
                    <SelectItem value="urgent">জরুরি</SelectItem>
                    <SelectItem value="holiday">ছুটি</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>সক্রিয়</Label>
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    checked={noticeForm.isActive}
                    onCheckedChange={(v) => setNoticeForm(p => ({ ...p, isActive: v }))}
                  />
                  <span className="text-sm">{noticeForm.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoticeDialogOpen(false)}>বাতিল</Button>
            <Button
              className="bg-sky-600 hover:bg-sky-700"
              onClick={handleCreateNotice}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              তৈরি করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Edit Notice ──────────────────────────────────────────── */}
      <Dialog open={editNoticeDialogOpen} onOpenChange={setEditNoticeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-500" />
              নোটিশ সম্পাদনা
            </DialogTitle>
            <DialogDescription>নোটিশের তথ্য আপডেট করুন</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>শিরোনাম (ইংরেজি)</Label>
                <Input
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>শিরোনাম (বাংলা)</Label>
                <Input
                  value={noticeForm.titleBn}
                  onChange={(e) => setNoticeForm(p => ({ ...p, titleBn: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>বিষয়বস্তু</Label>
              <Textarea
                value={noticeForm.content}
                onChange={(e) => setNoticeForm(p => ({ ...p, content: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ধরন</Label>
                <Select value={noticeForm.type} onValueChange={(v) => setNoticeForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">সাধারণ</SelectItem>
                    <SelectItem value="exam">পরীক্ষা</SelectItem>
                    <SelectItem value="urgent">জরুরি</SelectItem>
                    <SelectItem value="holiday">ছুটি</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>সক্রিয়</Label>
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    checked={noticeForm.isActive}
                    onCheckedChange={(v) => setNoticeForm(p => ({ ...p, isActive: v }))}
                  />
                  <span className="text-sm">{noticeForm.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNoticeDialogOpen(false)}>বাতিল</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleUpdateNotice}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              আপডেট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Add Note ─────────────────────────────────────────────── */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" />
              নতুন নোট যোগ করুন
            </DialogTitle>
            <DialogDescription>নতুন পড়ার নোট তৈরি করুন</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>শিরোনাম (ইংরেজি)</Label>
                <Input
                  value={noteForm.title}
                  onChange={(e) => setNoteForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Note title"
                />
              </div>
              <div className="space-y-2">
                <Label>শিরোনাম (বাংলা)</Label>
                <Input
                  value={noteForm.titleBn}
                  onChange={(e) => setNoteForm(p => ({ ...p, titleBn: e.target.value }))}
                  placeholder="নোটের শিরোনাম"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>বিষয়</Label>
                <Select value={noteForm.subjectId} onValueChange={(v) => setNoteForm(p => ({ ...p, subjectId: v, chapterId: '' }))}>
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
              <div className="space-y-2">
                <Label>অধ্যায় (ঐচ্ছিক)</Label>
                <Select value={noteForm.chapterId} onValueChange={(v) => setNoteForm(p => ({ ...p, chapterId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="অধ্যায় নির্বাচন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">নেই</SelectItem>
                    {availableChapters.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nameBn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>ধরন</Label>
              <Select value={noteForm.type} onValueChange={(v) => setNoteForm(p => ({ ...p, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="handnote">হ্যান্ডনোট</SelectItem>
                  <SelectItem value="suggestion">সাজেশন</SelectItem>
                  <SelectItem value="past-question">বিগত প্রশ্ন</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>বিষয়বস্তু (মার্কডাউন)</Label>
              <Textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm(p => ({ ...p, content: e.target.value }))}
                placeholder="নোটের বিষয়বস্তু লিখুন..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>বাতিল</Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              onClick={handleCreateNote}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              তৈরি করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Add Video ────────────────────────────────────────────── */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-500" />
              নতুন ভিডিও যোগ করুন
            </DialogTitle>
            <DialogDescription>ইউটিউব ভিডিও লেকচার যোগ করুন</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>শিরোনাম (ইংরেজি)</Label>
                <Input
                  value={videoForm.title}
                  onChange={(e) => setVideoForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Video title"
                />
              </div>
              <div className="space-y-2">
                <Label>শিরোনাম (বাংলা)</Label>
                <Input
                  value={videoForm.titleBn}
                  onChange={(e) => setVideoForm(p => ({ ...p, titleBn: e.target.value }))}
                  placeholder="ভিডিওর শিরোনাম"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>বিষয়</Label>
                <Select value={videoForm.subjectId} onValueChange={(v) => setVideoForm(p => ({ ...p, subjectId: v, chapterId: '' }))}>
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
              <div className="space-y-2">
                <Label>অধ্যায় (ঐচ্ছিক)</Label>
                <Select value={videoForm.chapterId} onValueChange={(v) => setVideoForm(p => ({ ...p, chapterId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="অধ্যায় নির্বাচন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">নেই</SelectItem>
                    {availableChapters.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nameBn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ইউটিউব ভিডিও আইডি</Label>
                <Input
                  value={videoForm.youtubeId}
                  onChange={(e) => setVideoForm(p => ({ ...p, youtubeId: e.target.value }))}
                  placeholder="dQw4w9WgXcQ"
                />
              </div>
              <div className="space-y-2">
                <Label>সময়কাল (মিনিট)</Label>
                <Input
                  type="number"
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="15"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>বাতিল</Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={handleCreateVideo}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              যোগ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Add Exam ─────────────────────────────────────────────── */}
      <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-500" />
              নতুন পরীক্ষা তৈরি করুন
            </DialogTitle>
            <DialogDescription>নতুন MCQ পরীক্ষা তৈরি করুন</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>শিরোনাম (ইংরেজি)</Label>
                <Input
                  value={examForm.title}
                  onChange={(e) => setExamForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Exam title"
                />
              </div>
              <div className="space-y-2">
                <Label>শিরোনাম (বাংলা)</Label>
                <Input
                  value={examForm.titleBn}
                  onChange={(e) => setExamForm(p => ({ ...p, titleBn: e.target.value }))}
                  placeholder="পরীক্ষার শিরোনাম"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>বিষয়</Label>
                <Select value={examForm.subjectId} onValueChange={(v) => setExamForm(p => ({ ...p, subjectId: v, chapterId: '' }))}>
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
              <div className="space-y-2">
                <Label>অধ্যায় (ঐচ্ছিক)</Label>
                <Select value={examForm.chapterId} onValueChange={(v) => setExamForm(p => ({ ...p, chapterId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="অধ্যায় নির্বাচন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">নেই</SelectItem>
                    {availableChapters.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nameBn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>সময়কাল (মিনিট)</Label>
                <Input
                  type="number"
                  value={examForm.duration}
                  onChange={(e) => setExamForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label>মোট নম্বর</Label>
                <Input
                  type="number"
                  value={examForm.totalMarks}
                  onChange={(e) => setExamForm(p => ({ ...p, totalMarks: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamDialogOpen(false)}>বাতিল</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleCreateExam}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              তৈরি করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
