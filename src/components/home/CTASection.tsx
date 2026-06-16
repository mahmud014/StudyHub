'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Bell, CheckCircle2, Shield, Lock, Award, Users, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ─── Animated Counter Hook ────────────────────────────────
function useAnimatedCounter(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);
  
  return count;
}

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Stats type ────────────────────────────────────────────
interface CTAStatItem {
  label: string;
  value: number;
  suffix: string;
  icon: React.ComponentType<{ className?: string }>;
}

const defaultStatsData: CTAStatItem[] = [
  { label: 'শিক্ষার্থী', value: 0, suffix: '+', icon: Users },
  { label: 'বিষয়', value: 0, suffix: 'টি', icon: BookOpen },
  { label: 'ভিডিও', value: 0, suffix: '+', icon: Award },
];

const trustBadges = [
  { icon: Shield, label: 'SSL সুরক্ষিত' },
  { icon: Lock, label: 'ভেরিফাইড' },
  { icon: Award, label: 'প্রশংসিত' },
];

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [startCounters, setStartCounters] = useState(false);
  const [statsData, setStatsData] = useState<CTAStatItem[]>(defaultStatsData);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setStatsData([
              { label: 'শিক্ষার্থী', value: json.data.students, suffix: '+', icon: Users },
              { label: 'বিষয়', value: json.data.subjects, suffix: 'টি', icon: BookOpen },
              { label: 'ভিডিও', value: json.data.videos, suffix: '+', icon: Award },
            ]);
          }
        }
      } catch {
        // Silently fail — use default fallback data
      }
    };
    fetchStats();
  }, []);

  const studentCount = useAnimatedCounter(statsData[0]?.value || 0, 2000, startCounters);
  const subjectCount = useAnimatedCounter(statsData[1]?.value || 0, 1500, startCounters);
  const videoCount = useAnimatedCounter(statsData[2]?.value || 0, 2000, startCounters);
  const counterValues = [studentCount, subjectCount, videoCount];

  // Intersection observer to start counters
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCounters(true);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('সঠিক ইমেইল দিন');
      return;
    }
    setSubscribed(true);
    toast.success('সাবস্ক্রিপশন সফল!');
    setEmail('');
  };

  return (
    <section ref={sectionRef} className="py-10 sm:py-14 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-emerald-500/5 to-teal-500/5 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large floating shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/5"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-teal-500/5"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 -right-4 w-20 h-20 rounded-lg bg-primary/5 rotate-12"
        />
        <motion.div
          animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-1/4 left-[10%] w-14 h-14 rounded-full bg-amber-500/5"
        />
        
        {/* Small floating dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/15"
            style={{
              left: `${15 + (i * 10) % 70}%`,
              top: `${20 + (i * 8) % 60}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Urgency badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4"
          >
            <Badge className="px-4 py-1.5 text-sm bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-badge-pulse gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              সীমিত সময়ের অফার!
            </Badge>
          </motion.div>

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            আপডেট পেতে সাবস্ক্রাইব করুন
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            নতুন কোর্স, পরীক্ষার তারিখ এবং বিশেষ অফার সরাসরি আপনার ইনবক্সে পান
          </p>

          {/* Stats counters */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 mb-6">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-2xl sm:text-3xl font-bold tabular-nums">
                      {toBengaliNum(counterValues[index])}{stat.suffix}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </motion.div>
              );
            })}
          </div>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-lg font-semibold">সাবস্ক্রিপশন সফল! ধন্যবাদ।</span>
            </motion.div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
              <div className="relative flex-1 w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="আপনার ইমেইল লিখুন"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  className="pl-10 h-12 border-primary/20 focus:border-primary/50"
                />
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="gap-2 h-12 px-8 w-full sm:w-auto animate-breathe-glow shadow-lg shadow-primary/20 relative overflow-hidden group"
                  onClick={handleSubscribe}
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    সাবস্ক্রাইব
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </motion.div>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6">
            {trustBadges.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <motion.div
                  key={badge.label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground/70 bg-muted/30 px-3 py-1.5 rounded-full border border-border/30"
                >
                  <BadgeIcon className="w-3.5 h-3.5 text-primary/60" />
                  {badge.label}
                </motion.div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground/60 mt-3">
            আমরা আপনার ইমেইল কারো সাথে শেয়ার করব না। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।
          </p>
        </motion.div>
      </div>
    </section>
  );
}
