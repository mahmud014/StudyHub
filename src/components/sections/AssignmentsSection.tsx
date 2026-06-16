"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Monitor,
  Globe,
  Languages,
  ChevronDown,
  Sparkles,
  FileUp,
  Info,
  ShieldCheck,
  Check,
  X,
  GraduationCap,
  TrendingUp,
  Award,
  BarChart3,
  Timer,
  ArrowRight,
  Link2,
  Paperclip,
  RefreshCw,
  Plus,
  Eye,
  Users,
  Trash2,
  Edit3,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useStudyHub } from "@/components/layout/StudyHubProvider";
import { toast } from "sonner";

// ============================================================
// HELPERS
// ============================================================

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

function getSubjectIcon(iconName: string | null | undefined) {
  const iconMap: Record<string, React.ElementType> = {
    BookOpen,
    Languages,
    Calculator,
    Atom,
    FlaskConical,
    Leaf,
    Monitor,
    Globe,
  };
  return iconMap?.[iconName || ""] || FileText;
}

function getSubjectGradient(color: string | null | undefined): string {
  if (!color) return "from-emerald-500 to-emerald-600";
  const colorMap: Record<string, string> = {
    "#E53935": "from-red-500 to-rose-600",
    "#1E88E5": "from-sky-500 to-teal-600",
    "#43A047": "from-emerald-500 to-green-600",
    "#FB8C00": "from-amber-500 to-orange-600",
    "#8E24AA": "from-purple-500 to-fuchsia-600",
    "#00897B": "from-teal-500 to-emerald-600",
    "#546E7A": "from-slate-500 to-gray-600",
    "#D81B60": "from-pink-500 to-rose-600",
  };
  return colorMap[color] || "from-emerald-500 to-emerald-600";
}

function getSubjectAccentBg(color: string | null | undefined): string {
  if (!color) return "bg-emerald-500";
  const colorMap: Record<string, string> = {
    "#E53935": "bg-red-500",
    "#1E88E5": "bg-sky-500",
    "#43A047": "bg-emerald-500",
    "#FB8C00": "bg-amber-500",
    "#8E24AA": "bg-purple-500",
    "#00897B": "bg-teal-500",
    "#546E7A": "bg-slate-500",
    "#D81B60": "bg-pink-500",
  };
  return colorMap[color] || "bg-emerald-500";
}

function getSubjectTextColor(color: string | null | undefined): string {
  if (!color) return "text-emerald-600 dark:text-emerald-400";
  const colorMap: Record<string, string> = {
    "#E53935": "text-red-600 dark:text-red-400",
    "#1E88E5": "text-sky-600 dark:text-sky-400",
    "#43A047": "text-emerald-600 dark:text-emerald-400",
    "#FB8C00": "text-amber-600 dark:text-amber-400",
    "#8E24AA": "text-purple-600 dark:text-purple-400",
    "#00897B": "text-teal-600 dark:text-teal-400",
    "#546E7A": "text-slate-600 dark:text-slate-400",
    "#D81B60": "text-pink-600 dark:text-pink-400",
  };
  return colorMap[color] || "text-emerald-600 dark:text-emerald-400";
}

function getSubjectLightBg(color: string | null | undefined): string {
  if (!color) return "bg-emerald-500/10";
  const colorMap: Record<string, string> = {
    "#E53935": "bg-red-500/10",
    "#1E88E5": "bg-sky-500/10",
    "#43A047": "bg-emerald-500/10",
    "#FB8C00": "bg-amber-500/10",
    "#8E24AA": "bg-purple-500/10",
    "#00897B": "bg-teal-500/10",
    "#546E7A": "bg-slate-500/10",
    "#D81B60": "bg-pink-500/10",
  };
  return colorMap[color] || "bg-emerald-500/10";
}

function getPriorityInfo(deadline: string | null): {
  label: string;
  color: string;
  bg: string;
  dotColor: string;
} {
  if (!deadline)
    return {
      label: "সাধারণ",
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-500/10 border-slate-500/20",
      dotColor: "bg-slate-400",
    };
  const hoursLeft =
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft < 0)
    return {
      label: "সময় শেষ",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      dotColor: "bg-red-500",
    };
  if (hoursLeft < 48)
    return {
      label: "উচ্চ",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      dotColor: "bg-red-500 animate-pulse",
    };
  if (hoursLeft < 120)
    return {
      label: "মাঝারি",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      dotColor: "bg-amber-500",
    };
  return {
    label: "সাধারণ",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  };
}

function getCountdown(deadline: string | null): string | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0)
    return `বাকি ${toBengaliNum(days)} দিন ${toBengaliNum(hours)} ঘন্টা`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0)
    return `বাকি ${toBengaliNum(hours)} ঘন্টা ${toBengaliNum(minutes)} মিনিট`;
  return `বাকি ${toBengaliNum(minutes)} মিনিট`;
}

// Status indicator helper
function getStatusConfig(
  status: "pending" | "submitted" | "graded" | "overdue",
) {
  switch (status) {
    case "pending":
      return {
        label: "অপেক্ষমাণ",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
        icon: Clock,
        dotClass: "bg-amber-500",
      };
    case "submitted":
      return {
        label: "জমা দেওয়া",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        icon: CheckCircle,
        dotClass: "bg-emerald-500",
      };
    case "graded":
      return {
        label: "মূল্যায়ন সম্পন্ন",
        color: "text-teal-600 dark:text-teal-400",
        bg: "bg-teal-500/10",
        icon: Award,
        dotClass: "bg-teal-500",
      };
    case "overdue":
      return {
        label: "সময় শেষ",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-500/10",
        icon: AlertTriangle,
        dotClass: "bg-red-500",
      };
  }
}

// ============================================================
// INTERFACES
// ============================================================

interface Subject {
  id: string;
  name: string;
  nameBn: string;
  icon?: string | null;
  color?: string | null;
}

interface Submission {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  marks: number | null;
  feedback: string | null;
  status: string;
  submittedAt: string;
  reviewedAt?: string | null;
}

interface Assignment {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  deadline: string | null;
  maxMarks: number;
  subjectId: string;
  chapterId?: string | null;
  createdAt?: string;
  subject: Subject;
  submissions?: Submission[];
  _count?: { submissions: number };
}

type FilterTab = "all" | "ongoing" | "submitted" | "expired";

// ============================================================
// CIRCULAR PROGRESS RING COMPONENT
// ============================================================

function CircularProgressRing({
  value,
  max,
  size = 56,
  strokeWidth = 4,
  color,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;
  const grade =
    percentage >= 90
      ? "A+"
      : percentage >= 80
        ? "A"
        : percentage >= 70
          ? "B"
          : percentage >= 60
            ? "C"
            : "D";
  const strokeColor =
    color ||
    (percentage >= 80
      ? "oklch(0.508 0.165 160)"
      : percentage >= 60
        ? "oklch(0.769 0.188 70.08)"
        : "oklch(0.577 0.245 27.325)");

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold">{grade}</span>
        <span className="text-[9px] text-muted-foreground">
          {toBengaliNum(value)}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// ANIMATED CHECKMARK COMPONENT
// ============================================================

function AnimatedCheckmark({ size = 20 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="text-emerald-500"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

// ============================================================
// SUCCESS ANIMATION COMPONENT
// ============================================================

function SuccessAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4"
      >
        <AnimatedCheckmark size={32} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-bold text-emerald-600 dark:text-emerald-400"
      >
        সফলভাবে জমা হয়েছে!
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground mt-1"
      >
        শিক্ষক শীঘ্রই আপনার কাজ মূল্যায়ন করবেন
      </motion.p>
    </div>
  );
}

// ============================================================
// STAT CARD COMPONENT
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  subText,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subText?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-card border shadow-sm"
    >
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-base sm:text-lg font-bold leading-tight">{value}</p>
        {subText && (
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">
            {subText}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AssignmentsSection() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [termsChecked, setTermsChecked] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useStudyHub();

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAssignment, setDetailAssignment] = useState<Assignment | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // Create assignment dialog state (admin/teacher)
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    titleBn: "",
    description: "",
    subjectId: "",
    deadline: "",
    maxMarks: 100,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  // Edit/Delete dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updatingAssignment, setUpdatingAssignment] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    titleBn: "",
    description: "",
    subjectId: "",
    deadline: "",
    maxMarks: 100,
  });

  // Grading states
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(
    null,
  );
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    marks: "",
    feedback: "",
  });

  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";

  // Fetch assignments
  const fetchAssignments = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const url = user
          ? `/api/assignments?userId=${user.id}`
          : "/api/assignments";
        const res = await fetch(url);
        if (!res.ok) throw new Error("সার্ভার ত্রুটি");
        const data = await res.json();
        if (data.success) {
          setAssignments(data.data);
        } else {
          throw new Error(data.error || "অ্যাসাইনমেন্ট লোড করতে সমস্যা হয়েছে");
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "অ্যাসাইনমেন্ট লোড করতে সমস্যা হয়েছে";
        setError(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  // Fetch all subjects for create form
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (data.success) {
        setAllSubjects(data.data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (isAdminOrTeacher) {
      fetchSubjects();
    }
  }, [isAdminOrTeacher, fetchSubjects]);

  // Fetch single assignment detail
  const fetchAssignmentDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/assignments/${id}`);
      const data = await res.json();
      if (data.success) {
        setDetailAssignment(data.data);
      }
    } catch {
      toast.error("অ্যাসাইনমেন্ট বিস্তারিত লোড করতে সমস্যা হয়েছে");
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle card click - open detail view
  const handleCardClick = (assignment: Assignment) => {
    setDetailAssignment(assignment);
    setDetailOpen(true);
    fetchAssignmentDetail(assignment.id);
  };

  const handleOpenEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    let formattedDeadline = "";
    if (assignment.deadline) {
      const d = new Date(assignment.deadline);
      formattedDeadline = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    setEditForm({
      title: assignment.title,
      titleBn: assignment.titleBn || "",
      description: assignment.description,
      subjectId: assignment.subjectId || "",
      deadline: formattedDeadline,
      maxMarks: assignment.maxMarks || 100,
    });
    setEditOpen(true);
  };

  const handleOpenDeleteAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDeleteOpen(true);
  };

  const handleUpdateAssignment = async () => {
    if (!selectedAssignment) return;
    if (
      !editForm.title ||
      !editForm.titleBn ||
      !editForm.description ||
      !editForm.subjectId
    ) {
      toast.error("সব ফিল্ড পূরণ করুন");
      return;
    }
    setUpdatingAssignment(true);
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("অ্যাসাইনমেন্ট সফলভাবে আপডেট করা হয়েছে");
        setEditOpen(false);
        fetchAssignments();
      } else {
        toast.error(data.error || "অ্যাসাইনমেন্ট আপডেট করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সংযোগে সমস্যা হয়েছে");
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    setUpdatingAssignment(true);
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("অ্যাসাইনমেন্ট মুছে ফেলা হয়েছে");
        setDeleteOpen(false);
        fetchAssignments();
      } else {
        toast.error(data.error || "অ্যাসাইনমেন্ট মুছতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সংযোগে সমস্যা হয়েছে");
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    const marksNum = parseInt(gradeForm.marks);
    if (isNaN(marksNum)) {
      toast.error("সঠিক নম্বর দিন");
      return;
    }
    if (detailAssignment && marksNum > detailAssignment.maxMarks) {
      toast.error(`নম্বর সর্বোচ্চ ${detailAssignment.maxMarks} হতে পারে`);
      return;
    }
    setGradingLoading(true);
    try {
      const res = await fetch(`/api/assignments/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marks: marksNum,
          feedback: gradeForm.feedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("মূল্যায়ন সম্পন্ন হয়েছে");
        setGradingSubmissionId(null);
        if (detailAssignment) {
          fetchAssignmentDetail(detailAssignment.id);
        }
        fetchAssignments();
      } else {
        toast.error(data.error || "মূল্যায়ন করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সংযোগে সমস্যা হয়েছে");
    } finally {
      setGradingLoading(false);
    }
  };

  // Create assignment handler
  const handleCreateAssignment = async () => {
    if (
      !createForm.title ||
      !createForm.titleBn ||
      !createForm.description ||
      !createForm.subjectId
    ) {
      toast.error("সব আবশ্যক ফিল্ড পূরণ করুন");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("অ্যাসাইনমেন্ট সফলভাবে তৈরি হয়েছে!");
        setCreateOpen(false);
        setCreateForm({
          title: "",
          titleBn: "",
          description: "",
          subjectId: "",
          deadline: "",
          maxMarks: 100,
        });
        await fetchAssignments();
      } else {
        toast.error(data.error || "অ্যাসাইনমেন্ট তৈরি করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সংযোগে সমস্যা হয়েছে");
    } finally {
      setCreateLoading(false);
    }
  };

  // Compute filtered assignments
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter((a) => a.subjectId === subjectFilter);
    }

    // Status filter
    if (activeFilter === "ongoing") {
      filtered = filtered.filter((a) => {
        const deadlinePassed = a.deadline
          ? new Date(a.deadline) < new Date()
          : false;
        const mySub = user
          ? a.submissions?.find((s) => s.userId === user.id)
          : null;
        return !deadlinePassed && !mySub;
      });
    } else if (activeFilter === "submitted") {
      filtered = filtered.filter((a) => {
        const mySub = user
          ? a.submissions?.find((s) => s.userId === user.id)
          : null;
        return !!mySub;
      });
    } else if (activeFilter === "expired") {
      filtered = filtered.filter((a) => {
        const deadlinePassed = a.deadline
          ? new Date(a.deadline) < new Date()
          : false;
        const mySub = user
          ? a.submissions?.find((s) => s.userId === user.id)
          : null;
        return deadlinePassed && !mySub;
      });
    }

    return filtered;
  }, [assignments, activeFilter, subjectFilter, user]);

  // Compute stats
  const stats = useMemo(() => {
    const total = assignments.length;
    let submitted = 0;
    let pending = 0;
    let overdue = 0;
    let totalMarks = 0;
    let gradedCount = 0;

    assignments.forEach((a) => {
      const deadlinePassed = a.deadline
        ? new Date(a.deadline) < new Date()
        : false;
      const mySub = user
        ? a.submissions?.find((s) => s.userId === user.id)
        : null;
      if (mySub) {
        submitted++;
        if (mySub.marks !== null) {
          totalMarks += mySub.marks;
          gradedCount++;
        }
      } else if (deadlinePassed) {
        overdue++;
      } else {
        pending++;
      }
    });

    const avgMarks = gradedCount > 0 ? Math.round(totalMarks / gradedCount) : 0;
    const completionRate =
      total > 0 ? Math.round((submitted / total) * 100) : 0;

    return {
      total,
      submitted,
      pending,
      overdue,
      avgMarks,
      gradedCount,
      completionRate,
    };
  }, [assignments, user]);

  // Unique subjects for dropdown
  const subjectOptions = useMemo(() => {
    const map = new Map<string, Subject>();
    assignments.forEach((a) => {
      if (!map.has(a.subject.id)) {
        map.set(a.subject.id, a.subject);
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  // Submit handler
  const handleSubmit = async () => {
    if (!user || !selectedAssignment) return;
    if (!fileUrl.trim()) {
      toast.error("ফাইলের লিংক দিন");
      return;
    }
    if (!termsChecked) {
      toast.error("শর্তাবলী মেনে নিন");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          userId: user.id,
          fileUrl,
          fileName: fileName || "assignment.pdf",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        toast.success("অ্যাসাইনমেন্ট সফলভাবে জমা হয়েছে!");
        // Refresh after delay for animation
        setTimeout(async () => {
          setSubmitOpen(false);
          setFileUrl("");
          setFileName("");
          setComment("");
          setTermsChecked(false);
          setSubmitSuccess(false);
          await fetchAssignments();
        }, 2000);
      } else {
        toast.error(data.error || "জমা দিতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সংযোগে সমস্যা হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const text =
      e.dataTransfer.getData("text/plain") ||
      e.dataTransfer.getData("text/uri-list");
    if (text) {
      setFileUrl(text.trim());
      if (!fileName) {
        const parts = text.trim().split("/");
        setFileName(parts[parts.length - 1] || "dropped-file");
      }
    }
  };

  const isDeadlinePassed = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // ============================================================
  // RENDER: Loading Skeletons
  // ============================================================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border"
            >
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>
          ))}
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <Skeleton className="h-2 w-full" />
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-3" />
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Error State
  // ============================================================
  if (error && assignments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary" />
            অ্যাসাইনমেন্ট
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full mt-2" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 sm:py-20"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center"
            >
              <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 text-red-500/60" />
            </motion.div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2 text-red-600 dark:text-red-400">
            ডেটা লোড করতে সমস্যা হয়েছে
          </h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm sm:text-base">
            {error}
          </p>
          <Button
            className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 min-h-[44px]"
            onClick={() => fetchAssignments()}
          >
            <RefreshCw className="w-4 h-4" />
            আবার চেষ্টা করুন
          </Button>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Empty State
  // ============================================================
  if (assignments.length === 0 && !error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <ClipboardList className="w-7 h-7 text-primary" />
                অ্যাসাইনমেন্ট
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full mt-2" />
            </div>
            {isAdminOrTeacher && (
              <Button
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 min-h-[44px]"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">নতুন অ্যাসাইনমেন্ট</span>
                <span className="sm:hidden">নতুন</span>
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 sm:py-20"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center"
            >
              <ClipboardList className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-500/60" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500/20"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">
            কোনো অ্যাসাইনমেন্ট নেই
          </h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm sm:text-base">
            এখনো কোনো অ্যাসাইনমেন্ট যুক্ত করা হয়নি।
            {isAdminOrTeacher
              ? " আপনি নতুন অ্যাসাইনমেন্ট তৈরি করতে পারেন।"
              : " শিক্ষক যখন অ্যাসাইনমেন্ট দেবেন, আপনি এখানে দেখতে পাবেন।"}
          </p>
          {isAdminOrTeacher ? (
            <Button
              className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 min-h-[44px]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4" />
              প্রথম অ্যাসাইনমেন্ট তৈরি করুন
            </Button>
          ) : (
            <Button
              className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 min-h-[44px]"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Sparkles className="w-4 h-4" />
              প্রথম অ্যাসাইনমেন্ট দেখুন
            </Button>
          )}
        </motion.div>

        {/* Create Assignment Dialog (for empty state) */}
        {isAdminOrTeacher && (
          <CreateAssignmentDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            form={createForm}
            setForm={setCreateForm}
            onSubmit={handleCreateAssignment}
            loading={createLoading}
            subjects={allSubjects}
          />
        )}
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
      {/* ====== HEADER ====== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <ClipboardList className="w-7 h-7 text-primary" />
                অ্যাসাইনমেন্ট
              </h2>
              <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-0 px-3 py-0.5 text-xs font-bold">
                {toBengaliNum(stats.total)}টি
              </Badge>
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full mt-2" />
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              বাড়ির কাজ ও অ্যাসাইনমেন্ট জমা দিন এবং শিক্ষকের ফিডব্যাক পান
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => fetchAssignments(true)}
              disabled={refreshing}
              title="রিফ্রেশ"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>

            {/* Create button for admin/teacher */}
            {isAdminOrTeacher && (
              <Button
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white min-h-[36px] h-9 text-sm"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">নতুন অ্যাসাইনমেন্ট</span>
                <span className="sm:hidden">নতুন</span>
              </Button>
            )}

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[160px] sm:w-[180px] h-10 sm:h-9 text-sm">
                <SelectValue placeholder="বিষয় নির্বাচন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব বিষয়</SelectItem>
                {subjectOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nameBn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* ====== STATS SUMMARY BAR ====== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8"
      >
        <StatCard
          icon={ClipboardList}
          label="মোট অ্যাসাইনমেন্ট"
          value={toBengaliNum(stats.total)}
          color="bg-gradient-to-r from-emerald-600 to-emerald-500"
        />
        <StatCard
          icon={CheckCircle}
          label="জমা দেওয়া"
          value={toBengaliNum(stats.submitted)}
          subText={
            stats.gradedCount > 0
              ? `${toBengaliNum(stats.gradedCount)}টি মূল্যায়ন`
              : undefined
          }
          color="bg-gradient-to-r from-teal-600 to-teal-500"
        />
        <StatCard
          icon={Clock}
          label="অপেক্ষমাণ"
          value={toBengaliNum(stats.pending)}
          color="bg-gradient-to-r from-amber-600 to-amber-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="সময় শেষ"
          value={toBengaliNum(stats.overdue)}
          color="bg-gradient-to-r from-red-600 to-red-500"
        />
        <StatCard
          icon={TrendingUp}
          label="সম্পন্ন হার"
          value={`${toBengaliNum(stats.completionRate)}%`}
          subText={
            stats.gradedCount > 0
              ? `গড়: ${toBengaliNum(stats.avgMarks)}`
              : undefined
          }
          color="bg-gradient-to-r from-emerald-700 to-teal-500"
        />
      </motion.div>

      {/* ====== FILTER TABS ====== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <Tabs
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as FilterTab)}
        >
          <TabsList className="bg-muted/50 h-10 sm:h-9">
            <TabsTrigger
              value="all"
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              সব{" "}
              <span className="ml-1 opacity-60">
                ({toBengaliNum(assignments.length)})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="ongoing"
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              চলমান
            </TabsTrigger>
            <TabsTrigger
              value="submitted"
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              জমা দেওয়া
            </TabsTrigger>
            <TabsTrigger
              value="expired"
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              সময় শেষ
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* ====== ERROR BANNER (non-fatal) ====== */}
      {error && assignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  কিছু ডেটা লোড করতে সমস্যা হয়েছে। পুরনো ডেটা দেখাচ্ছে।
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 gap-1 min-h-[36px]"
                onClick={() => fetchAssignments(true)}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
                রিফ্রেশ
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ====== LOGIN WARNING ====== */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <span className="text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                অ্যাসাইনমেন্ট জমা দিতে প্রথমে লগইন করুন
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ====== EMPTY FILTER STATE ====== */}
      {filteredAssignments.length === 0 && assignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 sm:py-16"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-center text-sm sm:text-base">
            এই ফিল্টারে কোনো অ্যাসাইনমেন্ট নেই
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-emerald-600 min-h-[44px]"
            onClick={() => {
              setActiveFilter("all");
              setSubjectFilter("all");
            }}
          >
            সব দেখুন
          </Button>
        </motion.div>
      )}

      {/* ====== ASSIGNMENT CARDS GRID ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAssignments.map((assignment, index) => {
            const deadlinePassed = isDeadlinePassed(assignment.deadline);
            const mySubmission = user
              ? assignment.submissions?.find((s) => s.userId === user.id)
              : null;
            const SubjectIcon = getSubjectIcon(assignment.subject?.icon);
            const gradientClass = getSubjectGradient(assignment.subject?.color);
            const accentBg = getSubjectAccentBg(assignment.subject?.color);
            const textColor = getSubjectTextColor(assignment.subject?.color);
            const lightBg = getSubjectLightBg(assignment.subject?.color);
            const priority = getPriorityInfo(assignment.deadline);
            const countdown = getCountdown(assignment.deadline);
            const totalSubmissions = assignment._count?.submissions || 0;

            // Determine status
            let assignmentStatus:
              | "pending"
              | "submitted"
              | "graded"
              | "overdue" = "pending";
            if (mySubmission) {
              assignmentStatus =
                mySubmission.marks !== null ? "graded" : "submitted";
            } else if (deadlinePassed) {
              assignmentStatus = "overdue";
            }
            const statusConfig = getStatusConfig(assignmentStatus);

            // Compute progress for multi-part
            const progressPercent =
              mySubmission && mySubmission.marks !== null
                ? Math.round((mySubmission.marks / assignment.maxMarks) * 100)
                : mySubmission
                  ? 100
                  : 0;

            return (
              <motion.div
                key={assignment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  {/* Gradient accent top bar */}
                  <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

                  <CardContent className="p-4 sm:p-5">
                    {/* Top: Subject badge + Status indicators */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg ${lightBg} flex items-center justify-center`}
                        >
                          <SubjectIcon className={`w-4 h-4 ${textColor}`} />
                        </div>
                        <span className={`text-xs font-medium ${textColor}`}>
                          {assignment.subject?.nameBn || "বিষয়"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Priority dot + badge */}
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${priority.dotColor}`}
                          />
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${priority.bg} ${priority.color} border-0`}
                          >
                            {priority.label}
                          </Badge>
                        </div>

                        {/* Status badge */}
                        <Badge
                          className={`${statusConfig.bg} ${statusConfig.color} border-0 gap-1 text-[10px]`}
                        >
                          <statusConfig.icon className="w-3 h-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors text-sm sm:text-base">
                      {assignment.titleBn || assignment.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                      {assignment.description}
                    </p>

                    {/* Countdown & Info row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground mb-3">
                      {countdown && (
                        <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3" />
                          {countdown}
                        </span>
                      )}
                      {deadlinePassed && assignment.deadline && (
                        <span className="flex items-center gap-1 text-red-500">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            সময় শেষ:
                          </span>{" "}
                          {new Date(assignment.deadline).toLocaleDateString(
                            "bn-BD",
                          )}
                        </span>
                      )}
                      {!deadlinePassed && assignment.deadline && !countdown && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(assignment.deadline).toLocaleDateString(
                            "bn-BD",
                          )}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {toBengaliNum(assignment.maxMarks)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {toBengaliNum(totalSubmissions)} জমা
                      </span>
                    </div>

                    {/* Progress bar for submission/grading status */}
                    {mySubmission && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
                          <span className="text-muted-foreground">
                            {mySubmission.marks !== null
                              ? "মূল্যায়ন সম্পন্ন"
                              : "জমা দেওয়া হয়েছে — মূল্যায়ন চলছে"}
                          </span>
                          <span className="font-medium">
                            {mySubmission.marks !== null
                              ? `${toBengaliNum(mySubmission.marks)}/${toBengaliNum(assignment.maxMarks)}`
                              : `${toBengaliNum(100)}%`}
                          </span>
                        </div>
                        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradientClass}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Marks with circular progress ring if graded */}
                    {mySubmission && mySubmission.marks !== null && (
                      <div className="mb-3 p-2.5 sm:p-3 rounded-lg bg-muted/30 flex items-start gap-3">
                        <CircularProgressRing
                          value={mySubmission.marks}
                          max={assignment.maxMarks}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm font-medium">
                              প্রাপ্ত নম্বর
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                              {toBengaliNum(mySubmission.marks)}/
                              {toBengaliNum(assignment.maxMarks)}
                            </span>
                          </div>
                          {/* Feedback */}
                          {mySubmission.feedback && (
                            <div className="mt-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                                  <GraduationCap className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                                  শিক্ষকের ফিডব্যাক
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-muted-foreground bg-background/50 rounded p-2 border">
                                {mySubmission.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons row */}
                    <div className="flex gap-2">
                      {/* View Detail button */}
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 min-h-[40px] text-sm"
                        onClick={() => handleCardClick(assignment)}
                      >
                        <Eye className="w-4 h-4" />
                        বিস্তারিত
                      </Button>

                      {isAdminOrTeacher && (
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 border-border/60 hover:text-primary hover:bg-primary/10 rounded-xl animate-fade-in"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditAssignment(assignment);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 border-border/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl animate-fade-in"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteAssignment(assignment);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {/* Submit button */}
                      {!mySubmission && !deadlinePassed && (
                        <Dialog
                          open={
                            submitOpen &&
                            selectedAssignment?.id === assignment.id
                          }
                          onOpenChange={(open) => {
                            setSubmitOpen(open);
                            if (open) {
                              setSelectedAssignment(assignment);
                              setSubmitSuccess(false);
                              setTermsChecked(false);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white min-h-[40px] text-sm"
                              disabled={!user}
                            >
                              <Upload className="w-4 h-4" />
                              জমা দিন
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Upload className="w-5 h-5 text-primary" />
                                অ্যাসাইনমেন্ট জমা দিন
                              </DialogTitle>
                              <DialogDescription className="text-sm">
                                {assignment.titleBn || assignment.title}
                              </DialogDescription>
                            </DialogHeader>

                            {submitSuccess ? (
                              <SuccessAnimation />
                            ) : (
                              <div className="space-y-4 py-2">
                                {/* Assignment instructions preview */}
                                <div className="p-3 rounded-lg bg-muted/40 border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">
                                      অ্যাসাইনমেন্ট বিবরণ
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-3">
                                    {assignment.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
                                    <span className="text-[10px] text-muted-foreground">
                                      সর্বোচ্চ নম্বর:{" "}
                                      {toBengaliNum(assignment.maxMarks)}
                                    </span>
                                    {assignment.deadline && (
                                      <span className="text-[10px] text-muted-foreground">
                                        শেষ তারিখ:{" "}
                                        {new Date(
                                          assignment.deadline,
                                        ).toLocaleDateString("bn-BD")}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Drag & drop upload area - improved */}
                                <div
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-200 ${
                                    isDragOver
                                      ? "border-emerald-500 bg-emerald-500/5 scale-[1.02]"
                                      : "border-muted-foreground/20 hover:border-emerald-500/40"
                                  }`}
                                >
                                  <motion.div
                                    animate={
                                      isDragOver ? { scale: 1.1 } : { scale: 1 }
                                    }
                                    className="flex flex-col items-center gap-2"
                                  >
                                    <div
                                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${isDragOver ? "bg-emerald-500/20" : "bg-muted/50"} flex items-center justify-center transition-colors`}
                                    >
                                      <FileUp
                                        className={`w-5 h-5 sm:w-6 sm:h-6 ${isDragOver ? "text-emerald-500" : "text-muted-foreground"}`}
                                      />
                                    </div>
                                    <p className="text-sm font-medium">
                                      {isDragOver
                                        ? "ফাইল লিংক এখানে ছাড়ুন!"
                                        : "লিংক এখানে ড্র্যাগ করুন"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Google Drive, Dropbox বা অন্য ক্লাউড লিংক
                                    </p>
                                  </motion.div>
                                </div>

                                {/* File name */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs">ফাইলের নাম</Label>
                                  <div className="relative">
                                    <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                      placeholder="assignment.pdf"
                                      value={fileName}
                                      onChange={(e) =>
                                        setFileName(e.target.value)
                                      }
                                      className="pl-9 h-10 sm:h-9 text-sm"
                                    />
                                  </div>
                                </div>

                                {/* File URL */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs">ফাইলের লিংক</Label>
                                  <div className="relative">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                      placeholder="https://drive.google.com/..."
                                      value={fileUrl}
                                      onChange={(e) =>
                                        setFileUrl(e.target.value)
                                      }
                                      className="pl-9 h-10 sm:h-9 text-sm"
                                    />
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">
                                    সমর্থিত: PDF, DOC, DOCX, PPT, PPTX, ইমেজ
                                  </p>
                                </div>

                                {/* Optional comment */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs">
                                    মন্তব্য (ঐচ্ছিক)
                                  </Label>
                                  <Textarea
                                    placeholder="শিক্ষককে কিছু জানাতে চাইলে লিখুন..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[60px] text-sm resize-none"
                                  />
                                </div>

                                <Separator />

                                {/* Terms checklist */}
                                <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/30">
                                  <Checkbox
                                    id="terms"
                                    checked={termsChecked}
                                    onCheckedChange={(checked) =>
                                      setTermsChecked(checked === true)
                                    }
                                    className="mt-0.5"
                                  />
                                  <label
                                    htmlFor="terms"
                                    className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed cursor-pointer"
                                  >
                                    আমি নিশ্চিত করছি যে এই কাজ আমার নিজের। আমি
                                    কোনো অনুচিত সাহায্য নিইনি এবং সকল নিয়ম মেনে
                                    জমা দিচ্ছি।
                                  </label>
                                </div>

                                {/* Submit button */}
                                <Button
                                  className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white min-h-[44px]"
                                  onClick={handleSubmit}
                                  disabled={isSubmitting || !termsChecked}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                          repeat: Infinity,
                                          duration: 1,
                                          ease: "linear",
                                        }}
                                      >
                                        <Sparkles className="w-4 h-4" />
                                      </motion.div>
                                      জমা হচ্ছে...
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-4 h-4" />
                                      জমা দিন
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Already submitted indicator */}
                      {mySubmission && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-lg p-2.5 flex-1">
                          <AnimatedCheckmark size={16} />
                          <span>
                            জমা দেওয়া হয়েছে —{" "}
                            {new Date(
                              mySubmission.submittedAt,
                            ).toLocaleDateString("bn-BD", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}

                      {/* Overdue indicator */}
                      {!mySubmission && deadlinePassed && (
                        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-500/5 rounded-lg p-2.5 flex-1">
                          <X className="w-4 h-4" />
                          <span>জমা দেওয়ার সময় শেষ</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ====== BOTTOM RESULT COUNT ====== */}
      {filteredAssignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {toBengaliNum(filteredAssignments.length)}টি অ্যাসাইনমেন্ট দেখানো
            হচ্ছে
            {subjectFilter !== "all" &&
              activeFilter !== "all" &&
              " (ফিল্টার করা)"}
          </p>
        </motion.div>
      )}

      {/* ====== ASSIGNMENT DETAIL DIALOG ====== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {detailLoading ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          ) : detailAssignment ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const SubIcon = getSubjectIcon(
                      detailAssignment.subject?.icon,
                    );
                    const subLightBg = getSubjectLightBg(
                      detailAssignment.subject?.color,
                    );
                    const subTextColor = getSubjectTextColor(
                      detailAssignment.subject?.color,
                    );
                    return (
                      <div
                        className={`w-10 h-10 rounded-lg ${subLightBg} flex items-center justify-center`}
                      >
                        <SubIcon className={`w-5 h-5 ${subTextColor}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <DialogTitle className="text-base sm:text-lg">
                      {detailAssignment.titleBn || detailAssignment.title}
                    </DialogTitle>
                    <p
                      className={`text-xs ${getSubjectTextColor(detailAssignment.subject?.color)}`}
                    >
                      {detailAssignment.subject?.nameBn || "বিষয়"}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Description */}
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">বিবরণ</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {detailAssignment.description}
                  </p>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {detailAssignment.deadline && (
                    <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          শেষ তারিখ
                        </p>
                        <p className="text-xs font-medium">
                          {new Date(
                            detailAssignment.deadline,
                          ).toLocaleDateString("bn-BD", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {getCountdown(detailAssignment.deadline) && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            {getCountdown(detailAssignment.deadline)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        সর্বোচ্চ নম্বর
                      </p>
                      <p className="text-xs font-medium">
                        {toBengaliNum(detailAssignment.maxMarks)}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        মোট জমা
                      </p>
                      <p className="text-xs font-medium">
                        {toBengaliNum(
                          detailAssignment._count?.submissions || 0,
                        )}{" "}
                        জন
                      </p>
                    </div>
                  </div>
                  {detailAssignment.createdAt && (
                    <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          তৈরির তারিখ
                        </p>
                        <p className="text-xs font-medium">
                          {new Date(
                            detailAssignment.createdAt,
                          ).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* My submission info */}
                {(() => {
                  const mySub = user
                    ? detailAssignment.submissions?.find(
                        (s: Submission) => s.userId === user.id,
                      )
                    : null;
                  if (mySub) {
                    return (
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            আপনি জমা দিয়েছেন
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">ফাইল:</span>
                            <span className="font-medium">
                              {mySub.fileName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              জমার তারিখ:
                            </span>
                            <span className="font-medium">
                              {new Date(mySub.submittedAt).toLocaleDateString(
                                "bn-BD",
                              )}
                            </span>
                          </div>
                          {mySub.marks !== null && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                প্রাপ্ত নম্বর:
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {toBengaliNum(mySub.marks)}/
                                {toBengaliNum(detailAssignment.maxMarks)}
                              </span>
                            </div>
                          )}
                          {mySub.feedback && (
                            <div className="mt-2 pt-2 border-t border-emerald-500/10">
                              <p className="text-[10px] text-muted-foreground mb-1">
                                শিক্ষকের ফিডব্যাক:
                              </p>
                              <p className="text-xs text-muted-foreground bg-background/50 rounded p-2 border">
                                {mySub.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Admin/teacher: Submission list */}
                {isAdminOrTeacher &&
                  detailAssignment.submissions &&
                  detailAssignment.submissions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          জমা দেওয়া শিক্ষার্থীরা
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {toBengaliNum(detailAssignment.submissions.length)} জন
                        </Badge>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {detailAssignment.submissions.map(
                          (
                            sub: Submission & {
                              user?: { name: string; email: string };
                            },
                          ) => (
                            <div
                              key={sub.id}
                              className="p-2.5 rounded-lg bg-muted/30 border text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-foreground">
                                  {(sub as unknown as Record<string, unknown>)
                                    .user
                                    ? (
                                        (
                                          sub as unknown as Record<
                                            string,
                                            unknown
                                          >
                                        ).user as Record<string, string>
                                      ).name
                                    : `শিক্ষার্থী`}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {sub.fileUrl && (
                                    <a
                                      href={sub.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                                    >
                                      <Eye className="w-3 h-3" />
                                      ফাইল দেখুন
                                    </a>
                                  )}
                                  <Badge
                                    className={`text-[9px] px-1.5 py-0 border-0 ${
                                      sub.status === "reviewed"
                                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    }`}
                                  >
                                    {sub.status === "reviewed"
                                      ? "মূল্যায়ন সম্পন্ন"
                                      : "অপেক্ষমাণ"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>{sub.fileName}</span>
                                {sub.marks !== null && (
                                  <span className="font-medium text-teal-600 dark:text-teal-400">
                                    নম্বর: {toBengaliNum(sub.marks)}/
                                    {toBengaliNum(detailAssignment.maxMarks)}
                                  </span>
                                )}
                              </div>
                              {sub.feedback && (
                                <p className="mt-1 text-[10px] text-muted-foreground italic">
                                  ফিডব্যাক: {sub.feedback}
                                </p>
                              )}

                              {gradingSubmissionId === sub.id ? (
                                <div className="mt-2.5 p-2 rounded bg-background/50 border border-primary/20 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-[10px]">
                                        প্রাপ্ত নম্বর
                                      </Label>
                                      <Input
                                        type="number"
                                        max={detailAssignment.maxMarks}
                                        placeholder={`যেমন: ${toBengaliNum(10)}`}
                                        value={gradeForm.marks}
                                        onChange={(e) =>
                                          setGradeForm({
                                            ...gradeForm,
                                            marks: e.target.value,
                                          })
                                        }
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[10px]">
                                        ফিডব্যাক
                                      </Label>
                                      <Input
                                        placeholder="ফিডব্যাক লিখুন"
                                        value={gradeForm.feedback}
                                        onChange={(e) =>
                                          setGradeForm({
                                            ...gradeForm,
                                            feedback: e.target.value,
                                          })
                                        }
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 text-[10px]"
                                      onClick={() =>
                                        setGradingSubmissionId(null)
                                      }
                                      disabled={gradingLoading}
                                    >
                                      বাতিল
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() =>
                                        handleGradeSubmission(sub.id)
                                      }
                                      disabled={gradingLoading}
                                    >
                                      {gradingLoading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        "সংরক্ষণ"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end mt-2 pt-1 border-t border-border/30">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px] gap-1 border-primary/20 text-primary hover:bg-primary/5"
                                    onClick={() => {
                                      setGradingSubmissionId(sub.id);
                                      setGradeForm({
                                        marks:
                                          sub.marks !== null
                                            ? sub.marks.toString()
                                            : "",
                                        feedback: sub.feedback || "",
                                      });
                                    }}
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    {sub.status === "reviewed"
                                      ? "পুনঃমূল্যায়ন"
                                      : "মূল্যায়ন করুন"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ====== CREATE ASSIGNMENT DIALOG (admin/teacher) ====== */}
      {isAdminOrTeacher && (
        <CreateAssignmentDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          form={createForm}
          setForm={setCreateForm}
          onSubmit={handleCreateAssignment}
          loading={createLoading}
          subjects={allSubjects}
        />
      )}
      {/* ====== EDIT ASSIGNMENT DIALOG (admin/teacher) ====== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              অ্যাসাইনমেন্ট সম্পাদন করুন
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title (English) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">শিরোনাম (ইংরেজি) *</Label>
              <Input
                placeholder="e.g., Physics Assignment 1"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Title (Bangla) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">শিরোনাম (বাংলা) *</Label>
              <Input
                placeholder="যেমন: পদার্থবিজ্ঞান অ্যাসাইনমেন্ট ১"
                value={editForm.titleBn}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, titleBn: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">বিবরণ *</Label>
              <Textarea
                placeholder="অ্যাসাইনমেন্টের বিস্তারিত বিবরণ লিখুন..."
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-[100px]"
              />
            </div>

            {/* Subject */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">বিষয় *</Label>
                <Select
                  value={editForm.subjectId}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({ ...prev, subjectId: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.nameBn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Marks */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">সর্বোচ্চ নম্বর</Label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.maxMarks}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      maxMarks: parseInt(e.target.value) || 100,
                    }))
                  }
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">শেষ সময় (অপশনাল)</Label>
              <Input
                type="datetime-local"
                value={editForm.deadline}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, deadline: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={updatingAssignment}
            >
              বাতিল
            </Button>
            <Button
              onClick={handleUpdateAssignment}
              disabled={
                updatingAssignment ||
                !editForm.title ||
                !editForm.titleBn ||
                !editForm.description ||
                !editForm.subjectId
              }
              className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white animate-fade-in"
            >
              {updatingAssignment && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              আপডেট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== DELETE ASSIGNMENT DIALOG (admin/teacher) ====== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              অ্যাসাইনমেন্ট মুছে ফেলুন
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              আপনি কি নিশ্চিতভাবে এই অ্যাসাইনমেন্টটি মুছে ফেলতে চান? এর সাথে
              সম্পর্কিত সকল শিক্ষার্থীর জমা দেওয়া ফাইল ও মূল্যায়ন মুছে যাবে।
            </p>
            <p className="text-sm font-semibold mt-2 text-foreground">
              {selectedAssignment?.titleBn || selectedAssignment?.title}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={updatingAssignment}
            >
              বাতিল
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAssignment}
              disabled={updatingAssignment}
              className="gap-2 animate-fade-in"
            >
              {updatingAssignment && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// CREATE ASSIGNMENT DIALOG COMPONENT
// ============================================================

function CreateAssignmentDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
  loading,
  subjects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    title: string;
    titleBn: string;
    description: string;
    subjectId: string;
    deadline: string;
    maxMarks: number;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onSubmit: () => void;
  loading: boolean;
  subjects: Subject[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Plus className="w-5 h-5 text-primary" />
            নতুন অ্যাসাইনমেন্ট তৈরি করুন
          </DialogTitle>
          <DialogDescription className="text-sm">
            শিক্ষার্থীদের জন্য নতুন অ্যাসাইনমেন্ট যুক্ত করুন
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Subject select */}
          <div className="space-y-1.5">
            <Label className="text-xs">বিষয় *</Label>
            <Select
              value={form.subjectId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, subjectId: value }))
              }
            >
              <SelectTrigger className="h-10 sm:h-9 text-sm">
                <SelectValue placeholder="বিষয় নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nameBn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">শিরোনাম (ইংরেজি) *</Label>
            <Input
              placeholder="Assignment Title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="h-10 sm:h-9 text-sm"
            />
          </div>

          {/* Title Bengali */}
          <div className="space-y-1.5">
            <Label className="text-xs">শিরোনাম (বাংলা) *</Label>
            <Input
              placeholder="অ্যাসাইনমেন্টের শিরোনাম"
              value={form.titleBn}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, titleBn: e.target.value }))
              }
              className="h-10 sm:h-9 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">বিবরণ *</Label>
            <Textarea
              placeholder="অ্যাসাইনমেন্টের বিস্তারিত বিবরণ লিখুন..."
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="min-h-[80px] text-sm resize-none"
            />
          </div>

          {/* Deadline and max marks row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">শেষ তারিখ</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="h-10 sm:h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">সর্বোচ্চ নম্বর</Label>
              <Input
                type="number"
                min={1}
                max={500}
                value={form.maxMarks}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maxMarks: parseInt(e.target.value) || 100,
                  }))
                }
                className="h-10 sm:h-9 text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* Create button */}
          <Button
            className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white min-h-[44px]"
            onClick={onSubmit}
            disabled={
              loading ||
              !form.title ||
              !form.titleBn ||
              !form.description ||
              !form.subjectId
            }
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                তৈরি হচ্ছে...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                অ্যাসাইনমেন্ট তৈরি করুন
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
