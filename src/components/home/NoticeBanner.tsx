'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, AlertTriangle, Calendar, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Notice {
  id: string;
  title: string;
  titleBn: string;
  content: string;
  type: string;
  isActive: boolean;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  urgent: { icon: AlertTriangle, color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', label: 'জরুরি' },
  exam: { icon: Calendar, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'পরীক্ষা' },
  holiday: { icon: Info, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', label: 'ছুটি' },
  general: { icon: Megaphone, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'বিজ্ঞপ্তি' },
};

export default function NoticeBanner() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/notices')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setNotices(data.data.filter((n: Notice) => n.isActive));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % notices.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [notices.length]);

  if (notices.length === 0) return null;

  const notice = notices[currentIndex];
  const config = typeConfig[notice.type] || typeConfig.general;
  const Icon = config.icon;

  return (
    <div className="bg-card/80 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          key={notice.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 py-2.5"
        >
          <Badge variant="outline" className={`${config.color} shrink-0 gap-1 text-xs`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
          <p className="text-sm text-foreground/80 truncate">
            {notice.titleBn || notice.title}
          </p>
          {notices.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 ml-auto shrink-0">
              {notices.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
