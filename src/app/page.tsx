'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NoticeBanner from '@/components/home/NoticeBanner';
import HeroSection from '@/components/home/HeroSection';
import SubjectGrid from '@/components/home/SubjectGrid';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PricingSection from '@/components/home/PricingSection';
import CTASection from '@/components/home/CTASection';
import FAQSection from '@/components/sections/FAQSection';
import StatsSection from '@/components/sections/StatsSection';
import SubjectDetailSection from '@/components/sections/SubjectDetailSection';
import ReadingProgressBar from '@/components/ui/ReadingProgressBar';

function SectionRenderer() {
  const { activeSection, selectedSubject } = useStudyHub();

  const renderSection = () => {
    if (activeSection === 'subject-detail' && selectedSubject) {
      return <SubjectDetailSection />;
    }

    return (
      <>
        <HeroSection />
        <StatsSection />
        <SubjectGrid />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection === 'subject-detail' ? `subject-${selectedSubject}` : activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {renderSection()}
      </motion.div>
    </AnimatePresence>
  );
}

function MainContent() {
  const { activeSection, hydrated } = useStudyHub();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="h-16 border-b bg-background/80 backdrop-blur-sm" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">লোড হচ্ছে...</span>
          </div>
        </main>
      </div>
    );
  }

  const isHomePage = activeSection === 'home' || activeSection === 'subject-detail';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {activeSection === 'home' && <NoticeBanner />}
      <main className="flex-1">
        <SectionRenderer />
      </main>
      {isHomePage && <Footer />}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <ReadingProgressBar />
      <MainContent />
    </>
  );
}
