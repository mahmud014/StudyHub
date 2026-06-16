'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, FlaskConical, Atom, Leaf, Globe, Monitor, GraduationCap, Languages, ChevronRight, Users, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

interface Subject {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  color: string;
  chapters: { id: string; name: string; nameBn: string }[];
}

const iconMap: Record<string, React.ElementType> = {
  'BookOpen': BookOpen,
  'Languages': Languages,
  'Calculator': Calculator,
  'Atom': Atom,
  'FlaskConical': FlaskConical,
  'Leaf': Leaf,
  'Monitor': Monitor,
  'Globe': Globe,
  'book-open': BookOpen,
  'calculator': Calculator,
  'flask': FlaskConical,
  'atom': Atom,
  'leaf': Leaf,
  'globe': Globe,
  'monitor': Monitor,
  'graduation-cap': GraduationCap,
};

// Map of icon names to accent color classes (Tailwind-safe)
const colorMap: Record<string, { bg: string; text: string; border: string; hoverBg: string; glow: string; ring: string }> = {
  'BookOpen': { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', border: 'hover:border-red-300 dark:hover:border-red-700', hoverBg: 'group-hover:bg-red-100 dark:group-hover:bg-red-900/40', glow: 'hover:shadow-red-500/15', ring: 'text-red-500' },
  'Languages': { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-600 dark:text-sky-400', border: 'hover:border-sky-300 dark:hover:border-sky-700', hoverBg: 'group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40', glow: 'hover:shadow-sky-500/15', ring: 'text-sky-500' },
  'Calculator': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'hover:border-emerald-300 dark:hover:border-emerald-700', hoverBg: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40', glow: 'hover:shadow-emerald-500/15', ring: 'text-emerald-500' },
  'Atom': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'hover:border-amber-300 dark:hover:border-amber-700', hoverBg: 'group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40', glow: 'hover:shadow-amber-500/15', ring: 'text-amber-500' },
  'FlaskConical': { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'hover:border-purple-300 dark:hover:border-purple-700', hoverBg: 'group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40', glow: 'hover:shadow-purple-500/15', ring: 'text-purple-500' },
  'Leaf': { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-600 dark:text-teal-400', border: 'hover:border-teal-300 dark:hover:border-teal-700', hoverBg: 'group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40', glow: 'hover:shadow-teal-500/15', ring: 'text-teal-500' },
  'Monitor': { bg: 'bg-slate-50 dark:bg-slate-950/30', text: 'text-slate-600 dark:text-slate-400', border: 'hover:border-slate-300 dark:hover:border-slate-700', hoverBg: 'group-hover:bg-slate-100 dark:group-hover:bg-slate-900/40', glow: 'hover:shadow-slate-500/15', ring: 'text-slate-500' },
  'Globe': { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-600 dark:text-pink-400', border: 'hover:border-pink-300 dark:hover:border-pink-700', hoverBg: 'group-hover:bg-pink-100 dark:group-hover:bg-pink-900/40', glow: 'hover:shadow-pink-500/15', ring: 'text-pink-500' },
};

const defaultColor = { bg: 'bg-primary/5', text: 'text-primary', border: 'hover:border-primary/30', hoverBg: 'group-hover:bg-primary/10', glow: 'hover:shadow-primary/15', ring: 'text-primary' };

// Mock data for subjects
const subjectMeta: Record<string, { isNew: boolean; studentCount: number; completion: number }> = {
  'BookOpen': { isNew: false, studentCount: 342, completion: 78 },
  'Languages': { isNew: false, studentCount: 289, completion: 65 },
  'Calculator': { isNew: true, studentCount: 456, completion: 72 },
  'Atom': { isNew: false, studentCount: 234, completion: 58 },
  'FlaskConical': { isNew: true, studentCount: 198, completion: 45 },
  'Leaf': { isNew: false, studentCount: 167, completion: 62 },
  'Monitor': { isNew: true, studentCount: 312, completion: 38 },
  'Globe': { isNew: false, studentCount: 278, completion: 70 },
};

// Bengali numeral helper
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// SVG Progress Ring Component
function ProgressRing({ progress, colorClass, size = 40, strokeWidth = 3 }: { progress: number; colorClass: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorClass}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-bold text-muted-foreground">{toBengaliNum(progress)}%</span>
      </div>
    </div>
  );
}

export default function SubjectGrid() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { setActiveSection, setSelectedSubject } = useStudyHub();

  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSubjects(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setActiveSection('subject-detail');
  };

  return (
    <section className="py-10 sm:py-14 bg-background relative">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/3 blur-3xl" />
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
            📚 ক্লাস ৯-১০
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">
            বিষয়সমূহ
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            জাতীয় শিক্ষাক্রম অনুযায়ী সকল বিষয়ের সম্পূর্ণ পড়াশোনা এখানে
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {subjects.map((subject, index) => {
            const Icon = iconMap[subject.icon] || BookOpen;
            const colors = colorMap[subject.icon] || defaultColor;
            const chapterCount = subject.chapters?.length || 0;
            const meta = subjectMeta[subject.icon] || { isNew: false, studentCount: Math.floor(100 + Math.random() * 300), completion: Math.floor(30 + Math.random() * 60) };

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Card
                  className={`cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${colors.glow} border-border/40 ${colors.border} overflow-hidden relative hover:border-2`}
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  {/* Gradient border glow on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg`} style={{
                    boxShadow: `inset 0 0 0 1px oklch(0.508 0.165 160 / 0.15), 0 8px 32px -8px oklch(0.508 0.165 160 / 0.1)`,
                  }} />

                  {/* "নতুন" badge */}
                  {meta.isNew && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="text-[9px] px-1.5 py-0 h-5 bg-emerald-500 text-white border-0 animate-badge-pulse flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        নতুন
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-3 sm:p-4 lg:p-4">
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${colors.bg} ${colors.hoverBg}`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base mb-0.5 truncate">
                          {subject.nameBn}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {chapterCount} টি অধ্যায়
                        </p>
                      </div>
                    </div>

                    {/* Student count & Progress ring */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{toBengaliNum(meta.studentCount)} জন শিক্ষার্থী</span>
                      </div>
                      <ProgressRing progress={meta.completion} colorClass={colors.ring} size={36} strokeWidth={3} />
                    </div>

                    {/* Chapter preview pills */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {subject.chapters?.slice(0, 2).map((ch) => (
                        <span key={ch.id} className="inline-flex items-center text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground truncate max-w-[100px]">
                          {ch.nameBn}
                        </span>
                      ))}
                      {chapterCount > 2 && (
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                          +{chapterCount - 2}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <span>পড়াশোনা শুরু করুন</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
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
