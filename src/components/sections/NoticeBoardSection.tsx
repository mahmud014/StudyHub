'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, Filter, Pin, ChevronDown, ChevronUp,
  AlertTriangle, Info, Megaphone, Calendar, BookOpen,
  ClipboardList, GraduationCap, Clock, X, Plus, Trash2, Edit3, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────

interface Notice {
  id: string;
  title: string;
  titleBn: string;
  content: string;
  type: string;
  priority: string;
  category: string;
  pinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type PriorityFilter = 'all' | 'জরুরি' | 'সাধারণ' | 'তথ্যমূলক';
type CategoryFilter = 'all' | 'পরীক্ষা' | 'ক্লাস' | 'অ্যাসাইনমেন্ট' | 'সাধারণ';

// ─── Bengali Date Helper ─────────────────────────────────────────

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const bengaliMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function toBengaliDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

function formatBengaliDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = toBengaliDigits(date.getDate());
  const month = bengaliMonths[date.getMonth()];
  const year = toBengaliDigits(date.getFullYear());
  return `${day} ${month}, ${year}`;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'এইমাত্র';
  if (diffMinutes < 60) return `${toBengaliDigits(diffMinutes)} মিনিট আগে`;
  if (diffHours < 24) return `${toBengaliDigits(diffHours)} ঘণ্টা আগে`;
  if (diffDays < 7) return `${toBengaliDigits(diffDays)} দিন আগে`;
  return formatBengaliDate(dateStr);
}

// ─── Priority & Category Config ──────────────────────────────────

const priorityConfig: Record<string, {
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  glow: string;
}> = {
  'জরুরি': {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: AlertTriangle,
    glow: 'shadow-red-500/10',
  },
  'সাধারণ': {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: Megaphone,
    glow: 'shadow-amber-500/10',
  },
  'তথ্যমূলক': {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: Info,
    glow: 'shadow-emerald-500/10',
  },
};

const categoryConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  'পরীক্ষা': { icon: Calendar, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
  'ক্লাস': { icon: GraduationCap, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  'অ্যাসাইনমেন্ট': { icon: ClipboardList, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
  'সাধারণ': { icon: BookOpen, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10' },
};

const priorityFilters: { value: PriorityFilter; label: string; color: string }[] = [
  { value: 'all', label: 'সব', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  { value: 'জরুরি', label: 'জরুরি', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  { value: 'সাধারণ', label: 'সাধারণ', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { value: 'তথ্যমূলক', label: 'তথ্যমূলক', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
];

const categoryFilters: { value: CategoryFilter; label: string; color: string }[] = [
  { value: 'all', label: 'সব', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  { value: 'পরীক্ষা', label: 'পরীক্ষা', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { value: 'ক্লাস', label: 'ক্লাস', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { value: 'অ্যাসাইনমেন্ট', label: 'অ্যাসাইনমেন্ট', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { value: 'সাধারণ', label: 'সাধারণ', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
];

// ─── Notice Card Component ───────────────────────────────────────

function NoticeCard({
  notice,
  index,
  isExpanded,
  onToggle,
  isAdminOrTeacher,
  onEdit,
  onDelete,
}: {
  notice: Notice;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isAdminOrTeacher?: boolean;
  onEdit?: (notice: Notice) => void;
  onDelete?: (notice: Notice) => void;
}) {
  const pConfig = priorityConfig[notice.priority] || priorityConfig['সাধারণ'];
  const cConfig = categoryConfig[notice.category] || categoryConfig['সাধারণ'];
  const PriorityIcon = pConfig.icon;
  const CategoryIcon = cConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.21, 1.11, 0.81, 0.99] }}
      layout
    >
      <Card
        className={`group cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden ${
          notice.pinned
            ? `border-2 ${pConfig.border} ${pConfig.glow} shadow-md`
            : 'border border-border/60 hover:border-primary/30'
        } bg-card/60 backdrop-blur-md`}
        onClick={onToggle}
      >
        {/* Pinned indicator bar */}
        {notice.pinned && (
          <div className={`h-1 w-full ${notice.priority === 'জরুরি' ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-primary to-emerald-500'}`} />
        )}

        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {notice.pinned && (
                  <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/30">
                    <Pin className="w-2.5 h-2.5" />
                    পিন
                  </Badge>
                )}
                <Badge variant="outline" className={`gap-1 text-[10px] px-1.5 py-0 h-5 ${pConfig.color} ${pConfig.bg} ${pConfig.border}`}>
                  <PriorityIcon className="w-2.5 h-2.5" />
                  {notice.priority}
                </Badge>
                <Badge variant="outline" className={`gap-1 text-[10px] px-1.5 py-0 h-5 ${cConfig.color} ${cConfig.bg}`}>
                  <CategoryIcon className="w-2.5 h-2.5" />
                  {notice.category}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {notice.titleBn || notice.title}
              </h3>
            </div>

            {/* Actions & Expand icon */}
            <div className="flex items-center gap-1 shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
              {isAdminOrTeacher && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                    onClick={() => onEdit?.(notice)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md"
                    onClick={() => onDelete?.(notice)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="p-1"
                onClick={onToggle}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4 pt-0">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Clock className="w-3 h-3" />
            <span>{formatBengaliDate(notice.createdAt)}</span>
            <span className="text-muted-foreground/60">•</span>
            <span>{formatRelativeTime(notice.createdAt)}</span>
          </div>

          {/* Preview or full content */}
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.p
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed"
              >
                {notice.content}
              </motion.p>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line border-t border-border/40 pt-3">
                  {notice.content}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
                  <span className="text-[10px] text-muted-foreground">
                    আপডেট: {formatBengaliDate(notice.updatedAt)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function NoticeBoardSection() {
  const { user } = useStudyHub();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // CRUD Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    titleBn: '',
    content: '',
    type: 'general',
    priority: 'সাধারণ',
    category: 'সাধারণ',
    pinned: false,
    isActive: true,
  });

  // Fetch notices
  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notices?all=true');
      const data = await res.json();
      if (data.success && data.data) {
        setNotices(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleOpenCreate = () => {
    setNoticeForm({
      title: '',
      titleBn: '',
      content: '',
      type: 'general',
      priority: 'সাধারণ',
      category: 'সাধারণ',
      pinned: false,
      isActive: true,
    });
    setCreateOpen(true);
  };

  const handleOpenEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setNoticeForm({
      title: notice.title,
      titleBn: notice.titleBn || '',
      content: notice.content,
      type: notice.type || 'general',
      priority: notice.priority || 'সাধারণ',
      category: notice.category || 'সাধারণ',
      pinned: notice.pinned || false,
      isActive: notice.isActive !== undefined ? notice.isActive : true,
    });
    setEditOpen(true);
  };

  const handleOpenDelete = (notice: Notice) => {
    setSelectedNotice(notice);
    setDeleteOpen(true);
  };

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
        body: JSON.stringify(noticeForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('নোটিশ সফলভাবে তৈরি হয়েছে');
        setCreateOpen(false);
        fetchNotices();
      } else {
        toast.error(data.error || 'নোটিশ তৈরি করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সংযোগে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNotice = async () => {
    if (!selectedNotice) return;
    if (!noticeForm.title || !noticeForm.titleBn || !noticeForm.content) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/notices/${selectedNotice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('নোটিশ আপডেট হয়েছে');
        setEditOpen(false);
        fetchNotices();
      } else {
        toast.error(data.error || 'নোটিশ আপডেট করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সংযোগে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async () => {
    if (!selectedNotice) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/notices/${selectedNotice.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('নোটিশ মুছে ফেলা হয়েছে');
        setDeleteOpen(false);
        fetchNotices();
      } else {
        toast.error(data.error || 'নোটিশ মুছতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সংযোগে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and sort notices
  const filteredNotices = notices
    .filter((n) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (n.titleBn || n.title).toLowerCase().includes(q);
        const matchesContent = n.content.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }
      // Priority filter
      if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
      // Category filter
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Stats
  const urgentCount = notices.filter(n => n.priority === 'জরুরি').length;
  const pinnedCount = notices.filter(n => n.pinned).length;
  const totalCount = notices.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-emerald-50/30 dark:to-emerald-950/10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">নোটিশ বোর্ড</h1>
                <p className="text-sm text-muted-foreground">সকল গুরুত্বপূর্ণ বিজ্ঞপ্তি ও ঘোষণা</p>
              </div>
            </div>

            {/* Stats badges & Create notice button */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {urgentCount > 0 && (
                  <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    {toBengaliDigits(urgentCount)} জরুরি
                  </Badge>
                )}
                {pinnedCount > 0 && (
                  <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/30">
                    <Pin className="w-3 h-3" />
                    {toBengaliDigits(pinnedCount)} পিন
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  <Bell className="w-3 h-3" />
                  মোট {toBengaliDigits(totalCount)}
                </Badge>
              </div>
              {isAdminOrTeacher && (
                <Button
                  onClick={handleOpenCreate}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  নতুন নোটিশ
                </Button>
              )}
            </div>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 space-y-3"
          >
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="নোটিশ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-11 bg-card/60 backdrop-blur-sm border-border/60 focus:border-primary/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle button (mobile) & inline filters (desktop) */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5 lg:hidden"
              >
                <Filter className="w-3.5 h-3.5" />
                ফিল্টার
                {(priorityFilter !== 'all' || categoryFilter !== 'all') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Button>

              {/* Desktop: always show filters */}
              <div className="hidden lg:flex items-center gap-4 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">অগ্রাধিকার:</span>
                  {priorityFilters.map((pf) => (
                    <button
                      key={pf.value}
                      onClick={() => setPriorityFilter(pf.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        priorityFilter === pf.value
                          ? `${pf.color} ring-1 ring-current shadow-sm`
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      {pf.label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-5 bg-border" />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">বিভাগ:</span>
                  {categoryFilters.map((cf) => (
                    <button
                      key={cf.value}
                      onClick={() => setCategoryFilter(cf.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        categoryFilter === cf.value
                          ? `${cf.color} ring-1 ring-current shadow-sm`
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      {cf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden lg:hidden"
                >
                  <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/40 p-4 space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">অগ্রাধিকার</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {priorityFilters.map((pf) => (
                          <button
                            key={pf.value}
                            onClick={() => setPriorityFilter(pf.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                              priorityFilter === pf.value
                                ? `${pf.color} ring-1 ring-current shadow-sm`
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                          >
                            {pf.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">বিভাগ</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {categoryFilters.map((cf) => (
                          <button
                            key={cf.value}
                            onClick={() => setCategoryFilter(cf.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                              categoryFilter === cf.value
                                ? `${cf.color} ring-1 ring-current shadow-sm`
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                          >
                            {cf.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Notices List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Active filters indicator */}
        {(priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4 flex-wrap"
          >
            <span className="text-xs text-muted-foreground">সক্রিয় ফিল্টার:</span>
            {priorityFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                অগ্রাধিকার: {priorityFilter}
                <button onClick={() => setPriorityFilter('all')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                বিভাগ: {categoryFilter}
                <button onClick={() => setCategoryFilter('all')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 text-xs">
                খোঁজ: {searchQuery}
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={() => {
                setPriorityFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-primary hover:underline"
            >
              সব মুছুন
            </button>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card/60 backdrop-blur-md border-border/40">
                <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
                  <div className="flex gap-2 mb-2">
                    <div className="h-5 w-16 rounded-full bg-muted/50 animate-pulse" />
                    <div className="h-5 w-16 rounded-full bg-muted/50 animate-pulse" />
                  </div>
                  <div className="h-5 w-3/4 rounded bg-muted/50 animate-pulse" />
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4">
                  <div className="h-3 w-32 rounded bg-muted/50 animate-pulse mb-2" />
                  <div className="h-3 w-full rounded bg-muted/50 animate-pulse mb-1" />
                  <div className="h-3 w-2/3 rounded bg-muted/50 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredNotices.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-emerald-500/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">কোনো নোটিশ পাওয়া যায়নি</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all'
                ? 'আপনার ফিল্টার বা অনুসন্ধানের সাথে মিলে এমন কোনো নোটিশ নেই। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।'
                : 'এখনো কোনো নোটিশ প্রকাশিত হয়নি। পরে আবার দেখুন।'}
            </p>
            {(searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                }}
                className="mt-4 gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                ফিল্টার মুছুন
              </Button>
            )}
          </motion.div>
        )}

        {/* Notices grid */}
        {!loading && filteredNotices.length > 0 && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredNotices.map((notice, index) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  index={index}
                  isExpanded={expandedId === notice.id}
                  onToggle={() =>
                    setExpandedId(expandedId === notice.id ? null : notice.id)
                  }
                  isAdminOrTeacher={isAdminOrTeacher}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Results count */}
        {!loading && filteredNotices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6"
          >
            <p className="text-xs text-muted-foreground">
              মোট {toBengaliDigits(filteredNotices.length)}টি নোটিশ দেখানো হচ্ছে
              {filteredNotices.length !== notices.length && (
                <span> (সর্বমোট {toBengaliDigits(notices.length)}টি থেকে)</span>
              )}
            </p>
          </motion.div>
        )}
      </div>

      {/* Create Notice Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              নতুন নোটিশ তৈরি করুন
            </DialogTitle>
            <DialogDescription>
              বিজ্ঞপ্তি বোর্ড প্রকাশ করতে তথ্যগুলো পূরণ করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">শিরোনাম (ইংরেজি) *</Label>
              <Input
                placeholder="Notice Title in English"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">শিরোনাম (বাংলা) *</Label>
              <Input
                placeholder="নোটিশের শিরোনাম বাংলায়"
                value={noticeForm.titleBn}
                onChange={(e) => setNoticeForm({ ...noticeForm, titleBn: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">বিস্তারিত বিবরণ *</Label>
              <Textarea
                placeholder="নোটিশের বিস্তারিত তথ্য এখানে লিখুন..."
                value={noticeForm.content}
                onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">অগ্রাধিকার</Label>
                <Select
                  value={noticeForm.priority}
                  onValueChange={(val) => setNoticeForm({ ...noticeForm, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="জরুরি">জরুরি</SelectItem>
                    <SelectItem value="সাধারণ">সাধারণ</SelectItem>
                    <SelectItem value="তথ্যমূলক">তথ্যমূলক</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">বিভাগ</Label>
                <Select
                  value={noticeForm.category}
                  onValueChange={(val) => setNoticeForm({ ...noticeForm, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="পরীক্ষা">পরীক্ষা</SelectItem>
                    <SelectItem value="ক্লাস">ক্লাস</SelectItem>
                    <SelectItem value="অ্যাসাইনমেন্ট">অ্যাসাইনমেন্ট</SelectItem>
                    <SelectItem value="সাধারণ">সাধারণ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-accent/50">
              <div className="space-y-0.5">
                <Label className="text-sm cursor-pointer" htmlFor="pinned-create">গুরুত্বপূর্ণ (পিন করুন)</Label>
                <p className="text-xs text-muted-foreground">নোটিশটি উপরে পিন হয়ে থাকবে</p>
              </div>
              <Switch
                id="pinned-create"
                checked={noticeForm.pinned}
                onCheckedChange={(val) => setNoticeForm({ ...noticeForm, pinned: val })}
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-accent/50">
              <div className="space-y-0.5">
                <Label className="text-sm cursor-pointer" htmlFor="active-create">সক্রিয় স্ট্যাটাস</Label>
                <p className="text-xs text-muted-foreground">শিক্ষার্থীরা নোটিশটি দেখতে পাবে</p>
              </div>
              <Switch
                id="active-create"
                checked={noticeForm.isActive}
                onCheckedChange={(val) => setNoticeForm({ ...noticeForm, isActive: val })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
              বাতিল
            </Button>
            <Button onClick={handleCreateNotice} disabled={submitting} className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              তৈরি করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              নোটিশ সম্পাদন করুন
            </DialogTitle>
            <DialogDescription>
              নোটিশের তথ্যগুলো আপডেট করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">শিরোনাম (ইংরেজি) *</Label>
              <Input
                placeholder="Notice Title in English"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">শিরোনাম (বাংলা) *</Label>
              <Input
                placeholder="নোটিশের শিরোনাম বাংলায়"
                value={noticeForm.titleBn}
                onChange={(e) => setNoticeForm({ ...noticeForm, titleBn: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">বিস্তারিত বিবরণ *</Label>
              <Textarea
                placeholder="নোটিশের বিস্তারিত তথ্য এখানে লিখুন..."
                value={noticeForm.content}
                onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">অগ্রাধিকার</Label>
                <Select
                  value={noticeForm.priority}
                  onValueChange={(val) => setNoticeForm({ ...noticeForm, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="জরুরি">জরুরি</SelectItem>
                    <SelectItem value="সাধারণ">সাধারণ</SelectItem>
                    <SelectItem value="তথ্যমূলক">তথ্যমূলক</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">বিভাগ</Label>
                <Select
                  value={noticeForm.category}
                  onValueChange={(val) => setNoticeForm({ ...noticeForm, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="পরীক্ষা">পরীক্ষা</SelectItem>
                    <SelectItem value="ক্লাস">ক্লাস</SelectItem>
                    <SelectItem value="অ্যাসাইনমেন্ট">অ্যাসাইনমেন্ট</SelectItem>
                    <SelectItem value="সাধারণ">সাধারণ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-accent/50">
              <div className="space-y-0.5">
                <Label className="text-sm cursor-pointer" htmlFor="pinned-edit">গুরুত্বপূর্ণ (পিন করুন)</Label>
                <p className="text-xs text-muted-foreground">নোটিশটি উপরে পিন হয়ে থাকবে</p>
              </div>
              <Switch
                id="pinned-edit"
                checked={noticeForm.pinned}
                onCheckedChange={(val) => setNoticeForm({ ...noticeForm, pinned: val })}
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-accent/50">
              <div className="space-y-0.5">
                <Label className="text-sm cursor-pointer" htmlFor="active-edit">সক্রিয় স্ট্যাটাস</Label>
                <p className="text-xs text-muted-foreground">শিক্ষার্থীরা নোটিশটি দেখতে পাবে</p>
              </div>
              <Switch
                id="active-edit"
                checked={noticeForm.isActive}
                onCheckedChange={(val) => setNoticeForm({ ...noticeForm, isActive: val })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>
              বাতিল
            </Button>
            <Button onClick={handleUpdateNotice} disabled={submitting} className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              আপডেট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Notice Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              নোটিশ মুছে ফেলুন
            </DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান? এটি আর পুনরুদ্ধার করা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-semibold text-foreground">
              {selectedNotice?.titleBn || selectedNotice?.title}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting}>
              বাতিল
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotice} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
