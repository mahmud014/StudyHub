'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Play, Clock, Search, BookOpen, Filter, ChevronDown,
  SkipForward, SkipBack, CheckCircle2, TrendingUp, Sparkles,
  Eye, ShieldCheck, Download, Shield, Lock, BookmarkPlus, BookmarkCheck,
  RefreshCw, WifiOff, Pencil, Trash2, PlusCircle, Loader2, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// ─── Bengali Number Helper ───────────────────────────────────────────────────
function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map(d => (d === '.' ? '.' : bengaliDigits[parseInt(d)] ?? d))
    .join('');
}

// ─── Duration Formatter ──────────────────────────────────────────────────────
function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${toBengaliNum(mins)}:${toBengaliNum(secs).padStart(2, '০')}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface VideoItem {
  id: string;
  title: string;
  titleBn: string;
  youtubeId: string;
  duration: number | null;
  subjectId: string;
  chapterId: string | null;
  createdAt?: string;
  subject?: { nameBn: string };
  chapter?: { nameBn: string };
}

interface Subject {
  id: string;
  name: string;
  nameBn: string;
  chapters?: { id: string; name: string; nameBn: string }[];
}

type SortMode = 'default' | 'popular' | 'new';

// ─── Component ───────────────────────────────────────────────────────────────
// Screenshot protection handler
function useScreenshotProtection() {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        toast.error('স্ক্রিনশট নেওয়া যাবে না', {
          description: 'কপিরাইট সুরক্ষিত কন্টেন্ট',
          icon: <Shield className="w-4 h-4 text-primary" />,
        });
        // Clear clipboard
        try { navigator.clipboard.writeText(''); } catch {}
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

export default function VideosSection() {
  useScreenshotProtection();
  const { user, selectedSubject } = useStudyHub();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD States for Admin/Teacher
  const [crudDialogOpen, setCrudDialogOpen] = useState(false);
  const [crudMode, setCrudMode] = useState<'create' | 'edit'>('create');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleBn: '',
    subjectId: '',
    chapterId: '',
    youtubeId: '',
    duration: '',
    order: '0',
  });
  const [crudLoading, setCrudLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [watchedVideoIds, setWatchedVideoIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('studyhub_watched_videos');
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        return new Set(parsed);
      }
    } catch {
      // ignore
    }
    return new Set();
  });
  // Watch later bookmarks
  const [watchLaterIds, setWatchLaterIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('studyhub_watch_later');
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        return new Set(parsed);
      }
    } catch {}
    return new Set();
  });

  // Mark video as watched
  const markWatched = useCallback((videoId: string) => {
    setWatchedVideoIds(prev => {
      const next = new Set(prev);
      next.add(videoId);
      try {
        localStorage.setItem('studyhub_watched_videos', JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Toggle watch later
  const toggleWatchLater = useCallback((videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchLaterIds(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
        toast('পরে দেখুন থেকে সরানো হয়েছে', { icon: <BookmarkPlus className="w-4 h-4 text-muted-foreground" /> });
      } else {
        next.add(videoId);
        toast.success('পরে দেখুন যোগ হয়েছে!', { icon: <BookmarkCheck className="w-4 h-4 text-primary" /> });
      }
      try {
        localStorage.setItem('studyhub_watch_later', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  // Fetch subjects
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => {
        if (!res.ok) throw new Error('সার্ভার ত্রুটি');
        return res.json();
      })
      .then(data => {
        if (data.success) setSubjects(data.data);
      })
      .catch(() => {
        // Subjects fetch failure is non-critical
      });
  }, []);

  // Fetch videos with error handling
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const subjectFilter = selectedSubject || (selectedSubjectId !== 'all' ? selectedSubjectId : '');
      if (subjectFilter) params.set('subjectId', subjectFilter);

      const res = await fetch(`/api/videos?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setVideos(data.data);
        setError(null);
      } else {
        setError(data.error || 'ভিডিও লোড করতে সমস্যা হয়েছে');
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedSubjectId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Retry handler for error state
  const handleRetry = useCallback(() => {
    fetchVideos();
  }, [fetchVideos]);

  // CRUD Actions
  const handleCreateVideo = useCallback(() => {
    setCrudMode('create');
    setFormData({
      title: '',
      titleBn: '',
      subjectId: selectedSubject || (selectedSubjectId !== 'all' ? selectedSubjectId : ''),
      chapterId: '',
      youtubeId: '',
      duration: '',
      order: '0',
    });
    setCrudDialogOpen(true);
  }, [selectedSubject, selectedSubjectId]);

  const handleEditVideo = useCallback((video: VideoItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCrudMode('edit');
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      titleBn: video.titleBn,
      subjectId: video.subjectId,
      chapterId: video.chapterId || '',
      youtubeId: video.youtubeId,
      duration: video.duration ? String(video.duration) : '',
      order: '0',
    });
    setCrudDialogOpen(true);
  }, []);

  const handleCrudSubmit = useCallback(async () => {
    if (!formData.subjectId || !formData.title || !formData.titleBn || !formData.youtubeId) {
      toast.error('বিষয়, শিরোনাম ও ইউটিউব আইডি প্রয়োজন');
      return;
    }

    setCrudLoading(true);
    try {
      const payload = {
        subjectId: formData.subjectId,
        chapterId: formData.chapterId || null,
        title: formData.title,
        titleBn: formData.titleBn,
        youtubeId: formData.youtubeId,
        duration: formData.duration ? parseInt(formData.duration) : null,
        order: formData.order ? parseInt(formData.order) : 0,
      };

      let res: Response;
      if (crudMode === 'create') {
        res = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (selectedVideo) {
        res = await fetch(`/api/videos/${selectedVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        return;
      }

      const data = await res.json();
      if (data.success) {
        toast.success(crudMode === 'create' ? 'ভিডিও যোগ করা হয়েছে!' : 'ভিডিও আপডেট করা হয়েছে!');
        setCrudDialogOpen(false);
        if (crudMode === 'edit' && selectedVideo && playingVideo?.id === selectedVideo.id) {
          setPlayingVideo(data.data);
        }
        fetchVideos();
      } else {
        toast.error(data.error || 'ভিডিও সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setCrudLoading(false);
    }
  }, [formData, crudMode, selectedVideo, playingVideo, fetchVideos]);

  const handleDeleteVideo = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/videos/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('ভিডিওটি মুছে ফেলা হয়েছে');
        if (playingVideo?.id === deleteTarget.id) {
          setPlayingVideo(null);
        }
        setDeleteTarget(null);
        fetchVideos();
      } else {
        toast.error(data.error || 'মুছে ফেলতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, playingVideo, fetchVideos]);

  // Filtered & sorted videos
  const filteredVideos = videos
    .filter(video =>
      (video.titleBn || video.title).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortMode === 'new') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (sortMode === 'popular') {
        // Deterministic "popularity" based on id hash
        const hashA = a.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const hashB = b.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return hashB - hashA;
      }
      return 0;
    });

  // Current video index for navigation
  const currentVideoIndex = filteredVideos.findIndex(v => v.id === playingVideo?.id);
  const hasPrev = currentVideoIndex > 0;
  const hasNext = currentVideoIndex < filteredVideos.length - 1 && currentVideoIndex >= 0;

  const goToPrev = () => {
    if (hasPrev) {
      const prevVideo = filteredVideos[currentVideoIndex - 1];
      setPlayingVideo(prevVideo);
      markWatched(prevVideo.id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      const nextVideo = filteredVideos[currentVideoIndex + 1];
      setPlayingVideo(nextVideo);
      markWatched(nextVideo.id);
    }
  };

  const handlePlayVideo = (video: VideoItem) => {
    setPlayingVideo(video);
    markWatched(video.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
      {/* ─── Enhanced Section Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Video className="w-7 h-7 text-primary" />
                ভিডিও ক্লাস
              </h2>
              <p className="mt-1 text-muted-foreground text-sm sm:text-base">
                বিষয় ও অধ্যায় অনুযায়ী সাজানো ভিডিও লেকচার
              </p>
              {/* Decorative underline */}
              <div className="mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-primary via-emerald-500 to-primary/40" />
            </div>
            <div className="flex items-center gap-2">
              {watchLaterIds.size > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20">
                  <BookmarkCheck className="w-3 h-3 mr-1" />
                  {toBengaliNum(watchLaterIds.size)} পরে দেখুন
                </Badge>
              )}
              <Badge variant="secondary" className="self-start sm:self-auto text-sm px-3 py-1">
                <Video className="w-3.5 h-3.5 mr-1.5" />
                মোট: {toBengaliNum(videos.length)} টি ভিডিও
              </Badge>
              {isAdminOrTeacher && (
                <Button
                  onClick={handleCreateVideo}
                  size="sm"
                  className="gap-1.5 h-9"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">নতুন ভিডিও</span>
                  <span className="sm:hidden">ভিডিও</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Search & Filter ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ভিডিও খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="h-10 sm:h-9 rounded-md border border-input bg-background px-3 pl-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none pr-8 cursor-pointer"
            >
              <option value="all">সকল বিষয়</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.nameBn}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {/* Sort Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={sortMode === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortMode(sortMode === 'popular' ? 'default' : 'popular')}
              className="gap-1.5 text-xs h-10 sm:h-9"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              জনপ্রিয়
            </Button>
            <Button
              variant={sortMode === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortMode(sortMode === 'new' ? 'default' : 'new')}
              className="gap-1.5 text-xs h-10 sm:h-9"
            >
              <Sparkles className="w-3.5 h-3.5" />
              নতুন
            </Button>
          </div>
        </div>
      </div>

      {/* Result Count */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <p className="text-sm text-muted-foreground">
            {toBengaliNum(filteredVideos.length)} টি ফলাফল
          </p>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skeleton Video Player */}
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          </div>
          {/* Skeleton Video List */}
          <div className="lg:col-span-1 space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-3 rounded-lg border">
                <div className="flex gap-3">
                  <Skeleton className="shrink-0 w-28 h-[72px] rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        /* ─── Error State ──────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-12 px-6 text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
              >
                <WifiOff className="w-8 h-8 text-destructive" />
              </motion.div>
              <h3 className="text-lg font-semibold text-destructive mb-2">
                ভিডিও লোড করতে সমস্যা হয়েছে
              </h3>
              <p className="text-sm text-muted-foreground mb-1 max-w-md mx-auto">
                {error}
              </p>
              <p className="text-xs text-muted-foreground/70 mb-6">
                ইন্টারনেট সংযোগ পরীক্ষা করুন অথবা পুনরায় চেষ্টা করুন
              </p>
              <Button
                onClick={handleRetry}
                variant="outline"
                className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="w-4 h-4" />
                পুনরায় চেষ্টা করুন
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* ─── Video Player Area ────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {playingVideo ? (
                <motion.div
                  key={playingVideo.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Video iframe with download protection overlay */}
                  <div
                    className="rounded-xl overflow-hidden bg-black aspect-video relative group"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toast.error('এই ভিডিও ডাউনলোড করা যাবে না', {
                        description: 'কপিরাইট সুরক্ষিত কন্টেন্ট',
                        icon: <Shield className="w-4 h-4 text-primary" />,
                      });
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={playingVideo.titleBn || playingVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    {/* Protection watermark overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none overflow-hidden">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute text-white text-xs font-bold whitespace-nowrap"
                          style={{
                            top: `${12 + i * 12}%`,
                            left: '-10%',
                            transform: 'rotate(-25deg)',
                            width: '150%',
                          }}
                        >
                          স্টাডি হাব © {new Date().getFullYear()} | কপিরাইট সুরক্ষিত
                        </div>
                      ))}
                    </div>
                    {/* Top protection badge */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <Badge className="bg-black/60 text-white/80 text-[10px] backdrop-blur-sm border-0">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        কপিরাইট সুরক্ষিত
                      </Badge>
                    </div>
                    {/* Watermark overlay - স্টাডি হাব */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none">
                      <span className="text-white/[0.06] text-4xl sm:text-6xl font-black tracking-widest rotate-[-20deg]">
                        স্টাডি হাব
                      </span>
                    </div>
                    {/* Download protection overlay */}
                    <div className="absolute bottom-2 left-2 pointer-events-none">
                      <Badge className="bg-emerald-600/70 text-white text-[9px] backdrop-blur-sm border-0 gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        ডাউনলোড সুরক্ষিত
                      </Badge>
                    </div>
                  </div>

                  {/* Gradient border below video */}
                  <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-full" />

                  {/* Video Info Section */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg sm:text-xl font-semibold leading-tight flex-1">
                        {playingVideo.titleBn || playingVideo.title}
                      </h3>
                      {isAdminOrTeacher && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleEditVideo(playingVideo, e)}
                            className="h-8 gap-1 text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 text-primary" />
                            এডিট
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(playingVideo);
                            }}
                            className="h-8 gap-1 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            মুছুন
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Subject Badge */}
                      {playingVideo.subject && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 gap-1">
                          <BookOpen className="w-3 h-3" />
                          {playingVideo.subject.nameBn}
                        </Badge>
                      )}
                      {/* Chapter Badge */}
                      {playingVideo.chapter && (
                        <Badge variant="secondary" className="gap-1">
                          <BookOpen className="w-3 h-3" />
                          {playingVideo.chapter.nameBn}
                        </Badge>
                      )}
                      {/* Duration Badge - improved styling */}
                      {playingVideo.duration && (
                        <Badge variant="outline" className="gap-1 bg-muted/50 font-medium">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {formatDuration(playingVideo.duration)}
                        </Badge>
                      )}
                      {/* Watch Later toggle in player */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 h-8 px-2 text-xs"
                              onClick={(e) => toggleWatchLater(playingVideo.id, e as unknown as React.MouseEvent)}
                            >
                              {watchLaterIds.has(playingVideo.id) ? (
                                <BookmarkCheck className="w-4 h-4 text-primary" />
                              ) : (
                                <BookmarkPlus className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="hidden sm:inline">{watchLaterIds.has(playingVideo.id) ? 'সংরক্ষিত' : 'পরে দেখুন'}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {watchLaterIds.has(playingVideo.id) ? 'পরে দেখুন থেকে সরান' : 'পরে দেখুন যোগ করুন'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPrev}
                          disabled={!hasPrev}
                          className="gap-1.5 h-9"
                        >
                          <SkipBack className="w-4 h-4" />
                          <span className="hidden sm:inline">পূর্ববর্তী</span>
                          <span className="sm:hidden">আগে</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 h-9"
                          onClick={() => {
                            toast.error('প্রিমিয়াম প্ল্যানে ডাউনলোড করুন', {
                              description: 'ভিডিও ডাউনলোড করতে প্রিমিয়ামে আপগ্রেড করুন',
                              icon: <Download className="w-4 h-4 text-primary" />,
                            });
                          }}
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">ডাউনলোড</span>
                        </Button>
                      </div>

                      {/* Progress Indicator */}
                      {currentVideoIndex >= 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-muted-foreground">
                            {toBengaliNum(currentVideoIndex + 1)} / {toBengaliNum(filteredVideos.length)}
                          </span>
                          <div className="flex gap-0.5">
                            {filteredVideos.slice(
                              Math.max(0, currentVideoIndex - 2),
                              Math.min(filteredVideos.length, currentVideoIndex + 3)
                            ).map((v, i) => {
                              const realIndex = Math.max(0, currentVideoIndex - 2) + i;
                              return (
                                <div
                                  key={v.id}
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    realIndex === currentVideoIndex
                                      ? 'w-6 bg-primary'
                                      : realIndex < currentVideoIndex
                                        ? 'w-1.5 bg-primary/50'
                                        : 'w-1.5 bg-muted-foreground/30'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNext}
                        disabled={!hasNext}
                        className="gap-1.5 h-9"
                      >
                        <span className="hidden sm:inline">পরবর্তী</span>
                        <span className="sm:hidden">পরে</span>
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ─── Enhanced Empty State ────────────────────────────────── */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="aspect-video flex items-center justify-center border-dashed">
                    <div className="text-center text-muted-foreground px-4">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <div className="relative">
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1" />
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            animate={{
                              boxShadow: [
                                '0 0 0 0 oklch(0.508 0.165 160 / 0.4)',
                                '0 0 0 12px oklch(0.508 0.165 160 / 0)',
                              ],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>
                      <p className="text-base sm:text-lg font-medium">একটি ভিডিও নির্বাচন করুন</p>
                      <p className="text-sm mt-1 max-w-xs mx-auto">
                        ডান পাশ থেকে আপনার পছন্দের ভিডিও লেকচার বাছাই করুন এবং শিখতে শুরু করুন
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{toBengaliNum(videos.length)} টি ভিডিও উপলব্ধ</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Video List ────────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <ScrollArea className="h-[500px] sm:h-[600px] pr-2 sm:pr-4">
              <div className="space-y-2 sm:space-y-3">
                {filteredVideos.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    </motion.div>
                    <p className="text-base font-medium">কোনো ভিডিও পাওয়া যায়নি</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">অন্য ফিল্টার বা সার্চ ব্যবহার করুন</p>
                  </motion.div>
                )}
                {filteredVideos.map((video, index) => {
                  const isPlaying = playingVideo?.id === video.id;
                  const isWatched = watchedVideoIds.has(video.id);
                  const isWatchLater = watchLaterIds.has(video.id);

                  return (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md group overflow-hidden ${
                          isPlaying
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:border-primary/30'
                        }`}
                        onClick={() => handlePlayVideo(video)}
                      >
                        <CardContent className="p-2.5 sm:p-3">
                          <div className="flex gap-2.5 sm:gap-3">
                            {/* Thumbnail */}
                            <div className="relative shrink-0 w-24 sm:w-28 h-[62px] sm:h-[72px] rounded-lg overflow-hidden bg-muted">
                              <img
                                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                alt={video.titleBn || video.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              {/* Play overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                <motion.div
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                                </motion.div>
                              </div>
                              {/* Duration Overlay - improved styling */}
                              {video.duration && (
                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm">
                                  {formatDuration(video.duration)}
                                </div>
                              )}
                              {/* Watched indicator */}
                              {isWatched && !isPlaying && (
                                <div className="absolute top-1 left-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-md" />
                                </div>
                              )}
                              {/* Download protected badge */}
                              <div className="absolute top-1 right-1">
                                <Badge className="bg-black/50 text-white/70 text-[7px] backdrop-blur-sm border-0 gap-0.5 px-1 py-0 h-3.5">
                                  <Lock className="w-2 h-2" />
                                  সুরক্ষিত
                                </Badge>
                              </div>
                              {/* Now Playing badge */}
                              {isPlaying && (
                                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold text-center py-0.5 uppercase tracking-wider">
                                  এখন চলছে
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <h4 className={`font-medium text-sm line-clamp-2 leading-snug ${
                                isPlaying ? 'text-primary' : ''
                              }`}>
                                {video.titleBn || video.title}
                              </h4>
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {video.chapter && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {video.chapter.nameBn}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {/* Subject badge on card */}
                                  {video.subject && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0 h-4 font-normal w-fit"
                                    >
                                      {video.subject.nameBn}
                                    </Badge>
                                  )}
                                  {/* Watch later button on card */}
                                  <motion.button
                                    onClick={(e) => toggleWatchLater(video.id, e)}
                                    whileTap={{ scale: 0.85 }}
                                    className="p-1 rounded hover:bg-muted/80 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                                  >
                                    {isWatchLater ? (
                                      <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
                                    ) : (
                                      <BookmarkPlus className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground" />
                                    )}
                                  </motion.button>
                                </div>
                                {/* Admin actions */}
                                {isAdminOrTeacher && (
                                  <div className="flex items-center gap-0.5">
                                    <motion.button
                                      onClick={(e) => handleEditVideo(video, e)}
                                      whileTap={{ scale: 0.85 }}
                                      className="p-1 rounded hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                                      title="এডিট"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </motion.button>
                                    <motion.button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteTarget(video);
                                      }}
                                      whileTap={{ scale: 0.85 }}
                                      className="p-1 rounded hover:bg-muted/80 text-muted-foreground hover:text-destructive transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                                      title="মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* CRUD Dialog for Admin/Teacher */}
      {isAdminOrTeacher && (
        <>
          <Dialog open={crudDialogOpen} onOpenChange={setCrudDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {crudMode === 'create' ? 'নতুন ভিডিও যোগ করুন' : 'ভিডিও সম্পাদনা করুন'}
                </DialogTitle>
                <DialogDescription>
                  ভিডিওর জন্য সমস্ত প্রয়োজনীয় বিবরণ নিচে পূরণ করুন।
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="video-title-en">শিরোনাম (English)</Label>
                  <Input
                    id="video-title-en"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Physics Chapter 3: Force"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="video-title-bn">শিরোনাম (বাংলা)</Label>
                  <Input
                    id="video-title-bn"
                    value={formData.titleBn}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleBn: e.target.value }))}
                    placeholder="যেমন: পদার্থবিজ্ঞান অধ্যায় ৩: বল"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="video-subject">বিষয়</Label>
                    <select
                      id="video-subject"
                      value={formData.subjectId}
                      onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value, chapterId: '' }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="">বিষয় নির্বাচন করুন</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.nameBn}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="video-chapter">অধ্যায়</Label>
                    <select
                      id="video-chapter"
                      value={formData.chapterId}
                      onChange={(e) => setFormData(prev => ({ ...prev, chapterId: e.target.value }))}
                      disabled={!formData.subjectId}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-50"
                    >
                      <option value="">অধ্যায় নির্বাচন করুন</option>
                      {subjects.find(s => s.id === formData.subjectId)?.chapters?.map(c => (
                        <option key={c.id} value={c.id}>{c.nameBn}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="video-youtube-id">YouTube Video ID</Label>
                  <Input
                    id="video-youtube-id"
                    value={formData.youtubeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeId: e.target.value }))}
                    placeholder="e.g. dQw4w9WgXcQ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="video-duration">সময়কাল (সেকেন্ডে)</Label>
                    <Input
                      id="video-duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g. 1200 (20 min)"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="video-order">ক্রম (Order)</Label>
                    <Input
                      id="video-order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCrudDialogOpen(false)} disabled={crudLoading}>
                  বাতিল
                </Button>
                <Button onClick={handleCrudSubmit} disabled={crudLoading} className="gap-2">
                  {crudLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  সংরক্ষণ করুন
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  ভিডিওটি মুছে ফেলতে চান?
                </DialogTitle>
                <DialogDescription>
                  আপনি কি নিশ্চিত যে আপনি এই ভিডিওটি মুছে ফেলতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না।
                </DialogDescription>
              </DialogHeader>
              {deleteTarget && (
                <div className="p-3 bg-muted rounded-lg text-sm font-medium">
                  {deleteTarget.titleBn || deleteTarget.title}
                </div>
              )}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
                  বাতিল
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteVideo}
                  disabled={deleteLoading}
                  className="gap-2"
                >
                  {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  মুছে ফেলুন
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
