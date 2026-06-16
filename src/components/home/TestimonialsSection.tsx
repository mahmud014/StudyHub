"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch("/api/feedback");
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          // API রেসপন্স অনুযায়ী ডেটা ফরম্যাট করা
          const formattedData = result.data.map((item: any) => {
            return {
              name: item.author || "ব্যবহারকারী",
              role: item.category || "শিক্ষার্থী", // category কে role হিসেবে দেখাচ্ছি
              classInfo: "StudyHub", // যেহেতু API-তে subject নেই, তাই এটি স্ট্যাটিক রাখছি
              quote: item.text || "", // API এর 'text' ফিল্ড
              rating: item.rating || 5, // API এর 'rating' ফিল্ড
              initials: (item.author || "ইউ")[0], // নামের প্রথম অক্ষর
            };
          });
          setTestimonials(formattedData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const goToNext = useCallback(() => {
    if (testimonials.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const goToPrev = useCallback(() => {
    if (testimonials.length === 0) return;
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, [testimonials.length]);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  useEffect(() => {
    if (isPaused || testimonials.length === 0) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, goToNext, testimonials.length]);

  if (loading)
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <section className="py-10 sm:py-14 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            💬 মতামত
          </Badge>
          <h2 className="text-3xl font-bold">শিক্ষার্থী ও অভিভাবকদের মতামত</h2>
        </div>

        <div
          className="max-w-3xl mx-auto relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <Quote className="w-10 h-10 text-primary/20 mb-4" />
                    <p className="text-lg mb-6">{currentTestimonial.quote}</p>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {currentTestimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {currentTestimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {currentTestimonial.role} -{" "}
                          {currentTestimonial.classInfo}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-x-10 p-2"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 translate-x-10 p-2"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}

function toBengaliNum(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}
