'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Printer, Download, Award, TrendingUp,
  TrendingDown, Minus, User, GraduationCap, Calendar,
  BookOpen, BarChart3, Star, CheckCircle, Clock, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudyHub } from '@/components/layout/StudyHubProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

interface GradeInfo {
  grade: string;
  gpa: number;
  color: string;
  bg: string;
  border: string;
  comment: string;
}

function getGradeInfo(percentage: number): GradeInfo {
  if (percentage >= 90) return { grade: 'A+', gpa: 5.0, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', comment: 'অসাধারণ' };
  if (percentage >= 80) return { grade: 'A', gpa: 4.0, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', comment: 'চমৎকার' };
  if (percentage >= 70) return { grade: 'A-', gpa: 3.5, color: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', comment: 'ভালো' };
  if (percentage >= 60) return { grade: 'B', gpa: 3.0, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', comment: 'মোটামুটি ভালো' };
  if (percentage >= 50) return { grade: 'C', gpa: 2.0, color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', comment: 'উন্নতি প্রয়োজন' };
  if (percentage >= 40) return { grade: 'D', gpa: 1.0, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', comment: 'দুর্বল' };
  return { grade: 'F', gpa: 0.0, color: 'text-red-800 dark:text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/40', comment: 'অসফল' };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubjectGrade {
  subject: string;
  subjectBn: string;
  examCount: number;
  avgMarks: number;
  maxMarks: number;
  percentage: number;
  gradeInfo: GradeInfo;
}

interface ExamHistoryItem {
  id: string;
  examTitle: string;
  subject: string;
  subjectBn: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  dateTaken: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function getMockSubjectGrades(): SubjectGrade[] {
  const subjectsData = [
    { subject: 'বাংলা', examCount: 4, avgMarks: 82, maxMarks: 95, percentage: 82 },
    { subject: 'ইংরেজি', examCount: 3, avgMarks: 76, maxMarks: 88, percentage: 76 },
    { subject: 'গণিত', examCount: 5, avgMarks: 71, maxMarks: 85, percentage: 71 },
    { subject: 'বিজ্ঞান', examCount: 4, avgMarks: 85, maxMarks: 96, percentage: 85 },
    { subject: 'তথ্য ও যোগাযোগ প্রযুক্তি', examCount: 3, avgMarks: 90, maxMarks: 98, percentage: 90 },
    { subject: 'বাংলাদেশ ও বিশ্বপরিচয়', examCount: 3, avgMarks: 73, maxMarks: 82, percentage: 73 },
    { subject: 'ধর্ম ও নৈতিক শিক্ষা', examCount: 2, avgMarks: 88, maxMarks: 94, percentage: 88 },
    { subject: 'ভূগোল ও পরিবেশ', examCount: 3, avgMarks: 68, maxMarks: 80, percentage: 68 },
  ];

  return subjectsData.map((s) => ({
    ...s,
    gradeInfo: getGradeInfo(s.percentage),
  }));
}

const teacherRemarks = [
  { teacher: 'মোঃ আবদুল করিম', subject: 'বাংলা', remark: 'ছাত্র/ছাত্রীর পড়াশোনায় মনোযোগ বেশি দরকার। লেখার দক্ষতা ভালো।' },
  { teacher: 'শ্রীমতি রুবিনা আক্তার', subject: 'গণিত', remark: 'অঙ্ক করার অভ্যাস বাড়াতে হবে। সূত্র মনে রাখার চেষ্টা করুন।' },
  { teacher: 'মোঃ রফিকুল ইসলাম', subject: 'বিজ্ঞান', remark: 'বিজ্ঞান বিষয়ে চমৎকার পারদর্শিতা। এভাবেই এগিয়ে যান।' },
  { teacher: 'মোছাঃ নাজমা বেগম', subject: 'ইংরেজি', remark: 'ইংরেজি গ্রামারে উন্নতি প্রয়োজন। নিয়মিত অনুশীলন করুন।' },
];

const attendanceData = {
  totalDays: 220,
  presentDays: 198,
  absentDays: 22,
  percentage: 90,
};

// ─── Component ────────────────────────────────────────────────────────────────

function calculateSubjectGrades(history: ExamHistoryItem[]): SubjectGrade[] {
  if (history.length === 0) {
    return getMockSubjectGrades();
  }
  const grouped: Record<string, { totalObtained: number; totalMax: number; count: number; maxPercent: number }> = {};
  history.forEach((exam) => {
    const sub = exam.subjectBn || exam.subject || 'অন্যান্য';
    if (!grouped[sub]) {
      grouped[sub] = { totalObtained: 0, totalMax: 0, count: 0, maxPercent: 0 };
    }
    grouped[sub].totalObtained += exam.obtainedMarks;
    grouped[sub].totalMax += exam.totalMarks;
    grouped[sub].count += 1;
    const percent = Math.round((exam.obtainedMarks / exam.totalMarks) * 100);
    if (percent > grouped[sub].maxPercent) {
      grouped[sub].maxPercent = percent;
    }
  });

  return Object.entries(grouped).map(([subject, stats]) => {
    const avgPercent = stats.totalMax > 0 ? Math.round((stats.totalObtained / stats.totalMax) * 100) : 0;
    return {
      subject,
      subjectBn: subject,
      examCount: stats.count,
      avgMarks: Math.round(stats.totalObtained / stats.count),
      maxMarks: Math.round((stats.maxPercent / 100) * (stats.totalMax / stats.count)),
      percentage: avgPercent,
      gradeInfo: getGradeInfo(avgPercent),
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportCardSection() {
  const { user } = useStudyHub();
  const [subjectGrades, setSubjectGrades] = useState<SubjectGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Load students if user is admin/teacher/guardian
  useEffect(() => {
    async function loadStudents() {
      if (!user || user.role === 'student') return;
      setStudentsLoading(true);
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        if (data.success && data.data) {
          setStudents(data.data);
          if (data.data.length > 0) {
            setSelectedStudentId(data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        setStudentsLoading(false);
      }
    }
    loadStudents();
  }, [user]);

  // Load student exam history dynamically
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'student') {
      if (!studentsLoading && students.length === 0) {
        setLoading(false);
        return;
      }
      if (!selectedStudentId) return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const url = user.role === 'student'
          ? '/api/exams/history'
          : `/api/exams/history?userId=${selectedStudentId}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.data?.history) {
          const hist = data.data.history;
          setExamHistory(hist);
          setSubjectGrades(calculateSubjectGrades(hist));
        } else {
          setExamHistory([]);
          setSubjectGrades(getMockSubjectGrades());
        }
      } catch {
        setExamHistory([]);
        setSubjectGrades(getMockSubjectGrades());
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, selectedStudentId, students, studentsLoading]);

  const selectedStudent = useMemo(() => {
    if (user?.role === 'student') {
      return {
        name: user.name,
        class: '৯ম-১০ম',
        roll: '১২',
        school: 'ঢাকা সরকারি মডেল স্কুল'
      };
    }
    const found = students.find(s => s.id === selectedStudentId);
    if (found) {
      return {
        name: found.name,
        class: found.class === '9-10' ? '৯ম-১০ম' : found.class,
        roll: found.roll || '১২',
        school: found.school || 'ঢাকা সরকারি মডেল স্কুল'
      };
    }
    return {
      name: 'ছাত্র/ছাত্রী',
      class: '৯ম-১০ম',
      roll: '১২',
      school: 'ঢাকা সরকারি মডেল স্কুল'
    };
  }, [user, students, selectedStudentId]);

  const overallGPA = useMemo(() => {
    if (subjectGrades.length === 0) return 0;
    const totalGPA = subjectGrades.reduce((sum, s) => sum + s.gradeInfo.gpa, 0);
    return Math.round((totalGPA / subjectGrades.length) * 100) / 100;
  }, [subjectGrades]);

  const overallGrade = useMemo(() => {
    if (overallGPA >= 4.5) return 'A+';
    if (overallGPA >= 3.5) return 'A';
    if (overallGPA >= 3.0) return 'A-';
    if (overallGPA >= 2.5) return 'B';
    if (overallGPA >= 2.0) return 'C';
    if (overallGPA >= 1.0) return 'D';
    return 'F';
  }, [overallGPA]);

  const trendData = useMemo(() => {
    if (examHistory.length === 0) {
      // Use mock trend
      return [
        { month: 'জানু', percentage: 65 },
        { month: 'ফেব্রু', percentage: 70 },
        { month: 'মার্চ', percentage: 72 },
        { month: 'এপ্রি', percentage: 78 },
        { month: 'মে', percentage: 75 },
        { month: 'জুন', percentage: 82 },
      ];
    }
    // Group exam history by month
    const monthly: Record<string, { total: number; count: number }> = {};
    const monthNames = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    examHistory.forEach((exam) => {
      const d = new Date(exam.dateTaken);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthly[key]) monthly[key] = { total: 0, count: 0 };
      monthly[key].total += exam.percentage;
      monthly[key].count += 1;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => {
        const monthIdx = parseInt(key.split('-')[1]);
        return { month: monthNames[monthIdx], percentage: Math.round(val.total / val.count) };
      });
  }, [examHistory]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate a simple text report
    const studentName = user?.name || 'ছাত্র/ছাত্রী';
    const lines = [
      '═══════════════════════════════════════',
      '         স্টাডি হাব - রিপোর্ট কার্ড',
      '═══════════════════════════════════════',
      '',
      `নাম: ${studentName}`,
      `শ্রেণি: ৯ম-১০ম`,
      `রোল: ${toBengaliNum(12)}`,
      `শিক্ষাবর্ষ: ২০২৫`,
      '',
      '───── বিষয়ভিত্তিক ফলাফল ─────',
      '',
      ...subjectGrades.map((s) =>
        `${s.subjectBn}: গড় ${toBengaliNum(s.avgMarks)} | সর্বোচ্চ ${toBengaliNum(s.maxMarks)} | গ্রেড ${s.gradeInfo.grade} | ${s.gradeInfo.comment}`
      ),
      '',
      `সামগ্রিক GPA: ${toBengaliNum(overallGPA)}`,
      `সামগ্রিক গ্রেড: ${overallGrade}`,
      '',
      `উপস্থিতি: ${toBengaliNum(attendanceData.presentDays)}/${toBengaliNum(attendanceData.totalDays)} (${toBengaliNum(attendanceData.percentage)}%)`,
      '',
      '───── শিক্ষক মন্তব্য ─────',
      '',
      ...teacherRemarks.map((r) => `${r.teacher} (${r.subject}): ${r.remark}`),
      '',
      '═══════════════════════════════════════',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `রিপোর্ট-কার্ড-${studentName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">রিপোর্ট কার্ড</h1>
            <p className="text-sm text-muted-foreground">একাডেমিক পারফরম্যান্স সারসংক্ষেপ</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden w-full md:w-auto md:justify-end">
          {user?.role !== 'student' && students.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">শিক্ষার্থী নির্বাচন:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer hover:border-emerald-500"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.class === '9-10' ? '৯ম-১০ম' : student.class} - রোল: {toBengaliNum(student.roll || '')})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="w-4 h-4" />
              প্রিন্ট
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:opacity-90">
              <Download className="w-4 h-4" />
              ডাউনলোড
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Official Report Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden print:border-black print:shadow-none">
          {/* Report Card Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-4 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">স্টাডি হাব একাডেমি</h2>
                <p className="text-white/80 text-sm">শিক্ষার আলোয় আগামীর পথ</p>
                <div className="mt-1 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  <Award className="w-3 h-3" />
                  একাডেমিক রিপোর্ট কার্ড ২০২৫
                </div>
              </div>
            </div>
          </div>

          {/* Student Info Bar */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">নাম</p>
                  <p className="text-sm font-semibold">{selectedStudent.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">শ্রেণি</p>
                  <p className="text-sm font-semibold">{selectedStudent.class}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">রোল</p>
                  <p className="text-sm font-semibold">{toBengaliNum(selectedStudent.roll)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">শিক্ষাবর্ষ</p>
                  <p className="text-sm font-semibold">২০২৫</p>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Subject Grades Table */}
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                বিষয়ভিত্তিক ফলাফল
              </h3>
              <div className="overflow-x-auto rounded-lg border border-emerald-200 dark:border-emerald-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-50 dark:bg-emerald-950/40">
                      <th className="px-3 py-2.5 text-left font-semibold text-emerald-800 dark:text-emerald-300">বিষয়</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-emerald-800 dark:text-emerald-300">পরীক্ষা সংখ্যা</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-emerald-800 dark:text-emerald-300">গড় নম্বর</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-emerald-800 dark:text-emerald-300">সর্বোচ্চ</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-emerald-800 dark:text-emerald-300">গ্রেড</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-emerald-800 dark:text-emerald-300">মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectGrades.map((subject, idx) => (
                      <motion.tr
                        key={subject.subject}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={`border-t border-emerald-100 dark:border-emerald-900 ${
                          idx % 2 === 0 ? 'bg-white dark:bg-background' : 'bg-emerald-50/50 dark:bg-emerald-950/20'
                        } hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors`}
                      >
                        <td className="px-3 py-2.5 font-medium">{subject.subjectBn}</td>
                        <td className="px-3 py-2.5 text-center">{toBengaliNum(subject.examCount)}</td>
                        <td className="px-3 py-2.5 text-center">{toBengaliNum(subject.avgMarks)}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-emerald-700 dark:text-emerald-400">{toBengaliNum(subject.maxMarks)}</td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge variant="outline" className={`${subject.gradeInfo.bg} ${subject.gradeInfo.color} ${subject.gradeInfo.border} font-bold`}>
                            {subject.gradeInfo.grade}
                          </Badge>
                        </td>
                        <td className={`px-3 py-2.5 ${subject.gradeInfo.color} text-xs font-medium`}>{subject.gradeInfo.comment}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overall GPA & Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white text-center shadow-lg shadow-emerald-500/20"
              >
                <p className="text-xs uppercase tracking-wider text-white/70 mb-1">সামগ্রিক GPA</p>
                <p className="text-4xl font-bold">{toBengaliNum(overallGPA)}</p>
                <p className="text-xs text-white/70 mt-1">৫.০ স্কেলে</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl p-4 text-white text-center shadow-lg shadow-emerald-600/20"
              >
                <p className="text-xs uppercase tracking-wider text-white/70 mb-1">সামগ্রিক গ্রেড</p>
                <p className="text-4xl font-bold">{overallGrade}</p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {overallGPA >= 3.5 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                  ) : overallGPA >= 2.5 ? (
                    <Minus className="w-3 h-3 text-yellow-300" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-300" />
                  )}
                  <p className="text-xs text-white/70">
                    {overallGPA >= 3.5 ? 'উন্নতি হচ্ছে' : overallGPA >= 2.5 ? 'মোটামুটি' : 'উন্নতি দরকার'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-4 text-white text-center shadow-lg shadow-teal-500/20"
              >
                <p className="text-xs uppercase tracking-wider text-white/70 mb-1">মোট পরীক্ষা</p>
                <p className="text-4xl font-bold">{toBengaliNum(subjectGrades.reduce((sum, s) => sum + s.examCount, 0))}</p>
                <p className="text-xs text-white/70 mt-1">এই শিক্ষাবর্ষে</p>
              </motion.div>
            </div>

            {/* Performance Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                পারফরম্যান্স ট্রেন্ড
              </h3>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-4 sm:p-6 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-end gap-2 sm:gap-4 h-48">
                  {trendData.map((item, idx) => {
                    const height = item.percentage;
                    const prevPerc = idx > 0 ? trendData[idx - 1].percentage : item.percentage;
                    const isUp = item.percentage >= prevPerc;
                    return (
                      <motion.div
                        key={item.month}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                        className="flex-1 flex flex-col items-center gap-1 relative"
                      >
                        <div className="absolute -top-6 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {toBengaliNum(item.percentage)}%
                        </div>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isUp
                              ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-md shadow-emerald-500/20'
                              : 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-md shadow-amber-500/20'
                          }`}
                          style={{ minHeight: '4px' }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">{item.month}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Attendance Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-emerald-600" />
                উপস্থিতি সারসংক্ষেপ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 text-center border border-emerald-200/50 dark:border-emerald-800/50">
                  <p className="text-xs text-muted-foreground">মোট দিন</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{toBengaliNum(attendanceData.totalDays)}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 text-center border border-emerald-200/50 dark:border-emerald-800/50">
                  <p className="text-xs text-muted-foreground">উপস্থিত</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{toBengaliNum(attendanceData.presentDays)}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 text-center border border-emerald-200/50 dark:border-emerald-800/50">
                  <p className="text-xs text-muted-foreground">অনুপস্থিত</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{toBengaliNum(attendanceData.absentDays)}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 text-center border border-emerald-200/50 dark:border-emerald-800/50">
                  <p className="text-xs text-muted-foreground">উপস্থিতির হার</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{toBengaliNum(attendanceData.percentage)}%</p>
                  <div className="mt-1 h-1.5 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${attendanceData.percentage}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Teacher Remarks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                শিক্ষক মন্তব্য
              </h3>
              <div className="space-y-3">
                {teacherRemarks.map((remark, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + idx * 0.1 }}
                    className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-3 border border-emerald-200/50 dark:border-emerald-800/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{remark.teacher}</p>
                          <Badge variant="outline" className="text-[10px] border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400">
                            {remark.subject}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{remark.remark}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Grading Scale Reference */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="bg-muted/30 rounded-xl p-4 border border-border/50"
            >
              <p className="text-xs font-semibold text-muted-foreground mb-2">গ্রেডিং স্কেল</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { grade: 'A+', range: '৯০-১০০', gpa: '৫.০', color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
                  { grade: 'A', range: '৮০-৮৯', gpa: '৪.০', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700' },
                  { grade: 'A-', range: '৭০-৭৯', gpa: '৩.৫', color: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700' },
                  { grade: 'B', range: '৬০-৬৯', gpa: '৩.০', color: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
                  { grade: 'C', range: '৫০-৫৯', gpa: '২.০', color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700' },
                  { grade: 'D', range: '৪০-৪৯', gpa: '১.০', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' },
                  { grade: 'F', range: '০-৩৯', gpa: '০.০', color: 'bg-red-200 dark:bg-red-950 text-red-900 dark:text-red-300 border-red-400 dark:border-red-600' },
                ].map((item) => (
                  <span key={item.grade} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border ${item.color}`}>
                    <span className="font-bold">{item.grade}</span>
                    <span>{item.range}</span>
                    <span className="opacity-60">({item.gpa})</span>
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Official Seal */}
            <div className="flex items-center justify-center pt-4 print:pt-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-300 dark:border-emerald-700 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40">
                  <div className="text-center">
                    <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <p className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">স্টাডি হাব</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">আধিকারিক সীলমোহর</p>
                <div className="flex items-center gap-8 mt-2 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="w-32 border-b border-muted-foreground/30 mb-1" />
                    <p>অভিভাবকের স্বাক্ষর</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-muted-foreground/30 mb-1" />
                    <p>প্রধান শিক্ষকের স্বাক্ষর</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Print-specific CSS */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-black {
            border-color: black !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:pt-8 {
            padding-top: 2rem !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
