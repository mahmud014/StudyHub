'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Download, FileText, Search, ChevronDown, Filter,
  Bookmark, BookmarkCheck, Copy, Share2, Clock, Eye,
  Type, Minus, Plus, Check, Shield, File, PlusCircle,
  Pencil, Trash2, ChevronLeft, ChevronRight, AlertCircle,
  Loader2, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import PDFViewer from '@/components/ui/PDFViewer';

// ─── Types ────────────────────────────────────────────────────────────────

interface Subject {
  id: string;
  name: string;
  nameBn: string;
  chapters: { id: string; name: string; nameBn: string }[];
}

interface NoteSubject {
  id: string;
  name: string;
  nameBn: string;
}

interface NoteChapter {
  id: string;
  name: string;
  nameBn: string;
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
  order: number;
  createdAt: string;
  updatedAt: string;
  subject?: NoteSubject;
  chapter?: NoteChapter | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NoteFormData {
  subjectId: string;
  chapterId: string;
  title: string;
  titleBn: string;
  content: string;
  type: string;
  pdfUrl: string;
}

const emptyFormData: NoteFormData = {
  subjectId: '',
  chapterId: '',
  title: '',
  titleBn: '',
  content: '',
  type: 'handnote',
  pdfUrl: '',
};

// ─── Helper: convert digits to Bengali numerals ──────────────────────────

function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function NotesSection() {
  const { user, selectedSubject } = useStudyHub();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  // ─── Data state ──────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });

  // ─── Filter/search state ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [noteType, setNoteType] = useState('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  // ─── Loading/error state ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteDetailLoading, setNoteDetailLoading] = useState(false);

  // ─── Bookmark/recent state (localStorage) ───────────────────────────────
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('studyhub_note_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [recentlyViewed, setRecentlyViewed] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('studyhub_recent_notes');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [lastReadTimestamp, setLastReadTimestamp] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('studyhub_last_read');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // ─── Reader state ────────────────────────────────────────────────────────
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [copySuccess, setCopySuccess] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfViewerNote, setPdfViewerNote] = useState<Note | null>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─── CRUD state (admin/teacher) ─────────────────────────────────────────
  const [crudDialogOpen, setCrudDialogOpen] = useState(false);
  const [crudMode, setCrudMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<NoteFormData>(emptyFormData);
  const [crudLoading, setCrudLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Save bookmarks to localStorage ─────────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    try {
      localStorage.setItem('studyhub_note_bookmarks', JSON.stringify([...bookmarks]));
    } catch {}
  }, [bookmarks]);

  // ─── Save recently viewed to localStorage ───────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) return;
    try {
      localStorage.setItem('studyhub_recent_notes', JSON.stringify([...recentlyViewed]));
    } catch {}
  }, [recentlyViewed]);

  // ─── Save last read timestamps ──────────────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) return;
    try {
      localStorage.setItem('studyhub_last_read', JSON.stringify(lastReadTimestamp));
    } catch {}
  }, [lastReadTimestamp]);

  // ─── Debounce search query ──────────────────────────────────────────────
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // ─── Fetch subjects ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubjects(data.data);
      })
      .catch(() => {
        toast.error('বিষয়সমূহ লোড করতে সমস্যা হয়েছে');
      });
  }, []);

  // ─── Fetch notes from API with filters ──────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const subjectFilter = selectedSubject || (selectedSubjectId !== 'all' ? selectedSubjectId : '');
      if (subjectFilter) params.set('subjectId', subjectFilter);
      if (noteType !== 'all') params.set('type', noteType);
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));

      const res = await fetch(`/api/notes?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setNotes(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(data.error || 'নোট লোড করতে সমস্যা হয়েছে');
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedSubjectId, noteType, debouncedSearch, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ─── Fetch full note detail when selecting ──────────────────────────────
  const handleSelectNote = useCallback(async (note: Note) => {
    setNoteDetailLoading(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const fullNote = data.data;
        setSelectedNote(fullNote);
        setReadingProgress(0);
        setRecentlyViewed(prev => {
          const next = new Set(prev);
          next.add(fullNote.id);
          return next;
        });
        const now = new Date();
        const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        setLastReadTimestamp(prev => ({ ...prev, [fullNote.id]: timeStr }));
      } else {
        // Fallback to the list version if detail fetch fails
        setSelectedNote(note);
        toast.error('নোটের বিস্তারিত লোড করতে সমস্যা হয়েছে');
      }
    } catch {
      setSelectedNote(note);
      toast.error('নোটের বিস্তারিত লোড করতে সমস্যা হয়েছে');
    } finally {
      setNoteDetailLoading(false);
    }
  }, []);

  // ─── Reading progress tracking ──────────────────────────────────────────
  const handleContentScroll = useCallback(() => {
    const el = contentScrollRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      setReadingProgress(Math.min((scrollTop / scrollHeight) * 100, 100));
    }
  }, []);

  // ─── Toggle bookmark ────────────────────────────────────────────────────
  const toggleBookmark = useCallback((noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
        toast('বুকমার্ক সরানো হয়েছে', { icon: <Bookmark className="w-4 h-4 text-muted-foreground" /> });
      } else {
        next.add(noteId);
        toast.success('বুকমার্ক যোগ হয়েছে!', { icon: <BookmarkCheck className="w-4 h-4 text-primary" /> });
      }
      return next;
    });
  }, []);

  // ─── Copy content ──────────────────────────────────────────────────────
  const handleCopyContent = useCallback(() => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content || '').then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast.success('কন্টেন্ট কপি হয়েছে!');
    }).catch(() => {
      toast.error('কপি করতে সমস্যা হয়েছে');
    });
  }, [selectedNote]);

  // ─── Prevent right-click ───────────────────────────────────────────────
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    toast('কপিরাইট সুরক্ষিত', {
      description: 'এই কন্টেন্ট কপি করা নিষিদ্ধ।',
      icon: <Shield className="w-4 h-4 text-primary" />,
    });
  }, []);

  // ─── CRUD: Open create dialog ──────────────────────────────────────────
  const handleCreateNote = useCallback(() => {
    setCrudMode('create');
    setFormData({
      ...emptyFormData,
      subjectId: selectedSubject || (selectedSubjectId !== 'all' ? selectedSubjectId : ''),
    });
    setCrudDialogOpen(true);
  }, [selectedSubject, selectedSubjectId]);

  // ─── CRUD: Open edit dialog ────────────────────────────────────────────
  const handleEditNote = useCallback((note: Note, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCrudMode('edit');
    setFormData({
      subjectId: note.subjectId,
      chapterId: note.chapterId || '',
      title: note.title,
      titleBn: note.titleBn,
      content: note.content,
      type: note.type,
      pdfUrl: note.pdfUrl || '',
    });
    setCrudDialogOpen(true);
  }, []);

  // ─── CRUD: Submit (create or update) ───────────────────────────────────
  const handleCrudSubmit = useCallback(async () => {
    if (!formData.subjectId || !formData.title || !formData.titleBn || !formData.content) {
      toast.error('বিষয়, শিরোনাম ও বিষয়বস্তু প্রয়োজন');
      return;
    }

    setCrudLoading(true);
    try {
      const payload = {
        subjectId: formData.subjectId,
        chapterId: formData.chapterId || null,
        title: formData.title,
        titleBn: formData.titleBn,
        content: formData.content,
        type: formData.type,
        pdfUrl: formData.pdfUrl || null,
      };

      let res: Response;
      if (crudMode === 'create') {
        res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (selectedNote) {
        res = await fetch(`/api/notes/${selectedNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        return;
      }

      const data = await res.json();
      if (data.success) {
        toast.success(crudMode === 'create' ? 'নোট তৈরি হয়েছে!' : 'নোট আপডেট হয়েছে!');
        setCrudDialogOpen(false);
        if (crudMode === 'edit' && selectedNote) {
          setSelectedNote(data.data);
        }
        fetchNotes();
      } else {
        toast.error(data.error || 'সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setCrudLoading(false);
    }
  }, [formData, crudMode, selectedNote, fetchNotes]);

  // ─── CRUD: Delete note ─────────────────────────────────────────────────
  const handleDeleteNote = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/notes/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('নোট মুছে ফেলা হয়েছে');
        if (selectedNote?.id === deleteTarget.id) {
          setSelectedNote(null);
        }
        setDeleteTarget(null);
        fetchNotes();
      } else {
        toast.error(data.error || 'মুছতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, selectedNote, fetchNotes]);

  // ─── Bookmark filtered notes ───────────────────────────────────────────
  const bookmarkedNotes = notes.filter(note => bookmarks.has(note.id));

  // ─── Helper: get subject/chapter names from note relations ─────────────
  const getSubjectName = useCallback((note: Note) => {
    if (note.subject) return note.subject.nameBn || note.subject.name;
    const subject = subjects.find(s => s.id === note.subjectId);
    return subject?.nameBn || subject?.name || null;
  }, [subjects]);

  const getChapterName = useCallback((note: Note) => {
    if (note.chapter) return note.chapter.nameBn || note.chapter.name;
    if (!note.chapterId) return null;
    const subject = subjects.find(s => s.id === note.subjectId);
    if (!subject) return null;
    const chapter = subject.chapters.find(c => c.id === note.chapterId);
    return chapter?.nameBn || chapter?.name || null;
  }, [subjects]);

  // ─── Type label/color helpers ───────────────────────────────────────────
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      handnote: 'হ্যান্ডনোট',
      suggestion: 'সাজেশন',
      'past-question': 'বিগত বছরের প্রশ্ন',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      handnote: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      suggestion: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      'past-question': 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    };
    return colors[type] || 'bg-primary/10 text-primary';
  };

  const getTypeBorderColor = (type: string) => {
    const colors: Record<string, string> = {
      handnote: 'border-l-emerald-500',
      suggestion: 'border-l-amber-500',
      'past-question': 'border-l-rose-500',
    };
    return colors[type] || 'border-l-primary';
  };

  const getTypeIconBg = (type: string) => {
    const colors: Record<string, string> = {
      handnote: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      suggestion: 'bg-gradient-to-br from-amber-500 to-amber-600',
      'past-question': 'bg-gradient-to-br from-rose-500 to-rose-600',
    };
    return colors[type] || 'bg-gradient-to-br from-primary to-emerald-600';
  };

  const fontSizeClass = {
    small: 'prose-xs',
    medium: 'prose-sm',
    large: 'prose-base',
  }[fontSize];

  const formatLastRead = (noteId: string) => {
    const ts = lastReadTimestamp[noteId];
    return ts ? `সর্বশেষ পড়া: ${ts}` : null;
  };

  // ─── Chapters for selected subject in form ──────────────────────────────
  const formChapters = subjects.find(s => s.id === formData.subjectId)?.chapters || [];

  // ─── Note card component ────────────────────────────────────────────────
  const NoteCard = ({ note, index }: { note: Note; index: number }) => {
    const isBookmarked = bookmarks.has(note.id);
    const isRecentlyViewed = recentlyViewed.has(note.id);
    const isSelected = selectedNote?.id === note.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        layout
      >
        <Card
          className={`cursor-pointer transition-all duration-200 border-l-4 ${getTypeBorderColor(note.type)} overflow-hidden group ${
            isSelected
              ? 'ring-2 ring-primary bg-primary/5 shadow-md'
              : 'hover:shadow-md hover:-translate-y-0.5'
          }`}
          onClick={() => handleSelectNote(note)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Type icon */}
              <div className={`shrink-0 w-10 h-10 rounded-lg ${getTypeIconBg(note.type)} flex items-center justify-center shadow-sm`}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-medium text-sm line-clamp-2 flex-1 leading-snug">
                    {isRecentlyViewed && (
                      <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1.5 mb-0.5 animate-pulse" title="সম্প্রতি দেখা" />
                    )}
                    {note.titleBn || note.title}
                  </h4>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {/* Bookmark button */}
                    <motion.button
                      onClick={(e) => toggleBookmark(note.id, e)}
                      whileTap={{ scale: 0.85 }}
                      className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-primary" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground" />
                      )}
                    </motion.button>
                    {/* Admin/teacher actions */}
                    {isAdminOrTeacher && (
                      <>
                        <motion.button
                          onClick={(e) => handleEditNote(note, e)}
                          whileTap={{ scale: 0.85 }}
                          className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </motion.button>
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(note); }}
                          whileTap={{ scale: 0.85 }}
                          className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 ${getTypeColor(note.type)}`}>
                    {getTypeLabel(note.type)}
                  </Badge>
                  {getSubjectName(note) && (
                    <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                      {getSubjectName(note)}
                    </span>
                  )}
                </div>
                {getChapterName(note) && (
                  <p className="text-[11px] text-muted-foreground/70 mt-1 truncate">
                    📖 {getChapterName(note)}
                  </p>
                )}
                {note.pdfUrl && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-primary/70">
                    <File className="w-3 h-3" />
                    PDF আছে
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
      {/* Enhanced Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-primary" />
                <span className="text-gradient">স্মার্ট নোটস</span>
              </h2>
              {/* Decorative gradient underline */}
              <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-emerald-500" />
              <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                অধ্যায়ভিত্তিক হ্যান্ডনোট, সাজেশন এবং বিগত বছরের প্রশ্ন
              </p>
            </div>
            <div className="flex items-center gap-2">
              {bookmarkedNotes.length > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20">
                  <BookmarkCheck className="w-3 h-3 mr-1" />
                  {toBengaliNum(bookmarkedNotes.length)} বুকমার্ক
                </Badge>
              )}
              <Badge variant="secondary" className="text-sm px-3 py-1.5 bg-primary/10 text-primary border border-primary/20">
                মোট: {toBengaliNum(pagination.total)} টি নোট
              </Badge>
              {isAdminOrTeacher && (
                <Button
                  onClick={handleCreateNote}
                  size="sm"
                  className="gap-1.5 h-9"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">নতুন নোট</span>
                  <span className="sm:hidden">নোট</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="নোটস খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-9 transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
          />
          {debouncedSearch && loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {debouncedSearch && !loading && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
            >
              {toBengaliNum(pagination.total)} টি ফলাফল
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="h-10 sm:h-9 rounded-md border border-input bg-background px-3 pl-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none pr-8 cursor-pointer"
            >
              <option value="all">সকল বিষয়</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.nameBn}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <Tabs value={noteType} onValueChange={(v) => { setNoteType(v); setPagination(prev => ({ ...prev, page: 1 })); }}>
            <TabsList className="h-10 sm:h-9">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">সব</TabsTrigger>
              <TabsTrigger value="handnote" className="text-xs sm:text-sm px-2 sm:px-3">হ্যান্ডনোট</TabsTrigger>
              <TabsTrigger value="suggestion" className="text-xs sm:text-sm px-2 sm:px-3">সাজেশন</TabsTrigger>
              <TabsTrigger value="past-question" className="text-xs sm:text-sm px-2 sm:px-3 hidden sm:flex">বিগত বছর</TabsTrigger>
              <TabsTrigger value="past-question" className="text-xs sm:text-sm px-2 sm:px-3 flex sm:hidden">বিগত</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotes}
                className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                আবার চেষ্টা করুন
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading && !error ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skeleton Notes List */}
          <div className="lg:col-span-1 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Skeleton className="shrink-0 w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton Content Area */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-lg border h-[400px] sm:h-[600px]">
              <div className="space-y-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-5 w-1/4" />
                <div className="space-y-3 mt-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Enhanced Notes List */}
          <div className="lg:col-span-1">
            <ScrollArea className="h-[500px] sm:h-[600px] pr-2 sm:pr-4">
              <div className="space-y-2 sm:space-y-3">
                <AnimatePresence mode="popLayout">
                  {notes.map((note, index) => (
                    <NoteCard key={note.id} note={note} index={index} />
                  ))}
                </AnimatePresence>
                {notes.length === 0 && !error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 sm:py-16 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 border border-dashed border-primary/20"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <BookOpen className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 text-primary/30" />
                    </motion.div>
                    <p className="text-base sm:text-lg font-medium text-muted-foreground">কোনো নোটস পাওয়া যায়নি</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">অন্য ফিল্টার বা সার্চ ব্যবহার করুন</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 gap-2 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setNoteType('all'); setSelectedSubjectId('all'); }}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      ফিল্টার রিসেট করুন
                    </Button>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <p className="text-xs text-muted-foreground">
                  পৃষ্ঠা {toBengaliNum(pagination.page)} / {toBengaliNum(pagination.totalPages)}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {/* Page number buttons */}
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 text-xs"
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      >
                        {toBengaliNum(pageNum)}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Note Content Viewer */}
          <div className="lg:col-span-2">
            {noteDetailLoading ? (
              <Card className="h-[400px] sm:h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground">নোট লোড হচ্ছে...</p>
                </div>
              </Card>
            ) : selectedNote ? (
              <motion.div
                key={selectedNote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card className="overflow-hidden relative">
                  {/* Gradient top border */}
                  <div className="h-[2px] bg-gradient-to-r from-primary to-emerald-500" />

                  {/* Reading progress bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] z-10">
                    <motion.div
                      className="h-full bg-primary/60"
                      style={{ width: `${readingProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>

                  <CardHeader className="pb-3 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg sm:text-xl leading-tight">
                          {selectedNote.titleBn || selectedNote.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                          <Badge className={`w-fit text-xs ${getTypeColor(selectedNote.type)}`}>
                            {getTypeLabel(selectedNote.type)}
                          </Badge>
                          {/* Copyright Protected Badge */}
                          <Badge variant="outline" className="w-fit gap-1 border-primary/30 text-primary text-[10px]">
                            <Shield className="w-3 h-3" />
                            কপিরাইট সুরক্ষিত
                          </Badge>
                          {formatLastRead(selectedNote.id) && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatLastRead(selectedNote.id)}
                            </span>
                          )}
                          {/* Admin edit button in content area */}
                          {isAdminOrTeacher && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs gap-1 px-2 text-primary hover:bg-primary/10"
                              onClick={() => handleEditNote(selectedNote)}
                            >
                              <Pencil className="w-3 h-3" />
                              সম্পাদনা
                            </Button>
                          )}
                        </div>
                      </div>
                      {/* Action buttons - wrap on mobile */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        {/* Font size controls */}
                        <div className="flex items-center gap-0.5 mr-1 bg-muted/50 rounded-md p-0.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setFontSize('small')}
                                  className={`p-1.5 rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
                                    fontSize === 'small' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                  }`}
                                >
                                  <Type className="w-3 h-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>ছোট ফন্ট</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setFontSize('medium')}
                                  className={`p-1.5 rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
                                    fontSize === 'medium' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                  }`}
                                >
                                  <Type className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>মাঝারি ফন্ট</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setFontSize('large')}
                                  className={`p-1.5 rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
                                    fontSize === 'large' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                  }`}
                                >
                                  <Type className="w-5 h-5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>বড় ফন্ট</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Copy content button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={handleCopyContent}
                              >
                                {copySuccess ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{copySuccess ? 'কপি হয়েছে!' : 'কন্টেন্ট কপি করুন'}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {/* Share button (visual only) */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>শেয়ার করুন</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {/* PDF View button - full screen on mobile */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 h-9"
                          onClick={() => {
                            setPdfViewerNote(selectedNote);
                            setPdfViewerOpen(true);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">পিডিএফ দেখুন</span>
                          <span className="sm:hidden">PDF</span>
                        </Button>
                        {/* PDF download button */}
                        {selectedNote.pdfUrl && (
                          <Button variant="outline" size="sm" className="gap-1.5 h-9">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF ডাউনলোড</span>
                            <span className="sm:hidden">ডাউনলোড</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <ScrollArea className="h-[350px] sm:h-[450px]">
                      <div
                        ref={contentScrollRef}
                        onScroll={handleContentScroll}
                        onContextMenu={handleContextMenu}
                        className="overflow-y-auto h-[350px] sm:h-[450px] watermark-pattern select-none"
                      >
                        <div className={`prose dark:prose-invert max-w-none ${fontSizeClass} px-1 relative z-10`}>
                          <ReactMarkdown>{selectedNote.content || 'কোনো কন্টেন্ট নেই'}</ReactMarkdown>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="h-[400px] sm:h-[600px] flex items-center justify-center overflow-hidden relative">
                {/* Gradient background for empty state */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
                <div className="text-center text-muted-foreground relative z-10 px-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-primary/20" />
                  </motion.div>
                  <p className="text-lg sm:text-xl font-medium">একটি নোট নির্বাচন করুন</p>
                  <p className="text-sm mt-2 text-muted-foreground/70">বাম পাশ থেকে নোটস বাছাই করুন</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/50">
                    <Eye className="w-3.5 h-3.5" />
                    <span>পড়ার অগ্রগতি ট্র্যাক করা হবে</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* PDF Viewer Dialog */}
      <PDFViewer
        open={pdfViewerOpen}
        onOpenChange={setPdfViewerOpen}
        title={pdfViewerNote?.titleBn || pdfViewerNote?.title || ''}
        content={pdfViewerNote?.content || ''}
        subjectName={pdfViewerNote ? getSubjectName(pdfViewerNote) || undefined : undefined}
      />

      {/* Create/Edit Note Dialog (admin/teacher only) */}
      <Dialog open={crudDialogOpen} onOpenChange={setCrudDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{crudMode === 'create' ? 'নতুন নোট তৈরি করুন' : 'নোট সম্পাদনা করুন'}</DialogTitle>
            <DialogDescription>
              {crudMode === 'create' ? 'নতুন নোটের তথ্য নিচে পূরণ করুন।' : 'নোটের তথ্য আপডেট করুন।'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Subject select */}
            <div className="space-y-2">
              <Label htmlFor="note-subject">বিষয় *</Label>
              <select
                id="note-subject"
                value={formData.subjectId}
                onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value, chapterId: '' }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="">বিষয় নির্বাচন করুন</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.nameBn}</option>
                ))}
              </select>
            </div>

            {/* Chapter select */}
            <div className="space-y-2">
              <Label htmlFor="note-chapter">অধ্যায়</Label>
              <select
                id="note-chapter"
                value={formData.chapterId}
                onChange={(e) => setFormData(prev => ({ ...prev, chapterId: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                disabled={!formData.subjectId}
              >
                <option value="">অধ্যায় নির্বাচন করুন (ঐচ্ছিক)</option>
                {formChapters.map(c => (
                  <option key={c.id} value={c.id}>{c.nameBn}</option>
                ))}
              </select>
            </div>

            {/* Type select */}
            <div className="space-y-2">
              <Label htmlFor="note-type">ধরন</Label>
              <select
                id="note-type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="handnote">হ্যান্ডনোট</option>
                <option value="suggestion">সাজেশন</option>
                <option value="past-question">বিগত বছরের প্রশ্ন</option>
              </select>
            </div>

            {/* Title (English) */}
            <div className="space-y-2">
              <Label htmlFor="note-title">শিরোনাম (ইংরেজি) *</Label>
              <Input
                id="note-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Note title in English"
              />
            </div>

            {/* Title (Bengali) */}
            <div className="space-y-2">
              <Label htmlFor="note-title-bn">শিরোনাম (বাংলা) *</Label>
              <Input
                id="note-title-bn"
                value={formData.titleBn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleBn: e.target.value }))}
                placeholder="বাংলায় নোটের শিরোনাম"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="note-content">বিষয়বস্তু (Markdown) *</Label>
              <Textarea
                id="note-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="নোটের বিষয়বস্তু লিখুন (Markdown সমর্থিত)"
                className="min-h-[200px]"
              />
            </div>

            {/* PDF URL */}
            <div className="space-y-2">
              <Label htmlFor="note-pdf">PDF লিংক</Label>
              <Input
                id="note-pdf"
                value={formData.pdfUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                placeholder="https://example.com/note.pdf (ঐচ্ছিক)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCrudDialogOpen(false)}
              disabled={crudLoading}
            >
              বাতিল
            </Button>
            <Button
              onClick={handleCrudSubmit}
              disabled={crudLoading}
            >
              {crudLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {crudMode === 'create' ? 'তৈরি করুন' : 'আপডেট করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>নোট মুছে ফেলুন</AlertDialogTitle>
            <AlertDialogDescription>
              আপনি কি নিশ্চিত যে &ldquo;{deleteTarget?.titleBn || deleteTarget?.title}&rdquo; নোটটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
