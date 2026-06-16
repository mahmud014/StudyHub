"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircleQuestion,
  Send,
  CheckCircle2,
  MessageCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Share2,
  Filter,
  ArrowUpDown,
  Eye,
  Clock,
  Tag,
  UserCircle,
  Shield,
  X,
  Sparkles,
  HelpCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStudyHub } from "@/components/layout/StudyHubProvider";
import { toast } from "sonner";

// Helper: convert digits to Bengali numerals
function toBengaliNum(num: number): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

// Subject colors for tags
const subjectTagColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  গণিত: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  পদার্থবিজ্ঞান: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  রসায়ন: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
  },
  জীববিজ্ঞান: {
    bg: "bg-lime-500/10",
    text: "text-lime-600 dark:text-lime-400",
    border: "border-lime-500/20",
  },
  ইংরেজি: {
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/20",
  },
  বাংলা: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
  },
  ইতিহাস: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  },
  ভূগোল: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
  },
};

const defaultTagColor = {
  bg: "bg-emerald-500/10",
  text: "text-emerald-600 dark:text-emerald-400",
  border: "border-emerald-500/20",
};

function getSubjectTagColor(subject: string) {
  return subjectTagColors[subject] || defaultTagColor;
}

// Time ago helper
function timeAgo(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "এইমাত্র";
    if (diffMins < 60) return `${toBengaliNum(diffMins)} মিনিট আগে`;
    if (diffHours < 24) return `${toBengaliNum(diffHours)} ঘন্টা আগে`;
    if (diffDays < 7) return `${toBengaliNum(diffDays)} দিন আগে`;
    return `${toBengaliNum(diffDays)} দিন আগে`;
  } catch {
    return "সর্বশেষ";
  }
}

// Subject type from API
interface SubjectOption {
  id: string;
  name: string;
  nameBn: string;
}

// Extended question type for local UI state
interface QAQuestionUI {
  id: string;
  title: string;
  content: string;
  isSolved: boolean;
  upvotes: number;
  createdAt: string;
  subjectId?: string | null;
  subject?: { id: string; name: string; nameBn: string } | null;
  user: { id: string; name: string; avatar?: string | null };
  answers: QAAnswerUI[];
  _count?: { answers: number };
  tags?: string[];
}

interface QAAnswerUI {
  id: string;
  content: string;
  isAccepted: boolean;
  upvotes: number;
  createdAt: string;
  user: { id: string; name: string; avatar?: string | null; role?: string };
}

// Vote storage type
interface VoteState {
  questions: Record<string, number>; // questionId -> +1, -1, 0
  answers: Record<string, number>;
}

export default function QASection() {
  const [questions, setQuestions] = useState<QAQuestionUI[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QAQuestionUI | null>(
    null,
  );
  const [answerText, setAnswerText] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [questionTags, setQuestionTags] = useState("");
  const [questionSubject, setQuestionSubject] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "unanswered">(
    "recent",
  );
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const { user } = useStudyHub();

  // Local storage state for votes, bookmarks
  const [votes, setVotes] = useState<VoteState>(() => {
    if (typeof window === "undefined") return { questions: {}, answers: {} };
    try {
      const saved = localStorage.getItem("studyhub_qa_votes");
      return saved ? JSON.parse(saved) : { questions: {}, answers: {} };
    } catch {
      return { questions: {}, answers: {} };
    }
  });

  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("studyhub_qa_bookmarks");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("studyhub_qa_votes", JSON.stringify(votes));
    } catch {}
  }, [votes]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "studyhub_qa_bookmarks",
        JSON.stringify([...bookmarks]),
      );
    } catch {}
  }, [bookmarks]);

  // Fetch subjects from API
  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setSubjects(
            data.data.map(
              (s: { id: string; name: string; nameBn: string }) => ({
                id: s.id,
                name: s.name,
                nameBn: s.nameBn,
              }),
            ),
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (subjectFilter && subjectFilter !== "all")
        params.set("subjectId", subjectFilter);
      const res = await fetch(`/api/qa?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const qList = Array.isArray(data.data)
          ? data.data
          : data.data.questions || [];
        const enhanced = qList.map((q: QAQuestionUI) => ({
          ...q,
          tags: q.tags || (q.subject?.nameBn ? [q.subject.nameBn] : []),
          upvotes: q.upvotes ?? 0,
        }));
        setQuestions(enhanced);
      } else {
        setError(data.error || "প্রশ্ন লোড করতে সমস্যা হয়েছে");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [subjectFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const fetchQuestionDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetch(`/api/qa/${id}`);
      const data = await res.json();
      if (data.success) {
        const q = data.data;
        setSelectedQuestion({
          ...q,
          tags: q.tags || (q.subject?.nameBn ? [q.subject.nameBn] : []),
          upvotes: q.upvotes ?? 0,
          answers: (q.answers || []).map((a: QAAnswerUI) => ({
            ...a,
            upvotes: a.upvotes ?? 0,
          })),
        });
      } else {
        setDetailError(data.error || "প্রশ্ন লোড করতে সমস্যা হয়েছে");
      }
    } catch {
      setDetailError("নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!user) {
      toast.error("প্রশ্ন করতে লগইন করুন");
      return;
    }
    if (!questionTitle.trim() || !questionContent.trim()) {
      toast.error("শিরোনাম ও বিবরণ দিন");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subjectId: questionSubject || undefined,
          title: questionTitle,
          content: questionContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("প্রশ্ন পোস্ট হয়েছে!");
        setAskOpen(false);
        setQuestionTitle("");
        setQuestionContent("");
        setQuestionTags("");
        setQuestionSubject("");
        setIsAnonymous(false);
        setShowPreview(false);
        // Refresh questions list
        await fetchQuestions();
      } else {
        toast.error(data.error || "প্রশ্ন পোস্ট করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostAnswer = async () => {
    if (!user || !selectedQuestion) return;
    if (!answerText.trim()) {
      toast.error("উত্তর লিখুন");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/qa/${selectedQuestion.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          content: answerText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("উত্তর পোস্ট হয়েছে!");
        setAnswerText("");
        fetchQuestionDetail(selectedQuestion.id);
      } else {
        toast.error(data.error || "উত্তর পোস্ট করতে সমস্যা");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vote handlers - call backend API
  const handleVoteQuestion = async (questionId: string, direction: 1 | -1) => {
    const current = votes.questions[questionId] || 0;
    const newVote = current === direction ? 0 : direction;

    // Optimistic update for local vote state
    setVotes((prev) => ({
      ...prev,
      questions: { ...prev.questions, [questionId]: newVote },
    }));

    // Optimistic upvote count update
    const diff = newVote - current;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + diff } : q,
      ),
    );
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion((prev) =>
        prev ? { ...prev, upvotes: prev.upvotes + diff } : null,
      );
    }

    // Call backend API
    try {
      if (direction === 1 && newVote === 1) {
        await fetch(`/api/qa/${questionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upvote" }),
        });
      } else if (direction === -1 && newVote === -1) {
        await fetch(`/api/qa/${questionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "downvote" }),
        });
      } else if (newVote === 0) {
        // Undo: apply opposite
        await fetch(`/api/qa/${questionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: current === 1 ? "downvote" : "upvote",
          }),
        });
      }
    } catch {
      toast.error("ভোট দিতে সমস্যা হয়েছে");
      // Revert optimistic update
      setVotes((prev) => ({
        ...prev,
        questions: { ...prev.questions, [questionId]: current },
      }));
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, upvotes: q.upvotes - diff } : q,
        ),
      );
      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion((prev) =>
          prev ? { ...prev, upvotes: prev.upvotes - diff } : null,
        );
      }
    }
  };

  const handleVoteAnswer = async (
    questionId: string,
    answerId: string,
    direction: 1 | -1,
  ) => {
    const current = votes.answers[answerId] || 0;
    const newVote = current === direction ? 0 : direction;

    // Optimistic update
    setVotes((prev) => ({
      ...prev,
      answers: { ...prev.answers, [answerId]: newVote },
    }));

    const diff = newVote - current;
    if (selectedQuestion) {
      setSelectedQuestion((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          answers: prev.answers.map((a) =>
            a.id === answerId ? { ...a, upvotes: a.upvotes + diff } : a,
          ),
        };
      });
    }

    try {
      if (direction === 1 && newVote === 1) {
        await fetch(`/api/qa/${questionId}/answer`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerId, action: "upvote" }),
        });
      } else if (direction === -1 && newVote === -1) {
        await fetch(`/api/qa/${questionId}/answer`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerId, action: "downvote" }),
        });
      } else if (newVote === 0) {
        await fetch(`/api/qa/${questionId}/answer`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answerId,
            action: current === 1 ? "downvote" : "upvote",
          }),
        });
      }
    } catch {
      toast.error("ভোট দিতে সমস্যা হয়েছে");
      // Revert
      setVotes((prev) => ({
        ...prev,
        answers: { ...prev.answers, [answerId]: current },
      }));
      if (selectedQuestion) {
        setSelectedQuestion((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            answers: prev.answers.map((a) =>
              a.id === answerId ? { ...a, upvotes: a.upvotes - diff } : a,
            ),
          };
        });
      }
    }
  };

  // Bookmark handler
  const handleBookmark = (questionId: string) => {
    setBookmarks((prev) => {
      const n = new Set(prev);
      if (n.has(questionId)) n.delete(questionId);
      else n.add(questionId);
      return n;
    });
  };

  // Share handler
  const handleShare = async (questionId: string) => {
    const url = `${window.location.origin}?section=qa&q=${questionId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "স্টাডি হাব - প্রশ্ন", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("লিংক কপি হয়েছে!");
    }
  };

  // Accept answer handler - calls backend API
  const handleAcceptAnswer = async (answerId: string) => {
    if (!selectedQuestion) return;
    try {
      const res = await fetch(`/api/qa/${selectedQuestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept-answer", answerId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("উত্তর গৃহীত হয়েছে!");
        // Update local state from API response
        const updatedQ = data.data;
        setSelectedQuestion({
          ...updatedQ,
          tags:
            updatedQ.tags ||
            (updatedQ.subject?.nameBn ? [updatedQ.subject.nameBn] : []),
          upvotes: updatedQ.upvotes ?? 0,
          answers: (updatedQ.answers || []).map((a: QAAnswerUI) => ({
            ...a,
            upvotes: a.upvotes ?? 0,
          })),
        });
        // Also update the question in the list
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === selectedQuestion.id ? { ...q, isSolved: true } : q,
          ),
        );
      } else {
        toast.error(data.error || "উত্তর গ্রহণ করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    }
  };

  // Filtered and sorted questions
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q),
      );
    }

    // Subject filter is now handled server-side, but also filter client-side for search results
    // (subjectFilter state drives the API call via fetchQuestions)

    // Sort
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "unanswered":
        result = result.filter(
          (item) =>
            !item.answers ||
            item.answers.length === 0 ||
            item._count?.answers === 0,
        );
        break;
      case "recent":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return result;
  }, [questions, searchQuery, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = questions.length;
    const answered = questions.filter(
      (q) =>
        q.isSolved ||
        (q.answers && q.answers.length > 0) ||
        (q._count && q._count.answers > 0),
    ).length;
    const unanswered = total - answered;
    const rate = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { total, answered, unanswered, rate };
  }, [questions]);

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
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                <MessageCircleQuestion className="w-5 h-5 text-primary" />
              </div>
              প্রশ্নোত্তর ফোরাম
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-sm px-3 py-1">
                {toBengaliNum(stats.total)} টি প্রশ্ন
              </Badge>
            </h2>
            {/* Decorative underline */}
            <div className="mt-2 ml-[52px] flex items-center gap-2">
              <div className="h-1 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <div className="h-1 w-4 rounded-full bg-emerald-300/50" />
            </div>
            <p className="mt-2 text-muted-foreground ml-[52px]">
              পড়াশোনা বিষয়ক যেকোনো সমস্যায় প্রশ্ন করুন
            </p>
          </div>

          <Dialog open={askOpen} onOpenChange={setAskOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20"
                disabled={!user}
              >
                <MessageCircleQuestion className="w-4 h-4" />
                প্রশ্ন করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  নতুন প্রশ্ন করুন
                </DialogTitle>
                <DialogDescription>
                  আপনার পড়াশোনা বিষয়ক প্রশ্ন লিখুন
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Subject selector - fetched from API */}
                <div className="space-y-2">
                  <Label>বিষয়</Label>
                  <Select
                    value={questionSubject}
                    onValueChange={setQuestionSubject}
                  >
                    <SelectTrigger className="w-full">
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
                <div className="space-y-2">
                  <Label>শিরোনাম</Label>
                  <Input
                    placeholder="আপনার প্রশ্নের শিরোনাম"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>বিবরণ</Label>
                  <Textarea
                    placeholder="প্রশ্নের বিস্তারিত লিখুন..."
                    rows={5}
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    ট্যাগ (কমা দিয়ে আলাদা করুন)
                  </Label>
                  <Input
                    placeholder="যেমন: বীজগণিত, সূত্র, সহজ"
                    value={questionTags}
                    onChange={(e) => setQuestionTags(e.target.value)}
                  />
                  {questionTags && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {questionTags.split(",").map(
                        (tag, i) =>
                          tag.trim() && (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.trim()}
                            </Badge>
                          ),
                      )}
                    </div>
                  )}
                </div>

                {/* Anonymous toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">বেনামে প্রশ্ন করুন</p>
                      <p className="text-xs text-muted-foreground">
                        আপনার নাম প্রকাশ হবে না
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>

                {/* Preview toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? "ফর্ম দেখুন" : "প্রিভিউ দেখুন"}
                </Button>

                {/* Preview */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Card className="border-dashed">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">
                            {questionTitle || "শিরোনাম লিখুন..."}
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {questionContent || "বিবরণ লিখুন..."}
                          </p>
                          {questionTags && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {questionTags.split(",").map(
                                (tag, i) =>
                                  tag.trim() && (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag.trim()}
                                    </Badge>
                                  ),
                              )}
                            </div>
                          )}
                          {isAnonymous && (
                            <Badge className="mt-2 bg-amber-500/10 text-amber-600 text-xs border-0">
                              বেনামে
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  onClick={handleAskQuestion}
                  disabled={
                    isSubmitting ||
                    !questionTitle.trim() ||
                    !questionContent.trim()
                  }
                >
                  {isSubmitting ? "পোস্ট হচ্ছে..." : "প্রশ্ন পোস্ট করুন"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {loading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  toBengaliNum(stats.total)
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">মোট প্রশ্ন</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {loading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  toBengaliNum(stats.answered)
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">উত্তর হয়েছে</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <MessageCircleQuestion className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {loading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  toBengaliNum(stats.unanswered)
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">উত্তরহীন</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {loading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  `${toBengaliNum(stats.rate)}%`
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">সমাধান হার</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search, Filter & Sort */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="প্রশ্ন খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="বিষয় ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব বিষয়</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nameBn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(v) =>
            setSortBy(v as "recent" | "popular" | "unanswered")
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">সাম্প্রতিক</SelectItem>
            <SelectItem value="popular">জনপ্রিয়</SelectItem>
            <SelectItem value="unanswered">উত্তরহীন</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Error state for questions list */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500/50" />
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={fetchQuestions}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                আবার চেষ্টা করুন
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skeleton Questions List */}
          <div className="lg:col-span-1 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Skeleton className="shrink-0 w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton Detail Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-lg border">
              <div className="flex items-start gap-3 mb-4">
                <Skeleton className="shrink-0 w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <Skeleton className="shrink-0 w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions List */}
          <div className="lg:col-span-1">
            <ScrollArea className="h-[650px] pr-4">
              <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircleQuestion className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">কোনো প্রশ্ন পাওয়া যায়নি</p>
                  </div>
                ) : (
                  filteredQuestions.map((q, index) => {
                    const answerCount =
                      q._count?.answers || q.answers?.length || 0;
                    const subjectName = q.subject?.nameBn || "";
                    const tagColor = subjectName
                      ? getSubjectTagColor(subjectName)
                      : null;
                    const isBookmarked = bookmarks.has(q.id);
                    const userVote = votes.questions[q.id] || 0;
                    const displayVote = q.upvotes;

                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md group ${
                            selectedQuestion?.id === q.id
                              ? "ring-2 ring-primary border-primary/30"
                              : ""
                          } ${q.isSolved ? "border-emerald-500/20" : ""}`}
                          onClick={() => fetchQuestionDetail(q.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Vote column */}
                              <div className="shrink-0 flex flex-col items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-6 w-6 ${userVote === 1 ? "text-emerald-500" : "text-muted-foreground"}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVoteQuestion(q.id, 1);
                                  }}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </Button>
                                <span
                                  className={`text-xs font-bold ${displayVote > 0 ? "text-emerald-600" : displayVote < 0 ? "text-red-500" : "text-muted-foreground"}`}
                                >
                                  {toBengaliNum(displayVote)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-6 w-6 ${userVote === -1 ? "text-red-500" : "text-muted-foreground"}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVoteQuestion(q.id, -1);
                                  }}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </Button>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-sm line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                                    {q.title}
                                  </h4>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleBookmark(q.id);
                                          }}
                                        >
                                          {isBookmarked ? (
                                            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                                          ) : (
                                            <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {isBookmarked
                                          ? "বুকমার্ক সরান"
                                          : "বুকমার্ক করুন"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>

                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {/* Answer count badge */}
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <MessageCircle className="w-3 h-3 mr-1" />
                                    {toBengaliNum(answerCount)}
                                  </Badge>

                                  {/* Subject tag */}
                                  {tagColor && (
                                    <Badge
                                      className={`text-xs ${tagColor.bg} ${tagColor.text} border ${tagColor.border}`}
                                    >
                                      {subjectName}
                                    </Badge>
                                  )}

                                  {q.isSolved && (
                                    <Badge className="text-xs bg-emerald-500/10 text-emerald-600 border-0">
                                      সমাধান হয়েছে
                                    </Badge>
                                  )}
                                </div>

                                {/* Time and actions row */}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    সর্বশেষ: {timeAgo(q.createdAt)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground hover:text-primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShare(q.id);
                                    }}
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Question Detail */}
          <div className="lg:col-span-2">
            {detailLoading ? (
              <div className="space-y-4">
                <div className="p-6 rounded-lg border">
                  <div className="flex items-start gap-3 mb-4">
                    <Skeleton className="shrink-0 w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Skeleton className="shrink-0 w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            ) : detailError ? (
              <Card className="h-[650px] flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500/50" />
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    {detailError}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      selectedQuestion
                        ? fetchQuestionDetail(selectedQuestion.id)
                        : null
                    }
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    আবার চেষ্টা করুন
                  </Button>
                </div>
              </Card>
            ) : selectedQuestion ? (
              <motion.div
                key={selectedQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`mb-6 ${selectedQuestion.isSolved ? "border-emerald-500/20" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {/* Vote column */}
                      <div className="shrink-0 flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${(votes.questions[selectedQuestion.id] || 0) === 1 ? "text-emerald-500" : ""}`}
                          onClick={() =>
                            handleVoteQuestion(selectedQuestion.id, 1)
                          }
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-bold">
                          {toBengaliNum(selectedQuestion.upvotes)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${(votes.questions[selectedQuestion.id] || 0) === -1 ? "text-red-500" : ""}`}
                          onClick={() =>
                            handleVoteQuestion(selectedQuestion.id, -1)
                          }
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">
                              {selectedQuestion.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1">
                                {selectedQuestion.user?.avatar ? (
                                  <img
                                    src={selectedQuestion.user.avatar}
                                    alt=""
                                    className="w-4 h-4 rounded-full"
                                  />
                                ) : (
                                  <UserCircle className="w-4 h-4" />
                                )}
                                {selectedQuestion.user?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo(selectedQuestion.createdAt)}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleBookmark(selectedQuestion.id)
                              }
                            >
                              {bookmarks.has(selectedQuestion.id) ? (
                                <BookmarkCheck className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleShare(selectedQuestion.id)}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Subject tag */}
                        {selectedQuestion.subject?.nameBn && (
                          <div className="mt-2">
                            <Badge
                              className={`${getSubjectTagColor(selectedQuestion.subject.nameBn).bg} ${getSubjectTagColor(selectedQuestion.subject.nameBn).text} border ${getSubjectTagColor(selectedQuestion.subject.nameBn).border}`}
                            >
                              {selectedQuestion.subject.nameBn}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="ml-11">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedQuestion.content}
                      </p>

                      {/* Tags */}
                      {selectedQuestion.tags &&
                        selectedQuestion.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {selectedQuestion.tags.map((tag, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                <Tag className="w-2.5 h-2.5 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                      {selectedQuestion.isSolved && (
                        <Badge className="mt-3 bg-emerald-500/10 text-emerald-600 border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          সমাধান হয়েছে
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Answers */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    উত্তরসমূহ
                    <Badge variant="secondary" className="text-xs">
                      {toBengaliNum(selectedQuestion.answers?.length || 0)}
                    </Badge>
                  </h3>
                </div>
                <div className="space-y-4">
                  {selectedQuestion.answers?.map((answer) => {
                    const isTeacher = answer.user?.role === "teacher";
                    const answerVote = votes.answers[answer.id] || 0;
                    // answer.upvotes is already optimistically updated in handleVoteAnswer,
                    // so we use it directly as the display value
                    const displayAnswerVote = answer.upvotes;

                    return (
                      <Card
                        key={answer.id}
                        className={`${answer.isAccepted ? "border-emerald-500/30 bg-emerald-500/5" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Vote column */}
                            <div className="shrink-0 flex flex-col items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 ${answerVote === 1 ? "text-emerald-500" : ""}`}
                                onClick={() =>
                                  handleVoteAnswer(
                                    selectedQuestion.id,
                                    answer.id,
                                    1,
                                  )
                                }
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </Button>
                              <span className="text-xs font-semibold">
                                {toBengaliNum(displayAnswerVote)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 ${answerVote === -1 ? "text-red-500" : ""}`}
                                onClick={() =>
                                  handleVoteAnswer(
                                    selectedQuestion.id,
                                    answer.id,
                                    -1,
                                  )
                                }
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                                    isTeacher
                                      ? "bg-amber-500/10 text-amber-600"
                                      : "bg-emerald-500/10 text-emerald-600"
                                  }`}
                                >
                                  {answer.user?.name?.[0] || "?"}
                                </div>
                                <span className="text-sm font-medium">
                                  {answer.user?.name}
                                </span>
                                {isTeacher && (
                                  <Badge className="bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0 border-0">
                                    <Shield className="w-3 h-3 mr-0.5" />
                                    শিক্ষক
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {timeAgo(answer.createdAt)}
                                </span>
                              </div>

                              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {answer.content}
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                {answer.isAccepted && (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 text-xs border-0">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    গৃহীত উত্তর
                                  </Badge>
                                )}
                                {/* Accept answer button (only for question author) */}
                                {user &&
                                  user.id === selectedQuestion.user?.id &&
                                  !answer.isAccepted &&
                                  !selectedQuestion.isSolved && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-7 gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                      onClick={() =>
                                        handleAcceptAnswer(answer.id)
                                      }
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      গ্রহণ করুন
                                    </Button>
                                  )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {(!selectedQuestion.answers ||
                    selectedQuestion.answers.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">এখনো কোনো উত্তর দেওয়া হয়নি</p>
                      <p className="text-xs mt-1">প্রথম উত্তর দিন!</p>
                    </div>
                  )}
                </div>

                {/* Post Answer */}
                {user && (
                  <div className="mt-6">
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                          <Send className="w-4 h-4 text-primary" />
                          আপনার উত্তর লিখুন
                        </h4>
                        <Textarea
                          placeholder="আপনার উত্তর লিখুন..."
                          rows={4}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-muted-foreground">
                            {toBengaliNum(answerText.length)} অক্ষর
                          </p>
                          <Button
                            className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                            onClick={handlePostAnswer}
                            disabled={isSubmitting || !answerText.trim()}
                          >
                            <Send className="w-4 h-4" />
                            {isSubmitting ? "পোস্ট হচ্ছে..." : "উত্তর দিন"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            ) : (
              <Card className="h-[650px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <MessageCircleQuestion className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  </motion.div>
                  <p className="text-lg">একটি প্রশ্ন নির্বাচন করুন</p>
                  <p className="text-sm mt-1">বাম পাশ থেকে প্রশ্ন বাছাই করুন</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
