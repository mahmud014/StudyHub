'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Crown,
  Sparkles,
  ArrowRight,
  Shield,
  ChevronDown,
  Zap,
  BookOpen,
  Video,
  Users,
  Bot,
  Star,
  Gift,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import PaymentDialog from '@/components/ui/PaymentDialog';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    name: 'ফ্রি',
    nameBn: 'ফ্রি প্ল্যান',
    price: '০',
    priceNote: '৳০/মাস',
    description: 'শুরু করার জন্য পারফেক্ট',
    gradientFrom: 'from-slate-400',
    gradientTo: 'to-slate-500',
    icon: Zap,
    features: [
      'সীমিত নোটস অ্যাক্সেস (৩টি অধ্যায়)',
      '৫টি ভিডিও ক্লাস',
      '২টি MCQ পরীক্ষা',
      'প্রশ্নোত্তর ফোরাম (শুধু দেখা)',
    ],
    cta: 'শুরু করুন',
    popular: false,
  },
  {
    id: 'standard',
    name: 'স্ট্যান্ডার্ড',
    nameBn: 'স্ট্যান্ডার্ড প্ল্যান',
    price: '১৯৯',
    priceNote: '৳১৯৯/মাস',
    description: 'সম্পূর্ণ নোটস ও ভিডিও',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    icon: BookOpen,
    features: [
      'সকল নোটস ও PDF ডাউনলোড',
      'আনলিমিটেড ভিডিও ক্লাস',
      'আনলিমিটেড MCQ পরীক্ষা',
      'প্রশ্নোত্তর ফোরাম (প্রশ্ন করা যাবে)',
      'অ্যাসাইনমেন্ট জমা ও ফিডব্যাক',
      'প্রোগ্রেস ট্র্যাকিং',
    ],
    cta: 'পরিকল্পনা বেছে নিন',
    popular: true,
  },
  {
    id: 'premium',
    name: 'প্রিমিয়াম',
    nameBn: 'প্রিমিয়াম প্ল্যান',
    price: '৩৯৯',
    priceNote: '৳৩৯৯/মাস',
    description: 'সবকিছু + লাইভ ক্লাস + AI',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    icon: Crown,
    features: [
      'স্ট্যান্ডার্ডের সকল ফিচার',
      'সাপ্তাহিক লাইভ ক্লাস',
      'AI টিউটর সাহায্য',
      'প্রায়োরিটি সাপোর্ট',
      'কাস্টম স্টাডি প্ল্যান',
      'লিডারবোর্ড অ্যাক্সেস',
      'মাসিক প্রোগ্রেস রিপোর্ট',
      'অফলাইন ডাউনলোড',
    ],
    cta: 'পরিকল্পনা বেছে নিন',
    popular: false,
  },
];

const comparisonFeatures = [
  { name: 'নোটস অ্যাক্সেস', free: '৩টি অধ্যায়', standard: 'সম্পূর্ণ', premium: 'সম্পূর্ণ' },
  { name: 'ভিডিও ক্লাস', free: '৫টি', standard: 'আনলিমিটেড', premium: 'আনলিমিটেড' },
  { name: 'MCQ পরীক্ষা', free: '২টি', standard: 'আনলিমিটেড', premium: 'আনলিমিটেড' },
  { name: 'PDF ডাউনলোড', free: false, standard: true, premium: true },
  { name: 'প্রশ্নোত্তর ফোরাম', free: 'শুধু দেখা', standard: 'প্রশ্ন করা যাবে', premium: 'প্রশ্ন করা যাবে' },
  { name: 'লাইভ ক্লাস', free: false, standard: false, premium: true },
  { name: 'AI টিউটর', free: false, standard: false, premium: true },
  { name: 'অ্যাসাইনমেন্ট', free: false, standard: true, premium: true },
  { name: 'প্রোগ্রেস ট্র্যাকিং', free: false, standard: true, premium: true },
  { name: 'অফলাইন ডাউনলোড', free: false, standard: false, premium: true },
  { name: 'প্রায়োরিটি সাপোর্ট', free: false, standard: false, premium: true },
];

const faqs = [
  {
    q: 'পেমেন্ট কীভাবে করব?',
    a: 'বিকাশ বা নগদের মাধ্যমে সহজেই পেমেন্ট করতে পারবেন। "পরিকল্পনা বেছে নিন" বাটনে ক্লিক করলে ধাপে ধাপে নির্দেশনা পাবেন।',
  },
  {
    q: 'যেকোনো সময় ক্যান্সেল করতে পারব?',
    a: 'হ্যাঁ! যেকোনো সময় আপনার সাবস্ক্রিপশন ক্যান্সেল করতে পারবেন। বর্তমান মাসের শেষ পর্যন্ত সব ফিচার ব্যবহার করতে পারবেন।',
  },
  {
    q: 'টাকা ফেরত পাওয়া যাবে?',
    a: 'হ্যাঁ, সাবস্ক্রিপশন শুরুর ৭ দিনের মধ্যে সম্পূর্ণ টাকা ফেরত পাবেন। কোনো প্রশ্ন জিজ্ঞাসা করা হবে না।',
  },
  {
    q: 'প্ল্যান আপগ্রেড করতে পারব?',
    a: 'অবশ্যই! যেকোনো সময় উচ্চতর প্ল্যানে আপগ্রেড করতে পারবেন। বাকি দিনের জন্য প্রো-রেটেড হিসাব করা হবে।',
  },
  {
    q: 'পেমেন্ট কতক্ষণে অ্যাক্টিভ হবে?',
    a: 'পেমেন্ট যাচাই হলে সাথে সাথেই আপনার প্ল্যান অ্যাক্টিভ হয়ে যাবে। সাধারণত ১-৫ মিনিটের মধ্যে সম্পন্ন হয়।',
  },
  {
    q: 'একাধিক ডিভাইসে ব্যবহার করতে পারব?',
    a: 'হ্যাঁ, একই অ্যাকাউন্ট থেকে একাধিক ডিভাইসে লগইন করে ব্যবহার করতে পারবেন। তবে একই সময়ে একটি ডিভাইসেই সক্রিয় থাকবে।',
  },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
    ) : (
      <X className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />
    );
  }
  return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      layout
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-h-[48px]"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 pr-4">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PricingSection() {
  const { setActiveSection, user } = useStudyHub();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
    features: string[];
  }>({ name: '', price: '', features: [] });
  const [showComparison, setShowComparison] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.id === 'free') {
      if (user) {
        setActiveSection('dashboard');
      } else {
        setActiveSection('home');
      }
      return;
    }
    setSelectedPlan({
      name: plan.nameBn,
      price: billingPeriod === 'yearly' ? String(Math.round(Number(plan.price) * 10)) : plan.price,
      features: plan.features,
    });
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    toast.success('পেমেন্ট সফল! আপনার প্ল্যান অ্যাক্টিভেট হয়েছে।', {
      description: 'পড়াশোনা শুরু করুন!',
    });
  };

  const yearlyDiscount = (price: string) => {
    const monthly = Number(price);
    if (monthly === 0) return '০';
    const yearly = Math.round(monthly * 10);
    return String(yearly);
  };

  return (
    <section className="py-10 sm:py-12 lg:py-14 bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-background dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-8"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
            <Gift className="w-3.5 h-3.5 mr-1.5" />
            সাশ্রয়ী মূল্যে
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
            প্রাইসিং প্ল্যান
          </h2>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            আপনার প্রয়োজন অনুযায়ী প্ল্যান বেছে নিন। যেকোনো সময় আপগ্রেড বা ক্যান্সেল করতে পারবেন।
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              মাসিক
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 min-h-[44px] ${
                billingPeriod === 'yearly'
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              বার্ষিক
              <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-0 text-[10px] px-1.5 py-0">
                ১৭% ছাড়
              </Badge>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const IconComp = plan.icon;
            const displayPrice =
              billingPeriod === 'yearly' ? yearlyDiscount(plan.price) : plan.price;
            const priceNote =
              billingPeriod === 'yearly' && plan.price !== '০'
                ? `৳${yearlyDiscount(plan.price)}/বছর`
                : plan.priceNote;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative"
              >
                <Card
                  className={`h-full relative overflow-hidden transition-shadow duration-300 ${
                    plan.popular
                      ? 'border-2 border-emerald-400 dark:border-emerald-600 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20'
                      : 'border border-gray-200 dark:border-gray-700 hover:shadow-lg'
                  }`}
                >
                  {/* Gradient top strip */}
                  <div
                    className={`h-2 bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo}`}
                  />

                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg gap-1 px-3 py-1 text-xs font-bold">
                        <Star className="w-3 h-3" />
                        সবচেয়ে জনপ্রিয়
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2 pt-5 px-4 sm:px-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradientFrom} ${plan.gradientTo} flex items-center justify-center mx-auto mb-3 shadow-md`}
                    >
                      <IconComp className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        ৳{displayPrice}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">
                        /{billingPeriod === 'yearly' && plan.price !== '০' ? 'বছর' : 'মাস'}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && plan.price !== '০' && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        মাসে মাত্র ৳{Math.round(Number(plan.price) * 10 / 12)}!
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4 px-4 sm:px-6">
                    <ul className="space-y-2.5 sm:space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full gap-2 font-semibold h-11 min-h-[44px] ${
                        plan.popular
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md'
                          : plan.id === 'premium'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md'
                          : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      variant={plan.id === 'free' ? 'outline' : 'default'}
                      onClick={() => handlePlanClick(plan)}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Money-back guarantee badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-full px-4 sm:px-6 py-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                ৭ দিনের টাকা ফেরত গ্যারান্টি
              </p>
              <p className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-500">
                সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত — কোনো প্রশ্ন নেই
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            পেমেন্ট মাধ্যম:
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/30">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <span className="text-xs font-black text-white">b</span>
              </div>
              <span className="text-sm font-semibold text-pink-700 dark:text-pink-400">বিকাশ</span>
              <Smartphone className="w-3 h-3 text-pink-400 hidden sm:block" />
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <span className="text-xs font-black text-white">N</span>
              </div>
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">নগদ</span>
              <Smartphone className="w-3 h-3 text-orange-400 hidden sm:block" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            মোবাইল ব্যাংকিং এর মাধ্যমে সহজেই পেমেন্ট করুন
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 lg:mt-10"
        >
          <div className="text-center mb-6">
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 min-h-[44px]"
            >
              {showComparison ? 'তুলনা লুকান' : 'প্ল্যান তুলনা করুন'}
              <motion.div animate={{ rotate: showComparison ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </Button>
          </div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {/* Desktop comparison table */}
                <div className="hidden sm:block max-w-3xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                      ফিচার
                    </div>
                    <div className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center border-r border-gray-200 dark:border-gray-700">
                      ফ্রি
                    </div>
                    <div className="p-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 text-center border-r border-gray-200 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/10">
                      স্ট্যান্ডার্ড
                    </div>
                    <div className="p-3 text-sm font-semibold text-amber-600 dark:text-amber-400 text-center bg-amber-50/50 dark:bg-amber-900/10">
                      প্রিমিয়াম
                    </div>
                  </div>
                  {/* Table body */}
                  {comparisonFeatures.map((feature, i) => (
                    <div
                      key={feature.name}
                      className={`grid grid-cols-4 ${
                        i % 2 === 0 ? 'bg-white dark:bg-background' : 'bg-gray-50/50 dark:bg-gray-900/20'
                      }`}
                    >
                      <div className="p-3 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        {feature.name}
                      </div>
                      <div className="p-3 text-center border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <ComparisonCell value={feature.free} />
                      </div>
                      <div className="p-3 text-center border-r border-gray-200 dark:border-gray-700 flex items-center justify-center bg-emerald-50/30 dark:bg-emerald-900/5">
                        <ComparisonCell value={feature.standard} />
                      </div>
                      <div className="p-3 text-center flex items-center justify-center bg-amber-50/30 dark:bg-amber-900/5">
                        <ComparisonCell value={feature.premium} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile comparison - stacked cards */}
                <div className="sm:hidden space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className={`p-3 bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo} text-white font-semibold text-center`}>
                        {plan.name} প্ল্যান
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {comparisonFeatures.map((feature) => {
                          const value = plan.id === 'free' ? feature.free : plan.id === 'standard' ? feature.standard : feature.premium;
                          return (
                            <div key={feature.name} className="flex items-center justify-between p-3">
                              <span className="text-sm text-muted-foreground">{feature.name}</span>
                              <ComparisonCell value={value} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 lg:mt-10 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6 sm:mb-8">
            <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs">
              ❓ সাধারণ জিজ্ঞাসা
            </Badge>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              পেমেন্ট সম্পর্কে প্রশ্ন?
            </h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>
      </div>

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        planName={selectedPlan.name}
        price={selectedPlan.price}
        features={selectedPlan.features}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </section>
  );
}
