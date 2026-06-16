'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Trash2, Sparkles, BookOpen, Calculator,
  FlaskConical, Globe, Lightbulb, RotateCcw, Copy,
  Check, ChevronDown, GraduationCap, MessageSquare,
  Mic, Paperclip, ThumbsUp, ThumbsDown, X, Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// ─── Helper ───────────────────────────────────────────────────────────────────
function toBengaliNum(num: number | string): string {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => digits[parseInt(d)]);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  liked?: boolean | null;
}

// ─── Suggested Questions ──────────────────────────────────────────────────────
const suggestedQuestions = [
  { text: 'বীজগণিতের সূত্রগুলো বুঝিয়ে বলো', icon: Calculator, subject: 'গণিত', color: 'emerald' },
  { text: 'নিউটনের গতির সূত্র কী কী?', icon: FlaskConical, subject: 'পদার্থবিজ্ঞান', color: 'amber' },
  { text: 'রসায়নে অম্ল ও ক্ষারকে বুঝিয়ে বলো', icon: FlaskConical, subject: 'রসায়ন', color: 'sky' },
  { text: 'বাংলাদেশের মুক্তিযুদ্ধের ইতিহাস বলো', icon: Globe, subject: 'বাংলাদেশ ও বিশ্বপরিচয়', color: 'rose' },
  { text: 'Active Voice ও Passive Voice এর পার্থক্য কী?', icon: BookOpen, subject: 'ইংরেজি', color: 'violet' },
  { text: 'পড়াশোনার জন্য টিপস দাও', icon: Lightbulb, subject: 'সাধারণ', color: 'yellow' },
];

// ─── Subject Color Map ────────────────────────────────────────────────────────
const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    hover: 'hover:bg-emerald-500/15',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    hover: 'hover:bg-amber-500/15',
  },
  sky: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/20',
    hover: 'hover:bg-sky-500/15',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
    hover: 'hover:bg-rose-500/15',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20',
    hover: 'hover:bg-violet-500/15',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-500/20',
    hover: 'hover:bg-yellow-500/15',
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AITutorSection() {
  const { user } = useStudyHub();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate unique ID
  const genId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Send message
  const sendMessage = useCallback(async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Build history for API
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          history,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const aiMsg: ChatMessage = {
          id: genId(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        toast.error(data.error || 'উত্তর পেতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সংযোগে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, sessionId]);

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Copy message
  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Like/dislike
  const toggleLike = (id: string, liked: boolean | null) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, liked: m.liked === liked ? null : liked } : m))
    );
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    fetch(`/api/chat?sessionId=${sessionId}`, { method: 'DELETE' }).catch(() => {});
  };

  // Typing indicator
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">AI শিক্ষক সহকারী</h2>
              <p className="text-sm text-muted-foreground">ক্লাস ৯-১০ এর যেকোনো প্রশ্ন করুন, আমি সাহায্য করব!</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1.5 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">মুছুন</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Chat Area */}
      <Card className="border-border/50 overflow-hidden">
        {/* Gradient top accent */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

        <CardContent className="p-0">
          {/* Messages Container */}
          <div className="h-[calc(100vh-320px)] min-h-[400px] max-h-[600px] overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
            {/* Empty state with suggestions */}
            {messages.length === 0 && showSuggestions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full py-8"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center mb-6">
                  <GraduationCap className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">স্বাগতম! আমি আপনার AI শিক্ষক</h3>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                  ক্লাস ৯-১০ এর যেকোনো বিষয়ে প্রশ্ন করুন। আমি বাংলায় সহজ ভাষায় বুঝিয়ে বলব!
                </p>

                <div className="w-full max-w-2xl">
                  <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
                    <Sparkles className="w-4 h-4 inline mr-1.5 text-amber-500" />
                    প্রশ্ন বেছে নিন অথবা নিজে লিখুন
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedQuestions.map((q, i) => {
                      const Icon = q.icon;
                      const colors = colorMap[q.color];
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => sendMessage(q.text)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border ${colors.border} ${colors.bg} ${colors.hover} text-left transition-all duration-200 group`}
                        >
                          <div className={`shrink-0 w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                          </div>
                          <div className="min-w-0">
                            <Badge variant="secondary" className="text-[10px] mb-1 px-1.5 py-0">
                              {q.subject}
                            </Badge>
                            <p className="text-sm font-medium leading-snug">{q.text}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Chat messages */}
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  {msg.role === 'assistant' ? (
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {user?.name?.charAt(0) || 'ছ'}
                      </span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground rounded-2xl rounded-tr-sm'
                        : 'bg-muted/50 rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    <div className="px-4 py-3">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </div>
                    </div>

                    {/* Action bar for assistant messages */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 px-3 pb-2">
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="p-1 rounded-md hover:bg-muted/80 transition-colors"
                          title="কপি করুন"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleLike(msg.id, true)}
                          className={`p-1 rounded-md transition-colors ${
                            msg.liked === true ? 'text-emerald-500' : 'hover:bg-muted/80 text-muted-foreground'
                          }`}
                          title="সহায়ক"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleLike(msg.id, false)}
                          className={`p-1 rounded-md transition-colors ${
                            msg.liked === false ? 'text-rose-500' : 'hover:bg-muted/80 text-muted-foreground'
                          }`}
                          title="উন্নতি প্রয়োজন"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border/50 bg-muted/20 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="আপনার প্রশ্ন লিখুন... (Enter পাঠাতে, Shift+Enter নতুন লাইন)"
                  className="resize-none min-h-[44px] max-h-[120px] pr-12 border-border/50 focus:border-primary/50 rounded-xl"
                  rows={1}
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2 text-[10px] text-muted-foreground">
                  {toBengaliNum(input.length)}/৫০০
                </div>
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-md shadow-primary/20 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[10px] text-muted-foreground">
                AI উত্তর সম্পূর্ণ সঠিক নাও হতে পারে। গুরুত্বপূর্ণ তথ্য যাচাই করুন।
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-500" />
                  AI চালিত
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
