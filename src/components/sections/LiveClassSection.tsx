'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, ExternalLink, Calendar, Clock, Monitor, Users, ArrowRight, Play,
  ChevronRight, Bell, BellRing, MessageSquare, Send,
  BarChart3, Eye, Timer, CheckCircle2, X, Shield, AlertTriangle, Wifi,
  Volume2, Trash2, BookOpen, Pencil, PlusCircle, Loader2, AlertCircle, Plus,
  Copy, Check, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// Helper: convert digits to Bengali numerals
function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

// Subject color mapping
const subjectColors: Record<string, { gradient: string; bg: string; text: string; border: string; light: string }> = {
  'গণিত': {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    light: 'bg-emerald-500/5',
  },
  'পদার্থবিজ্ঞান': {
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    light: 'bg-amber-500/5',
  },
  'ইংরেজি': {
    gradient: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/30',
    light: 'bg-teal-500/5',
  },
  'রসায়ন': {
    gradient: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    light: 'bg-rose-500/5',
  },
  'জীববিজ্ঞান': {
    gradient: 'from-lime-500 to-lime-600',
    bg: 'bg-lime-500/10',
    text: 'text-lime-600 dark:text-lime-400',
    border: 'border-lime-500/30',
    light: 'bg-lime-500/5',
  },
  'বাংলা': {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
    light: 'bg-orange-500/5',
  },
  'তথ্য ও যোগাযোগ প্রযুক্তি': {
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
    light: 'bg-slate-500/5',
  },
  'বাংলাদেশ ও বিশ্বপরিচয়': {
    gradient: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/30',
    light: 'bg-pink-500/5',
  },
};

const defaultColor = subjectColors['গণিত'];

function getSubjectColor(subject: string) {
  return subjectColors[subject] || defaultColor;
}

// Data
interface LiveClassData {
  id: string;
  title: string;
  titleBn: string;
  subject: { id: string; name: string; nameBn: string; color: string | null };
  youtubeId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  hostName: string;
  description: string | null;
}

// Countdown timer component
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const target = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState(Math.max(0, target - Date.now()));

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [target, timeLeft]);

  const totalSecs = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const toBengali = (n: number) => n.toString().padStart(2, '0').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);

  if (totalSecs <= 0) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 text-xs bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md font-mono">
        <Clock className="w-3 h-3" />
        <span className="font-semibold">{toBengali(hours)}:{toBengali(mins)}:{toBengali(secs)}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">পরে</span>
    </div>
  );
}

// Pulsing live indicator
function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-red-500"
          animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 relative z-10" />
      </div>
      <Badge className="bg-red-500/90 text-white shrink-0 text-[10px] px-1.5 py-0 border-0">
        লাইভ
      </Badge>
    </div>
  );
}

// Join countdown for dialog
function JoinCountdown({ onReady }: { onReady: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      onReady();
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onReady]);

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
        {toBengaliNum(count > 0 ? count : 0)}
      </div>
      <span className="text-sm text-muted-foreground">সেকেন্ড পর যুক্ত হবে...</span>
    </div>
  );
}

// Format date/time in Bengali
function formatDateTimeBn(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const dayName = days[date.getDay()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'সন্ধ্যা' : 'সকাল';
  const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const timeStr = `${period} ${toBengaliNum(h)}:${toBengaliNum(minutes.toString().padStart(2, '0'))}`;
  return `${dayName}, ${timeStr}`;
}

function formatDateBn(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  return `${toBengaliNum(date.getDate())} ${months[date.getMonth()]} ${toBengaliNum(date.getFullYear())}`;
}

export default function LiveClassSection() {
  const { user } = useStudyHub();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const [liveClasses, setLiveClasses] = useState<LiveClassData[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; nameBn: string }[]>([]);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<LiveClassData | null>(null);
  const [checklist, setChecklist] = useState({
    internet: false,
    onTime: false,
    quiet: false,
    materials: false,
  });
  const [joinPhase, setJoinPhase] = useState<'check' | 'countdown' | 'joined'>('check');
  const [reminders, setReminders] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('studyhub_class_reminders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [selectedDay, setSelectedDay] = useState<string>('শনি');
  const [loading, setLoading] = useState(true);
  const [youtubeEmbedOpen, setYoutubeEmbedOpen] = useState(false);
  const [embedClass, setEmbedClass] = useState<LiveClassData | null>(null);

  // CRUD States for Admin/Teacher
  const [crudDialogOpen, setCrudDialogOpen] = useState(false);
  const [crudMode, setCrudMode] = useState<'create' | 'edit'>('create');
  const [selectedLiveClass, setSelectedLiveClass] = useState<LiveClassData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleBn: '',
    subjectId: '',
    youtubeId: '',
    scheduledAt: '',
    duration: '60',
    status: 'upcoming',
    hostName: '',
    description: '',
  });
  const [crudLoading, setCrudLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LiveClassData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dialog visibility states for View All and Full Schedule
  const [showAllRecordingsOpen, setShowAllRecordingsOpen] = useState(false);
  const [showFullScheduleOpen, setShowFullScheduleOpen] = useState(false);
  const [recordingSearchQuery, setRecordingSearchQuery] = useState('');
  const [recordingSubjectFilter, setRecordingSubjectFilter] = useState('all');

  // Teacher Classroom Dashboard state
  const [activeTeacherTab, setActiveTeacherTab] = useState<'stream' | 'chat' | 'materials'>('stream');
  const [teacherChatInput, setTeacherChatInput] = useState('');
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedText, setCopiedText] = useState<'rtmp' | 'key' | null>(null);
  const [teacherChatLog, setTeacherChatLog] = useState([
    { id: '1', sender: 'আসিফ রহমান', role: 'student', message: 'আসসালামু আলাইকুম স্যার। আজকের ক্লাস কি এই অধ্যায়ের শেষ ক্লাস?', time: '১২:১৫' },
    { id: '2', sender: 'তাসনিম সুলতানা', role: 'student', message: 'সাউন্ড এবং ভিডিও একদম ক্লিয়ার আছে স্যার।', time: '১২:১৬' },
    { id: '3', sender: 'মেহেদী হাসান', role: 'student', message: 'স্যার, ২ নং সৃজনশীল অংকটা আরেকবার বুঝিয়ে দিলে ভালো হতো।', time: '১২:১৮' },
  ]);
  const [activeViewerCount, setActiveViewerCount] = useState(52);
  const [teacherClassMaterials, setTeacherClassMaterials] = useState([
    { id: '1', title: 'লেকচার শিট - পার্ট ১', url: 'https://pdf.studyhub.com/math-part-1' },
    { id: '2', title: 'সৃজনশীল প্র্যাকটিস শিট', url: 'https://pdf.studyhub.com/math-practice' }
  ]);
  const [materialFormTitle, setMaterialFormTitle] = useState('');
  const [materialFormUrl, setMaterialFormUrl] = useState('');

  // Dynamic viewer count and chat logic for Live Class Control Panel
  useEffect(() => {
    if (joinPhase === 'joined' && selectedClass?.status === 'live') {
      const chatInterval = setInterval(() => {
        const studentNames = ['রাইয়ান আহমেদ', 'ফারিহা ইসলাম', 'সাদমান সাকিব', 'সুমাইয়া আক্তার', 'নাফিস মাহমুদ', 'অনন্যা সেন'];
        const messages = [
          'স্যার, লেকচার শিটটা কি পাওয়া যাবে?',
          'সব ঠিকঠাক শোনা যাচ্ছে স্যার।',
          'এই অধ্যায় থেকে পরীক্ষায় কেমন প্রশ্ন আসতে পারে স্যার?',
          'অনেক সুন্দর করে বুঝিয়েছেন স্যার, ধন্যবাদ!',
          'স্যার, ৩ নং নিয়মের আর একটা উদাহরণ দিলে ভালো হতো।',
          'আসসালামু আলাইকুম স্যার, লেট হয়ে গেল জয়েন করতে!',
          'স্যার, বোর্ড পরীক্ষার জন্য কোনগুলো বেশি ইম্পর্ট্যান্ট?'
        ];
        const randomName = studentNames[Math.floor(Math.random() * studentNames.length)];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        setTeacherChatLog(prev => [
          ...prev,
          { id: String(Date.now()), sender: randomName, role: 'student', message: randomMsg, time: toBengaliNum(timeStr as any) }
        ]);
        
        // Fluctuate viewers count slightly
        setActiveViewerCount(c => Math.max(35, c + Math.floor(Math.random() * 5) - 2));
      }, 12000);

      return () => clearInterval(chatInterval);
    }
  }, [joinPhase, selectedClass]);

  // Fetch live classes from API
  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/live-classes');
      const json = await res.json();
      if (json.success && json.data) {
        setLiveClasses(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Fetch subjects for select
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubjects(data.data);
        }
      })
      .catch(console.error);
  }, []);

  // CRUD Actions
  const handleCreateClass = useCallback(() => {
    setCrudMode('create');
    setFormData({
      title: '',
      titleBn: '',
      subjectId: '',
      youtubeId: '',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      duration: '60',
      status: 'upcoming',
      hostName: user?.name || '',
      description: '',
    });
    setCrudDialogOpen(true);
  }, [user]);

  const handleEditClass = useCallback((cls: LiveClassData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCrudMode('edit');
    setSelectedLiveClass(cls);
    setFormData({
      title: cls.title,
      titleBn: cls.titleBn,
      subjectId: cls.subject.id,
      youtubeId: cls.youtubeId,
      scheduledAt: new Date(cls.scheduledAt).toISOString().slice(0, 16),
      duration: String(cls.duration),
      status: cls.status,
      hostName: cls.hostName,
      description: cls.description || '',
    });
    setCrudDialogOpen(true);
  }, []);

  const handleCrudSubmit = useCallback(async () => {
    if (!formData.subjectId || !formData.title || !formData.titleBn || !formData.youtubeId || !formData.scheduledAt) {
      toast.error('বিষয়, শিরোনাম, সময় ও ইউটিউব আইডি প্রয়োজন');
      return;
    }

    setCrudLoading(true);
    try {
      const payload = {
        subjectId: formData.subjectId,
        title: formData.title,
        titleBn: formData.titleBn,
        youtubeId: formData.youtubeId,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: parseInt(formData.duration) || 60,
        status: formData.status,
        hostName: formData.hostName,
        description: formData.description || null,
      };

      let res: Response;
      if (crudMode === 'create') {
        res = await fetch('/api/live-classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (selectedLiveClass) {
        res = await fetch(`/api/live-classes/${selectedLiveClass.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        return;
      }

      const data = await res.json();
      if (data.success) {
        toast.success(crudMode === 'create' ? 'লাইভ ক্লাস নির্ধারণ করা হয়েছে!' : 'লাইভ ক্লাস আপডেট করা হয়েছে!');
        setCrudDialogOpen(false);
        fetchClasses();
      } else {
        toast.error(data.error || 'সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setCrudLoading(false);
    }
  }, [formData, crudMode, selectedLiveClass, fetchClasses]);

  const handleDeleteClass = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/live-classes/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('লাইভ ক্লাসটি মুছে ফেলা হয়েছে');
        setDeleteTarget(null);
        fetchClasses();
      } else {
        toast.error(data.error || 'মুছে ফেলতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, fetchClasses]);

  const handleUpdateStatus = useCallback(async (clsId: string, status: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`/api/live-classes/${clsId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('ক্লাসের স্ট্যাটাস পরিবর্তন করা হয়েছে');
        fetchClasses();
      } else {
        toast.error(data.error || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    }
  }, [fetchClasses]);

  // Separate classes by status
  const upcomingClasses = liveClasses.filter((c) => c.status === 'upcoming' || c.status === 'live');
  const completedClasses = liveClasses.filter((c) => c.status === 'completed');

  // Stats
  const stats = {
    attended: completedClasses.length,
    upcoming: upcomingClasses.filter(c => c.status === 'upcoming').length,
    avgDuration: liveClasses.length > 0 ? Math.round(liveClasses.reduce((sum, c) => sum + c.duration, 0) / liveClasses.length) : 0,
  };

  // Save reminders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('studyhub_class_reminders', JSON.stringify([...reminders]));
    } catch {}
  }, [reminders]);

  const handleJoinClick = (cls: LiveClassData) => {
    setSelectedClass(cls);
    if (isAdminOrTeacher) {
      setJoinPhase('joined');
    } else {
      setJoinPhase('check');
      setChecklist({ internet: false, onTime: false, quiet: false, materials: false });
    }
    setJoinDialogOpen(true);
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleStartCountdown = useCallback(() => {
    setJoinPhase('countdown');
  }, []);

  const handleJoined = useCallback(() => {
    setJoinPhase('joined');
  }, []);

  const handleSetReminder = (cls: LiveClassData) => {
    const key = `${cls.id}`;
    if (reminders.has(key)) {
      setReminders(prev => { const n = new Set(prev); n.delete(key); return n; });
      return;
    }
    setReminders(prev => new Set(prev).add(key));

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('স্টাডি হাব - ক্লাস রিমাইন্ডার', {
          body: `${cls.subject.nameBn} ক্লাস ${formatDateTimeBn(cls.scheduledAt)} এ শুরু হবে`,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            new Notification('স্টাডি হাব - ক্লাস রিমাইন্ডার', {
              body: `${cls.subject.nameBn} ক্লাস ${formatDateTimeBn(cls.scheduledAt)} এ শুরু হবে`,
              icon: '/favicon.ico',
            });
          }
        });
      }
    }
  };

  // Build weekly schedule from live classes
  const weeklySchedule = (() => {
    const days = [
      { day: 'শনি', dayFull: 'শনিবার', slots: [] as { time: string; subject: string; teacher: string; color: typeof defaultColor }[] },
      { day: 'রবি', dayFull: 'রবিবার', slots: [] as { time: string; subject: string; teacher: string; color: typeof defaultColor }[] },
      { day: 'সোম', dayFull: 'সোমবার', slots: [] as { time: string; subject: string; teacher: string; color: typeof defaultColor }[] },
      { day: 'মঙ্গল', dayFull: 'মঙ্গলবার', slots: [] as { time: string; subject: string; teacher: string; color: typeof defaultColor }[] },
      { day: 'বুধ', dayFull: 'বুধবার', slots: [] as { time: string; subject: string; teacher: string; color: typeof defaultColor }[] },
      { day: 'বৃহ', dayFull: 'বৃহস্পতিবার', slots: [] as { time: string; subject: string; teacher: string; color: typeof defaultColor }[] },
      { day: 'শুক্র', dayFull: 'শুক্রবার', slots: [] as { time: string; subject: string; teacher: string; color: typeof defaultColor }[] },
    ];

    const dayMap: Record<number, number> = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };

    upcomingClasses.forEach((cls) => {
      const date = new Date(cls.scheduledAt);
      const dayIdx = dayMap[date.getDay()];
      if (dayIdx !== undefined) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'সন্ধ্যা' : 'সকাল';
        const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        const timeStr = `${period} ${toBengaliNum(h)}:${toBengaliNum(minutes.toString().padStart(2, '0'))}`;

        days[dayIdx].slots.push({
          time: timeStr,
          subject: cls.subject.nameBn,
          teacher: cls.hostName,
          color: getSubjectColor(cls.subject.nameBn),
        });
      }
    });

    return days;
  })();

  const selectedDaySchedule = weeklySchedule.find(d => d.day === selectedDay);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-5 rounded-xl border">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="w-24 h-9 rounded-md" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl border space-y-3">
                <Skeleton className="h-5 w-2/3" />
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              লাইভ ক্লাস
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-sm px-3 py-1">
                {toBengaliNum(liveClasses.length)} টি
              </Badge>
            </h2>
            <div className="mt-2 ml-[52px] flex items-center gap-2">
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <div className="h-1 w-4 rounded-full bg-emerald-300/50" />
            </div>
            <p className="mt-2 text-muted-foreground ml-[52px]">
              সরাসরি ক্লাসে যুক্ত হন এবং রেকর্ডিং দেখুন
            </p>
          </div>

          {/* Statistics Card */}
          <div className="flex items-center gap-3 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-border/50 px-3 py-2 shadow-none">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">সমাপন</p>
                        <p className="text-sm font-bold">{toBengaliNum(stats.attended)}</p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>সম্পন্ন ক্লাস</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-border/50 px-3 py-2 shadow-none">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">আসন্ন</p>
                        <p className="text-sm font-bold">{toBengaliNum(stats.upcoming)}</p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>আসন্ন লাইভ ক্লাস</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-border/50 px-3 py-2 shadow-none">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">গড় সময়</p>
                        <p className="text-sm font-bold">{toBengaliNum(stats.avgDuration)} মি.</p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>গড় ক্লাস সময়কাল</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isAdminOrTeacher && (
              <Button
                onClick={handleCreateClass}
                className="gap-1.5 h-10 px-4"
              >
                <PlusCircle className="w-4 h-4" />
                নতুন লাইভ ক্লাস
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {liveClasses.length === 0 ? (
        <Card className="border-dashed border-2 border-emerald-200 dark:border-emerald-800">
          <CardContent className="py-16 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                কোনো লাইভ ক্লাস নেই
              </h3>
              <p className="text-muted-foreground text-sm">
                এখনো কোনো লাইভ ক্লাস শিডিউল করা হয়নি। পরে আবার দেখুন!
              </p>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Live Classes */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              আসন্ন ও লাইভ ক্লাস
              <Badge variant="secondary" className="text-xs">
                {toBengaliNum(upcomingClasses.length)} টি ক্লাস
              </Badge>
            </h3>
            <div className="space-y-4">
              {upcomingClasses.length === 0 ? (
                <Card className="border-dashed border-2 border-border/50">
                  <CardContent className="py-10 text-center">
                    <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">কোনো আসন্ন ক্লাস নেই</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingClasses.map((cls, index) => {
                  const color = getSubjectColor(cls.subject.nameBn);
                  const reminderKey = cls.id;
                  const hasReminder = reminders.has(reminderKey);
                  const isLive = cls.status === 'live';
                  return (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 ${isLive ? 'border-emerald-500/30' : 'border-border/50'}`}>
                        <div className={`h-1.5 bg-gradient-to-r ${color.gradient}`} />
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color.bg} group-hover:scale-110 transition-transform duration-300`}>
                              <Monitor className={`w-6 h-6 ${color.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <h4 className="font-semibold truncate">{cls.titleBn}</h4>
                                {isLive ? (
                                  <LiveIndicator />
                                ) : (
                                  <CountdownTimer targetDate={cls.scheduledAt} />
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {cls.hostName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDateTimeBn(cls.scheduledAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3.5 h-3.5" />
                                  {toBengaliNum(cls.duration)} মিনিট
                                </span>
                                <Badge className={`text-xs ${color.bg} ${color.text} border-0`}>
                                  {cls.subject.nameBn}
                                </Badge>
                              </div>
                              {cls.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cls.description}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="flex items-center gap-2">
                                {isLive ? (
                                  <Button
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20"
                                    size="sm"
                                    onClick={() => handleJoinClick(cls)}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1.5" />
                                    যুক্ত হন
                                  </Button>
                                ) : (
                                  <>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant={hasReminder ? 'default' : 'outline'}
                                            size="sm"
                                            className={hasReminder ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                            onClick={() => handleSetReminder(cls)}
                                          >
                                            {hasReminder ? (
                                              <BellRing className="w-4 h-4 mr-1.5" />
                                            ) : (
                                              <Bell className="w-4 h-4 mr-1.5" />
                                            )}
                                            রিমাইন্ডার
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {hasReminder ? 'রিমাইন্ডার সরান' : 'রিমাইন্ডার সেট করুন'}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <Button variant="outline" size="sm" onClick={() => {
                                      setEmbedClass(cls);
                                      setYoutubeEmbedOpen(true);
                                    }}>
                                      বিস্তারিত
                                    </Button>
                                  </>
                                )}
                              </div>
                              {isAdminOrTeacher && (
                                <div className="flex items-center gap-1 bg-muted/65 p-1 rounded-lg border">
                                  {cls.status === 'upcoming' && (
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      onClick={(e) => handleUpdateStatus(cls.id, 'live', e)}
                                      className="h-7 px-2 text-[10px] bg-red-500 hover:bg-red-600 text-white font-medium gap-1"
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                      লাইভ যান
                                    </Button>
                                  )}
                                  {cls.status === 'live' && (
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      onClick={(e) => handleUpdateStatus(cls.id, 'completed', e)}
                                      className="h-7 px-2 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white font-medium gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      সমাপ্ত করুন
                                    </Button>
                                  )}
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={(e) => handleEditClass(cls, e)}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                                    title="এডিট"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget(cls);
                                    }}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Statistics Card */}
            <Card className="border-border/50 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-sm">ক্লাস পরিসংখ্যান</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{toBengaliNum(stats.attended)}</p>
                    <p className="text-[10px] text-muted-foreground">সমাপন</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{toBengaliNum(stats.upcoming)}</p>
                    <p className="text-[10px] text-muted-foreground">আসন্ন</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-teal-500/5 border border-teal-500/10">
                    <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{toBengaliNum(stats.avgDuration)}</p>
                    <p className="text-[10px] text-muted-foreground">গড় মি.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule Interactive View */}
            <Card className="border-border/50 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-sm">সাপ্তাহিক রুটিন</h4>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {weeklySchedule.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(day.day)}
                      className={`text-center rounded-lg py-2 px-1 transition-all duration-200 ${
                        selectedDay === day.day
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : day.slots.length > 0
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                            : 'bg-muted/50 text-muted-foreground/50 hover:bg-muted/80'
                      }`}
                    >
                      <p className="text-[10px] font-medium">{day.day}</p>
                      <p className="text-[9px] mt-0.5">
                        {day.slots.length > 0 ? toBengaliNum(day.slots.length) : '—'}
                      </p>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDay}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {selectedDaySchedule && selectedDaySchedule.slots.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDaySchedule.slots.map((slot, i) => (
                          <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${slot.color.light} border ${slot.color.border}`}>
                            <div className={`w-8 h-8 rounded-md ${slot.color.bg} flex items-center justify-center shrink-0`}>
                              <Monitor className={`w-4 h-4 ${slot.color.text}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{slot.subject}</p>
                              <p className="text-[10px] text-muted-foreground">{slot.time} • {slot.teacher}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">এই দিনে কোনো ক্লাস নেই</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 gap-1.5"
                  onClick={() => setShowFullScheduleOpen(true)}
                >
                  সম্পূর্ণ রুটিন দেখুন
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>

            {/* Recorded Sessions */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                সাম্প্রতিক রেকর্ডিং
              </h3>
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500/30 to-amber-500/30" />
                <CardContent className="p-4">
                  {completedClasses.length === 0 ? (
                    <div className="text-center py-6">
                      <Play className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">কোনো রেকর্ডিং নেই</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedClasses.slice(0, 4).map((session, i) => {
                        const sessionColor = getSubjectColor(session.subject.nameBn);
                        return (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 group cursor-pointer"
                            onClick={() => {
                              setEmbedClass(session);
                              setYoutubeEmbedOpen(true);
                            }}
                          >
                            <div className={`shrink-0 w-10 h-10 rounded-lg ${sessionColor.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative`}>
                              <Play className={`w-4 h-4 ${sessionColor.text}`} />
                              <Badge className="absolute -bottom-1.5 -right-1.5 text-[8px] px-1 py-0 bg-background border text-muted-foreground">
                                {toBengaliNum(session.duration)} মি.
                              </Badge>
                            </div>
                            <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{session.titleBn}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                                  <span>{formatDateBn(session.scheduledAt)}</span>
                                  <Badge className={`text-[9px] px-1 py-0 ${sessionColor.bg} ${sessionColor.text} border-0`}>
                                    {session.subject.nameBn}
                                  </Badge>
                                </div>
                              </div>
                              {isAdminOrTeacher && (
                                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    onClick={(e) => handleEditClass(session, e)}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget(session);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  {completedClasses.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => setShowAllRecordingsOpen(true)}
                    >
                      <Play className="w-3.5 h-3.5" />
                      সব রেকর্ডিং দেখুন
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Set Reminders */}
            {reminders.size > 0 && (
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BellRing className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-sm">আমার রিমাইন্ডার</h4>
                    <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-0">
                      {toBengaliNum(reminders.size)}
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {[...reminders].map((key) => {
                      const cls = liveClasses.find((c) => c.id === key);
                      return (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <span className="text-xs truncate flex-1">{cls?.titleBn || key}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500"
                            onClick={() => setReminders(prev => { const n = new Set(prev); n.delete(key); return n; })}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* YouTube Embed Dialog */}
      <Dialog open={youtubeEmbedOpen} onOpenChange={setYoutubeEmbedOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              {embedClass?.titleBn || 'ক্লাস ভিডিও'}
            </DialogTitle>
            <DialogDescription>
              {embedClass && (
                <span>{embedClass.subject.nameBn} • {embedClass.hostName} • {formatDateTimeBn(embedClass.scheduledAt)}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          {embedClass?.youtubeId && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${embedClass.youtubeId}`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className={isAdminOrTeacher ? "max-w-2xl h-[600px] flex flex-col p-6 overflow-hidden" : "max-w-lg"}>
          {isAdminOrTeacher && selectedClass ? (
            // Teacher / Administrator Control Panel
            <div className="flex flex-col h-full overflow-hidden">
              <DialogHeader className="shrink-0 pb-3 border-b">
                <DialogTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-emerald-500 animate-pulse" />
                    শিক্ষক নিয়ন্ত্রণ প্যানেল (Teacher Control Panel)
                  </span>
                  <Badge className="bg-red-500 hover:bg-red-600 animate-pulse text-white flex items-center gap-1 text-[11px] px-2 py-0.5 border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping" />
                    লাইভ ব্রডকাস্ট
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  আপনার OBS বা স্ট্রিমিং সফটওয়্যার দিয়ে লাইভ স্টার্ট করতে এবং শিক্ষার্থীদের সাথে চ্যাট করতে নিচের ট্যাবগুলো ব্যবহার করুন।
                </DialogDescription>
              </DialogHeader>

              {/* Tab Navigation */}
              <div className="flex gap-1.5 p-1 bg-muted/60 rounded-lg shrink-0 mt-3 border border-border/40">
                <button
                  onClick={() => setActiveTeacherTab('stream')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    activeTeacherTab === 'stream'
                      ? 'bg-background text-primary shadow-sm border border-border/30'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted/40'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  স্ট্রিমিং সেটআপ
                </button>
                <button
                  onClick={() => setActiveTeacherTab('chat')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 relative ${
                    activeTeacherTab === 'chat'
                      ? 'bg-background text-primary shadow-sm border border-border/30'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted/40'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  লাইভ চ্যাট
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full text-[8px] px-1 font-bold animate-pulse">
                    {toBengaliNum(activeViewerCount)}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTeacherTab('materials')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    activeTeacherTab === 'materials'
                      ? 'bg-background text-primary shadow-sm border border-border/30'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted/40'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  লেকচার মেটেরিয়াল
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-hidden my-3 min-h-0">
                {activeTeacherTab === 'stream' && (
                  <div className="space-y-4 py-1 h-full overflow-y-auto pr-1">
                    {/* Class Identity Card */}
                    <div className="bg-muted/50 p-4 rounded-xl border border-border/60">
                      <div className="flex items-center gap-3">
                        <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${getSubjectColor(selectedClass.subject.nameBn).bg}`}>
                          <Play className={`w-5.5 h-5.5 ${getSubjectColor(selectedClass.subject.nameBn).text}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm line-clamp-1">{selectedClass.titleBn}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{selectedClass.subject.nameBn} • {selectedClass.hostName}</p>
                        </div>
                      </div>
                    </div>

                    {/* RTMP OBS Configuration */}
                    <div className="bg-card p-4 rounded-xl border border-border/60 space-y-3 shadow-sm">
                      <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        OBS স্ট্রিমিং কনফিগারেশন
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-muted-foreground">RTMP সার্ভার ইউআরএল</span>
                          <div className="flex gap-2">
                            <Input
                              readOnly
                              value="rtmp://a.rtmp.youtube.com/live2"
                              className="bg-muted/40 text-xs h-9"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 h-9"
                              onClick={() => {
                                navigator.clipboard.writeText("rtmp://a.rtmp.youtube.com/live2");
                                setCopiedText('rtmp');
                                toast.success('সার্ভার ইউআরএল কপি করা হয়েছে!');
                                setTimeout(() => setCopiedText(null), 2000);
                              }}
                            >
                              {copiedText === 'rtmp' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-muted-foreground">স্ট্রীম কী (Stream Key)</span>
                          <div className="flex gap-2">
                            <Input
                              type={showStreamKey ? "text" : "password"}
                              readOnly
                              value={`shub-live-key-${selectedClass.youtubeId}`}
                              className="bg-muted/40 text-xs h-9 font-mono"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 h-9"
                              onClick={() => setShowStreamKey(!showStreamKey)}
                            >
                              {showStreamKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 h-9"
                              onClick={() => {
                                navigator.clipboard.writeText(`shub-live-key-${selectedClass.youtubeId}`);
                                setCopiedText('key');
                                toast.success('স্ট্রীম কী কপি করা হয়েছে!');
                                setTimeout(() => setCopiedText(null), 2000);
                              }}
                            >
                              {copiedText === 'key' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTeacherTab === 'chat' && (
                  <div className="flex flex-col h-full border border-border/60 rounded-xl bg-card p-3 overflow-hidden">
                    <div className="flex items-center justify-between border-b pb-2 shrink-0">
                      <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        লাইভ চ্যাট মনিটর
                      </h5>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{toBengaliNum(activeViewerCount)} জন শিক্ষার্থী দেখছে</span>
                      </div>
                    </div>

                    {/* Chat message logs */}
                    <ScrollArea className="flex-1 my-2 pr-2">
                      <div className="space-y-3 text-xs">
                        {teacherChatLog.map((chat) => (
                          <div
                            key={chat.id}
                            className={`p-2.5 rounded-lg border max-w-[85%] ${
                              chat.role === 'teacher'
                                ? 'bg-emerald-500/5 border-emerald-500/20 ml-auto'
                                : 'bg-muted/40 border-border/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`font-semibold ${chat.role === 'teacher' ? 'text-emerald-600' : 'text-primary'}`}>
                                {chat.sender} {chat.role === 'teacher' && '(শিক্ষক)'}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                            </div>
                            <p className="text-muted-foreground leading-normal">{chat.message}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Chat input */}
                    <div className="flex gap-2 border-t pt-2 shrink-0">
                      <Input
                        placeholder="শিক্ষার্থীদের উত্তর দিন..."
                        value={teacherChatInput}
                        onChange={(e) => setTeacherChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && teacherChatInput.trim()) {
                            const now = new Date();
                            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                            setTeacherChatLog(prev => [
                              ...prev,
                              {
                                id: String(Date.now()),
                                sender: selectedClass.hostName || user?.name || 'শিক্ষক',
                                role: 'teacher',
                                message: teacherChatInput,
                                time: toBengaliNum(timeStr as any)
                              }
                            ]);
                            setTeacherChatInput('');
                          }
                        }}
                        className="text-xs h-9"
                      />
                      <Button
                        size="sm"
                        className="h-9 px-3 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => {
                          if (teacherChatInput.trim()) {
                            const now = new Date();
                            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                            setTeacherChatLog(prev => [
                              ...prev,
                              {
                                id: String(Date.now()),
                                sender: selectedClass.hostName || user?.name || 'শিক্ষক',
                                role: 'teacher',
                                message: teacherChatInput,
                                time: toBengaliNum(timeStr as any)
                              }
                            ]);
                            setTeacherChatInput('');
                          }
                        }}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeTeacherTab === 'materials' && (
                  <div className="space-y-4 py-1 h-full overflow-y-auto pr-1">
                    {/* Materials Uploader */}
                    <div className="bg-card p-4 rounded-xl border border-border/60 space-y-3 shadow-sm">
                      <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
                        <BookOpen className="w-4 h-4 text-emerald-500" />
                        লেকচার শিট ও মেটেরিয়াল যুক্ত করুন
                      </h5>
                      
                      {teacherClassMaterials.length > 0 ? (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {teacherClassMaterials.map((mat) => (
                            <div key={mat.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-xs">
                              <span className="font-medium text-muted-foreground truncate max-w-[200px]">{mat.title}</span>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setTeacherClassMaterials(prev => prev.filter(m => m.id !== mat.id));
                                    toast.success('মেটেরিয়াল সরানো হয়েছে!');
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">কোনো মেটেরিয়াল যুক্ত করা হয়নি</p>
                      )}

                      <div className="space-y-2 pt-2 border-t">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="শিরোনাম (যেমন: লেকচার শিট)"
                            value={materialFormTitle}
                            onChange={(e) => setMaterialFormTitle(e.target.value)}
                            className="h-8 text-xs font-medium"
                          />
                          <Input
                            placeholder="ইউআরএল বা পিডিএফ লিংক"
                            value={materialFormUrl}
                            onChange={(e) => setMaterialFormUrl(e.target.value)}
                            className="h-8 text-xs font-medium"
                          />
                        </div>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            if (!materialFormTitle || !materialFormUrl) {
                              toast.error('শিরোনাম এবং ইউআরএল উভয়ই প্রয়োজন');
                              return;
                            }
                            setTeacherClassMaterials(prev => [
                              ...prev,
                              { id: String(Date.now()), title: materialFormTitle, url: materialFormUrl }
                            ]);
                            setMaterialFormTitle('');
                            setMaterialFormUrl('');
                            toast.success('মেটেরিয়াল সফলভাবে যুক্ত করা হয়েছে!');
                          }}
                          size="sm"
                          className="w-full h-8 bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          স্টাডি মেটেরিয়াল যুক্ত করুন
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons in Footer */}
              <div className="flex items-center justify-between border-t pt-3 mt-auto shrink-0">
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 h-9"
                  onClick={async () => {
                    await handleUpdateStatus(selectedClass.id, 'completed');
                    setJoinDialogOpen(false);
                    toast.success('লাইভ ক্লাস সফলভাবে সমাপ্ত হয়েছে!');
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  লাইভ শেষ করুন (Finish Class)
                </Button>
                <Button variant="outline" size="sm" className="h-9" onClick={() => setJoinDialogOpen(false)}>
                  বন্ধ করুন
                </Button>
              </div>
            </div>
          ) : (
            // Student View (Existing verification and play window)
            selectedClass && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    ক্লাসে যুক্ত হন
                  </DialogTitle>
                  <DialogDescription>লাইভ ক্লাসে যোগ দেওয়ার আগে নিচের তথ্য দেখুন</DialogDescription>
                </DialogHeader>

                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getSubjectColor(selectedClass.subject.nameBn).bg}`}>
                        <Monitor className={`w-6 h-6 ${getSubjectColor(selectedClass.subject.nameBn).text}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{selectedClass.titleBn}</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {selectedClass.hostName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDateTimeBn(selectedClass.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" />
                            YouTube
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="w-3.5 h-3.5" />
                            {toBengaliNum(selectedClass.duration)} মিনিট
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {joinPhase === 'check' && (
                  <>
                    <div>
                      <h5 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                        <Shield className="w-4 h-4 text-amber-500" />
                        নিয়মাবলী
                      </h5>
                      <div className="space-y-1.5 text-xs text-muted-foreground bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                        <p className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                          ক্লাস চলাকালীন মাইক মিউট রাখুন
                        </p>
                        <p className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                          সময়মতো ক্লাসে যুক্ত হন
                        </p>
                        <p className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                          চ্যাটে শুধু পড়াশোনা সম্পর্কিত প্রশ্ন করুন
                        </p>
                        <p className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                          অন্য শিক্ষার্থীদের প্রতি সম্মান দেখান
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h5 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        যোগ্যতা চেকলিস্ট
                      </h5>
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={checklist.internet}
                            onCheckedChange={(checked) => setChecklist(p => ({ ...p, internet: !!checked }))}
                          />
                          <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
                          আমার স্থিতিশীল ইন্টারনেট সংযোগ আছে
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={checklist.onTime}
                            onCheckedChange={(checked) => setChecklist(p => ({ ...p, onTime: !!checked }))}
                          />
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          আমি সময়মতো উপস্থিত হব
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={checklist.quiet}
                            onCheckedChange={(checked) => setChecklist(p => ({ ...p, quiet: !!checked }))}
                          />
                          <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                          আমি শান্ত পরিবেশে থাকব
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={checklist.materials}
                            onCheckedChange={(checked) => setChecklist(p => ({ ...p, materials: !!checked }))}
                          />
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                          আমার প্রয়োজনীয় বই-খাতা প্রস্তুত আছে
                        </label>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-semibold text-white"
                      disabled={!allChecked}
                      onClick={handleStartCountdown}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      যুক্ত হন
                    </Button>
                  </>
                )}

                {joinPhase === 'countdown' && (
                  <div className="py-6">
                    <JoinCountdown onReady={handleJoined} />
                  </div>
                )}

                {joinPhase === 'joined' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h4 className="text-base font-semibold text-emerald-600">ক্লাসে যুক্ত হয়েছেন!</h4>
                    {selectedClass.youtubeId && (
                      <div className="mt-3 aspect-video w-full rounded-lg overflow-hidden bg-black shadow-lg">
                        <iframe
                          src={`https://www.youtube.com/embed/${selectedClass.youtubeId}?autoplay=1`}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    )}

                    {/* Class Materials for students */}
                    <div className="mt-4 bg-muted/40 p-4 rounded-xl border border-border/50 text-left">
                      <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        লেকচার শিট ও মেটেরিয়াল
                      </h5>
                      {teacherClassMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {teacherClassMaterials.map((mat) => (
                            <a
                              key={mat.id}
                              href={mat.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-card border hover:border-emerald-500/40 transition-colors text-xs"
                            >
                              <span className="font-medium text-muted-foreground truncate max-w-[120px]">{mat.title}</span>
                              <span className="text-[10px] text-emerald-600 font-semibold shrink-0">ডাউনলোড</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">শিক্ষক এখনো কোনো মেটেরিয়াল আপলোড করেননি।</p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={() => setJoinDialogOpen(false)}
                    >
                      বন্ধ করুন
                    </Button>
                  </motion.div>
                )}
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD Dialog for Admin/Teacher */}
      {isAdminOrTeacher && (
        <>
          <Dialog open={crudDialogOpen} onOpenChange={setCrudDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {crudMode === 'create' ? 'নতুন লাইভ ক্লাস শিডিউল করুন' : 'লাইভ ক্লাস সম্পাদনা করুন'}
                </DialogTitle>
                <DialogDescription>
                  লাইভ ক্লাসের জন্য সমস্ত বিবরণ নিচে পূরণ করুন।
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="live-title-en">শিরোনাম (English)</Label>
                  <Input
                    id="live-title-en"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Higher Math Chapter 1: Set"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="live-title-bn">শিরোনাম (বাংলা)</Label>
                  <Input
                    id="live-title-bn"
                    value={formData.titleBn}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleBn: e.target.value }))}
                    placeholder="যেমন: উচ্চতর গণিত অধ্যায় ১: সেট"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="live-subject">বিষয়</Label>
                    <select
                      id="live-subject"
                      value={formData.subjectId}
                      onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="">বিষয় নির্বাচন করুন</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.nameBn}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="live-status">স্ট্যাটাস</Label>
                    <select
                      id="live-status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="upcoming">আসন্ন (Upcoming)</option>
                      <option value="live">লাইভ (Live)</option>
                      <option value="completed">সম্পন্ন (Completed)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="live-youtube-id">YouTube Video/Stream ID</Label>
                  <Input
                    id="live-youtube-id"
                    value={formData.youtubeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeId: e.target.value }))}
                    placeholder="e.g. dQw4w9WgXcQ"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="live-scheduled-at">শিডিউল সময়</Label>
                  <Input
                    id="live-scheduled-at"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="live-duration">সময়কাল (মিনিট)</Label>
                    <Input
                      id="live-duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g. 60"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="live-hostname">শিক্ষক / হোস্ট</Label>
                    <Input
                      id="live-hostname"
                      value={formData.hostName}
                      onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
                      placeholder="যেমন: হাসান স্যার"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="live-description">সংক্ষিপ্ত বর্ণনা</Label>
                  <Input
                    id="live-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="যেমন: এই ক্লাসে আমরা সেটের বেসিক বিষয় নিয়ে আলোচনা করব।"
                  />
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
                  লাইভ ক্লাস মুছে ফেলতে চান?
                </DialogTitle>
                <DialogDescription>
                  আপনি কি নিশ্চিত যে আপনি এই লাইভ ক্লাসটি মুছে ফেলতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না।
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
                  onClick={handleDeleteClass}
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
      {/* Full Schedule Dialog */}
      <Dialog open={showFullScheduleOpen} onOpenChange={setShowFullScheduleOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              সম্পূর্ণ সাপ্তাহিক ক্লাস রুটিন (Full Weekly Schedule)
            </DialogTitle>
            <DialogDescription>
              সপ্তাহের প্রতিটি দিনের আসন্ন এবং লাইভ ক্লাসের সম্পূর্ণ রুটিন দেখুন।
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 my-4 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {weeklySchedule.map((daySchedule) => (
                <div
                  key={daySchedule.dayFull}
                  className="bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm flex flex-col min-h-[160px]"
                >
                  <div className="bg-muted/50 px-4 py-2.5 border-b flex items-center justify-between">
                    <span className="font-semibold text-sm text-primary">{daySchedule.dayFull}</span>
                    <Badge variant="outline" className="text-[10px] bg-background">
                      {toBengaliNum(daySchedule.slots.length)}টি ক্লাস
                    </Badge>
                  </div>
                  
                  <div className="p-3 flex-1 flex flex-col justify-start gap-2">
                    {daySchedule.slots.length > 0 ? (
                      daySchedule.slots.map((slot, i) => (
                        <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg ${slot.color.light} border ${slot.color.border} text-xs`}>
                          <div className={`w-7 h-7 rounded-md ${slot.color.bg} flex items-center justify-center shrink-0`}>
                            <Monitor className={`w-3.5 h-3.5 ${slot.color.text}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{slot.subject}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{slot.time} • {slot.teacher}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-6 text-muted-foreground text-[11px]">
                        <Calendar className="w-6 h-6 mb-1 opacity-20" />
                        <span>কোনো ক্লাস নেই</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4 shrink-0">
            <Button variant="outline" onClick={() => setShowFullScheduleOpen(false)}>
              বন্ধ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View All Recordings Dialog */}
      <Dialog open={showAllRecordingsOpen} onOpenChange={setShowAllRecordingsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-500" />
              সম্পূর্ণ ক্লাস রেকর্ডিং আর্কাইভ (Recorded Classes Archive)
            </DialogTitle>
            <DialogDescription>
              পূর্বে সম্পন্ন হওয়া সমস্ত ক্লাসের রেকর্ডিং একসাথে দেখতে ও প্লে করতে পারেন।
            </DialogDescription>
          </DialogHeader>

          {/* Search & Subject Filter controls */}
          <div className="flex flex-col sm:flex-row gap-3 my-4 shrink-0">
            <div className="flex-1">
              <Input
                placeholder="শিরোনাম দিয়ে সার্চ করুন..."
                value={recordingSearchQuery}
                onChange={(e) => setRecordingSearchQuery(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={recordingSubjectFilter}
                onChange={(e) => setRecordingSubjectFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <option value="all">সব বিষয়</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.nameBn}</option>
                ))}
              </select>
            </div>
          </div>

          <ScrollArea className="flex-1 pr-1">
            {(() => {
              const filteredRecordings = completedClasses.filter(c => {
                const matchSearch = c.titleBn.toLowerCase().includes(recordingSearchQuery.toLowerCase()) || 
                                    c.title.toLowerCase().includes(recordingSearchQuery.toLowerCase());
                const matchSubject = recordingSubjectFilter === 'all' || c.subjectId === recordingSubjectFilter;
                return matchSearch && matchSubject;
              });

              if (filteredRecordings.length === 0) {
                return (
                  <div className="text-center py-12 border rounded-xl bg-muted/20">
                    <Play className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">কোনো রেকর্ডিং খুঁজে পাওয়া যায়নি।</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                  {filteredRecordings.map((session) => {
                    const sessionColor = getSubjectColor(session.subject.nameBn);
                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          setEmbedClass(session);
                          setYoutubeEmbedOpen(true);
                        }}
                        className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className={`shrink-0 w-11 h-11 rounded-lg ${sessionColor.bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative`}>
                          <Play className={`w-4.5 h-4.5 ${sessionColor.text}`} />
                          <Badge className="absolute -bottom-1.5 -right-1.5 text-[8px] px-1 py-0 bg-background border text-muted-foreground">
                            {toBengaliNum(session.duration)} মি.
                          </Badge>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{session.titleBn}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatDateBn(session.scheduledAt)}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge className={`text-[8px] px-1 py-0 ${sessionColor.bg} ${sessionColor.text} border-0`}>
                              {session.subject.nameBn}
                            </Badge>
                            <span className="text-[9px] text-muted-foreground">{session.hostName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </ScrollArea>

          <DialogFooter className="border-t pt-4 mt-4 shrink-0">
            <Button variant="outline" onClick={() => setShowAllRecordingsOpen(false)}>
              বন্ধ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
