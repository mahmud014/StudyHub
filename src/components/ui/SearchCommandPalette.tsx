'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Video, FileCheck, Home, LayoutDashboard,
  Radio, ClipboardList, MessageCircleQuestion, Trophy, ArrowRight,
  Clock, Sparkles, X, GraduationCap, Hash, Loader2, Bot, Award, Zap, CalendarDays
} from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ============================================================
// Types
// ============================================================

interface SubjectItem {
  id: string;
  name: string;
  nameBn: string;
  icon: string | null;
  color: string | null;
}

interface NoteItem {
  id: string;
  subjectId: string;
  title: string;
  titleBn: string;
  type: string;
  subject: { id: string; name: string; nameBn: string } | null;
  chapter: { id: string; name: string; nameBn: string } | null;
}

interface VideoItem {
  id: string;
  subjectId: string;
  title: string;
  titleBn: string;
  youtubeId: string;
  duration: number | null;
  subject: { id: string; name: string; nameBn: string } | null;
  chapter: { id: string; name: string; nameBn: string } | null;
}

interface ExamItem {
  id: string;
  subjectId: string;
  title: string;
  titleBn: string;
  duration: number;
  totalMarks: number;
  subject: { id: string; name: string; nameBn: string } | null;
  chapter: { id: string; name: string; nameBn: string } | null;
  _count?: { questions: number };
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
}

type SearchResultItem =
  | { type: 'subject'; data: SubjectItem }
  | { type: 'note'; data: NoteItem }
  | { type: 'video'; data: VideoItem }
  | { type: 'exam'; data: ExamItem }
  | { type: 'nav'; data: NavItem };

// ============================================================
// Constants
// ============================================================

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'হোম', icon: Home, shortcut: 'Alt+1' },
  { id: 'notes', label: 'নোটস', icon: BookOpen, shortcut: 'Alt+2' },
  { id: 'videos', label: 'ভিডিও', icon: Video, shortcut: 'Alt+3' },
  { id: 'live', label: 'লাইভ ক্লাস', icon: Radio, shortcut: 'Alt+4' },
  { id: 'exams', label: 'পরীক্ষা', icon: FileCheck, shortcut: 'Alt+5' },
  { id: 'assignments', label: 'অ্যাসাইনমেন্ট', icon: ClipboardList, shortcut: 'Alt+6' },
  { id: 'qa', label: 'প্রশ্নোত্তর', icon: MessageCircleQuestion, shortcut: 'Alt+7' },
  { id: 'leaderboard', label: 'লিডারবোর্ড', icon: Trophy, shortcut: 'Alt+8' },
  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, shortcut: 'Alt+D' },
  { id: 'ai-tutor', label: 'AI শিক্ষক', icon: Bot, shortcut: '' },
  { id: 'achievements', label: 'অর্জন', icon: Award, shortcut: '' },
  { id: 'daily-challenge', label: 'দৈনিক চ্যালেঞ্জ', icon: Zap, shortcut: '' },
  { id: 'planner', label: 'প্ল্যানার', icon: CalendarDays, shortcut: '' },
  { id: 'certificate', label: 'সার্টিফিকেট', icon: Award, shortcut: '' },
];

const RECENT_SEARCHES_KEY = 'studyhub_recent_searches';
const MAX_RECENT = 8;

const CATEGORY_LABELS = {
  nav: 'ন্যাভিগেশন',
  subject: 'বিষয়',
  note: 'নোটস',
  video: 'ভিডিও',
  exam: 'পরীক্ষা',
  recent: 'সাম্প্রতিক অনুসন্ধান',
} as const;

// ============================================================
// Fuzzy match utility
// ============================================================

function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Direct substring match
  if (lowerText.includes(lowerQuery)) return true;

  // Character-by-character fuzzy match
  let qi = 0;
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      qi++;
    }
  }
  return qi === lowerQuery.length;
}

function fuzzyScore(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match
  if (lowerText === lowerQuery) return 100;

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 80;

  // Contains query as substring
  const indexOf = lowerText.indexOf(lowerQuery);
  if (indexOf !== -1) return 60 - indexOf;

  // Fuzzy match — count consecutive matches
  let score = 0;
  let qi = 0;
  let lastMatchIdx = -2;
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      score += (ti === lastMatchIdx + 1) ? 15 : 5;
      lastMatchIdx = ti;
      qi++;
    }
  }
  return qi === lowerQuery.length ? score : -1;
}

// ============================================================
// Recent searches helpers
// ============================================================

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (!query.trim()) return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter(s => s !== query.trim());
    const updated = [query.trim(), ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

// ============================================================
// Skeleton loader component
// ============================================================

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      <div className="w-5 h-5 rounded bg-emerald-200/60 dark:bg-emerald-800/30 animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-3/4 rounded bg-emerald-200/60 dark:bg-emerald-800/30 animate-pulse" />
        <div className="h-2.5 w-1/2 rounded bg-emerald-200/40 dark:bg-emerald-800/20 animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonGroup() {
  return (
    <div className="p-1">
      <div className="h-3 w-20 mb-2 mx-2 rounded bg-emerald-200/50 dark:bg-emerald-800/25 animate-pulse" />
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function SearchCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { setActiveSection, setSelectedSubject } = useStudyHub();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ---- Keyboard shortcut: Cmd+K / Ctrl+K ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ---- Debounced search input ----
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // ---- Load data when dialog opens ----
  const fetchData = useCallback(async () => {
    if (dataLoaded) return;
    setIsLoading(true);
    try {
      const [subjectsRes, notesRes, videosRes, examsRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/notes'),
        fetch('/api/videos'),
        fetch('/api/exams'),
      ]);
      const [subjectsData, notesData, videosData, examsData] = await Promise.all([
        subjectsRes.json(),
        notesRes.json(),
        videosRes.json(),
        examsRes.json(),
      ]);
      if (subjectsData.success) setSubjects(subjectsData.data || []);
      if (notesData.success) setNotes(notesData.data || []);
      if (videosData.success) setVideos(videosData.data || []);
      if (examsData.success) setExams(examsData.data || []);
      setDataLoaded(true);
    } catch (error) {
      console.error('Failed to fetch search data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dataLoaded]);

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      fetchData();
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [open, fetchData]);

  // ---- Filter & score results ----
  const getFilteredResults = useCallback((): SearchResultItem[] => {
    if (!debouncedQuery.trim()) return [];

    const q = debouncedQuery.trim();
    const results: SearchResultItem[] = [];

    // Navigation items
    NAV_ITEMS.forEach(nav => {
      const score = Math.max(
        fuzzyScore(nav.label, q),
        fuzzyScore(nav.id, q)
      );
      if (score > 0) {
        results.push({ type: 'nav', data: nav });
      }
    });

    // Subjects
    subjects.forEach(subject => {
      const score = Math.max(
        fuzzyScore(subject.name, q),
        fuzzyScore(subject.nameBn, q)
      );
      if (score > 0) {
        results.push({ type: 'subject', data: subject });
      }
    });

    // Notes
    notes.forEach(note => {
      const score = Math.max(
        fuzzyScore(note.title, q),
        fuzzyScore(note.titleBn, q),
        note.subject ? fuzzyScore(note.subject.nameBn, q) : 0,
        note.chapter ? fuzzyScore(note.chapter.nameBn, q) : 0
      );
      if (score > 0) {
        results.push({ type: 'note', data: note });
      }
    });

    // Videos
    videos.forEach(video => {
      const score = Math.max(
        fuzzyScore(video.title, q),
        fuzzyScore(video.titleBn, q),
        video.subject ? fuzzyScore(video.subject.nameBn, q) : 0,
        video.chapter ? fuzzyScore(video.chapter.nameBn, q) : 0
      );
      if (score > 0) {
        results.push({ type: 'video', data: video });
      }
    });

    // Exams
    exams.forEach(exam => {
      const score = Math.max(
        fuzzyScore(exam.title, q),
        fuzzyScore(exam.titleBn, q),
        exam.subject ? fuzzyScore(exam.subject.nameBn, q) : 0,
        exam.chapter ? fuzzyScore(exam.chapter.nameBn, q) : 0
      );
      if (score > 0) {
        results.push({ type: 'exam', data: exam });
      }
    });

    return results;
  }, [debouncedQuery, subjects, notes, videos, exams]);

  // ---- Group results by type ----
  const groupedResults = useCallback((): Record<string, SearchResultItem[]> => {
    const filtered = getFilteredResults();
    const groups: Record<string, SearchResultItem[]> = {
      nav: [],
      subject: [],
      note: [],
      video: [],
      exam: [],
    };

    filtered.forEach(item => {
      if (groups[item.type]) {
        groups[item.type].push(item);
      }
    });

    return groups;
  }, [getFilteredResults]);

  // ---- Handle selection ----
  const handleSelect = useCallback((item: SearchResultItem) => {
    addRecentSearch(debouncedQuery || (item.type === 'nav' ? item.data.label : ''));

    switch (item.type) {
      case 'nav':
        setActiveSection(item.data.id);
        break;
      case 'subject':
        setSelectedSubject(item.data.id);
        setActiveSection('notes');
        break;
      case 'note':
        setSelectedSubject(item.data.subjectId);
        setActiveSection('notes');
        break;
      case 'video':
        setSelectedSubject(item.data.subjectId);
        setActiveSection('videos');
        break;
      case 'exam':
        setSelectedSubject(item.data.subjectId);
        setActiveSection('exams');
        break;
    }

    setOpen(false);
  }, [debouncedQuery, setActiveSection, setSelectedSubject]);

  // ---- Handle recent search click ----
  const handleRecentSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    setDebouncedQuery(searchTerm);
  }, []);

  // ---- Handle clear recent searches ----
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // ---- Render item icon ----
  const renderItemIcon = (item: SearchResultItem) => {
    if (item.type === 'nav') {
      const Icon = item.data.icon;
      return <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    if (item.type === 'subject') {
      return <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    if (item.type === 'note') {
      return <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    if (item.type === 'video') {
      return <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    if (item.type === 'exam') {
      return <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    return null;
  };

  // ---- Render item label ----
  const renderItemLabel = (item: SearchResultItem): string => {
    if (item.type === 'nav') return item.data.label;
    if (item.type === 'subject') return item.data.nameBn || item.data.name;
    if (item.type === 'note') return item.data.titleBn || item.data.title;
    if (item.type === 'video') return item.data.titleBn || item.data.title;
    if (item.type === 'exam') return item.data.titleBn || item.data.title;
    return '';
  };

  // ---- Render item description ----
  const renderItemDescription = (item: SearchResultItem): string | null => {
    if (item.type === 'nav') return null;
    if (item.type === 'subject') return item.data.name;
    if (item.type === 'note') {
      const parts: string[] = [];
      if (item.data.subject) parts.push(item.data.subject.nameBn);
      if (item.data.chapter) parts.push(item.data.chapter.nameBn);
      const typeLabel = item.data.type === 'handnote' ? 'হ্যান্ডনোট' :
        item.data.type === 'suggestion' ? 'সাজেশন' :
        item.data.type === 'past-question' ? 'বিগত বছরের প্রশ্ন' : '';
      if (typeLabel) parts.push(typeLabel);
      return parts.join(' · ');
    }
    if (item.type === 'video') {
      const parts: string[] = [];
      if (item.data.subject) parts.push(item.data.subject.nameBn);
      if (item.data.chapter) parts.push(item.data.chapter.nameBn);
      if (item.data.duration) {
        const mins = Math.floor(item.data.duration / 60);
        const secs = item.data.duration % 60;
        parts.push(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
      return parts.join(' · ');
    }
    if (item.type === 'exam') {
      const parts: string[] = [];
      if (item.data.subject) parts.push(item.data.subject.nameBn);
      if (item.data.chapter) parts.push(item.data.chapter.nameBn);
      parts.push(`${item.data.duration} মিনিট`);
      if (item.data.totalMarks) parts.push(`${item.data.totalMarks} নম্বর`);
      return parts.join(' · ');
    }
    return null;
  };

  // ---- Get item value for cmdk search ----
  const getItemValue = (item: SearchResultItem): string => {
    if (item.type === 'nav') return `nav-${item.data.id}-${item.data.label}`;
    if (item.type === 'subject') return `subject-${item.data.id}-${item.data.nameBn}-${item.data.name}`;
    if (item.type === 'note') return `note-${item.data.id}-${item.data.titleBn}-${item.data.title}`;
    if (item.type === 'video') return `video-${item.data.id}-${item.data.titleBn}-${item.data.title}`;
    if (item.type === 'exam') return `exam-${item.data.id}-${item.data.titleBn}-${item.data.title}`;
    return '';
  };

  // ---- Render item shortcut ----
  const renderItemShortcut = (item: SearchResultItem): string | null => {
    if (item.type === 'nav' && item.data.shortcut) {
      return item.data.shortcut;
    }
    return null;
  };

  const groups = groupedResults();
  const hasResults = Object.values(groups).some(g => g.length > 0);
  const isSearching = debouncedQuery.trim().length > 0;
  const showRecent = !isSearching && recentSearches.length > 0;

  return (
    <>
      {/* Command Palette Dialog */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="সার্চ কমান্ড প্যালেট"
        description="বিষয়, নোটস, ভিডিও, পরীক্ষা এবং ন্যাভিগেশন খুঁজুন"
        className="sm:max-w-lg md:max-w-xl lg:max-w-2xl [&_[data-slot=dialog-content]]:bg-white/80 [&_[data-slot=dialog-content]]:dark:bg-gray-900/80 [&_[data-slot=dialog-content]]:backdrop-blur-xl [&_[data-slot=dialog-content]]:border-emerald-200/50 [&_[data-slot=dialog-content]]:dark:border-emerald-800/30 [&_[data-slot=dialog-content]]:shadow-2xl [&_[data-slot=dialog-content]]:shadow-emerald-500/10"
      >
        {/* Custom search input with emerald styling */}
        <div className="flex items-center border-b border-emerald-200/60 dark:border-emerald-800/40 px-4">
          <Search className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mr-2" />
          <input
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="বিষয়, নোটস, ভিডিও বা পরীক্ষা খুঁজুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setDebouncedQuery(''); }}
              className="shrink-0 p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <kbd className="shrink-0 ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 font-mono text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
            Esc
          </kbd>
        </div>

        <CommandList className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-700">
          {/* Loading state */}
          {isLoading && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ডেটা লোড হচ্ছে...
              </div>
              <SkeletonGroup />
              <SkeletonGroup />
            </div>
          )}

          {/* Recent searches (no active query) */}
          {showRecent && !isLoading && (
            <CommandGroup heading={CATEGORY_LABELS.recent}>
              {recentSearches.map((term, idx) => (
                <CommandItem
                  key={`recent-${idx}`}
                  value={`recent-${term}`}
                  onSelect={() => handleRecentSearch(term)}
                  className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-900/20"
                >
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate text-sm">{term}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-50" />
                </CommandItem>
              ))}
              <CommandItem
                value="clear-recent"
                onSelect={handleClearRecent}
                className="cursor-pointer text-xs text-muted-foreground justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                সাম্প্রতিক অনুসন্ধান মুছুন
              </CommandItem>
            </CommandGroup>
          )}

          {/* Search results grouped by category */}
          {!isLoading && isSearching && (
            <>
              {!hasResults && (
                <CommandEmpty>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-6"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        &quot;{debouncedQuery}&quot; পাওয়া যায়নি
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ভিন্ন শব্দ দিয়ে খুঁজে দেখুন অথবা বানান পরীক্ষা করুন
                      </p>
                    </div>
                  </motion.div>
                </CommandEmpty>
              )}

              {/* Navigation group */}
              {groups.nav.length > 0 && (
                <CommandGroup heading={CATEGORY_LABELS.nav}>
                  {groups.nav.map(item => (
                    <CommandItem
                      key={`nav-${item.data.id}`}
                      value={getItemValue(item)}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-900/20"
                    >
                      {renderItemIcon(item)}
                      <span className="flex-1 truncate text-sm">{renderItemLabel(item)}</span>
                      {renderItemShortcut(item) && (
                        <CommandShortcut className="text-emerald-600/60 dark:text-emerald-400/60">
                          {renderItemShortcut(item)}
                        </CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Subjects group */}
              {groups.subject.length > 0 && (
                <CommandGroup heading={CATEGORY_LABELS.subject}>
                  {groups.subject.map(item => (
                    <CommandItem
                      key={`subject-${item.data.id}`}
                      value={getItemValue(item)}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-900/20"
                    >
                      {renderItemIcon(item)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{renderItemLabel(item)}</p>
                        {renderItemDescription(item) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {renderItemDescription(item)}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Notes group */}
              {groups.note.length > 0 && (
                <CommandGroup heading={CATEGORY_LABELS.note}>
                  {groups.note.slice(0, 6).map(item => (
                    <CommandItem
                      key={`note-${item.data.id}`}
                      value={getItemValue(item)}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-900/20"
                    >
                      {renderItemIcon(item)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{renderItemLabel(item)}</p>
                        {renderItemDescription(item) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {renderItemDescription(item)}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Videos group */}
              {groups.video.length > 0 && (
                <CommandGroup heading={CATEGORY_LABELS.video}>
                  {groups.video.slice(0, 6).map(item => (
                    <CommandItem
                      key={`video-${item.data.id}`}
                      value={getItemValue(item)}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-900/20"
                    >
                      {renderItemIcon(item)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{renderItemLabel(item)}</p>
                        {renderItemDescription(item) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {renderItemDescription(item)}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Exams group */}
              {groups.exam.length > 0 && (
                <CommandGroup heading={CATEGORY_LABELS.exam}>
                  {groups.exam.slice(0, 6).map(item => (
                    <CommandItem
                      key={`exam-${item.data.id}`}
                      value={getItemValue(item)}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-900/20"
                    >
                      {renderItemIcon(item)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{renderItemLabel(item)}</p>
                        {renderItemDescription(item) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {renderItemDescription(item)}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}

          {/* Default state: no query, no recent searches */}
          {!isLoading && !isSearching && !showRecent && (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  দ্রুত খুঁজে পান
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                  বিষয়, নোটস, ভিডিও, পরীক্ষা এবং আরও অনেক কিছু সহজে খুঁজুন
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <kbd className="inline-flex items-center gap-1 rounded-md border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <Hash className="w-3 h-3" />
                  {typeof navigator !== 'undefined' && /Mac|iPhone/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}
                  +K
                </kbd>
                <span className="text-xs text-muted-foreground">দিয়ে যেকোনো সময় খুলুন</span>
              </div>
            </div>
          )}
        </CommandList>

        {/* Footer with keyboard hints */}
        <div className="border-t border-emerald-200/60 dark:border-emerald-800/40 px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center rounded border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/30 px-1 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">↑↓</kbd>
              <span>নেভিগেট</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center rounded border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/30 px-1 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">↵</kbd>
              <span>নির্বাচন</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center rounded border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/30 px-1 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">Esc</kbd>
              <span>বন্ধ</span>
            </span>
          </div>
          <span className="text-emerald-600/60 dark:text-emerald-400/60 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            স্টাডি হাব সার্চ
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
