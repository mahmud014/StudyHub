'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Video, MessageCircle, Phone, Mail, MapPin,
  Heart, ArrowUp, ExternalLink, Send, Facebook, Youtube, Instagram,
  Shield, Star, Users, Zap, Clock, Smartphone, Monitor, CheckCircle,
  Award, TrendingUp, Sparkles, ChevronUp, Loader2, Globe, QrCode,
  Building2, Library, CalendarDays, HeadphonesIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Static Data ──────────────────────────────────────────────────────────────

const quickLinks = [
  { label: 'স্মার্ট নোটস', section: 'notes', icon: BookOpen },
  { label: 'ভিডিও ক্লাস', section: 'videos', icon: Video },
  { label: 'অনলাইন পরীক্ষা', section: 'exams', icon: Shield },
  { label: 'অ্যাসাইনমেন্ট', section: 'assignments', icon: Clock },
  { label: 'প্রশ্নোত্তর ফোরাম', section: 'qa', icon: MessageCircle },
  { label: 'লাইভ ক্লাস', section: 'live', icon: Zap },
];

const subjects = [
  'বাংলা', 'ইংরেজি', 'গণিত', 'পদার্থবিজ্ঞান',
  'রসায়ন', 'জীববিজ্ঞান', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'বাংলাদেশ ও বিশ্বপরিচয়',
];

const resources = [
  { label: 'প্রাইসিং প্ল্যান', section: 'home' },
  { label: 'FAQ', section: 'home' },
  { label: 'শর্তাবলী', section: 'home' },
  { label: 'গোপনীয়তা নীতি', section: 'home' },
  { label: 'যোগাযোগ', section: 'home' },
];

const socialLinks = [
  { icon: Facebook, label: 'ফেসবুক', href: '#', brandColor: '#1877F2' },
  { icon: Youtube, label: 'ইউটিউব', href: '#', brandColor: '#FF0000' },
  { icon: Instagram, label: 'ইনস্টাগ্রাম', href: '#', brandColor: '#E4405F' },
  { icon: MessageCircle, label: 'হোয়াটসঅ্যাপ', href: '#', brandColor: '#25D366' },
  { icon: Mail, label: 'ইমেইল', href: '#', brandColor: '#F59E0B' },
];

const defaultStats = [
  { icon: Users, value: 0, suffix: '+', label: 'শিক্ষার্থী', key: 'students' as const },
  { icon: BookOpen, value: 0, suffix: '+', label: 'নোটস', key: 'notes' as const },
  { icon: Video, value: 0, suffix: '+', label: 'ভিডিও', key: 'videos' as const },
  { icon: Star, value: 4.8, suffix: '', label: 'রেটিং', isDecimal: true, key: null },
];

interface StatsData {
  students: number;
  videos: number;
  notes: number;
  exams: number;
  teachers: number;
  subjects: number;
  satisfaction: number;
}

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const currentYear = new Date().getFullYear();
const bengaliYear = String(currentYear).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);

function toBengali(num: number): string {
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Skeleton loader for stats ───
function StatsSkeleton() {
  return (
    <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-emerald-500/10 animate-pulse" />
          <div className="h-8 w-20 mx-auto rounded bg-emerald-500/10 animate-pulse mb-1" />
          <div className="h-3 w-14 mx-auto rounded bg-emerald-500/5 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── Animated Counter Component ───
function AnimatedCounter({ value, suffix, isDecimal }: { value: number; suffix: string; isDecimal?: boolean }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal ? parseFloat((eased * value).toFixed(1)) : Math.floor(eased * value);
      setCount(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasAnimated, value, isDecimal]);

  return (
    <motion.span
      onViewportEnter={() => { if (!hasAnimated) setHasAnimated(true); }}
      viewport={{ once: true }}
      className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent"
    >
      {isDecimal ? toBengali(parseFloat(count.toFixed(1))) : toBengali(count)}{suffix}
    </motion.span>
  );
}

// ─── Floating Particles Component ───
function FloatingParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.12 + 0.04,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Confetti Particles for newsletter ───
function ConfettiCelebration() {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => {
    const colors = ['#10B981', '#14B8A6', '#059669', '#34D399', '#6EE7B7', '#F59E0B', '#3B82F6', '#EF4444'];
    return {
      id: i,
      color: colors[i % colors.length],
      x: Math.random() * 200 - 100,
      y: -(Math.random() * 120 + 40),
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.4,
      size: Math.random() * 6 + 3,
      delay: Math.random() * 0.3,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
          }}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: piece.x,
            y: piece.y,
            scale: piece.scale,
            rotate: piece.rotation,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.2,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Scroll Progress Ring for Back-to-Top ───
function ScrollProgressRing({ scrollProgress }: { scrollProgress: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 52 52">
      <circle
        cx="26" cy="26" r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-emerald-500/20"
      />
      <motion.circle
        cx="26" cy="26" r={radius}
        fill="none"
        stroke="url(#footerProgressGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="footerProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── QR Code Placeholder Component ───
function QRCodePlaceholder() {
  return (
    <div className="relative w-24 h-24 rounded-xl overflow-hidden" style={{
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
    }}>
      {/* Simplified QR pattern */}
      <div className="absolute inset-2 grid grid-cols-7 grid-rows-7 gap-[1px]">
        {Array.from({ length: 49 }).map((_, i) => {
          const row = Math.floor(i / 7);
          const col = i % 7;
          const isCorner = (row < 3 && col < 3) || (row < 3 && col > 4) || (row > 4 && col < 3);
          const isCenter = row === 3 && col === 3;
          const isRandom = Math.random() > 0.45;
          const filled = isCorner || isCenter || isRandom;
          return (
            <div
              key={i}
              className={`rounded-[0.5px] ${filled ? 'bg-emerald-800' : 'bg-white'}`}
            />
          );
        })}
      </div>
      {/* Center logo overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    </div>
  );
}

// ─── Glass Card Wrapper ───
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'rgba(16, 185, 129, 0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(16, 185, 129, 0.08)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Section Heading ───
function SectionHeading({ children, accent = 'emerald' }: { children: React.ReactNode; accent?: 'emerald' | 'teal' }) {
  const gradientClass = accent === 'teal'
    ? 'from-teal-400 to-emerald-600'
    : 'from-emerald-400 to-emerald-600';
  return (
    <h3 className="font-semibold text-sm uppercase tracking-wider text-emerald-100/50 flex items-center gap-2 mb-5">
      <div className={`w-1 h-5 bg-gradient-to-b ${gradientClass} rounded-full`} />
      {children}
    </h3>
  );
}

// ─── Main Footer Component ───
export default function Footer() {
  const { setActiveSection } = useStudyHub();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch('/api/stats');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setStatsData(json.data);
          }
        }
      } catch {
        // Silently fail — footer stats are non-critical
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Build stats array from API data or defaults
  const displayStats = statsData
    ? [
        { icon: Users, value: statsData.students, suffix: '+', label: 'শিক্ষার্থী' },
        { icon: BookOpen, value: statsData.notes, suffix: '+', label: 'নোটস' },
        { icon: Video, value: statsData.videos, suffix: '+', label: 'ভিডিও' },
        { icon: Star, value: 4.8, suffix: '', label: 'রেটিং', isDecimal: true },
      ]
    : defaultStats;

  // Build trust badges from API data - now includes শিক্ষক and বিষয়
  const trustedBy = statsData
    ? [
        { icon: Users, value: `${toBengali(statsData.students)}+`, label: 'শিক্ষার্থী' },
        { icon: Award, value: `${toBengali(statsData.teachers)}+`, label: 'শিক্ষক' },
        { icon: BookOpen, value: `${toBengali(statsData.subjects)}+`, label: 'বিষয়' },
        { icon: TrendingUp, value: `${toBengali(statsData.satisfaction)}%`, label: 'সন্তুষ্টির হার' },
      ]
    : [
        { icon: Users, value: '৫,০০০+', label: 'শিক্ষার্থী' },
        { icon: Award, value: '৫০+', label: 'শিক্ষক' },
        { icon: BookOpen, value: '৮+', label: 'বিষয়' },
        { icon: TrendingUp, value: '৯৮%', label: 'সন্তুষ্টির হার' },
      ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartBeat(true);
      setTimeout(() => setHeartBeat(false), 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#070d0a]">
      {/* ═══════════════════════════════════════════ */}
      {/* GRADIENT MESH BACKGROUND                     */}
      {/* ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Mesh gradient blobs - enhanced */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #14B8A6 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #34D399 0%, transparent 70%)' }}
        />
        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(rgba(16,185,129,0.5) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Diagonal line pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              rgba(16,185,129,0.3) 40px,
              rgba(16,185,129,0.3) 41px
            )`,
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* FLOATING PARTICLES                           */}
      {/* ═══════════════════════════════════════════ */}
      <FloatingParticles />

      {/* ═══════════════════════════════════════════ */}
      {/* TOP GRADIENT ACCENT BAR - More prominent     */}
      {/* ═══════════════════════════════════════════ */}
      <div className="relative h-1.5">
        {/* Glow underneath */}
        <div
          className="absolute -bottom-4 inset-x-0 h-8 opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent, #10B98140, #14B8A640, #10B98140, transparent)',
            filter: 'blur(8px)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, #10B981, #14B8A6, #10B981, transparent)',
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #059669, #10B981, #14B8A6, #34D399, #10B981, #059669)',
            backgroundSize: '300% 100%',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* FLOATING BACK-TO-TOP WITH PROGRESS RING      */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center group cursor-pointer"
            aria-label="উপরে যান"
          >
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-500 blur-md" />
            {/* Progress ring */}
            <ScrollProgressRing scrollProgress={scrollProgress} />
            {/* Button inner */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-xl group-hover:shadow-emerald-500/50 transition-all duration-300">
              <ArrowUp className="w-4.5 h-4.5 text-white" />
              {/* Scroll percentage indicator */}
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-emerald-400/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {toBengali(Math.round(scrollProgress))}%
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════ */}
      {/* PREMIUM STATS BANNER WITH GLASS-MORPHISM     */}
      {/* ═══════════════════════════════════════════ */}
      <div className="relative border-b border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Glass card wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl p-8 sm:p-10 overflow-hidden"
            style={{
              background: 'rgba(16, 185, 129, 0.04)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
            }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/8 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-teal-500/8 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/3 blur-3xl" />
            </div>

            {/* Section title */}
            <div className="text-center mb-8 relative">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/30 font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                আমাদের অর্জন
                <Sparkles className="w-3.5 h-3.5" />
              </motion.p>
            </div>

            {statsLoading ? (
              <StatsSkeleton />
            ) : (
              <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
                {displayStats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.5 }}
                      className="text-center relative group"
                    >
                      <motion.div
                        className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/10 flex items-center justify-center group-hover:border-emerald-500/30 group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className="w-6 h-6 text-emerald-400" />
                      </motion.div>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} isDecimal={stat.isDecimal} />
                      <p className="text-xs text-emerald-200/35 mt-1.5 font-medium">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TRUSTED BY SECTION - Enhanced with 4 items   */}
      {/* ═══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-5"
        >
          <span className="text-[11px] text-emerald-300/30 uppercase tracking-[0.15em] font-semibold flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            বিশ্বস্ততা ও সাফল্য
          </span>
          <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            {trustedBy.map((item, i) => {
              const TrustedIcon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 cursor-default"
                  style={{
                    background: 'rgba(16, 185, 129, 0.04)',
                    border: '1px solid rgba(16, 185, 129, 0.08)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                    <TrustedIcon className="w-4 h-4 text-emerald-400/70" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-300/60">{item.value}</p>
                    <p className="text-[10px] text-emerald-300/30">{item.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MAIN FOOTER CONTENT - Enhanced Layout        */}
      {/* ═══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* ─── About & Newsletter (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25"
                whileHover={{ rotate: 10, scale: 1.05 }}
              >
                <GraduationCap className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  স্টাডি হাব
                </span>
                <p className="text-[10px] text-emerald-300/30 -mt-0.5 tracking-wider">স্মার্ট লার্নিং প্ল্যাটফর্ম</p>
              </div>
            </div>
            <p className="text-sm text-emerald-100/30 leading-relaxed">
              ক্লাস ৯-১০ এর শিক্ষার্থীদের জন্য একটি সম্পূর্ণ অনলাইন লার্নিং প্ল্যাটফর্ম।
              অভিজ্ঞ শিক্ষকের তত্ত্বাবধানে ঘরে বসেই সেরা পড়াশোনা।
            </p>

            {/* ═══ App download with QR ═══ */}
            <GlassCard className="p-5">
              <h4 className="text-sm font-semibold text-emerald-100/50 flex items-center gap-1.5 mb-4">
                <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
                <Smartphone className="w-3.5 h-3.5 text-emerald-400/60" />
                অ্যাপ ডাউনলোড করুন
              </h4>
              <div className="flex items-center gap-4">
                {/* QR Code */}
                <div className="shrink-0 hidden sm:block">
                  <QRCodePlaceholder />
                </div>
                {/* App store buttons */}
                <div className="flex flex-col gap-2 flex-1">
                  {[
                    { icon: Smartphone, label: 'GET IT ON', name: 'Google Play', gradient: 'from-emerald-600/20 to-teal-600/20' },
                    { icon: Monitor, label: 'DOWNLOAD ON', name: 'App Store', gradient: 'from-teal-600/20 to-emerald-600/20' },
                  ].map((app) => {
                    const AppIcon = app.icon;
                    return (
                      <motion.button
                        key={app.name}
                        whileHover={{ scale: 1.03, x: 2 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group w-full"
                        style={{
                          background: 'rgba(16, 185, 129, 0.06)',
                          border: '1px solid rgba(16, 185, 129, 0.12)',
                        }}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center border border-emerald-500/10 group-hover:border-emerald-500/25 transition-colors`}>
                          <AppIcon className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <div className="text-left">
                          <p className="text-[8px] text-emerald-300/25 leading-tight uppercase tracking-wider">{app.label}</p>
                          <p className="text-xs font-semibold text-emerald-100/50 leading-tight group-hover:text-emerald-100/70 transition-colors">{app.name}</p>
                        </div>
                        <ArrowUp className="w-3 h-3 text-emerald-400/0 group-hover:text-emerald-400/50 ml-auto rotate-45 transition-all" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <p className="text-[9px] text-emerald-300/20 mt-3 text-center">স্ক্যান করুন অ্যাপ ডাউনলোড করতে</p>
            </GlassCard>

            {/* ═══ Newsletter - Prominent gradient background ═══ */}
            <div className="relative rounded-2xl overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/8 to-emerald-600/5" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.06) 50%, rgba(5,150,105,0.08) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
              }} />
              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-20" style={{
                background: 'radial-gradient(circle at 100% 0%, rgba(16,185,129,0.3), transparent 70%)',
              }} />
              <div className="absolute bottom-0 left-0 w-20 h-20 opacity-20" style={{
                background: 'radial-gradient(circle at 0% 100%, rgba(20,184,166,0.3), transparent 70%)',
              }} />

              <div className="relative p-5 space-y-3">
                <h4 className="text-sm font-semibold text-emerald-100/60 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-emerald-400/70" />
                  </div>
                  <div>
                    <span className="block">নিউজলেটার সাবস্ক্রাইব</span>
                    <span className="block text-[9px] text-emerald-300/30 font-normal">সর্বশেষ আপডেট পেতে</span>
                  </div>
                </h4>
                <form onSubmit={handleSubscribe} className="relative">
                  <div
                    className="flex items-center gap-0 rounded-xl overflow-hidden transition-all duration-300 focus-within:shadow-lg focus-within:shadow-emerald-500/10 focus-within:border-emerald-500/20"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(16, 185, 129, 0.12)',
                    }}
                  >
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400/30 pointer-events-none" />
                      <Input
                        type="email"
                        placeholder="আপনার ইমেইল লিখুন..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 pl-9 pr-2 text-sm bg-transparent border-0 text-emerald-100/60 placeholder:text-emerald-300/20 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="m-1 h-9 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all rounded-lg shrink-0 gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">সাবস্ক্রাইব</span>
                    </Button>
                  </div>
                </form>
                <AnimatePresence>
                  {subscribed && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="relative overflow-visible"
                    >
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </motion.div>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-xs text-emerald-400 font-medium"
                        >
                          সফলভাবে সাবস্ক্রাইব হয়েছে!
                        </motion.span>
                      </div>
                      <ConfettiCelebration />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Premium Social Links - Brand color hover effects */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social, i) => {
                const SocialIcon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.2, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    className="group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{
                      background: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                    }}
                    aria-label={social.label}
                  >
                    {/* Brand color hover bg */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                      style={{ background: `${social.brandColor}15` }}
                    />
                    {/* Brand color glow effect */}
                    <div
                      className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 rounded-xl"
                      style={{ background: `${social.brandColor}20` }}
                    />
                    {/* Brand color border on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                      style={{ border: `1px solid ${social.brandColor}40` }}
                    />
                    <SocialIcon
                      className="w-4 h-4 text-emerald-300/40 relative z-10 transition-colors duration-300"
                      onMouseEnter={(e) => { (e.target as SVGElement).style.color = social.brandColor; }}
                      onMouseLeave={(e) => { (e.target as SVGElement).style.color = ''; }}
                    />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* ─── Quick Links (2 cols) ─── */}
          <div className="lg:col-span-2">
            <SectionHeading>দ্রুত লিংক</SectionHeading>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => {
                const LinkIcon = link.icon;
                return (
                  <li key={link.label}>
                    <motion.span
                      whileHover={{ x: 6 }}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="text-sm text-emerald-100/30 hover:text-emerald-400 transition-colors duration-300 cursor-pointer flex items-center gap-3 group py-1"
                      onClick={() => { setActiveSection(link.section); scrollToTop(); }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/15 group-hover:border-emerald-500/25 group-hover:shadow-sm group-hover:shadow-emerald-500/10 transition-all duration-300">
                        <LinkIcon className="w-3 h-3 text-emerald-500/40 group-hover:text-emerald-400 transition-colors duration-300" />
                      </div>
                      {link.label}
                      <ArrowUp className="w-2.5 h-2.5 text-emerald-400/0 group-hover:text-emerald-400/50 ml-auto rotate-45 transition-all duration-300" />
                    </motion.span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ─── Subjects (3 cols) ─── */}
          <div className="lg:col-span-3">
            <SectionHeading accent="teal">বিষয়সমূহ</SectionHeading>
            <ul className="space-y-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
              {subjects.map((subject, i) => (
                <li key={subject}>
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ x: 4 }}
                    className="text-sm text-emerald-100/30 hover:text-emerald-400 transition-colors duration-300 cursor-pointer flex items-center gap-2 group py-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-400 group-hover:shadow-sm group-hover:shadow-emerald-400/50 transition-all duration-300 shrink-0" />
                    {subject}
                  </motion.span>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── প্রতিষ্ঠানের তথ্য + Resources + Contact (3 cols) ─── */}
          <div className="lg:col-span-3 space-y-6">
            {/* প্রতিষ্ঠানের তথ্য - Institution Info */}
            <div>
              <SectionHeading>প্রতিষ্ঠানের তথ্য</SectionHeading>
              <GlassCard className="p-4 space-y-3">
                {[
                  { icon: Building2, label: 'প্রতিষ্ঠান', value: 'স্টাডি হাব একাডেমি' },
                  { icon: Library, label: 'প্রতিষ্ঠার বছর', value: '২০২০' },
                  { icon: CalendarDays, label: 'কার্যক্রম', value: 'ক্লাস ৯-১০' },
                  { icon: Globe, label: 'অনুমোদন', value: 'জাতীয় শিক্ষাক্রম' },
                  { icon: HeadphonesIcon, label: 'সাপোর্ট', value: '২৪/৭ অনলাইন' },
                ].map((info, i) => {
                  const InfoIcon = info.icon;
                  return (
                    <motion.div
                      key={info.label}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 group cursor-default"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/15 group-hover:border-emerald-500/20 transition-all duration-300">
                        <InfoIcon className="w-3.5 h-3.5 text-emerald-400/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-emerald-300/25 leading-tight">{info.label}</p>
                        <p className="text-xs text-emerald-100/45 font-medium leading-tight group-hover:text-emerald-100/60 transition-colors">{info.value}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </GlassCard>
            </div>

            {/* Resources */}
            <div>
              <SectionHeading>রিসোর্স</SectionHeading>
              <ul className="space-y-2.5">
                {resources.map((resource, i) => (
                  <li key={resource.label}>
                    <motion.span
                      whileHover={{ x: 4 }}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="text-sm text-emerald-100/30 hover:text-emerald-400 transition-colors duration-300 cursor-pointer flex items-center gap-2 group py-0.5"
                      onClick={() => { setActiveSection(resource.section); scrollToTop(); }}
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-500/25 group-hover:text-emerald-400 transition-colors duration-300" />
                      {resource.label}
                    </motion.span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact glass card */}
            <div>
              <SectionHeading>যোগাযোগ</SectionHeading>
              <GlassCard className="p-4 space-y-3">
                {[
                  { icon: Phone, text: '+৮৮০ ১৭০০-০০০০০০', sublabel: 'কল করুন' },
                  { icon: Mail, text: 'info@studyhub.com.bd', sublabel: 'ইমেইল করুন' },
                  { icon: MapPin, text: 'ঢাকা, বাংলাদেশ', sublabel: 'ঠিকানা' },
                ].map((contact, i) => {
                  const ContactIcon = contact.icon;
                  return (
                    <motion.div
                      key={contact.text}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 2 }}
                      className="flex items-center gap-3 text-sm text-emerald-100/30 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/15 group-hover:border-emerald-500/20 group-hover:shadow-sm group-hover:shadow-emerald-500/10 transition-all duration-300">
                        <ContactIcon className="w-3.5 h-3.5 text-emerald-400/60" />
                      </div>
                      <div>
                        <p className="text-[9px] text-emerald-300/25 leading-tight">{contact.sublabel}</p>
                        <p className="text-xs font-medium group-hover:text-emerald-400/70 transition-colors duration-300">{contact.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </GlassCard>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-emerald-300/25">পেমেন্ট:</span>
              <Badge className="text-[9px] px-2 py-0.5 bg-pink-500/10 text-pink-400/60 border border-pink-500/10 hover:bg-pink-500/15 transition-colors">
                বিকাশ
              </Badge>
              <Badge className="text-[9px] px-2 py-0.5 bg-orange-500/10 text-orange-400/60 border border-orange-500/10 hover:bg-orange-500/15 transition-colors">
                নগদ
              </Badge>
              <Badge className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400/60 border border-blue-500/10 hover:bg-blue-500/15 transition-colors">
                রকেট
              </Badge>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* PREMIUM GRADIENT SEPARATOR                   */}
        {/* ═══════════════════════════════════════════ */}
        <div className="my-10 relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
          <motion.div
            className="absolute top-0 h-full w-32 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* BOTTOM BAR - Deep dark background            */}
        {/* ═══════════════════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(16, 185, 129, 0.06)',
          backdropFilter: 'blur(20px)',
        }}>
          <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-emerald-100/20 flex items-center gap-1.5 text-sm"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                © {bengaliYear} স্টাডি হাব। সর্বস্বত্ব সংরক্ষিত।
              </motion.p>
              <span className="hidden sm:inline text-emerald-500/15">•</span>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-1.5 text-emerald-100/20 text-sm"
              >
                নির্মিত
                <motion.span
                  animate={heartBeat ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="inline-flex"
                >
                  <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                </motion.span>
                দ্বারা
                <span className="text-emerald-400/40 font-medium">এমডি. শুকুর মাহমুদ</span>
              </motion.p>
            </div>
            <div className="flex items-center gap-4 text-xs text-emerald-100/20">
              {['শর্তাবলী', 'গোপনীয়তা', 'কুকিজ'].map((item) => (
                <motion.span
                  key={item}
                  whileHover={{ color: '#34D399', y: -1 }}
                  className="hover:text-emerald-400/50 cursor-pointer transition-colors duration-300"
                >
                  {item}
                </motion.span>
              ))}
              {/* Back to top button in copyright section */}
              <motion.button
                onClick={scrollToTop}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-emerald-400/30 hover:text-emerald-400/60 transition-colors duration-300 cursor-pointer"
                aria-label="উপরে যান"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span className="text-[10px]">উপরে যান</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* BOTTOM GRADIENT FADE EDGE - Enhanced         */}
      {/* ═══════════════════════════════════════════ */}
      <div className="absolute bottom-0 inset-x-0 h-1.5">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-500/20 to-emerald-600/10" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, #10B98130, #14B8A630, #10B98130, transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </footer>
  );
}
