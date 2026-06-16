'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Download, Printer, FileText,
  Shield, Maximize, MoveHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

// ─── Bengali numeral helper ──────────────────────────────────────────────────
function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface PDFViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string; // Markdown content
  subjectName?: string;
}

type ZoomMode = 'fit-width' | 'fit-page' | 'custom';

// ─── Split content into pages ────────────────────────────────────────────────
function splitContentIntoPages(content: string, charsPerPage: number = 1200): string[] {
  if (!content) return ['কোনো কন্টেন্ট নেই'];

  const lines = content.split('\n');
  const pages: string[] = [];
  let currentPage = '';

  for (const line of lines) {
    if (currentPage.length + line.length + 1 > charsPerPage && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = line;
    } else {
      currentPage += (currentPage ? '\n' : '') + line;
    }
  }

  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }

  return pages.length > 0 ? pages : ['কোনো কন্টেন্ট নেই'];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function PDFViewer({ open, onOpenChange, title, content, subjectName }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-width');
  const [customZoom, setCustomZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageDirection, setPageDirection] = useState<'forward' | 'backward'>('forward');

  const pages = useMemo(() => splitContentIntoPages(content), [content]);
  const totalPages = pages.length;

  // Reset page when content changes (derived state instead of effect)
  const safePage = Math.min(currentPage, Math.max(totalPages - 1, 0));

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setPageDirection('forward');
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setPageDirection('backward');
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, goToNextPage, goToPrevPage]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleZoomIn = useCallback(() => {
    setZoomMode('custom');
    setCustomZoom((prev) => Math.min(prev + 20, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomMode('custom');
    setCustomZoom((prev) => Math.max(prev - 20, 60));
  }, []);

  const handleFitWidth = useCallback(() => {
    setZoomMode('fit-width');
    setCustomZoom(100);
  }, []);

  const handleFitPage = useCallback(() => {
    setZoomMode('fit-page');
    setCustomZoom(100);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleDownload = useCallback(() => {
    toast.error('ডাউনলোড প্রিমিয়াম সদস্যদের জন্য', {
      description: 'প্রিমিয়াম প্ল্যানে আপগ্রেড করুন ডাউনলোড করতে',
      icon: <Shield className="w-4 h-4 text-primary" />,
    });
  }, []);

  const handlePrint = useCallback(() => {
    toast.error('প্রিন্ট সুবিধা প্রিমিয়াম সদস্যদের জন্য', {
      description: 'প্রিমিয়াম প্ল্যানে আপগ্রেড করুন',
      icon: <Shield className="w-4 h-4 text-primary" />,
    });
  }, []);

  // Get zoom scale for CSS
  const getZoomScale = () => {
    if (zoomMode === 'fit-width') return 100;
    if (zoomMode === 'fit-page') return 80;
    return customZoom;
  };

  const zoomScale = getZoomScale();

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col ${isFullscreen ? '' : 'inset-4 rounded-xl overflow-hidden'}`}
        >
          {/* ─── Top Toolbar ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-card/95 backdrop-blur-lg border-b border-border/50 shrink-0"
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onOpenChange(false)}
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Document Title */}
            <div className="min-w-0 flex-1 flex items-center gap-2 px-2">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium truncate">{title}</span>
              {subjectName && (
                <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0 h-5">
                  {subjectName}
                </Badge>
              )}
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border/50 shrink-0" />

            {/* Page Navigation */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goToPrevPage}
                disabled={safePage <= 0}
                aria-label="পূর্ববর্তী পৃষ্ঠা"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[80px] text-center tabular-nums">
                পৃষ্ঠা {toBengaliNum(safePage + 1)} / {toBengaliNum(totalPages)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextPage}
                disabled={safePage >= totalPages - 1}
                aria-label="পরবর্তী পৃষ্ঠা"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border/50 shrink-0" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={zoomMode === 'fit-width' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleFitWidth}
                    >
                      <MoveHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>প্রস্থ অনুযায়ী</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={zoomMode === 'fit-page' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleFitPage}
                    >
                      <Maximize className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>পৃষ্ঠা অনুযায়ী</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={zoomScale <= 60}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>

              <span className="text-xs text-muted-foreground min-w-[42px] text-center tabular-nums">
                {toBengaliNum(zoomScale)}%
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
                disabled={zoomScale >= 200}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border/50 shrink-0" />

            {/* Download & Print (disabled) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/50"
                    onClick={handleDownload}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ডাউনলোড প্রিমিয়াম সদস্যদের জন্য</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/50"
                    onClick={handlePrint}
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>প্রিন্ট প্রিমিয়াম সদস্যদের জন্য</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Separator */}
            <div className="h-6 w-px bg-border/50 shrink-0" />

            {/* Fullscreen Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? 'ছোট করুন' : 'পূর্ণ স্ক্রিন'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>

          {/* ─── PDF Content Area ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-auto bg-muted/30 dark:bg-black/40 flex items-start justify-center p-6">
            <div
              className="relative w-full transition-transform duration-200"
              style={{
                maxWidth: zoomMode === 'fit-page' ? '700px' : '900px',
                transform: `scale(${zoomScale / 100})`,
                transformOrigin: 'top center',
              }}
            >
              {/* Simulated PDF Page */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={safePage}
                  initial={{ opacity: 0, x: pageDirection === 'forward' ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: pageDirection === 'forward' ? -30 : 30 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="bg-card rounded-lg shadow-2xl border border-border/30 overflow-hidden"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toast('কপিরাইট সুরক্ষিত', {
                      description: 'এই কন্টেন্ট কপি করা নিষিদ্ধ।',
                      icon: <Shield className="w-4 h-4 text-primary" />,
                    });
                  }}
                >
                  {/* Page Header */}
                  <div className="px-8 py-3 border-b border-border/30 flex items-center justify-between bg-primary/5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      {title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      পৃষ্ঠা {toBengaliNum(safePage + 1)} / {toBengaliNum(totalPages)}
                    </span>
                  </div>

                  {/* Page Content */}
                  <div className="px-8 py-6 min-h-[500px] select-none">
                    <div className="prose dark:prose-invert max-w-none prose-sm">
                      <ReactMarkdown>{pages[safePage]}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Page Footer */}
                  <div className="px-8 py-2 border-t border-border/30 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/50">
                      স্টাডি হাব - শুধুমাত্র পড়ার জন্য
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">
                      {toBengaliNum(safePage + 1)}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ─── Watermark Overlay ──────────────────────────────────────── */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-primary/[0.04] text-lg font-bold whitespace-nowrap select-none"
                    style={{
                      top: `${10 + i * 16}%`,
                      left: '-5%',
                      transform: 'rotate(-30deg)',
                      width: '120%',
                      textAlign: 'center',
                    }}
                  >
                    স্টাডি হাব - শুধুমাত্র পড়ার জন্য
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Bottom Page Bar ────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-3 px-4 py-2.5 bg-card/95 backdrop-blur-lg border-t border-border/50 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={safePage <= 0}
              className="gap-1.5 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              পূর্ববর্তী
            </Button>

            {/* Page dots */}
            <div className="flex items-center gap-1">
              {totalPages <= 10 ? (
                Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPageDirection(i > safePage ? 'forward' : 'backward');
                      setCurrentPage(i);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      i === safePage
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
                    }`}
                    aria-label={`পৃষ্ঠা ${toBengaliNum(i + 1)}`}
                  />
                ))
              ) : (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {toBengaliNum(safePage + 1)} / {toBengaliNum(totalPages)}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={safePage >= totalPages - 1}
              className="gap-1.5 text-xs"
            >
              পরবর্তী
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
