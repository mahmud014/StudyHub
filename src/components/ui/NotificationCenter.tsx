'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle, ClipboardCheck, Megaphone,
  Radio, Trophy, CreditCard, Check, CheckCheck,
  ExternalLink
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Notification Types ──────────────────────────────────────────────────────

type NotificationType =
  | 'exam_result'
  | 'assignment_feedback'
  | 'notice'
  | 'live_class'
  | 'achievement'
  | 'subscription';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  linkSection?: string;
}

const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, {
  label: string;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  darkAccentBg: string;
}> = {
  exam_result: {
    label: 'পরীক্ষা ফলাফল',
    icon: CheckCircle,
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-l-emerald-500',
    darkAccentBg: 'dark:bg-emerald-950/40',
  },
  assignment_feedback: {
    label: 'অ্যাসাইনমেন্ট ফিডব্যাক',
    icon: ClipboardCheck,
    accentColor: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-l-amber-500',
    darkAccentBg: 'dark:bg-amber-950/40',
  },
  notice: {
    label: 'নোটিস',
    icon: Megaphone,
    accentColor: 'text-sky-600 dark:text-sky-400',
    accentBg: 'bg-sky-50',
    accentBorder: 'border-l-sky-500',
    darkAccentBg: 'dark:bg-sky-950/40',
  },
  live_class: {
    label: 'লাইভ ক্লাস রিমাইন্ডার',
    icon: Radio,
    accentColor: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-50',
    accentBorder: 'border-l-rose-500',
    darkAccentBg: 'dark:bg-rose-950/40',
  },
  achievement: {
    label: 'সাফল্য',
    icon: Trophy,
    accentColor: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-50',
    accentBorder: 'border-l-violet-500',
    darkAccentBg: 'dark:bg-violet-950/40',
  },
  subscription: {
    label: 'সাবস্ক্রিপশন',
    icon: CreditCard,
    accentColor: 'text-primary',
    accentBg: 'bg-primary/5',
    accentBorder: 'border-l-primary',
    darkAccentBg: 'dark:bg-primary/10',
  },
};

// ─── Bengali Number Conversion ───────────────────────────────────────────────

function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

function getBengaliTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'এইমাত্র';
  if (diffMin < 60) return `${toBengaliNum(diffMin)} মিনিট আগে`;
  if (diffHr < 24) return `${toBengaliNum(diffHr)} ঘণ্টা আগে`;
  if (diffDay < 7) return `${toBengaliNum(diffDay)} দিন আগে`;
  if (diffWeek < 4) return `${toBengaliNum(diffWeek)} সপ্তাহ আগে`;

  // Format as Bengali date
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  return `${toBengaliNum(date.getDate())} ${months[date.getMonth()]} ${toBengaliNum(date.getFullYear())}`;
}

// ─── Mock Notifications ──────────────────────────────────────────────────────

function generateMockNotifications(): Notification[] {
  const now = new Date();
  return [
    {
      id: 'n1',
      type: 'exam_result',
      title: 'গণিত পরীক্ষার ফলাফল প্রকাশ',
      message: 'আপনার তৃতীয় অধ্যায় পরীক্ষায় ৮৫% নম্বর এসেছে। অভিনন্দন!',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 min ago
      read: false,
      linkSection: 'exams',
    },
    {
      id: 'n2',
      type: 'live_class',
      title: 'লাইভ ক্লাস ১৫ মিনিটে শুরু',
      message: 'রসায়ন - পরমাণুর গঠন বিষয়ে স্যার করিমের লাইভ ক্লাস শীঘ্রই শুরু হবে।',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
      read: false,
      linkSection: 'live',
    },
    {
      id: 'n3',
      type: 'assignment_feedback',
      title: 'ইংরেজি অ্যাসাইনমেন্ট মূল্যায়ন',
      message: 'আপনার অ্যাসাইনমেন্টে A+ গ্রেড পেয়েছেন। চমৎকার কাজ!',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hr ago
      read: false,
      linkSection: 'assignments',
    },
    {
      id: 'n4',
      type: 'achievement',
      title: 'নতুন ব্যাজ অর্জন! 🏆',
      message: 'আপনি "৭ দিনের স্ট্রিক" ব্যাজ অর্জন করেছেন। চালিয়ে যান!',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hr ago
      read: false,
      linkSection: 'dashboard',
    },
    {
      id: 'n5',
      type: 'notice',
      title: 'বার্ষিক পরীক্ষার রুটিন প্রকাশ',
      message: '২০২৫ সালের বার্ষিক পরীক্ষার রুটিন প্রকাশ করা হয়েছে। বিস্তারিত দেখুন।',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hr ago
      read: true,
      linkSection: 'home',
    },
    {
      id: 'n6',
      type: 'subscription',
      title: 'প্রিমিয়াম প্ল্যানে আপগ্রেড করুন',
      message: 'আজই প্রিমিয়ামে আপগ্রেড করুন এবং সকল লাইভ ক্লাস ও নোটস আনলক করুন!',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hr ago
      read: false,
      linkSection: 'dashboard',
    },
    {
      id: 'n7',
      type: 'exam_result',
      title: 'বিজ্ঞান মডেল টেস্ট ফলাফল',
      message: 'মডেল টেস্টে আপনার স্কোর ৭২/১০০। উন্নতির সুযোগ আছে।',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      linkSection: 'exams',
    },
    {
      id: 'n8',
      type: 'live_class',
      title: 'আজকের লাইভ ক্লাস শেষ',
      message: 'বাংলা - সনেট কবিতা বিষয়ে ক্লাস সম্পন্ন হয়েছে। রেকর্ডিং দেখুন।',
      timestamp: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
      read: true,
      linkSection: 'videos',
    },
    {
      id: 'n9',
      type: 'assignment_feedback',
      title: 'গণিত অ্যাসাইনমেন্ট জমা দিন',
      message: 'আপনার গণিত অ্যাসাইনমেন্ট জমা দেওয়ার শেষ সময় আগামীকাল।',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      linkSection: 'assignments',
    },
    {
      id: 'n10',
      type: 'notice',
      title: 'স্কুল ছুটির নোটিশ',
      message: 'আগামী শুক্রবার ও শনিবার স্কুল ছুটি থাকবে। সকল শিক্ষার্থীদের জানানো হচ্ছে।',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      linkSection: 'home',
    },
  ];
}

// ─── Single Notification Item ────────────────────────────────────────────────

function NotificationItem({
  notification,
  onMarkRead,
  onClick,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}) {
  const config = NOTIFICATION_TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className={`
        group relative flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer
        border-l-[3px] ${config.accentBorder}
        transition-all duration-200
        ${notification.read
          ? 'bg-transparent hover:bg-muted/50'
          : `${config.accentBg} ${config.darkAccentBg} hover:opacity-90`
        }
      `}
      onClick={() => onClick(notification)}
    >
      {/* Type Icon */}
      <div className={`
        mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${notification.read ? 'bg-muted' : `${config.accentBg} ${config.darkAccentBg}`}
      `}>
        <Icon className={`w-4 h-4 ${notification.read ? 'text-muted-foreground' : config.accentColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight ${
            notification.read ? 'text-muted-foreground' : 'text-foreground'
          }`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <p className={`text-xs mt-0.5 line-clamp-2 ${
          notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'
        }`}>
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground/60">
            {getBengaliTimeAgo(notification.timestamp)}
          </span>
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium"
            >
              <Check className="w-3 h-3" />
              পড়ুন
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <Bell className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">কোনো নোটিফিকেশন নেই</p>
      <p className="text-xs text-muted-foreground/60 mt-1">নতুন নোটিফিকেশন এলে এখানে দেখাবে</p>
    </motion.div>
  );
}

// ─── Main NotificationCenter Component ───────────────────────────────────────

export default function NotificationCenter() {
  const { user, setActiveSection } = useStudyHub();
  const [notifications, setNotifications] = useState<Notification[]>(generateMockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
      if (notification.linkSection) {
        setActiveSection(notification.linkSection);
        setOpen(false);
      }
    },
    [markAsRead, setActiveSection]
  );

  const handleViewAll = useCallback(() => {
    setActiveSection('dashboard');
    setOpen(false);
  }, [setActiveSection]);

  // Only render when user is logged in
  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative hover:bg-primary/10 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/30"
            >
              {toBengaliNum(unreadCount)}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 rounded-xl border shadow-xl overflow-hidden
          bg-background/80 dark:bg-background/80
          backdrop-blur-xl
          border-border/60"
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">নোটিফিকেশন</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                    {toBengaliNum(unreadCount)} নতুন
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  সব পড়ুন
                </button>
              )}
            </div>

            {/* Notification List */}
            {notifications.length === 0 ? (
              <EmptyState />
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="p-2 space-y-1">
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markAsRead}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}

            {/* Footer */}
            <Separator />
            <div className="px-3 py-2.5 bg-muted/20">
              <button
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/5"
              >
                সব দেখুন
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
