'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Bengali numeral helper ---
function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

// --- Timer modes ---
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerConfig {
  label: string;
  duration: number; // in seconds
  color: string; // tailwind color class prefix
  ringStroke: string; // hex color for SVG
  bgGradient: string; // gradient classes
}

const TIMER_CONFIGS: Record<TimerMode, TimerConfig> = {
  focus: {
    label: 'ফোকাস',
    duration: 25 * 60,
    color: 'emerald',
    ringStroke: '#10b981',
    bgGradient: 'from-emerald-500 to-emerald-600',
  },
  shortBreak: {
    label: 'ছোট বিরতি',
    duration: 5 * 60,
    color: 'sky',
    ringStroke: '#0ea5e9',
    bgGradient: 'from-sky-400 to-sky-500',
  },
  longBreak: {
    label: 'বড় বিরতি',
    duration: 15 * 60,
    color: 'amber',
    ringStroke: '#f59e0b',
    bgGradient: 'from-amber-400 to-amber-500',
  },
};

const MODE_ORDER: TimerMode[] = ['focus', 'shortBreak', 'longBreak'];

// --- Circular progress ring ---
function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 8,
  strokeColor,
}: {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  strokeColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-linear"
        style={{
          filter: `drop-shadow(0 0 6px ${strokeColor}40)`,
        }}
      />
    </svg>
  );
}

// --- Session dots ---
function SessionDots({ completed, total }: { completed: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            i < completed
              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
              : 'bg-muted-foreground/20'
          }`}
          initial={false}
          animate={i < completed ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

// --- Main component ---
export default function StudyTimer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIGS.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = TIMER_CONFIGS[mode];
  const totalDuration = config.duration;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;

  // Format time as MM:SS in Bengali
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toBengaliNum(mins).padStart(2, '০')}:${toBengaliNum(secs).padStart(2, '০')}`;
  }, []);

  // Small badge time format for FAB
  const formatBadgeTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            setIsRunning(false);
            if (mode === 'focus') {
              setCompletedSessions((s) => s + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode, timeLeft]);

  // Auto-switch to break after focus completes
  useEffect(() => {
    if (timeLeft === 0 && !isRunning) {
      if (mode === 'focus') {
        // Auto switch to break
        const nextMode = completedSessions % 4 === 0 && completedSessions > 0 ? 'longBreak' : 'shortBreak';
        // Small delay for visual feedback
        const timeout = setTimeout(() => {
          setMode(nextMode);
          setTimeLeft(TIMER_CONFIGS[nextMode].duration);
        }, 800);
        return () => clearTimeout(timeout);
      } else {
        // After break, switch back to focus
        const timeout = setTimeout(() => {
          setMode('focus');
          setTimeLeft(TIMER_CONFIGS.focus.duration);
        }, 800);
        return () => clearTimeout(timeout);
      }
    }
  }, [timeLeft, isRunning, mode, completedSessions]);

  // Sync timeLeft when mode changes manually
  const handleModeChange = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIGS[newMode].duration);
    setIsRunning(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(config.duration);
  }, [config.duration]);

  const handleSkip = useCallback(() => {
    const currentIdx = MODE_ORDER.indexOf(mode);
    const nextMode = MODE_ORDER[(currentIdx + 1) % MODE_ORDER.length];
    handleModeChange(nextMode);
  }, [mode, handleModeChange]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Get ring color based on mode
  const getRingStroke = () => {
    if (timeLeft === 0 && !isRunning) return '#94a3b8'; // slate when complete
    return config.ringStroke;
  };

  return (
    <>
      {/* Expanded Timer Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[320px] max-w-[calc(100vw-48px)]"
          >
            <div className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${config.bgGradient} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Timer className="size-4 text-white" />
                  <span className="text-white font-semibold text-sm">স্টাডি টাইমার</span>
                </div>
                <button
                  onClick={toggleExpand}
                  className="text-white/80 hover:text-white transition-colors text-xl leading-none"
                  aria-label="বন্ধ করুন"
                >
                  ×
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="flex gap-1 px-4 pt-4 pb-2">
                {MODE_ORDER.map((m) => {
                  const mConfig = TIMER_CONFIGS[m];
                  const isActive = mode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => handleModeChange(m)}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${mConfig.bgGradient} text-white shadow-md`
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {mConfig.label}
                    </button>
                  );
                })}
              </div>

              {/* Timer Ring */}
              <div className="flex flex-col items-center py-4">
                <div className="relative">
                  <ProgressRing
                    progress={progress}
                    size={180}
                    strokeWidth={8}
                    strokeColor={getRingStroke()}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tracking-wider text-foreground">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mt-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="rounded-full hover:bg-muted"
                    aria-label="রিসেট"
                  >
                    <RotateCcw className="size-4 text-muted-foreground" />
                  </Button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlayPause}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 bg-gradient-to-br ${config.bgGradient} hover:opacity-90`}
                    aria-label={isRunning ? 'বিরতি' : 'শুরু'}
                  >
                    {isRunning ? (
                      <Pause className="size-6 text-white" />
                    ) : (
                      <Play className="size-6 text-white ml-0.5" />
                    )}
                  </motion.button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkip}
                    className="rounded-full hover:bg-muted"
                    aria-label="পরবর্তী"
                  >
                    <SkipForward className="size-4 text-muted-foreground" />
                  </Button>
                </div>

                {/* Session Counter */}
                <div className="flex flex-col items-center mt-4 gap-2">
                  <SessionDots completed={completedSessions} total={4} />
                  <span className="text-xs text-muted-foreground">
                    সম্পন্ন: {toBengaliNum(completedSessions % 4 || (completedSessions > 0 ? 4 : 0))}/৪ সেশন
                  </span>
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between w-full px-6 mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">নোটিফিকেশন সাউন্ড</span>
                  <button
                    onClick={() => setSoundEnabled((prev) => !prev)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label={soundEnabled ? 'সাউন্ড বন্ধ' : 'সাউন্ড চালু'}
                  >
                    {soundEnabled ? (
                      <Volume2 className="size-4 text-muted-foreground" />
                    ) : (
                      <VolumeX className="size-4 text-muted-foreground/50" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={toggleExpand}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors duration-300 bg-gradient-to-br from-primary to-emerald-600 hover:opacity-90 ${
          isRunning && !isExpanded ? 'animate-pulse-ring' : ''
        }`}
        whileTap={{ scale: 0.9 }}
        aria-label="স্টাডি টাইমার"
      >
        <Timer className="size-6 text-white" />

        {/* Time badge when timer is running and collapsed */}
        <AnimatePresence>
          {isRunning && !isExpanded && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 5 }}
              className="absolute -top-2 -left-2 bg-background text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-border"
            >
              {formatBadgeTime(timeLeft)}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Running indicator dot */}
        {isRunning && !isExpanded && (
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
          </span>
        )}
      </motion.button>
    </>
  );
}
