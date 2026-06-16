'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Video, FileCheck, ArrowRight, Sparkles, Users, Star, Shield, Zap, Radio, Clock, Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

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

// ─── Bengali Numeral Helper ────────────────────────────────
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Typing Animation Hook ────────────────────────────────
function useTypingEffect(text: string, speed: number = 40, startDelay: number = 800) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return { displayedText, isComplete, hasStarted };
}

const stats = [
  { label: 'শিক্ষার্থী', value: 500, suffix: '+', icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
  { label: 'ভিডিও', value: 200, suffix: '+', icon: Video, color: 'text-rose-500 bg-rose-500/10' },
  { label: 'নোটস', value: 300, suffix: '+', icon: BookOpen, color: 'text-amber-500 bg-amber-500/10' },
  { label: 'পরীক্ষা', value: 100, suffix: '+', icon: FileCheck, color: 'text-sky-500 bg-sky-500/10' },
];

const trustBadges = [
  { icon: Shield, text: 'অভিজ্ঞ শিক্ষক' },
  { icon: Star, text: 'জাতীয় শিক্ষাক্রম' },
  { icon: GraduationCap, text: 'ফলাফল গ্যারান্টি' },
];

const features = [
  { icon: BookOpen, label: 'স্মার্ট নোটস', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { icon: Video, label: 'ভিডিও লেকচার', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { icon: FileCheck, label: 'MCQ পরীক্ষা', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { icon: Radio, label: 'লাইভ ক্লাস', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { icon: Bot, label: 'AI শিক্ষক', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { icon: Zap, label: 'দৈনিক চ্যালেঞ্জ', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
];

export default function HeroSection() {
  const { setActiveSection, user } = useStudyHub();
  const mountedRef = useRef(false);
  const [startCounters, setStartCounters] = useState(false);
  const studentCount = useAnimatedCounter(523, 2000, startCounters);
  const videoCount = useAnimatedCounter(247, 2000, startCounters);
  const notesCount = useAnimatedCounter(312, 2000, startCounters);
  const examCount = useAnimatedCounter(156, 2000, startCounters);

  const animatedValues = [studentCount, videoCount, notesCount, examCount];

  // Typing effect for subtitle
  const subtitleText = 'স্টাডি হাবে ক্লাস ৯-১০ এর সকল বিষয়ের নোটস, ভিডিও লেকচার, অনলাইন পরীক্ষা এবং অভিজ্ঞ শিক্ষকের সরাসরি সাপোর্ট পান।';
  const { displayedText, isComplete } = useTypingEffect(subtitleText, 30, 1200);

  // Scroll indicator
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const handleScroll = useCallback(() => {
    setShowScrollIndicator(window.scrollY < 100);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      requestAnimationFrame(() => {
        setStartCounters(true);
      });
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* ─── Animated gradient mesh background ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient mesh - overlapping radial gradients */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, oklch(0.508 0.165 160 / 0.06) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 30%, oklch(0.55 0.12 145 / 0.05) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 50% 80%, oklch(0.45 0.10 170 / 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 70% 60%, oklch(0.508 0.08 155 / 0.03) 0%, transparent 50%)
          `,
        }} />
        
        {/* Morphing blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 animate-morph" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/5 animate-morph" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-emerald-400/5 animate-morph" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-teal-400/5 animate-morph" style={{ animationDelay: '6s' }} />
        
        {/* Animated particle/dot field */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-primary/20 animate-float"
            style={{
              width: `${2 + (i % 3) * 2}px`,
              height: `${2 + (i % 3) * 2}px`,
              left: `${5 + (i * 4.7) % 90}%`,
              top: `${8 + (i * 7.3) % 84}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          />
        ))}
        
        {/* Additional larger floating dots for depth */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute rounded-full bg-emerald-500/10 animate-float"
            style={{
              width: `${6 + (i % 2) * 4}px`,
              height: `${6 + (i % 2) * 4}px`,
              left: `${10 + (i * 15) % 80}%`,
              top: `${20 + (i * 12) % 60}%`,
              animationDelay: `${1 + i * 0.8}s`,
              animationDuration: `${5 + (i % 2) * 2}s`,
            }}
          />
        ))}
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(oklch(0.508 0.165 160 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(0.508 0.165 160 / 1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        
        {/* Radial gradient for depth */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, oklch(0.99 0.002 155 / 0.3) 100%)',
        }} />

        {/* Decorative floating shapes - CSS only */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[15%] right-[8%] w-20 h-20 border border-emerald-500/10 rounded-lg"
          style={{ transform: 'rotate(45deg)' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[20%] left-[5%] w-16 h-16 border border-teal-500/10 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[60%] right-[15%] w-8 h-8 bg-emerald-500/5 rounded-md"
          style={{ transform: 'rotate(30deg)' }}
        />
        {/* Triangle shape */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[25%] left-[12%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-emerald-500/8"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Live indicator badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                এখন ৫৩ জন শিক্ষার্থী অনলাইনে
              </Badge>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4" />
                ক্লাস ৯-১০ এর সেরা লার্নিং প্ল্যাটফর্ম
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
            >
              {'শিক্ষার আলো, '}
              <span className="text-gradient animate-gradient-text" style={{
                backgroundSize: '200% auto',
                backgroundImage: 'linear-gradient(135deg, oklch(0.508 0.165 160), oklch(0.55 0.15 145), oklch(0.6 0.14 170), oklch(0.508 0.165 160))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                সাফল্যের পথে
              </span>
            </motion.h1>

            {/* Subtitle with typing animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 lg:mt-5 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl"
            >
              <span>{displayedText}</span>
              {!isComplete && (
                <span className="inline-block w-0.5 h-6 bg-primary ml-0.5 animate-blink align-middle" />
              )}
            </motion.div>

            {/* Feature chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.span
                    key={feature.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${feature.color} border border-current/10`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {feature.label}
                  </motion.span>
                );
              })}
            </motion.div>

            {/* CTA Buttons - Enhanced with larger size and better hover effects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-start gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="gap-2 text-lg px-10 py-7 animate-breathe-glow shadow-lg shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 group relative overflow-hidden"
                  onClick={() => setActiveSection(user ? 'dashboard' : 'notes')}
                >
                  {/* Shine effect on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {user ? 'ড্যাশবোর্ড দেখুন' : 'শিক্ষার্থী লগইন'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-lg px-10 py-7 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group border-2"
                  onClick={() => setActiveSection('notes')}
                >
                  <BookOpen className="w-5 h-5 group-hover:text-primary transition-colors" />
                  কোর্স দেখুন
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
            >
              {trustBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.text} className="flex items-center gap-2 animated-underline cursor-pointer">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{badge.text}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Right: Stats & Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main visual card */}
              <div className="rounded-3xl bg-card/80 backdrop-blur-sm border shadow-2xl shadow-primary/10 p-6 card-hover tilt-3d">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        className="text-center p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${stat.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold tabular-nums">
                          {toBengaliNum(animatedValues[index])}{stat.suffix}
                        </p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Progress preview */}
                <div className="mt-4 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">সাপ্তাহিক অগ্রগতি</span>
                    <span className="text-sm text-primary font-semibold">৭৫%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 animate-gradient"
                      style={{ backgroundSize: '200% 100%' }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>বাংলা ✓ ইংরেজি ✓ গণিত ✓</span>
                    <span>৫/৮ বিষয়</span>
                  </div>
                </div>

                {/* Mini activity feed */}
                <div className="mt-3 space-y-1.5">
                  {[
                    { text: 'রাফি গণিত পরীক্ষায় ৯২% পেয়েছে', time: '২ মিনিট আগে' },
                    { text: 'ফাতেমা পদার্থবিজ্ঞান নোটস পড়ছে', time: '৫ মিনিট আগে' },
                  ].map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + i * 0.2 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-muted/20"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="truncate flex-1">{activity.text}</span>
                      <span className="text-[10px] shrink-0">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating elements - enhanced with more decorative shapes */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg"
              >
                <span className="text-3xl">🏆</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg"
              >
                <span className="text-2xl">📚</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-1/2 -right-8 w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-md"
              >
                <span className="text-lg">🎯</span>
              </motion.div>
              {/* Additional floating shapes */}
              <motion.div
                animate={{ y: [0, -8, 0], x: [0, 3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -top-8 left-1/4 w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/15 flex items-center justify-center"
              >
                <span className="text-sm">✨</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-1/3 -left-6 w-8 h-8 rounded-lg bg-primary/10 border border-primary/15"
              />
            </div>
          </motion.div>
        </div>

        {/* Mobile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center p-4 rounded-2xl bg-card border shadow-sm card-hover">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl sm:text-2xl font-bold tabular-nums">
                  {toBengaliNum(animatedValues[index])}{stat.suffix}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* ─── Scroll-down indicator ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollIndicator ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
      >
        <span className="text-xs text-muted-foreground/60 font-medium">নিচে স্ক্রল করুন</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-primary/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
