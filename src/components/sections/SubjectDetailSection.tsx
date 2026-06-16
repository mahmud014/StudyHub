'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Video, FileCheck, List, Play, Clock,
  Download, FileText, ChevronRight, Eye, CheckCircle2, Star,
  BookMarked, GraduationCap, Sparkles, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import ReactMarkdown from 'react-markdown';

// ─── Bengali Number Helper ──────────────────────────────────────────────────
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Duration Formatter ─────────────────────────────────────────────────────
function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${toBengaliNum(mins)}:${toBengaliNum(secs).padStart(2, '০')}`;
}

// ─── Type Badge Map ─────────────────────────────────────────────────────────
const noteTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  'handnote': { label: 'হ্যান্ডনোট', icon: FileText, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  'suggestion': { label: 'সাজেশন', icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'past-question': { label: 'বিগত সালের প্রশ্ন', icon: BookMarked, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
};

const defaultNoteType = { label: 'নোট', icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted border-border' };

// ─── Icon Map for Subjects ──────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  'BookOpen': BookOpen,
  'Calculator': BookOpen,
  'FlaskConical': BookOpen,
  'Atom': BookOpen,
  'Leaf': BookOpen,
  'Globe': BookOpen,
  'Monitor': BookOpen,
  'GraduationCap': GraduationCap,
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface Chapter {
  id: string;
  name: string;
  nameBn: string;
  order: number;
}

interface Subject {
  id: string;
  name: string;
  nameBn: string;
  icon: string | null;
  color: string | null;
  chapters: Chapter[];
}

interface Note {
  id: string;
  title: string;
  titleBn: string;
  content: string;
  pdfUrl: string | null;
  type: string;
  subjectId: string;
  chapterId: string | null;
  subject?: { nameBn: string };
  chapter?: { nameBn: string };
}

interface VideoItem {
  id: string;
  title: string;
  titleBn: string;
  youtubeId: string;
  duration: number | null;
  subjectId: string;
  chapterId: string | null;
  subject?: { nameBn: string };
  chapter?: { nameBn: string };
}

interface Exam {
  id: string;
  title: string;
  titleBn: string;
  duration: number;
  totalMarks: number;
  isActive: boolean;
  subjectId: string;
  chapterId: string | null;
  subject?: { nameBn: string };
  chapter?: { nameBn: string };
  _count?: { questions: number };
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function SubjectDetailSection() {
  const { selectedSubject, setActiveSection } = useStudyHub();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');

  // Note detail state
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);

  // Video player state
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  // ─── Fetch subject details ──────────────────────────────────────────────
  useEffect(() => {
    if (!selectedSubject) return;

    setLoading(true);
    setSubject(null);
    setNotes([]);
    setVideos([]);
    setExams([]);
    setSelectedNote(null);
    setPlayingVideo(null);

    Promise.all([
      fetch(`/api/subjects/${selectedSubject}`).then(r => r.json()),
      fetch(`/api/notes?subjectId=${selectedSubject}`).then(r => r.json()),
      fetch(`/api/videos?subjectId=${selectedSubject}`).then(r => r.json()),
      fetch(`/api/exams?subjectId=${selectedSubject}`).then(r => r.json()),
    ])
      .then(([subjectData, notesData, videosData, examsData]) => {
        if (subjectData.success) setSubject(subjectData.data);
        if (notesData.success) setNotes(notesData.data || []);
        if (videosData.success) setVideos(videosData.data || []);
        if (examsData.success) setExams(examsData.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  // ─── Fetch individual note content ──────────────────────────────────────
  const handleNoteClick = useCallback(async (note: Note) => {
    setNoteLoading(true);
    setSelectedNote(note);
    try {
      const res = await fetch(`/api/notes/${note.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedNote(data.data);
      }
    } catch {
      // keep the preview
    } finally {
      setNoteLoading(false);
    }
  }, []);

  // ─── Difficulty helper for exams ────────────────────────────────────────
  function getDifficulty(totalMarks: number) {
    if (totalMarks < 20) return { label: 'সহজ', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (totalMarks <= 40) return { label: 'মাঝারি', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'কঠিন', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  }

  // ─── Simulated chapter progress ─────────────────────────────────────────
  function getChapterProgress(chapterId: string): number {
    // Deterministic pseudo-progress based on chapter id hash
    const hash = chapterId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (hash % 101);
  }

  // ─── Back navigation ────────────────────────────────────────────────────
  const handleBack = () => {
    setActiveSection('home');
  };

  // ─── Loading State ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-40 w-full rounded-2xl mb-4" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">বিষয় পাওয়া যায়নি</h2>
          <p className="text-muted-foreground mb-6">দুঃখিত, এই বিষয়ের তথ্য লোড করা যায়নি</p>
          <Button onClick={handleBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            হোমে ফিরে যান
          </Button>
        </motion.div>
      </div>
    );
  }

  const SubjectIcon = iconMap[subject.icon || ''] || BookOpen;
  const chapterCount = subject.chapters?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ─── Back Button ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          হোমে ফিরে যান
        </Button>
      </motion.div>

      {/* ─── Hero Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 sm:p-8 text-white">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Icon */}
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <SubjectIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              {/* Title & Description */}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                  {subject.nameBn}
                </h1>
                <p className="text-white/80 text-sm sm:text-base">
                  ক্লাস ৯-১০ • জাতীয় শিক্ষাক্রম অনুযায়ী সম্পূর্ণ পড়াশোনা
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <List className="w-4 h-4 text-white/70" />
                  <span className="text-xs text-white/70">অধ্যায়</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold">{toBengaliNum(chapterCount)}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-white/70" />
                  <span className="text-xs text-white/70">নোটস</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold">{toBengaliNum(notes.length)}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4 text-white/70" />
                  <span className="text-xs text-white/70">ভিডিও</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold">{toBengaliNum(videos.length)}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-4 h-4 text-white/70" />
                  <span className="text-xs text-white/70">পরীক্ষা</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold">{toBengaliNum(exams.length)}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Tabs Section ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto mb-6 bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="notes" className="gap-1.5 text-xs sm:text-sm px-3 py-2">
              <FileText className="w-4 h-4" />
              নোটস
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[20px] justify-center">
                {toBengaliNum(notes.length)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5 text-xs sm:text-sm px-3 py-2">
              <Video className="w-4 h-4" />
              ভিডিও
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[20px] justify-center">
                {toBengaliNum(videos.length)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-1.5 text-xs sm:text-sm px-3 py-2">
              <FileCheck className="w-4 h-4" />
              পরীক্ষা
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[20px] justify-center">
                {toBengaliNum(exams.length)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-1.5 text-xs sm:text-sm px-3 py-2">
              <List className="w-4 h-4" />
              অধ্যায়
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[20px] justify-center">
                {toBengaliNum(chapterCount)}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              NOTES TAB
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="notes">
            <AnimatePresence mode="wait">
              {selectedNote ? (
                <motion.div
                  key="note-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Note Detail View */}
                  <div className="mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNote(null)}
                      className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      নোট তালিকায় ফিরুন
                    </Button>
                  </div>

                  <Card className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {(() => {
                          const config = noteTypeConfig[selectedNote.type] || defaultNoteType;
                          const TypeIcon = config.icon;
                          return (
                            <Badge className={`${config.bg} ${config.color} border gap-1`}>
                              <TypeIcon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                          );
                        })()}
                        {selectedNote.chapter && (
                          <Badge variant="secondary" className="gap-1">
                            <BookOpen className="w-3 h-3" />
                            {selectedNote.chapter.nameBn}
                          </Badge>
                        )}
                        {selectedNote.pdfUrl && (
                          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-accent">
                            <Download className="w-3 h-3" />
                            PDF ডাউনলোড
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold mb-4">
                        {selectedNote.titleBn || selectedNote.title}
                      </h2>

                      {noteLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-4/6" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none
                          prose-headings:text-foreground prose-p:text-muted-foreground
                          prose-strong:text-foreground prose-code:text-primary
                          prose-a:text-primary">
                          <ReactMarkdown>
                            {selectedNote.content || 'এই নোটে কোনো বিষয়বস্তু নেই।'}
                          </ReactMarkdown>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="notes-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {notes.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-16 text-center">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                        <h3 className="text-lg font-semibold mb-1">কোনো নোট নেই</h3>
                        <p className="text-sm text-muted-foreground">এই বিষয়ে এখনো কোনো নোট যোগ করা হয়নি</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {notes.map((note, index) => {
                        const config = noteTypeConfig[note.type] || defaultNoteType;
                        const TypeIcon = config.icon;

                        return (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.04 }}
                          >
                            <Card
                              className="cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 overflow-hidden"
                              onClick={() => handleNoteClick(note)}
                            >
                              <CardContent className="p-4 sm:p-5">
                                {/* Type Badge */}
                                <div className="flex items-center justify-between mb-3">
                                  <Badge className={`${config.bg} ${config.color} border gap-1 text-[11px]`}>
                                    <TypeIcon className="w-3 h-3" />
                                    {config.label}
                                  </Badge>
                                  {note.pdfUrl && (
                                    <Download className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                  )}
                                </div>

                                {/* Title */}
                                <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                  {note.titleBn || note.title}
                                </h3>

                                {/* Chapter */}
                                {note.chapter && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <BookOpen className="w-3 h-3" />
                                    <span className="truncate">{note.chapter.nameBn}</span>
                                  </div>
                                )}

                                {/* CTA */}
                                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <Eye className="w-3 h-3" />
                                  <span>পড়ুন</span>
                                  <ChevronRight className="w-3 h-3" />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              VIDEOS TAB
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="videos">
            {videos.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">কোনো ভিডিও নেই</h3>
                  <p className="text-sm text-muted-foreground">এই বিষয়ে এখনো কোনো ভিডিও লেকচার যোগ করা হয়নি</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ─── Video Player Area ────────────────────────────────────── */}
                <div className="lg:col-span-3">
                  <AnimatePresence mode="wait">
                    {playingVideo ? (
                      <motion.div
                        key={playingVideo.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Video iframe */}
                        <div className="rounded-xl overflow-hidden bg-black aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1&rel=0`}
                            title={playingVideo.titleBn || playingVideo.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>

                        {/* Gradient border below video */}
                        <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-full" />

                        {/* Video Info */}
                        <div className="mt-4 space-y-3">
                          <h3 className="text-lg sm:text-xl font-semibold leading-tight">
                            {playingVideo.titleBn || playingVideo.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {playingVideo.chapter && (
                              <Badge variant="secondary" className="gap-1">
                                <BookOpen className="w-3 h-3" />
                                {playingVideo.chapter.nameBn}
                              </Badge>
                            )}
                            {playingVideo.duration && (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(playingVideo.duration)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Card className="aspect-video flex items-center justify-center border-dashed">
                          <div className="text-center text-muted-foreground">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                            >
                              <Play className="w-7 h-7 text-primary ml-0.5" />
                            </motion.div>
                            <p className="font-medium">একটি ভিডিও নির্বাচন করুন</p>
                            <p className="text-sm mt-1 text-muted-foreground/60">
                              ডান পাশ থেকে ভিডিও বাছাই করুন
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ─── Video List ───────────────────────────────────────────── */}
                <div className="lg:col-span-2">
                  <ScrollArea className="h-[500px] lg:h-[560px]">
                    <div className="space-y-3 pr-2">
                      {videos.map((video, index) => {
                        const isPlaying = playingVideo?.id === video.id;

                        return (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all hover:shadow-md group ${
                                isPlaying
                                  ? 'ring-2 ring-primary bg-primary/5'
                                  : 'hover:border-primary/30'
                              }`}
                              onClick={() => setPlayingVideo(video)}
                            >
                              <CardContent className="p-3">
                                <div className="flex gap-3">
                                  {/* Thumbnail */}
                                  <div className="relative shrink-0 w-28 h-[72px] rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                      alt={video.titleBn || video.title}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                      <Play className="w-5 h-5 text-white drop-shadow-md" />
                                    </div>
                                    {video.duration && (
                                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                                        {formatDuration(video.duration)}
                                      </div>
                                    )}
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
                                    {video.chapter && (
                                      <span className="text-[11px] text-muted-foreground mt-1 truncate">
                                        {video.chapter.nameBn}
                                      </span>
                                    )}
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
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              EXAMS TAB
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="exams">
            {exams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <FileCheck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">কোনো পরীক্ষা নেই</h3>
                  <p className="text-sm text-muted-foreground">এই বিষয়ে এখনো কোনো পরীক্ষা যোগ করা হয়নি</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map((exam, index) => {
                  const difficulty = getDifficulty(exam.totalMarks);
                  const questionCount = exam._count?.questions || 0;

                  return (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 overflow-hidden">
                        <CardContent className="p-4 sm:p-5">
                          {/* Difficulty & Duration */}
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={`${difficulty.bg} ${difficulty.color} border gap-1 text-[11px]`}>
                              <Sparkles className="w-3 h-3" />
                              {difficulty.label}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {toBengaliNum(exam.duration)} মিনিট
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2">
                            {exam.titleBn || exam.title}
                          </h3>

                          {/* Meta */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <FileCheck className="w-3 h-3" />
                              {toBengaliNum(questionCount)} টি প্রশ্ন
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {toBengaliNum(exam.totalMarks)} নম্বর
                            </span>
                          </div>

                          {/* Chapter */}
                          {exam.chapter && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                              <BookOpen className="w-3 h-3" />
                              <span className="truncate">{exam.chapter.nameBn}</span>
                            </div>
                          )}

                          {/* Start Button */}
                          <Button
                            className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                            onClick={() => {
                              setActiveSection('exams');
                            }}
                          >
                            <GraduationCap className="w-4 h-4" />
                            পরীক্ষা শুরু করুন
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              CHAPTERS TAB
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="chapters">
            {chapterCount === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <List className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">কোনো অধ্যায় নেই</h3>
                  <p className="text-sm text-muted-foreground">এই বিষয়ে এখনো কোনো অধ্যায় যোগ করা হয়নি</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {subject.chapters.map((chapter, index) => {
                  const progress = getChapterProgress(chapter.id);
                  const chapterNotes = notes.filter(n => n.chapterId === chapter.id);
                  const chapterVideos = videos.filter(v => v.chapterId === chapter.id);
                  const chapterExams = exams.filter(e => e.chapterId === chapter.id);

                  return (
                    <motion.div
                      key={chapter.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                    >
                      <Card className="group hover:shadow-md transition-all duration-300 hover:border-primary/30 overflow-hidden">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Chapter Number */}
                            <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                              {toBengaliNum(index + 1)}
                            </div>

                            {/* Chapter Info */}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base mb-1">
                                {chapter.nameBn}
                              </h3>

                              {/* Resource Counts */}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground mb-3">
                                {chapterNotes.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {toBengaliNum(chapterNotes.length)} নোট
                                  </span>
                                )}
                                {chapterVideos.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    {toBengaliNum(chapterVideos.length)} ভিডিও
                                  </span>
                                )}
                                {chapterExams.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <FileCheck className="w-3 h-3" />
                                    {toBengaliNum(chapterExams.length)} পরীক্ষা
                                  </span>
                                )}
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">অগ্রগতি</span>
                                  <span className="font-medium text-primary">
                                    {toBengaliNum(progress)}%
                                  </span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-primary/10 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.05, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                  />
                                </div>
                              </div>

                              {/* Completion Badge */}
                              {progress === 100 && (
                                <div className="mt-2">
                                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" />
                                    সম্পন্ন
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
