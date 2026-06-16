'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Video, FileCheck, ClipboardList,
  MessageCircleQuestion, Trophy, ArrowRight, Radio, Shield, Zap, Bot,
  LucideIcon, Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  section: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  borderAccent: string;
  tag: string;
  hoverAnim: 'rotate' | 'scale' | 'bounce';
  isPopular: boolean;
  studentCount: number;
}

const features: Feature[] = [
  {
    icon: BookOpen,
    title: 'স্মার্ট নোটস',
    description: 'অধ্যায়ভিত্তিক হ্যান্ডনোট, সাজেশন এবং বিগত বছরের প্রশ্ন ও সমাধান পড়ুন ও ডাউনলোড করুন।',
    section: 'notes',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    gradientFrom: 'from-emerald-500/5',
    gradientTo: 'to-emerald-600/0',
    borderAccent: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30',
    tag: 'PDF ডাউনলোড',
    hoverAnim: 'scale',
    isPopular: true,
    studentCount: 482,
  },
  {
    icon: Video,
    title: 'ভিডিও লেকচার',
    description: 'বিষয় ও অধ্যায় অনুযায়ী প্লেলিস্ট আকারে সাজানো প্রিমিয়াম ভিডিও ক্লাস দেখুন।',
    section: 'videos',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    gradientFrom: 'from-rose-500/5',
    gradientTo: 'to-rose-600/0',
    borderAccent: 'hover:border-rose-500/40 dark:hover:border-rose-500/30',
    tag: '২০০+ ভিডিও',
    hoverAnim: 'bounce',
    isPopular: true,
    studentCount: 523,
  },
  {
    icon: Radio,
    title: 'লাইভ ক্লাস',
    description: 'Zoom বা Google Meet এর মাধ্যমে শিক্ষকের সাথে সরাসরি লাইভ ক্লাসে যুক্ত হন।',
    section: 'live',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
    gradientFrom: 'from-red-500/5',
    gradientTo: 'to-red-600/0',
    borderAccent: 'hover:border-red-500/40 dark:hover:border-red-500/30',
    tag: 'সাপ্তাহিক ৩-৪ ক্লাস',
    hoverAnim: 'rotate',
    isPopular: false,
    studentCount: 267,
  },
  {
    icon: FileCheck,
    title: 'অনলাইন পরীক্ষা',
    description: 'অধ্যায়ভিত্তিক MCQ পরীক্ষা দিন। সাথে সাথে অটোমেটিক রেজাল্ট ও ব্যাখ্যা দেখুন।',
    section: 'exams',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    gradientFrom: 'from-amber-500/5',
    gradientTo: 'to-amber-600/0',
    borderAccent: 'hover:border-amber-500/40 dark:hover:border-amber-500/30',
    tag: 'অটো গ্রেডিং',
    hoverAnim: 'scale',
    isPopular: true,
    studentCount: 389,
  },
  {
    icon: ClipboardList,
    title: 'অ্যাসাইনমেন্ট',
    description: 'বাড়ির কাজ বা অ্যাসাইনমেন্ট আপলোড করুন এবং শিক্ষকের মার্কস ও ফিডব্যাক পান।',
    section: 'assignments',
    color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    gradientFrom: 'from-sky-500/5',
    gradientTo: 'to-sky-600/0',
    borderAccent: 'hover:border-sky-500/40 dark:hover:border-sky-500/30',
    tag: 'ফিডব্যাক',
    hoverAnim: 'bounce',
    isPopular: false,
    studentCount: 198,
  },
  {
    icon: MessageCircleQuestion,
    title: 'প্রশ্নোত্তর ফোরাম',
    description: 'পড়াশোনা বিষয়ক যেকোনো সমস্যায় প্রশ্ন পোস্ট করুন। শিক্ষক ও সহপাঠীরা উত্তর দেবেন।',
    section: 'qa',
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    gradientFrom: 'from-violet-500/5',
    gradientTo: 'to-violet-600/0',
    borderAccent: 'hover:border-violet-500/40 dark:hover:border-violet-500/30',
    tag: '২৪/৭ সাপোর্ট',
    hoverAnim: 'rotate',
    isPopular: false,
    studentCount: 156,
  },
  {
    icon: Trophy,
    title: 'লিডারবোর্ড',
    description: 'প্রতি সপ্তাহের পরীক্ষায় ভালো করুন এবং টপ পারফর্মার হিসেবে তালিকায় স্থান পান।',
    section: 'leaderboard',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    gradientFrom: 'from-orange-500/5',
    gradientTo: 'to-orange-600/0',
    borderAccent: 'hover:border-orange-500/40 dark:hover:border-orange-500/30',
    tag: 'পুরস্কার',
    hoverAnim: 'bounce',
    isPopular: false,
    studentCount: 312,
  },
  {
    icon: Shield,
    title: 'কন্টেন্ট সুরক্ষা',
    description: 'ভিডিও ডাউনলোড প্রোটেকশন এবং PDF ভিউয়ারে ওয়াটারমার্ক যুক্ত করার ব্যবস্থা।',
    section: 'home',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    gradientFrom: 'from-teal-500/5',
    gradientTo: 'to-teal-600/0',
    borderAccent: 'hover:border-teal-500/40 dark:hover:border-teal-500/30',
    tag: 'নিরাপদ',
    hoverAnim: 'rotate',
    isPopular: false,
    studentCount: 478,
  },
  {
    icon: Zap,
    title: 'প্রোগ্রেস ট্র্যাকিং',
    description: 'আপনার পড়াশোনার অগ্রগতি প্রোগ্রেস বারের মাধ্যমে ট্র্যাক করুন এবং লক্ষ্য নির্ধারণ করুন।',
    section: 'dashboard',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    gradientFrom: 'from-cyan-500/5',
    gradientTo: 'to-cyan-600/0',
    borderAccent: 'hover:border-cyan-500/40 dark:hover:border-cyan-500/30',
    tag: 'স্বয়ংক্রিয়',
    hoverAnim: 'scale',
    isPopular: false,
    studentCount: 445,
  },
  {
    icon: Bot,
    title: 'AI শিক্ষক সহকারী',
    description: 'কৃত্রিম বুদ্ধিমত্তা চালিত শিক্ষক যেকোনো প্রশ্নের উত্তর দেবে সহজ বাংলায়। সব বিষয়ে সাহায্য পান।',
    section: 'ai-tutor',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    gradientFrom: 'from-teal-500/5',
    gradientTo: 'to-teal-600/0',
    borderAccent: 'hover:border-teal-500/40 dark:hover:border-teal-500/30',
    tag: 'AI চালিত',
    hoverAnim: 'bounce',
    isPopular: true,
    studentCount: 567,
  },
];

// Icon hover animation variants - enhanced
const iconAnimations = {
  rotate: {
    whileHover: { rotate: 15, scale: 1.15 },
    transition: { type: 'spring', stiffness: 300, damping: 15 },
  },
  scale: {
    whileHover: { scale: 1.25 },
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
  bounce: {
    whileHover: { y: -6, scale: 1.15 },
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
};

// Bengali numerals for feature numbers
const bengaliNumerals = ['০১', '০২', '০৩', '০৪', '০৫', '০৬', '০৭', '০৮', '০৯', '১০'];

// Bengali numeral helper
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

export default function FeaturesSection() {
  const { setActiveSection } = useStudyHub();

  return (
    <section className="py-10 sm:py-14 bg-muted/30 relative overflow-hidden">
      {/* Background decoration - enhanced */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
      
      {/* Connecting lines decoration (visible on lg+) */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-features" width="250" height="200" patternUnits="userSpaceOnUse">
              <path d="M 250 0 L 0 0 0 200" fill="none" stroke="oklch(0.508 0.165 160)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-features)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-10"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
            ✨ সম্পূর্ণ সলিউশন
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">আমাদের ফিচারসমূহ</h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            পড়াশোনার সকল প্রয়োজন একটি প্ল্যাটফর্মে — নোটস থেকে শুরু করে পরীক্ষা পর্যন্ত
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const animConfig = iconAnimations[feature.hoverAnim];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Card className={`h-full group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1.5 border-border/40 overflow-hidden relative ${feature.borderAccent}`}>
                  {/* Gradient background - enhanced */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Top gradient border effect */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/0 group-hover:via-emerald-500/40 to-transparent transition-all duration-500" />

                  {/* Feature number badge in top-right corner */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/30">
                      {bengaliNumerals[index]}
                    </span>
                  </div>

                  {/* "জনপ্রিয়" badge */}
                  {feature.isPopular && (
                    <div className="absolute top-3 left-3">
                      <Badge className="text-[9px] px-1.5 py-0 h-5 bg-emerald-500 text-white border-0 flex items-center gap-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        জনপ্রিয়
                      </Badge>
                    </div>
                  )}

                  <CardContent className={`p-4 lg:p-5 relative ${feature.isPopular ? 'pt-9' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <motion.div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} transition-shadow duration-300 group-hover:shadow-lg`}
                        whileHover={animConfig.whileHover}
                        transition={animConfig.transition}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                      <Badge variant="secondary" className="text-[10px] shrink-0 bg-background/80 border-border/50">
                        {feature.tag}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Student count */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-3">
                      <Users className="w-3 h-3" />
                      <span>{toBengaliNum(feature.studentCount)}+ শিক্ষার্থী ব্যবহার করছেন</span>
                    </div>

                    <motion.button
                      onClick={() => setActiveSection(feature.section)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 group/btn"
                      whileHover={{ x: 4 }}
                    >
                      আরও দেখুন
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
