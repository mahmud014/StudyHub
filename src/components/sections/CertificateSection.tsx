'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, GraduationCap, BookOpen, Star, Download, Eye,
  Trash2, ChevronRight, Sparkles, CheckCircle, Clock,
  Users, FileCheck, Calendar, PenTool, ShieldCheck, Copy,
  Printer, X, Medal, Crown, Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// ─── Helper Functions ────────────────────────────────────────────────────────

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

function generateCertificateId(): string {
  const prefix = 'SH';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

function formatDateBengali(date: Date): string {
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  return `${toBengaliNum(date.getDate())} ${months[date.getMonth()]} ${toBengaliNum(date.getFullYear())}`;
}

function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

// ─── Types ───────────────────────────────────────────────────────────────────

type CertificateType = 'completion' | 'performance' | 'attendance';

interface CertificateData {
  id: string;
  certificateId: string;
  type: CertificateType;
  studentName: string;
  subject: string;
  grade: string;
  score: string;
  completionDate: string;
  createdAt: string;
}

interface SubjectOption {
  id: string;
  nameBn: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CERTIFICATE_TYPES: {
  type: CertificateType;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  bgAccent: string;
}[] = [
  {
    type: 'completion',
    title: 'কোর্স সমাপনী সার্টিফিকেট',
    description: 'কোনো বিষয়ের সম্পূর্ণ কোর্স শেষ করলে এই সার্টিফিকেট প্রদান করা হয়',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-emerald-700',
    bgAccent: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    type: 'performance',
    title: 'শ্রেষ্ঠ পারফরম্যান্স সার্টিফিকেট',
    description: 'পরীক্ষায় শ্রেষ্ঠ ফলাফল অর্জন করলে এই সার্টিফিকেট প্রদান করা হয়',
    icon: Trophy,
    gradient: 'from-amber-500 to-amber-700',
    bgAccent: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    type: 'attendance',
    title: 'নিয়মিত উপস্থিতি সার্টিফিকেট',
    description: 'নিয়মিত ক্লাসে উপস্থিতির জন্য এই সার্টিফিকেট প্রদান করা হয়',
    icon: Clock,
    gradient: 'from-teal-500 to-teal-700',
    bgAccent: 'bg-teal-50 dark:bg-teal-950/30',
  },
];

const GRADES = ['A+', 'A', 'A-', 'B', 'B-', 'C', 'D'];

const STORAGE_KEY = 'studyhub_certificates';

// ─── Ornamental Border SVG ──────────────────────────────────────────────────

function OrnamentalBorder() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 800 560"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="792" height="552" rx="8" stroke="url(#borderGrad)" strokeWidth="3" />
      <rect x="14" y="14" width="772" height="532" rx="4" stroke="url(#borderGrad)" strokeWidth="1.5" />
      <path d="M30 30 Q30 50 50 50 Q30 50 30 70" stroke="#D4AF37" strokeWidth="2" fill="none" />
      <circle cx="30" cy="30" r="4" fill="#D4AF37" />
      <path d="M770 30 Q770 50 750 50 Q770 50 770 70" stroke="#D4AF37" strokeWidth="2" fill="none" />
      <circle cx="770" cy="30" r="4" fill="#D4AF37" />
      <path d="M30 530 Q30 510 50 510 Q30 510 30 490" stroke="#D4AF37" strokeWidth="2" fill="none" />
      <circle cx="30" cy="530" r="4" fill="#D4AF37" />
      <path d="M770 530 Q770 510 750 510 Q770 510 770 490" stroke="#D4AF37" strokeWidth="2" fill="none" />
      <circle cx="770" cy="530" r="4" fill="#D4AF37" />
      <path d="M380 18 L400 8 L420 18" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
      <circle cx="400" cy="8" r="3" fill="#D4AF37" />
      <path d="M380 542 L400 552 L420 542" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
      <circle cx="400" cy="552" r="3" fill="#D4AF37" />
      <line x1="18" y1="100" x2="18" y2="460" stroke="url(#borderGrad)" strokeWidth="0.5" strokeDasharray="4 8" />
      <line x1="782" y1="100" x2="782" y2="460" stroke="url(#borderGrad)" strokeWidth="0.5" strokeDasharray="4 8" />
      <defs>
        <linearGradient id="borderGrad" x1="0" y1="0" x2="800" y2="560">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="30%" stopColor="#047857" />
          <stop offset="70%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Watermark Pattern ──────────────────────────────────────────────────────

function WatermarkOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 30px,
          currentColor 30px,
          currentColor 31px
        )`,
      }}
    />
  );
}

// ─── Certificate Preview Component ──────────────────────────────────────────

function CertificatePreview({
  data,
  showOrnament = true,
  subjectList,
}: {
  data: CertificateData;
  showOrnament?: boolean;
  subjectList: SubjectOption[];
}) {
  const typeInfo = CERTIFICATE_TYPES.find((t) => t.type === data.type);
  const subjectObj = subjectList.find((s) => s.id === data.subject);
  const typeName = typeInfo?.title || 'সার্টিফিকেট';
  const subjectName = subjectObj?.nameBn || data.subject;

  return (
    <div
      className="relative w-full aspect-[800/560] bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/40 dark:via-gray-900 dark:to-amber-950/30 rounded-lg overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl"
    >
      {showOrnament && <OrnamentalBorder />}
      <WatermarkOverlay />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 sm:p-10 text-center">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 leading-tight">স্টাডি হাব</h3>
            <p className="text-[8px] sm:text-[10px] text-emerald-600 dark:text-emerald-400">Study Hub - ক্লাস ৯-১০</p>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-[9px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">প্রত্যয়নপত্র</p>
          <h2 className="text-sm sm:text-xl font-bold text-emerald-900 dark:text-emerald-100 mt-0.5 leading-tight">
            {typeName}
          </h2>
          <div className="w-20 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-1.5" />
        </div>

        <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">এতদ্বারা প্রত্যয়ন করা যাচ্ছে যে</p>
        <h3 className="text-base sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-1" style={{ fontFamily: 'serif' }}>
          {data.studentName}
        </h3>
        <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">
          বিষয়ে <span className="font-semibold text-emerald-700 dark:text-emerald-300">{subjectName}</span>
          {data.type === 'completion' && ' কোর্স সফলভাবে সমাপন করেছেন'}
          {data.type === 'performance' && 'এ শ্রেষ্ঠ পারফরম্যান্স দেখিয়েছেন'}
          {data.type === 'attendance' && 'এ নিয়মিত উপস্থিতি প্রমাণ করেছেন'}
        </p>

        <div className="flex items-center gap-3 mt-2">
          {data.grade && (
            <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700">
              <span className="text-[9px] sm:text-xs text-emerald-600 dark:text-emerald-400">গ্রেড:</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 ml-1">{data.grade}</span>
            </div>
          )}
          {data.score && (
            <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700">
              <span className="text-[9px] sm:text-xs text-amber-600 dark:text-amber-400">নম্বর:</span>
              <span className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-200 ml-1">{toBengaliNum(data.score)}</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between w-full mt-auto pt-3">
          <div className="text-left">
            <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">প্রদানের তারিখ</p>
            <p className="text-[9px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300">{data.completionDate}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center mb-1">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500/70" />
            </div>
            <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">পরিচালক</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">সার্টিফিকেট আইডি</p>
            <p className="text-[9px] sm:text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300">{data.certificateId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Full Certificate HTML for Download ──────────────────────────────────────

function generateCertificateHTML(data: CertificateData, subjectList: SubjectOption[]): string {
  const typeInfo = CERTIFICATE_TYPES.find((t) => t.type === data.type);
  const subjectObj = subjectList.find((s) => s.id === data.subject);
  const typeName = typeInfo?.title || 'সার্টিফিকেট';
  const subjectName = subjectObj?.nameBn || data.subject;

  const typeEmoji = data.type === 'completion' ? '📖' : data.type === 'performance' ? '🏆' : '⏰';

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${typeName} - স্টাডি হাব</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Noto Sans Bengali', sans-serif;
    background: #f0fdf4;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }
  .certificate {
    width: 800px;
    height: 560px;
    background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 40%, #fffbeb 100%);
    border: 3px solid #D4AF37;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0,0,0,0.15);
  }
  .inner-border {
    position: absolute;
    inset: 10px;
    border: 1.5px solid #047857;
    border-radius: 6px;
    pointer-events: none;
  }
  .outer-ornament {
    position: absolute;
    inset: 3px;
    border: 2px solid transparent;
    border-image: linear-gradient(135deg, #D4AF37, #047857, #D4AF37, #047857) 1;
    border-radius: 8px;
    pointer-events: none;
  }
  .watermark {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background: repeating-linear-gradient(45deg, transparent, transparent 30px, #047857 30px, #047857 31px);
    pointer-events: none;
  }
  .corner {
    position: absolute;
    width: 40px;
    height: 40px;
  }
  .corner-tl { top: 16px; left: 16px; border-top: 2px solid #D4AF37; border-left: 2px solid #D4AF37; }
  .corner-tr { top: 16px; right: 16px; border-top: 2px solid #D4AF37; border-right: 2px solid #D4AF37; }
  .corner-bl { bottom: 16px; left: 16px; border-bottom: 2px solid #D4AF37; border-left: 2px solid #D4AF37; }
  .corner-br { bottom: 16px; right: 16px; border-bottom: 2px solid #D4AF37; border-right: 2px solid #D4AF37; }
  .corner::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #D4AF37;
  }
  .corner-tl::after { top: -4px; left: -4px; }
  .corner-tr::after { top: -4px; right: -4px; }
  .corner-bl::after { bottom: -4px; left: -4px; }
  .corner-br::after { bottom: -4px; right: -4px; }
  .content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px 60px;
    text-align: center;
  }
  .logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .logo-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #059669, #047857);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  }
  .logo-text { text-align: left; }
  .logo-text h3 { font-size: 14px; font-weight: 700; color: #065f46; line-height: 1.2; }
  .logo-text p { font-size: 10px; color: #059669; }
  .subtitle {
    font-size: 11px;
    color: #059669;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    color: #064e3b;
    margin-bottom: 4px;
  }
  .divider {
    width: 140px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    margin: 8px auto 16px;
  }
  .body-text { font-size: 12px; color: #4b5563; margin-bottom: 4px; }
  .student-name {
    font-size: 28px;
    font-weight: 800;
    color: #065f46;
    margin: 4px 0 6px;
    font-family: serif;
  }
  .detail-text { font-size: 12px; color: #4b5563; }
  .detail-text .highlight { font-weight: 600; color: #047857; }
  .badges {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }
  .badge {
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge-grade {
    background: #d1fae5;
    border: 1px solid #6ee7b7;
    color: #065f46;
  }
  .badge-score {
    background: #fef3c7;
    border: 1px solid #fcd34d;
    color: #92400e;
  }
  .footer-area {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    margin-top: auto;
    padding-top: 16px;
  }
  .footer-section { text-align: center; }
  .footer-label { font-size: 9px; color: #9ca3af; margin-bottom: 2px; }
  .footer-value { font-size: 11px; font-weight: 600; color: #047857; }
  .seal {
    width: 56px;
    height: 56px;
    border: 2px dashed #D4AF37;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 2px;
    opacity: 0.7;
  }
  .footer-section.right { text-align: right; }
  @media print {
    body { background: white; padding: 0; }
    .certificate { box-shadow: none; }
  }
</style>
</head>
<body>
<div class="certificate">
  <div class="outer-ornament"></div>
  <div class="inner-border"></div>
  <div class="watermark"></div>
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>
  <div class="content">
    <div class="logo-area">
      <div class="logo-icon">🎓</div>
      <div class="logo-text">
        <h3>স্টাডি হাব</h3>
        <p>Study Hub - ক্লাস ৯-১০</p>
      </div>
    </div>
    <p class="subtitle">প্রত্যয়নপত্র</p>
    <h2 class="title">${typeName}</h2>
    <div class="divider"></div>
    <p class="body-text">এতদ্বারা প্রত্যয়ন করা যাচ্ছে যে</p>
    <h3 class="student-name">${data.studentName}</h3>
    <p class="detail-text">
      বিষয়ে <span class="highlight">${subjectName}</span>
      ${data.type === 'completion' ? 'কোর্স সফলভাবে সমাপন করেছেন' : ''}
      ${data.type === 'performance' ? 'এ শ্রেষ্ঠ পারফরম্যান্স দেখিয়েছেন' : ''}
      ${data.type === 'attendance' ? 'এ নিয়মিত উপস্থিতি প্রমাণ করেছেন' : ''}
    </p>
    <div class="badges">
      ${data.grade ? `<div class="badge badge-grade">গ্রেড: ${data.grade}</div>` : ''}
      ${data.score ? `<div class="badge badge-score">নম্বর: ${toBengaliNum(data.score)}</div>` : ''}
    </div>
    <div class="footer-area">
      <div class="footer-section">
        <p class="footer-label">প্রদানের তারিখ</p>
        <p class="footer-value">${data.completionDate}</p>
      </div>
      <div class="footer-section">
        <div class="seal">${typeEmoji}</div>
        <p class="footer-label">পরিচালক</p>
      </div>
      <div class="footer-section right">
        <p class="footer-label">সার্টিফিকেট আইডি</p>
        <p class="footer-value" style="font-family: monospace;">${data.certificateId}</p>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CertificateSection() {
  const { user } = useStudyHub();
  const [activeTab, setActiveTab] = useState('earned');
  const [selectedType, setSelectedType] = useState<CertificateType>('completion');
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [score, setScore] = useState('');
  const [completionDate, setCompletionDate] = useState(formatDateBengali(new Date()));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<CertificateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const certPreviewRef = useRef<HTMLDivElement>(null);

  // Subjects from API
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  // Certificates from exam results
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  // Manually created certificates
  const [manualCertificates, setManualCertificates] = useState<CertificateData[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(true);

  // Pre-fill student name from user
  useEffect(() => {
    if (user?.name && !studentName) {
      requestAnimationFrame(() => setStudentName(user.name));
    }
  }, [user, studentName]);

  // Fetch subjects from API
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch('/api/subjects');
        const json = await res.json();
        if (json.success && json.data) {
          setSubjects(json.data.map((s: { id: string; nameBn: string }) => ({ id: s.id, nameBn: s.nameBn })));
        }
      } catch {}
    }
    fetchSubjects();
  }, []);

  // Fetch exam history and generate certificates
  useEffect(() => {
    async function fetchExamHistory() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/exams/history?userId=${user.id}`);
        const json = await res.json();
        if (json.success && json.data?.history) {
          // Generate certificates from exam results with score >= 80%
          const earnedCerts: CertificateData[] = json.data.history
            .filter((exam: { percentage: number }) => exam.percentage >= 80)
            .map((exam: { id: string; examTitle: string; subject: string; percentage: number; obtainedMarks: number; totalMarks: number; dateTaken: string; grade: string }, idx: number) => {
              const certType: CertificateType = exam.percentage >= 90 ? 'performance' : 'completion';
              return {
                id: `cert-${exam.id}`,
                certificateId: `SH-${new Date(exam.dateTaken).getFullYear()}-${(idx + 1).toString().padStart(4, '0')}`,
                type: certType,
                studentName: user?.name || 'ছাত্র/ছাত্রী',
                subject: exam.subject,
                grade: exam.grade || getGrade(exam.percentage),
                score: `${toBengaliNum(exam.obtainedMarks)}/${toBengaliNum(exam.totalMarks)}`,
                completionDate: formatDateBengali(new Date(exam.dateTaken)),
                createdAt: exam.dateTaken,
              };
            });
          setCertificates(earnedCerts);
        }
      } catch (error) {
        console.error('Failed to fetch exam history:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchExamHistory();
  }, [user]);

  // Save manual certificates to localStorage
  const saveManualCertificates = useCallback((certs: CertificateData[]) => {
    setManualCertificates(certs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
    } catch {}
  }, []);

  // All certificates combined (earned + manual)
  const allCertificates = [...certificates, ...manualCertificates];

  // Generate manual certificate
  const handleGenerate = useCallback(() => {
    if (!studentName.trim()) {
      toast.error('ছাত্র/ছাত্রীর নাম দিন');
      return;
    }
    if (!subject) {
      toast.error('বিষয় নির্বাচন করুন');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const certData: CertificateData = {
        id: Date.now().toString(),
        certificateId: generateCertificateId(),
        type: selectedType,
        studentName: studentName.trim(),
        subject,
        grade,
        score,
        completionDate,
        createdAt: new Date().toISOString(),
      };

      const updated = [certData, ...manualCertificates];
      saveManualCertificates(updated);
      setIsGenerating(false);
      setPreviewCert(certData);
      setPreviewOpen(true);
      toast.success('সার্টিফিকেট তৈরি হয়েছে!');
    }, 800);
  }, [studentName, subject, selectedType, grade, score, completionDate, manualCertificates, saveManualCertificates]);

  // Download certificate
  const handleDownload = useCallback((cert: CertificateData) => {
    const html = generateCertificateHTML(cert, subjects);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${cert.certificateId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('সার্টিফিকেট ডাউনলোড হচ্ছে');
  }, [subjects]);

  // Print certificate
  const handlePrint = useCallback((cert: CertificateData) => {
    const html = generateCertificateHTML(cert, subjects);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    toast.success('প্রিন্ট উইন্ডো খোলা হয়েছে');
  }, [subjects]);

  // Delete certificate (only manual ones)
  const handleDelete = useCallback((id: string) => {
    const updated = manualCertificates.filter((c) => c.id !== id);
    saveManualCertificates(updated);
    toast.success('সার্টিফিকেট মুছে ফেলা হয়েছে');
  }, [manualCertificates, saveManualCertificates]);

  // Current preview data (live)
  const livePreviewData: CertificateData = {
    id: 'preview',
    certificateId: generateCertificateId(),
    type: selectedType,
    studentName: studentName || 'ছাত্র/ছাত্রীর নাম',
    subject: subject || (subjects[0]?.id || 'bangla'),
    grade: grade || 'A+',
    score: score || '৮৫',
    completionDate,
    createdAt: new Date().toISOString(),
  };

  // ─── Animations ─────────────────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-3 px-4 py-1.5 text-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            সার্টিফিকেট সেন্টার
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
            আমার সার্টিফিকেট
          </h1>
          <p className="mt-2 text-muted-foreground text-lg max-w-2xl mx-auto">
            পরীক্ষায় ভালো ফলাফলের স্বীকৃতি হিসেবে সার্টিফিকেট অর্জন করুন ও ডাউনলোড করুন
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-emerald-100/60 dark:bg-emerald-900/30 p-1">
              <TabsTrigger value="earned" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 sm:px-6">
                <Trophy className="w-4 h-4 mr-1.5 hidden sm:inline" />
                অর্জিত সার্টিফিকেট
                {certificates.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 text-[10px] px-1.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                    {toBengaliNum(certificates.length)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="create" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 sm:px-6">
                <Sparkles className="w-4 h-4 mr-1.5 hidden sm:inline" />
                তৈরি করুন
              </TabsTrigger>
              <TabsTrigger value="my-certificates" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 sm:px-6">
                <FileCheck className="w-4 h-4 mr-1.5 hidden sm:inline" />
                ম্যানুয়াল
                {manualCertificates.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 text-[10px] px-1.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                    {toBengaliNum(manualCertificates.length)}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Earned Certificates Tab ──────────────────────────────────── */}
          <TabsContent value="earned">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {loading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-1 bg-emerald-200 dark:bg-emerald-800" />
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-2/3" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : certificates.length === 0 ? (
                <Card className="border-dashed border-2 border-emerald-200 dark:border-emerald-800">
                  <CardContent className="py-16 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, type: 'spring' }}
                    >
                      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-10 h-10 text-amber-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                        এখনো কোনো সার্টিফিকেট অর্জন হয়নি
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        পরীক্ষায় ৮০% বা তার বেশি নম্বর পেলে স্বয়ংক্রিয়ভাবে সার্টিফিকেট অর্জিত হবে।
                      </p>
                      <p className="text-muted-foreground text-xs">
                        পরীক্ষায় অংশগ্রহণ করুন এবং ভালো ফলাফল অর্জন করুন!
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Stats bar */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1">
                      <FileCheck className="w-3 h-3 mr-1" />
                        মোট: {toBengaliNum(certificates.length)} টি
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-3 py-1">
                      <Trophy className="w-3 mr-1" />
                      শ্রেষ্ঠ: {toBengaliNum(certificates.filter((c) => c.type === 'performance').length)}
                    </Badge>
                    <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1">
                      <BookOpen className="w-3 mr-1" />
                      সমাপনী: {toBengaliNum(certificates.filter((c) => c.type === 'completion').length)}
                    </Badge>
                  </div>

                  {/* Certificate list */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {certificates.map((cert, idx) => {
                      const typeInfo = CERTIFICATE_TYPES.find((t) => t.type === cert.type);
                      const Icon = typeInfo?.icon || Award;

                      return (
                        <motion.div
                          key={cert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <Card className="group border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200/20 dark:hover:shadow-emerald-900/20 transition-all duration-300 overflow-hidden">
                            <div className={`h-1 bg-gradient-to-r ${typeInfo?.gradient || 'from-emerald-500 to-emerald-700'}`} />
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeInfo?.gradient || 'from-emerald-500 to-emerald-700'} flex items-center justify-center shrink-0 shadow-md`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">{cert.studentName}</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {cert.subject}
                                    {cert.grade && <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-medium">• গ্রেড: {cert.grade}</span>}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    নম্বর: {cert.score} • {cert.completionDate}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{cert.certificateId}</p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  onClick={() => {
                                    setPreviewCert(cert);
                                    setPreviewOpen(true);
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                  দেখুন
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  onClick={() => handleDownload(cert)}
                                >
                                  <Download className="w-3 h-3" />
                                  ডাউনলোড
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  onClick={() => handlePrint(cert)}
                                >
                                  <Printer className="w-3 h-3" />
                                  প্রিন্ট
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ── Create Tab ──────────────────────────────────────────────── */}
          <TabsContent value="create">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid lg:grid-cols-2 gap-6"
            >
              {/* Left: Form */}
              <motion.div variants={itemVariants} className="space-y-5">
                {/* Certificate Type Selection */}
                <Card className="border-emerald-200/60 dark:border-emerald-800/40 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Medal className="w-4 h-4 text-emerald-600" />
                      সার্টিফিকেটের ধরন নির্বাচন করুন
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {CERTIFICATE_TYPES.map((ct) => {
                      const Icon = ct.icon;
                      const isSelected = selectedType === ct.type;
                      return (
                        <motion.button
                          key={ct.type}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedType(ct.type)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-300 group ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30'
                              : 'border-border/50 hover:border-emerald-300 dark:hover:border-emerald-700 bg-card'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? `bg-gradient-to-br ${ct.gradient} text-white shadow-md`
                                : `${ct.bgAccent} text-muted-foreground`
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold text-sm ${isSelected ? 'text-emerald-800 dark:text-emerald-200' : ''}`}>
                                  {ct.title}
                                </h4>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                  >
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{ct.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Form Fields */}
                <Card className="border-emerald-200/60 dark:border-emerald-800/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-emerald-600" />
                      সার্টিফিকেটের তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="studentName" className="text-sm">ছাত্র/ছাত্রীর নাম</Label>
                      <Input
                        id="studentName"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="নাম লিখুন"
                        className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">বিষয়</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="w-full border-emerald-200 dark:border-emerald-800">
                          <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.nameBn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">গ্রেড</Label>
                        <Select value={grade} onValueChange={setGrade}>
                          <SelectTrigger className="w-full border-emerald-200 dark:border-emerald-800">
                            <SelectValue placeholder="গ্রেড" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADES.map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="score" className="text-sm">নম্বর</Label>
                        <Input
                          id="score"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          placeholder="নম্বর লিখুন"
                          className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="completionDate" className="text-sm">সমাপনের তারিখ</Label>
                      <Input
                        id="completionDate"
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                        placeholder="তারিখ লিখুন"
                        className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30"
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-600/25 h-11 text-base font-semibold gap-2"
                    >
                      {isGenerating ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <>
                          <Award className="w-5 h-5" />
                          সার্টিফিকেট তৈরি করুন
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right: Live Preview */}
              <motion.div variants={itemVariants} className="space-y-4">
                <Card className="border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/30 to-amber-50/20 dark:from-emerald-950/20 dark:to-amber-950/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        লাইভ প্রিভিউ
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:border-emerald-700">
                        রিয়েল-টাইম
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div ref={certPreviewRef}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedType + subject + studentName + grade + score}
                          initial={{ opacity: 0.7, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CertificatePreview data={livePreviewData} subjectList={subjects} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      * এটি একটি প্রিভিউ। মূল সার্টিফিকেট ডাউনলোড করলে আরও সুন্দর দেখাবে।
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ── Manual Certificates Tab ─────────────────────────────────── */}
          <TabsContent value="my-certificates">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {manualCertificates.length === 0 ? (
                <Card className="border-dashed border-2 border-emerald-200 dark:border-emerald-800">
                  <CardContent className="py-16 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, type: 'spring' }}
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                        <Award className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                        কোনো ম্যানুয়াল সার্টিফিকেট নেই
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        &quot;তৈরি করুন&quot; ট্যাবে যান এবং আপনার প্রথম সার্টিফিকেট তৈরি করুন!
                      </p>
                      <Button
                        onClick={() => setActiveTab('create')}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        সার্টিফিকেট তৈরি করুন
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1">
                      <FileCheck className="w-3 h-3 mr-1" />
                        মোট: {toBengaliNum(manualCertificates.length)} টি
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {manualCertificates.map((cert, idx) => {
                      const typeInfo = CERTIFICATE_TYPES.find((t) => t.type === cert.type);
                      const Icon = typeInfo?.icon || Award;

                      return (
                        <motion.div
                          key={cert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <Card className="group border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200/20 dark:hover:shadow-emerald-900/20 transition-all duration-300 overflow-hidden">
                            <div className={`h-1 bg-gradient-to-r ${typeInfo?.gradient || 'from-emerald-500 to-emerald-700'}`} />
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeInfo?.gradient || 'from-emerald-500 to-emerald-700'} flex items-center justify-center shrink-0 shadow-md`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">{cert.studentName}</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {subjects.find((s) => s.id === cert.subject)?.nameBn || cert.subject}
                                    {cert.grade && <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-medium">• গ্রেড: {cert.grade}</span>}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{cert.certificateId}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  onClick={() => {
                                    setPreviewCert(cert);
                                    setPreviewOpen(true);
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                  দেখুন
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  onClick={() => handleDownload(cert)}
                                >
                                  <Download className="w-3 h-3" />
                                  ডাউনলোড
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  onClick={() => handlePrint(cert)}
                                >
                                  <Printer className="w-3 h-3" />
                                  প্রিন্ট
                                </Button>
                                <div className="flex-1" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  onClick={() => handleDelete(cert.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Full Preview Dialog ─────────────────────────────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl p-4 sm:p-6 bg-gradient-to-br from-emerald-50/50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Award className="w-5 h-5" />
              সার্টিফিকেট প্রিভিউ
            </DialogTitle>
            <DialogDescription>
              আপনার সার্টিফিকেট দেখুন এবং ডাউনলোড করুন
            </DialogDescription>
          </DialogHeader>

          {previewCert && (
            <div className="space-y-4">
              <div className="w-full overflow-auto">
                <CertificatePreview data={previewCert} subjectList={subjects} />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={() => handleDownload(previewCert)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <Download className="w-4 h-4" />
                  ডাউনলোড করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePrint(previewCert)}
                  className="border-emerald-300 dark:border-emerald-700 gap-2"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(previewCert.certificateId);
                    toast.success('সার্টিফিকেট আইডি কপি হয়েছে');
                  }}
                  className="border-emerald-300 dark:border-emerald-700 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  আইডি কপি
                </Button>
              </div>

              {/* Certificate details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">ধরন</p>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {CERTIFICATE_TYPES.find((t) => t.type === previewCert.type)?.title?.split(' ')[0]}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">বিষয়</p>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {subjects.find((s) => s.id === previewCert.subject)?.nameBn || previewCert.subject}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">গ্রেড</p>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {previewCert.grade || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">তারিখ</p>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {previewCert.completionDate}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
