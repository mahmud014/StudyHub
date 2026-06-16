'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  HelpCircle,
  BookOpen,
  CreditCard,
  Monitor,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // সাধারণ প্রশ্ন (General)
  {
    id: 'g1',
    question: 'স্টাডি হাব কী?',
    answer:
      'স্টাডি হাব হলো বাংলাদেশের শ্রেণি ৯-১০ শিক্ষার্থীদের জন্য একটি অনলাইন শিক্ষা প্ল্যাটফর্ম। এখানে আপনি ভিডিও লেকচার, নোট, পরীক্ষা এবং অ্যাসাইনমেন্ট পাবেন যা জাতীয় শিক্ষাক্রম অনুযায়ী তৈরি।',
    category: 'general',
  },
  {
    id: 'g2',
    question: 'স্টাডি হাব কাদের জন্য?',
    answer:
      'স্টাডি হাব মূলত শ্রেণি ৯ এবং ১০ এর শিক্ষার্থীদের জন্য ডিজাইন করা হয়েছে। তবে যেকোনো শিক্ষার্থী যিনি বাংলা মাধ্যমে পড়াশোনা করতে চান, তিনিও এটি ব্যবহার করতে পারবেন। অভিভাবক এবং শিক্ষকরাও শিক্ষার্থীদের অগ্রগতি দেখতে পারবেন।',
    category: 'general',
  },
  {
    id: 'g3',
    question: 'কিভাবে শুরু করব?',
    answer:
      'প্রথমে আমাদের ওয়েবসাইটে একটি ফ্রি অ্যাকাউন্ট তৈরি করুন। তারপর আপনার শ্রেণি এবং বিষয় নির্বাচন করুন। ফ্রি প্ল্যানে কিছু বিষয় বিনামূল্যে পড়তে পারবেন। প্রিমিয়াম প্ল্যানে সব কন্টেন্ট আনলক হবে।',
    category: 'general',
  },
  {
    id: 'g4',
    question: 'ফ্রি প্ল্যানে কী কী পাব?',
    answer:
      'ফ্রি প্ল্যানে আপনি নির্বাচিত বিষয়ের কিছু ভিডিও লেকচার, নোটের নমুনা এবং সীমিত পরীক্ষায় অংশগ্রহণ করতে পারবেন। তবে সম্পূর্ণ কন্টেন্ট, লাইভ ক্লাস এবং ব্যক্তিগত মেন্টরিং এর জন্য প্রিমিয়াম প্ল্যান প্রয়োজন।',
    category: 'general',
  },
  // পড়াশোনা সংক্রান্ত (Study-related)
  {
    id: 's1',
    question: 'নোটগুলো কি PDF আকারে ডাউনলোড করা যায়?',
    answer:
      'হ্যাঁ, প্রিমিয়াম ব্যবহারকারীরা সকল নোট PDF আকারে ডাউনলোড করতে পারবেন। ফ্রি ব্যবহারকারীরা শুধুমাত্র অনলাইনে নোট পড়তে পারবেন, ডাউনলোড করতে পারবেন না। PDF ফাইলগুলো প্রিন্ট-ফ্রেন্ডলি ফরম্যাটে তৈরি।',
    category: 'study',
  },
  {
    id: 's2',
    question: 'ভিডিও লেকচারগুলো কি সব বিষয়ের জন্য আছে?',
    answer:
      'বর্তমানে আমাদের কাছে গণিত, পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, বাংলা, ইংরেজি এবং তথ্য ও যোগাযোগ প্রযুক্তি বিষয়ের সম্পূর্ণ ভিডিও লেকচার আছে। আমরা ধীরে ধীরে অন্যান্য বিষয়ও যুক্ত করছি। প্রতিটি অধ্যায়ের জন্য আলাদা ভিডিও লেকচার রয়েছে।',
    category: 'study',
  },
  {
    id: 's3',
    question: 'পরীক্ষার ফলাফল কিভাবে দেখব?',
    answer:
      'পরীক্ষা শেষ করার পর সাথে সাথে আপনার ফলাফল দেখতে পারবেন। আপনার স্কোর, সঠিক এবং ভুল উত্তরের বিস্তারিত বিশ্লেষণ এবং প্রতিটি প্রশ্নের ব্যাখ্যা পাবেন। এছাড়া আপনার অগ্রগতি ড্যাশবোর্ডে সব সময় দেখা যাবে।',
    category: 'study',
  },
  {
    id: 's4',
    question: 'অ্যাসাইনমেন্ট জমা দেওয়ার নিয়ম কী?',
    answer:
      'প্রতিটি অধ্যায় শেষে একটি অ্যাসাইনমেন্ট পাবেন। অ্যাসাইনমেন্ট অনলাইনেই লিখে বা ছবি আপলোড করে জমা দিতে পারবেন। আমাদের শিক্ষকরা আপনার অ্যাসাইনমেন্ট পরীক্ষা করে মতামত দেবেন। সাধারণত ৩-৫ কার্যদিবসের মধ্যে মতামত পাবেন।',
    category: 'study',
  },
  // অর্থপ্রুণ (Payment)
  {
    id: 'p1',
    question: 'প্রিমিয়াম প্ল্যানের মূল্য কত?',
    answer:
      'আমাদের প্রিমিয়াম প্ল্যানের মাসিক মূল্য ২৯৯ টাকা এবং বার্ষিক মূল্য ২,৪৯৯ টাকা। বার্ষিক প্ল্যানে প্রায় ৩০% সাশ্রয় হয়। পেমেন্ট bKash, Nagad, Rocket বা ব্যাংক কার্ডের মাধ্যমে করা যায়।',
    category: 'payment',
  },
  {
    id: 'p2',
    question: 'bKash/Nagad দিয়ে কিভাবে পেমেন্ট করব?',
    answer:
      'প্রিমিয়াম প্ল্যানে ক্লিক করুন, তারপর পেমেন্ট মেথড হিসেবে bKash বা Nagad নির্বাচন করুন। আপনার মোবাইল নম্বর দিন এবং পেমেন্ট কনফার্ম করুন। আপনার মোবাইলে একটি ভেরিফিকেশন কোড আসবে, সেটি এন্ট্রি করলেই পেমেন্ট সম্পন্ন হবে।',
    category: 'payment',
  },
  {
    id: 'p3',
    question: 'রিফান্ড পলিসি কী?',
    answer:
      'পেমেন্টের ৭ দিনের মধ্যে আপনি সম্পূর্ণ রিফান্ড পাবেন যদি আপনি প্ল্যাটফর্মটি পছন্দ না করেন। তবে ৭ দিন পর কোনো রিফান্ড প্রযোজ্য হবে না। রিফান্ড একই পেমেন্ট মেথডে ৫-৭ কার্যদিবসের মধ্যে ফেরত দেওয়া হবে।',
    category: 'payment',
  },
  // প্রযুক্তি সংক্রান্ত (Technical)
  {
    id: 't1',
    question: 'কোন ডিভাইসে ব্যবহার করা যাবে?',
    answer:
      'স্টাডি হাব যেকোনো ডিভাইসে ব্যবহার করা যাবে - কম্পিউটার, ল্যাপটপ, ট্যাবলেট বা স্মার্টফোন। আমাদের ওয়েবসাইট সকল স্ক্রিন সাইজের জন্য অপটিমাইজ করা। আপনি Chrome, Firefox, Safari বা Edge ব্রাউজার ব্যবহার করতে পারেন।',
    category: 'technical',
  },
  {
    id: 't2',
    question: 'অফলাইনে কি পড়াশোনা করা যায়?',
    answer:
      'বর্তমানে অফলাইনে শুধুমাত্র ডাউনলোড করা PDF নোট এবং ডাউনলোড করা ভিডিও দেখা যায়। পূর্ণাঙ্গ অফলাইন মোড আমরা শীঘ্রই চালু করার পরিকল্পনা করছি। ততক্ষণ আপনি প্রিমিয়াম প্ল্যানে ভিডিও ডাউনলোড করে রাখতে পারেন।',
    category: 'technical',
  },
  {
    id: 't3',
    question: 'ভিডিও কোয়ালিটি কেমন?',
    answer:
      'আমাদের সকল ভিডিও কমপক্ষে ৭২০p HD কোয়ালিটিতে রেকর্ড করা হয়। আপনার ইন্টারনেট স্পিড অনুযায়ী স্বয়ংক্রিয়ভাবে কোয়ালিটি সামঞ্জস্য হবে। দ্রুত ইন্টারনেটে ১০৮০p তেও দেখতে পারবেন। ভিডিও স্পিড ০.৫x থেকে ২x পর্যন্ত পরিবর্তন করা যায়।',
    category: 'technical',
  },
  {
    id: 't4',
    question: 'ইন্টারনেট স্পিড কত প্রয়োজন?',
    answer:
      'ভিডিও লেকচার দেখার জন্য ন্যূনতম ২ Mbps ইন্টারনেট স্পিড প্রয়োজন। তবে ভালো অভিজ্ঞতার জন্য ৫ Mbps বা তার বেশি স্পিড সুপারিশ করা হয়। নোট পড়া এবং পরীক্ষা দেওয়ার জন্য কম স্পিডেও কাজ করবে।',
    category: 'technical',
  },
];

const categories = [
  { id: 'all', label: 'সব', icon: HelpCircle },
  { id: 'general', label: 'সাধারণ প্রশ্ন', icon: MessageCircle },
  { id: 'study', label: 'পড়াশোনা সংক্রান্ত', icon: BookOpen },
  { id: 'payment', label: 'অর্থপ্রুণ', icon: CreditCard },
  { id: 'technical', label: 'প্রযুক্তি সংক্রান্ত', icon: Monitor },
];

export default function FAQSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFAQs = useMemo(() => {
    let faqs = faqData;

    if (activeCategory !== 'all') {
      faqs = faqs.filter((faq) => faq.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      faqs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    return faqs;
  }, [searchQuery, activeCategory]);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return faqData.length;
    return faqData.filter((faq) => faq.category === categoryId).length;
  };

  return (
    <section className="py-10 lg:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4"
          >
            <HelpCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            সচরাচর জিজ্ঞাসা
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            আপনার প্রশ্নের উত্তর এখানে
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="আপনার প্রশ্ন খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 bg-white dark:bg-gray-900"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  <Badge
                    variant="secondary"
                    className={`ml-1 text-xs px-1.5 py-0.5 min-w-[20px] justify-center ${
                      isActive
                        ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {getCategoryCount(cat.id)}
                  </Badge>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredFAQs.length > 0 ? (
              <Card className="border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-50 dark:shadow-emerald-900/10 overflow-hidden">
                <CardContent className="p-0">
                  <Accordion type="multiple" className="w-full">
                    {filteredFAQs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <AccordionItem
                          value={faq.id}
                          className="border-b border-emerald-50 dark:border-emerald-900/20 last:border-b-0 px-4 sm:px-6"
                        >
                          <AccordionTrigger className="hover:no-underline hover:text-emerald-700 dark:hover:text-emerald-400 py-5 text-left">
                            <div className="flex items-start gap-3 text-left">
                              <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {faq.question}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 dark:text-gray-400 leading-relaxed pb-5 pl-9">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  কোনো ফলাফল পাওয়া যায়নি
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  অনুগ্রহ করে অন্য কিছু দিয়ে খুঁজুন বা ক্যাটেগরি পরিবর্তন করুন
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 mb-3">
            আপনার প্রশ্নের উত্তর এখানে পাননি?
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-medium transition-colors shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
          >
            <MessageCircle className="w-4 h-4" />
            আমাদের সাথে যোগাযোগ করুন
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
