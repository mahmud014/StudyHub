'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Search, FileText, BookOpen, GraduationCap,
  Calculator, Map, Filter, ChevronDown, Clock, Eye,
  FileCheck, Layers, Star, ExternalLink, Loader2, Video
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ResourceType = 'notes' | 'suggestion' | 'past-year' | 'formula' | 'map-chart' | 'video';

interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  subjectBn: string;
  type: ResourceType;
  typeBn: string;
  fileSize: string;
  downloadCount: number;
  rating: number;
  uploadedAt: string;
  description: string;
  pdfUrl?: string | null;
  isComingSoon?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const resourceTypeConfig: Record<ResourceType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  'notes': { label: 'নোটস', icon: FileText, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'suggestion': { label: 'সাজেশন', icon: GraduationCap, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'past-year': { label: 'বিগত বছরের প্রশ্ন', icon: FileCheck, color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  'formula': { label: 'ফর্মুলা শিট', icon: Calculator, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  'map-chart': { label: 'ম্যাপ/চার্ট', icon: Map, color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  'video': { label: 'ভিডিও', icon: Video, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

const defaultSubjects = [
  { id: 'all', label: 'সকল বিষয়' },
  { id: 'bangla', label: 'বাংলা' },
  { id: 'english', label: 'ইংরেজি' },
  { id: 'math', label: 'গণিত' },
  { id: 'science', label: 'বিজ্ঞান' },
  { id: 'ict', label: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
  { id: 'history', label: 'বাংলাদেশ ও বিশ্বপরিচয়' },
  { id: 'religion', label: 'ধর্ম ও নৈতিক শিক্ষা' },
  { id: 'geography', label: 'ভূগোল' },
];

const resourceTypes = [
  { id: 'all', label: 'সকল ধরন' },
  { id: 'notes', label: 'নোটস' },
  { id: 'video', label: 'ভিডিও' },
  { id: 'suggestion', label: 'সাজেশন' },
  { id: 'past-year', label: 'বিগত বছরের প্রশ্ন' },
  { id: 'formula', label: 'ফর্মুলা শিট' },
  { id: 'map-chart', label: 'ম্যাপ/চার্ট' },
];

// ─── Coming Soon Resources ────────────────────────────────────────────────────

const comingSoonResources: ResourceItem[] = [
  {
    id: 'cs-suggestion',
    title: 'সাজেশন ২০২৫ - শীঘ্রই আসছে',
    subject: 'all',
    subjectBn: 'সকল বিষয়',
    type: 'suggestion',
    typeBn: 'সাজেশন',
    fileSize: '—',
    downloadCount: 0,
    rating: 0,
    uploadedAt: '—',
    description: 'সকল বিষয়ের সাজেশন শীঘ্রই প্রকাশিত হবে',
    isComingSoon: true,
  },
  {
    id: 'cs-formula',
    title: 'ফর্মুলা শিট - শীঘ্রই আসছে',
    subject: 'all',
    subjectBn: 'সকল বিষয়',
    type: 'formula',
    typeBn: 'ফর্মুলা শিট',
    fileSize: '—',
    downloadCount: 0,
    rating: 0,
    uploadedAt: '—',
    description: 'বিজ্ঞান ও গণিতের ফর্মুলা শিট শীঘ্রই যুক্ত হবে',
    isComingSoon: true,
  },
  {
    id: 'cs-map',
    title: 'ম্যাপ/চার্ট সংগ্রহ - শীঘ্রই আসছে',
    subject: 'all',
    subjectBn: 'সকল বিষয়',
    type: 'map-chart',
    typeBn: 'ম্যাপ/চার্ট',
    fileSize: '—',
    downloadCount: 0,
    rating: 0,
    uploadedAt: '—',
    description: 'গুরুত্বপূর্ণ ম্যাপ ও চার্ট শীঘ্রই যুক্ত হবে',
    isComingSoon: true,
  },
  {
    id: 'cs-past-year',
    title: 'বিগত বছরের প্রশ্ন - শীঘ্রই আসছে',
    subject: 'all',
    subjectBn: 'সকল বিষয়',
    type: 'past-year',
    typeBn: 'বিগত বছরের প্রশ্ন',
    fileSize: '—',
    downloadCount: 0,
    rating: 0,
    uploadedAt: '—',
    description: 'বিগত বছরের বোর্ড পরীক্ষার প্রশ্ন শীঘ্রই যুক্ত হবে',
    isComingSoon: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResourcesSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [notesRes, videosRes, subjectsRes] = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/videos'),
        fetch('/api/subjects'),
      ]);

      const notesData = await notesRes.json();
      const videosData = await videosRes.json();
      const subjectsData = await subjectsRes.json();

      const apiResources: ResourceItem[] = [];

      // Transform notes into resource items
      if (notesData.success && Array.isArray(notesData.data)) {
        for (const note of notesData.data) {
          // Determine resource type based on note.type field
          let resType: ResourceType = 'notes';
          let typeBn = 'নোটস';
          if (note.type === 'suggestion') {
            resType = 'suggestion';
            typeBn = 'সাজেশন';
          } else if (note.type === 'past-question') {
            resType = 'past-year';
            typeBn = 'বিগত বছরের প্রশ্ন';
          }

          const subjectBn = note.subject?.nameBn || note.subject?.name || 'অজানা';
          const subjectName = note.subject?.name?.toLowerCase() || 'unknown';

          apiResources.push({
            id: `note-${note.id}`,
            title: note.titleBn || note.title,
            subject: subjectName,
            subjectBn,
            type: resType,
            typeBn,
            fileSize: note.pdfUrl ? 'PDF' : 'অনলাইন',
            downloadCount: 0,
            rating: 4.5,
            uploadedAt: note.createdAt ? new Date(note.createdAt).toLocaleDateString('bn-BD') : '—',
            description: note.content ? (note.content.length > 100 ? note.content.slice(0, 100) + '...' : note.content) : `${subjectBn} - ${typeBn}`,
            pdfUrl: note.pdfUrl || null,
          });
        }
      }

      // Transform videos into resource items
      if (videosData.success && Array.isArray(videosData.data)) {
        for (const video of videosData.data) {
          const subjectBn = video.subject?.nameBn || video.subject?.name || 'অজানা';
          const subjectName = video.subject?.name?.toLowerCase() || 'unknown';
          const durationMin = video.duration ? `${toBengaliNum(Math.floor(video.duration / 60))}:${toBengaliNum(video.duration % 60).padStart(2, '০')}` : 'ভিডিও';

          apiResources.push({
            id: `video-${video.id}`,
            title: video.titleBn || video.title,
            subject: subjectName,
            subjectBn,
            type: 'video',
            typeBn: 'ভিডিও',
            fileSize: durationMin,
            downloadCount: 0,
            rating: 4.5,
            uploadedAt: video.createdAt ? new Date(video.createdAt).toLocaleDateString('bn-BD') : '—',
            description: `${subjectBn} - ভিডিও লেকচার`,
          });
        }
      }

      // Add coming soon resources for types not covered by API data
      const existingTypes = new Set(apiResources.map((r) => r.type));
      const neededComingSoon = comingSoonResources.filter(
        (cs) => !existingTypes.has(cs.type) || apiResources.filter((r) => r.type === cs.type).length === 0
      );

      setResources([...apiResources, ...neededComingSoon]);

      // Build subjects list from API
      if (subjectsData.success && Array.isArray(subjectsData.data)) {
        const apiSubjects = [
          { id: 'all', label: 'সকল বিষয়' },
          ...subjectsData.data.map((s: { id: string; name: string; nameBn: string }) => ({
            id: s.name?.toLowerCase() || s.id,
            label: s.nameBn || s.name,
          })),
        ];
        setSubjects(apiSubjects);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([...comingSoonResources]);
      toast.error('রিসোর্স লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subjectBn.includes(searchQuery) ||
        resource.description.includes(searchQuery);
      const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [searchQuery, selectedSubject, selectedType, resources]);

  const typeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    resources.forEach((r) => {
      stats[r.type] = (stats[r.type] || 0) + 1;
    });
    return stats;
  }, [resources]);

  const handleDownload = (resource: ResourceItem) => {
    if (resource.isComingSoon) {
      toast.info('এই রিসোর্সটি শীঘ্রই আসছে', {
        description: 'আমরা দ্রুত এটি যুক্ত করার চেষ্টা করছি',
      });
      return;
    }

    if (resource.type === 'video') {
      // Navigate to videos section
      window.location.hash = '#videos';
      toast.info('ভিডিও সেকশনে যাচ্ছেন');
      return;
    }

    // For notes with pdfUrl, open the PDF
    if (resource.pdfUrl) {
      window.open(resource.pdfUrl, '_blank');
      toast.success(`"${resource.title}" ডাউনলোড শুরু হয়েছে`);
      return;
    }

    // For notes without pdfUrl
    toast.success(`"${resource.title}" খোলা হচ্ছে`, {
      description: 'অনলাইন নোট',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">স্টাডি রিসোর্স</h1>
            <p className="text-sm text-muted-foreground">পড়াশোনার সকল সহায়ক উপকরণ</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          মোট <span className="font-semibold text-emerald-600 dark:text-emerald-400">{toBengaliNum(resources.length)}</span>টি রিসোর্স
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="রিসোর্স খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700' : ''}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="flex-1">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="বিষয় নির্বাচন" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="ধরন নির্বাচন" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Type Quick Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {resourceTypes.filter(t => t.id !== 'all').map((type) => {
          const config = resourceTypeConfig[type.id as ResourceType];
          if (!config) return null;
          const Icon = config.icon;
          const count = typeStats[type.id] || 0;
          const isActive = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(isActive ? 'all' : type.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isActive
                  ? `${config.bg} ${config.color} ${config.border} shadow-sm`
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {type.label}
              <span className="bg-background/50 dark:bg-background/30 px-1.5 py-0.5 rounded text-[10px]">
                {toBengaliNum(count)}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">রিসোর্স লোড হচ্ছে...</p>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          {toBengaliNum(filteredResources.length)}টি রিসোর্স পাওয়া গেছে
        </div>
      )}

      {/* Resource Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((resource, idx) => {
              const typeConfig = resourceTypeConfig[resource.type];
              const TypeIcon = typeConfig?.icon || FileText;

              return (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className={`group h-full hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700 overflow-hidden ${resource.isComingSoon ? 'opacity-75' : ''}`}>
                    {/* Card Color Strip */}
                    <div className={`h-1 ${typeConfig?.bg || 'bg-emerald-500/10'}`} />

                    <CardContent className="p-4 space-y-3">
                      {/* Type Badge & Subject */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`${typeConfig?.bg || ''} ${typeConfig?.color || ''} ${typeConfig?.border || ''} text-[10px] gap-1`}>
                          <TypeIcon className="w-3 h-3" />
                          {resource.typeBn}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          {resource.isComingSoon && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                              শীঘ্রই আসছে
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            {resource.subjectBn}
                          </Badge>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {resource.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {resource.type === 'video' ? <Eye className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                          {resource.fileSize}
                        </span>
                        {resource.downloadCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {toBengaliNum(resource.downloadCount)}
                          </span>
                        )}
                        {resource.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500" />
                            {toBengaliNum(resource.rating)}
                          </span>
                        )}
                      </div>

                      {/* Upload Date */}
                      {resource.uploadedAt !== '—' && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          আপলোড: {resource.uploadedAt}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        size="sm"
                        className={`w-full gap-1.5 text-xs ${
                          resource.isComingSoon
                            ? 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-not-allowed'
                            : resource.type === 'video'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-700 hover:opacity-90'
                        }`}
                        onClick={() => handleDownload(resource)}
                      >
                        {resource.isComingSoon ? (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            শীঘ্রই আসছে
                          </>
                        ) : resource.type === 'video' ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            ভিডিও দেখুন
                          </>
                        ) : resource.pdfUrl ? (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            ডাউনলোড
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3.5 h-3.5" />
                            দেখুন
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredResources.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold">কোনো রিসোর্স পাওয়া যায়নি</h3>
          <p className="text-sm text-muted-foreground mt-1">আপনার সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedSubject('all');
              setSelectedType('all');
            }}
          >
            ফিল্টার রিসেট করুন
          </Button>
        </motion.div>
      )}
    </div>
  );
}
