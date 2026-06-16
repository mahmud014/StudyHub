'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark, X, BookOpen, Video, FileText, Clock,
  Trash2, ChevronRight, BookMarked
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// ─── Bengali numeral helper ──────────────────────────────────────────────────
function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Bookmark Types ──────────────────────────────────────────────────────────
interface NoteBookmark {
  id: string;
  type: 'note';
  noteId: string;
  title: string;
  subject: string;
  date: string;
}

interface VideoBookmark {
  id: string;
  type: 'video';
  videoId: string;
  title: string;
  duration: string;
}

interface ExamBookmark {
  id: string;
  type: 'exam';
  examId: string;
  title: string;
  score: string;
}

type BookmarkItem = NoteBookmark | VideoBookmark | ExamBookmark;

const STORAGE_KEY = 'studyhub-bookmarks';

function loadBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(items: BookmarkItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// ─── Empty State Illustration ────────────────────────────────────────────────
function EmptyState({ type }: { type: 'note' | 'video' | 'exam' }) {
  const messages = {
    note: { icon: BookOpen, title: 'কোনো নোটস বুকমার্ক নেই', subtitle: 'নোটস পড়ার সময় বুকমার্ক করুন' },
    video: { icon: Video, title: 'কোনো ভিডিও বুকমার্ক নেই', subtitle: 'ভিডিও দেখার সময় বুকমার্ক করুন' },
    exam: { icon: FileText, title: 'কোনো পরীক্ষা বুকমার্ক নেই', subtitle: 'পরীক্ষার ফলাফল বুকমার্ক করুন' },
  };
  const msg = messages[type];
  const Icon = msg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-muted-foreground"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className="w-14 h-14 mb-4 text-primary/20" />
      </motion.div>
      <p className="text-sm font-medium">{msg.title}</p>
      <p className="text-xs mt-1 text-muted-foreground/70">{msg.subtitle}</p>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BookmarkManager() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => loadBookmarks());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('notes');
  const { setActiveSection } = useStudyHub();

  // Listen for storage changes from other components
  useEffect(() => {
    const handleStorage = () => {
      setBookmarks(loadBookmarks());
    };
    window.addEventListener('storage', handleStorage);
    // Also poll every 2 seconds in case same-tab changes
    const interval = setInterval(handleStorage, 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const noteBookmarks = bookmarks.filter((b): b is NoteBookmark => b.type === 'note');
  const videoBookmarks = bookmarks.filter((b): b is VideoBookmark => b.type === 'video');
  const examBookmarks = bookmarks.filter((b): b is ExamBookmark => b.type === 'exam');

  const totalCount = bookmarks.length;

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
    setConfirmDeleteId(null);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    saveBookmarks(updated);
    setConfirmDeleteId(null);
    toast.success('বুকমার্ক সরানো হয়েছে');
  }, [bookmarks]);

  const handleNavigate = useCallback((item: BookmarkItem) => {
    if (item.type === 'note') {
      setActiveSection('notes');
    } else if (item.type === 'video') {
      setActiveSection('videos');
    } else if (item.type === 'exam') {
      setActiveSection('exams');
    }
    setIsExpanded(false);
  }, [setActiveSection]);

  return (
    <>
      {/* ─── Expanded Bookmark Panel ────────────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[calc(100vw-48px)]"
          >
            <div className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-emerald-600 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="size-4 text-white" />
                  <span className="text-white font-semibold text-sm">বুকমার্ক ম্যানেজার</span>
                  {totalCount > 0 && (
                    <Badge className="bg-white/20 text-white border-0 text-[10px] px-1.5 py-0 h-5">
                      {toBengaliNum(totalCount)}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={toggleExpand}
                  className="text-white/80 hover:text-white transition-colors text-xl leading-none"
                  aria-label="বন্ধ করুন"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="px-4 pt-3 pb-1">
                  <TabsList className="w-full grid grid-cols-3 h-9">
                    <TabsTrigger value="notes" className="text-xs gap-1">
                      <BookOpen className="w-3 h-3" />
                      নোটস
                      {noteBookmarks.length > 0 && (
                        <Badge variant="secondary" className="ml-0.5 text-[9px] px-1 py-0 h-4 min-w-[16px]">
                          {toBengaliNum(noteBookmarks.length)}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="text-xs gap-1">
                      <Video className="w-3 h-3" />
                      ভিডিও
                      {videoBookmarks.length > 0 && (
                        <Badge variant="secondary" className="ml-0.5 text-[9px] px-1 py-0 h-4 min-w-[16px]">
                          {toBengaliNum(videoBookmarks.length)}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="exams" className="text-xs gap-1">
                      <FileText className="w-3 h-3" />
                      পরীক্ষা
                      {examBookmarks.length > 0 && (
                        <Badge variant="secondary" className="ml-0.5 text-[9px] px-1 py-0 h-4 min-w-[16px]">
                          {toBengaliNum(examBookmarks.length)}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Notes Tab Content */}
                <TabsContent value="notes" className="mt-0 px-0">
                  <ScrollArea className="h-[320px]">
                    {noteBookmarks.length === 0 ? (
                      <EmptyState type="note" />
                    ) : (
                      <div className="px-3 pb-3 space-y-2">
                        {noteBookmarks.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="group flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                            onClick={() => handleNavigate(item)}
                          >
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-muted-foreground">{item.subject}</span>
                                <span className="text-[11px] text-muted-foreground/50">•</span>
                                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {item.date}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                              {confirmDeleteId === item.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); removeBookmark(item.id); }}
                                    className="p-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    aria-label="নিশ্চিত করুন"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                    className="p-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                    aria-label="বাতিল"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
                                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                  aria-label="বুকমার্ক সরান"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* Videos Tab Content */}
                <TabsContent value="videos" className="mt-0 px-0">
                  <ScrollArea className="h-[320px]">
                    {videoBookmarks.length === 0 ? (
                      <EmptyState type="video" />
                    ) : (
                      <div className="px-3 pb-3 space-y-2">
                        {videoBookmarks.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="group flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                            onClick={() => handleNavigate(item)}
                          >
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Video className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                সময়কাল: {item.duration}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                              {confirmDeleteId === item.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); removeBookmark(item.id); }}
                                    className="p-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    aria-label="নিশ্চিত করুন"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                    className="p-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                    aria-label="বাতিল"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
                                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                  aria-label="বুকমার্ক সরান"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* Exams Tab Content */}
                <TabsContent value="exams" className="mt-0 px-0">
                  <ScrollArea className="h-[320px]">
                    {examBookmarks.length === 0 ? (
                      <EmptyState type="exam" />
                    ) : (
                      <div className="px-3 pb-3 space-y-2">
                        {examBookmarks.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="group flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                            onClick={() => handleNavigate(item)}
                          >
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <span className="text-[11px] text-muted-foreground mt-0.5">
                                স্কোর: {item.score}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                              {confirmDeleteId === item.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); removeBookmark(item.id); }}
                                    className="p-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    aria-label="নিশ্চিত করুন"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                    className="p-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                    aria-label="বাতিল"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
                                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                  aria-label="বুকমার্ক সরান"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border/30 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  মোট বুকমার্ক: {toBengaliNum(totalCount)}
                </span>
                {totalCount > 0 && (
                  <button
                    onClick={() => {
                      setBookmarks([]);
                      saveBookmarks([]);
                      setConfirmDeleteId(null);
                      toast.success('সকল বুকমার্ক সরানো হয়েছে');
                    }}
                    className="text-[11px] text-red-500/70 hover:text-red-500 transition-colors"
                  >
                    সব মুছুন
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FAB Button (Bottom-Left) ───────────────────────────────────── */}
      <motion.button
        onClick={toggleExpand}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors duration-300 bg-gradient-to-br from-primary to-emerald-600 hover:opacity-90"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        aria-label="বুকমার্ক ম্যানেজার"
      >
        <Bookmark className="size-6 text-white" />

        {/* Count Badge */}
        <AnimatePresence>
          {totalCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md"
            >
              {totalCount > 99 ? '৯৯+' : toBengaliNum(totalCount)}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
