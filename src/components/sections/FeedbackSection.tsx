'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MessageSquare, ThumbsUp, Send, ShieldCheck,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// --- Mock Data (used as fallback when API has no data) ---
const categories = [
  { id: 'platform', label: 'প্ল্যাটফর্ম' },
  { id: 'content', label: 'কন্টেন্ট' },
  { id: 'teacher', label: 'শিক্ষক' },
  { id: 'technology', label: 'প্রযুক্তি' },
  { id: 'other', label: 'অন্যান্য' },
];

const defaultRecentFeedback = [
  {
    id: 1,
    rating: 5,
    category: 'কন্টেন্ট',
    text: 'গণিতের ভিডিও লেকচারগুলো খুবই সহজ করে বোঝানো হয়েছে। জ্যামিতির অধ্যায়টি বিশেষভাবে সাহায্যকারী।',
    date: '২ দিন আগে',
    anonymous: false,
    author: 'রাফি আহমেদ',
  },
  {
    id: 2,
    rating: 4,
    category: 'প্ল্যাটফর্ম',
    text: 'মোবাইল অ্যাপটি দারুণ, তবে অফলাইন মোড থাকলে আরও ভালো হতো।',
    date: '৩ দিন আগে',
    anonymous: true,
    author: '',
  },
  {
    id: 3,
    rating: 5,
    category: 'শিক্ষক',
    text: 'স্যারের পড়ানোর পদ্ধতি অসাধারণ! প্রতিটি বিষয় ক্লিয়ার করে বোঝান।',
    date: '৫ দিন আগে',
    anonymous: false,
    author: 'নুসরাত জাহান',
  },
  {
    id: 4,
    rating: 3,
    category: 'প্রযুক্তি',
    text: 'ভিডিও স্ট্রিমিং কখনো কখনো কাটে, ইন্টারনেট স্পিড ভালো থাকলেও। এটি ঠিক করলে ভালো হবে।',
    date: '১ সপ্তাহ আগে',
    anonymous: false,
    author: 'তানভীর হাসান',
  },
  {
    id: 5,
    rating: 4,
    category: 'কন্টেন্ট',
    text: 'বিজ্ঞানের ল্যাব ভিডিওগুলো খুব সুন্দর। আরও বেশি পরীক্ষণ যোগ করলে ভালো হবে।',
    date: '১ সপ্তাহ আগে',
    anonymous: true,
    author: '',
  },
  {
    id: 6,
    rating: 5,
    category: 'প্ল্যাটফর্ম',
    text: 'ড্যাশবোর্ড এবং প্রগ্রেস ট্র্যাকিং ফিচারটি চমৎকার। নিজের অগ্রগতি দেখতে পাওয়া অনুপ্রেরণামূলক।',
    date: '২ সপ্তাহ আগে',
    anonymous: false,
    author: 'সাদিয়া রহমান',
  },
];

const featureRequests = [
  {
    id: 1,
    title: 'অফলাইন ডাউনলোড',
    description: 'ভিডিও এবং নোট অফলাইনে সেভ করে রাখার সুবিধা',
    votes: 128,
  },
  {
    id: 2,
    title: 'গ্রুপ স্টাডি মোড',
    description: 'বন্ধুদের সাথে একসাথে পড়াশোনা করার ফিচার',
    votes: 95,
  },
  {
    id: 3,
    title: 'ভয়েস নোট',
    description: 'অডিও রেকর্ডিং দিয়ে নোট তৈরি করার সুবিধা',
    votes: 67,
  },
  {
    id: 4,
    title: 'প্রতিযোগিতামূলক পরীক্ষা',
    description: 'সপ্তাহিক র‍্যাংকিং সহ প্রতিযোগিতামূলক পরীক্ষা ব্যবস্থা',
    votes: 154,
  },
];

// --- Sub-components ---

function StarRating({ rating, onRatingChange, interactive = false, size = 'md' }: {
  rating: number;
  onRatingChange?: (r: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md';
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={!interactive}
          whileTap={interactive ? { scale: 1.3 } : undefined}
          whileHover={interactive ? { scale: 1.2 } : undefined}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-transform`}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRatingChange?.(star)}
          aria-label={`${star} তারা`}
        >
          <Star
            className={`${starSize} transition-colors duration-150 ${
              star <= (hoverRating || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

interface FeedbackItem {
  id: number | string;
  rating: number;
  category: string;
  text: string;
  date: string;
  anonymous: boolean;
  author: string;
}

function FeedbackCard({ feedback }: { feedback: FeedbackItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating rating={feedback.rating} size="sm" />
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {feedback.category}
              </Badge>
            </div>
            {feedback.anonymous && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <ShieldCheck className="w-3 h-3" />
                বেনামী
              </Badge>
            )}
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed mb-2">{feedback.text}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {feedback.anonymous ? 'বেনামী ব্যবহারকারী' : feedback.author}
            </span>
            <span className="text-xs text-muted-foreground">{feedback.date}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FeatureRequestCard({ request }: { request: typeof featureRequests[0] }) {
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(request.votes);

  const handleVote = () => {
    if (voted) {
      setVoteCount((c) => c - 1);
      setVoted(false);
    } else {
      setVoteCount((c) => c + 1);
      setVoted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.button
              onClick={handleVote}
              whileTap={{ scale: 0.85 }}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 ${
                voted
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
              aria-label={voted ? 'ভোট সরান' : 'ভোট দিন'}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-bold">{voteCount}</span>
            </motion.button>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground">{request.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{request.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Main Component ---

export default function FeedbackSection() {
  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>(defaultRecentFeedback);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch('/api/feedback?limit=20');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        // Merge API feedback with defaults, API feedback first
        setRecentFeedback([...data.data, ...defaultRecentFeedback.slice(0, 3)]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Keep default feedback on error
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const displayedFeedback = showAllFeedback ? recentFeedback : recentFeedback.slice(0, 3);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('অনুগ্রহ করে রেটিং দিন');
      return;
    }
    if (!selectedCategory) {
      toast.error('অনুগ্রহ করে ক্যাটাগরি নির্বাচন করুন');
      return;
    }
    if (!feedbackText.trim()) {
      toast.error('অনুগ্রহ করে আপনার মতামত লিখুন');
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryLabel = categories.find((c) => c.id === selectedCategory)?.label || selectedCategory;

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedCategory,
          subject: categoryLabel,
          rating,
          description: feedbackText.trim(),
          isAnonymous,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('আপনার মতামত সফলভাবে জমা হয়েছে! ধন্যবাদ।');

        // Add the new feedback to the list immediately
        const newFeedback: FeedbackItem = {
          id: data.data?.id || Date.now(),
          rating,
          category: categoryLabel,
          text: feedbackText.trim(),
          date: 'এইমাত্র',
          anonymous: isAnonymous,
          author: isAnonymous ? '' : 'আপনি',
        };

        setRecentFeedback((prev) => [newFeedback, ...prev]);

        // Reset form
        setRating(0);
        setSelectedCategory('');
        setFeedbackText('');
        setIsAnonymous(false);
      } else {
        toast.error(data.error || 'ফিডব্যাক জমা দিতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('ফিডব্যাক জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 mb-4">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">মতামত ও পরামর্শ</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-lg mx-auto">
          আপনার মতামত আমাদের কাছে মূল্যবান। প্ল্যাটফর্ম উন্নত করতে আপনার পরামর্শ দিন।
        </p>
      </motion.div>

      {/* Feedback Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-emerald-200 dark:border-emerald-800/50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              আপনার মতামত দিন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">রেটিং দিন</Label>
              <div className="flex items-center gap-3">
                <StarRating rating={rating} onRatingChange={setRating} interactive size="md" />
                {rating > 0 && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-muted-foreground"
                  >
                    {['', 'খারাপ', 'মোটামুটি', 'ভালো', 'খুব ভালো', 'অসাধারণ'][rating]}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">ক্যাটাগরি নির্বাচন করুন</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-accent text-muted-foreground border-border hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Feedback text */}
            <div className="space-y-2">
              <Label htmlFor="feedback-text" className="text-sm font-medium">বিস্তারিত মতামত</Label>
              <Textarea
                id="feedback-text"
                placeholder="আপনার মতামত বা পরামর্শ এখানে লিখুন..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-accent/50">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous-toggle" className="text-sm font-medium cursor-pointer">
                  বেনামী মতামত
                </Label>
                <p className="text-xs text-muted-foreground">আপনার পরিচয় গোপন রাখা হবে</p>
              </div>
              <Switch
                id="anonymous-toggle"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  জমা হচ্ছে...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  মতামত জমা দিন
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            সাম্প্রতিক মতামত
          </h2>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {recentFeedback.length}টি মতামত
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {displayedFeedback.map((fb) => (
              <FeedbackCard key={fb.id} feedback={fb} />
            ))}
          </AnimatePresence>
        </div>
        {recentFeedback.length > 3 && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllFeedback(!showAllFeedback)}
              className="gap-1.5"
            >
              {showAllFeedback ? (
                <>
                  কম দেখুন <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  আরও দেখুন <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Feature Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-emerald-600" />
            ফিচার অনুরোধ
          </h2>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {featureRequests.length}টি অনুরোধ
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {featureRequests.map((req) => (
              <FeatureRequestCard key={req.id} request={req} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
