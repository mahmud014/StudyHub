'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    name: 'রাফি আহমেদ',
    role: 'শিক্ষার্থী, ক্লাস ১০',
    classInfo: 'ক্লাস ১০, রোল - ০৫',
    quote: 'স্টাডি হাবের নোটস ও ভিডিও ক্লাসগুলো আমার পড়াশোনায় দারুণ সাহায্য করেছে। বিশেষ করে MCQ পরীক্ষা প্র্যাকটিস করতে পেরে আমি বোর্ড পরীক্ষায় ভালো করতে পেরেছি।',
    rating: 5,
    initials: 'রআ',
  },
  {
    name: 'নুসরাত জাহান',
    role: 'শিক্ষার্থী, ক্লাস ৯',
    classInfo: 'ক্লাস ৯, রোল - ১২',
    quote: 'গণিত আমার কাছে অনেক কঠিন ছিল। কিন্তু স্টাডি হাবের ভিডিও লেকচার দেখে আমি এখন গণিত পছন্দ করি! শিক্ষকের ব্যাখ্যা খুবই সহজ ও পরিষ্কার।',
    rating: 5,
    initials: 'নজ',
  },
  {
    name: 'করিম উদ্দিন',
    role: 'অভিভাবক',
    classInfo: 'অভিভাবক, মিরপুর, ঢাকা',
    quote: 'আমার সন্তানের পড়াশোনার অগ্রগতি ট্র্যাক করতে পেরে আমি খুবই সন্তুষ্ট। অভিভাবক হিসেবে আমি এখন ঘরে বসেই তার পরীক্ষার ফলাফল দেখতে পাই।',
    rating: 4,
    initials: 'কউ',
  },
  {
    name: 'ফাতেমা বেগম',
    role: 'শিক্ষক, গণিত',
    classInfo: 'গণিত শিক্ষক, ৮ বছরের অভিজ্ঞতা',
    quote: 'একজন শিক্ষক হিসেবে স্টাডি হাব আমাকে শিক্ষার্থীদের সাথে সরাসরি যোগাযোগ রাখতে সাহায্য করে। অ্যাসাইনমেন্ট চেক করা ও ফিডব্যাক দেওয়া এখন অনেক সহজ।',
    rating: 5,
    initials: 'ফব',
  },
  {
    name: 'সাকিব হাসান',
    role: 'শিক্ষার্থী, ক্লাস ১০',
    classInfo: 'ক্লাস ১০, রোল - ২১',
    quote: 'AI শিক্ষক সহকারীটি চমৎকার! রাতে পড়াশোনার সময় কোনো প্রশ্ন থাকলে সাথে সাথে উত্তর পাই। লাইভ ক্লাসও খুব ভালো হয়।',
    rating: 5,
    initials: 'সহ',
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Auto-rotate with 5-second interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, goToNext]);

  const currentTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <section className="py-10 sm:py-14 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-emerald-500/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-10"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
            💬 মতামত
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">শিক্ষার্থী ও অভিভাবকদের মতামত</h2>
          <p className="mt-3 text-muted-foreground text-lg">
            আমাদের প্ল্যাটফর্ম ব্যবহারকারীদের অভিজ্ঞতা
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="max-w-3xl mx-auto relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Main testimonial card */}
          <div className="relative min-h-[280px] sm:min-h-[240px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border/60">
                  <CardContent className="p-6 sm:p-8">
                    {/* Quote icon decoration */}
                    <div className="relative mb-4">
                      <Quote className="w-12 h-12 text-primary/10 absolute -top-2 -left-1" />
                      <Quote className="w-10 h-10 text-primary/20 relative z-10" />
                    </div>

                    {/* Quote text */}
                    <p className="text-base sm:text-lg leading-relaxed text-foreground/90 mb-6 relative z-10">
                      {currentTestimonial.quote}
                    </p>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              i < currentTestimonial.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-muted text-muted'
                            }`}
                          />
                        </motion.div>
                      ))}
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        {toBengaliNum(currentTestimonial.rating)}.০/৫.০
                      </span>
                    </div>

                    {/* Author info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {currentTestimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{currentTestimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
                        <p className="text-xs text-primary/70 mt-0.5">{currentTestimonial.classInfo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-5 w-10 h-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-muted transition-colors z-20"
            aria-label="আগের মতামত"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-5 w-10 h-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-muted transition-colors z-20"
            aria-label="পরের মতামত"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-2.5 bg-primary'
                    : 'w-2.5 h-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                }`}
                aria-label={`মতামত ${toBengaliNum(index + 1)} দেখুন`}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Show all testimonials in a scrollable grid */}
          <div className="mt-8 lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4">
                    <Quote className="w-6 h-6 text-primary/15 mb-2" />
                    <p className="text-sm leading-relaxed text-muted-foreground mb-3 line-clamp-3">
                      {testimonial.quote}
                    </p>
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-xs">{testimonial.name}</p>
                        <p className="text-[10px] text-muted-foreground">{testimonial.classInfo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Bengali numeral helper
function toBengaliNum(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}
