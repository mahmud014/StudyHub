'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Phone,
  Receipt,
  Calendar,
  AlertCircle,
  RefreshCw,
  Package,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  price: string;
  features?: string[];
  onPaymentSuccess?: () => void;
}

type PaymentMethod = 'bkash' | 'nagad';
type PaymentStep = 'select' | 'method' | 'details' | 'success';

const STEP_CONFIG = [
  { key: 'select' as PaymentStep, label: 'পরিকল্পনা', icon: Package },
  { key: 'method' as PaymentStep, label: 'মাধ্যম', icon: Smartphone },
  { key: 'details' as PaymentStep, label: 'পেমেন্ট', icon: Receipt },
  { key: 'success' as PaymentStep, label: 'সম্পন্ন', icon: CheckCircle },
];

const paymentMethods: {
  id: PaymentMethod;
  name: string;
  label: string;
  color: string;
  bgColor: string;
  darkBgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  instructions: string[];
  sendToNumber: string;
}[] = [
  {
    id: 'bkash',
    name: 'বিকাশ',
    label: 'bKash',
    color: '#E2136E',
    bgColor: 'bg-pink-50',
    darkBgColor: 'dark:bg-pink-950/30',
    borderColor: 'border-pink-400',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-rose-600',
    instructions: [
      'আপনার বিকাশ অ্যাপে "Send Money" এ যান',
      'নম্বরে টাকা পাঠান',
      'Transaction ID কপি করুন',
      'এখানে Transaction ID দিন',
    ],
    sendToNumber: '017XXXXXXXX',
  },
  {
    id: 'nagad',
    name: 'নগদ',
    label: 'Nagad',
    color: '#F6921E',
    bgColor: 'bg-orange-50',
    darkBgColor: 'dark:bg-orange-950/30',
    borderColor: 'border-orange-400',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-amber-600',
    instructions: [
      'আপনার নগদ অ্যাপে "Cash Out" এ যান',
      'নম্বরে টাকা পাঠান',
      'Transaction ID কপি করুন',
      'এখানে Transaction ID দিন',
    ],
    sendToNumber: '018XXXXXXXX',
  },
];

export default function PaymentDialog({
  open,
  onOpenChange,
  planName,
  price,
  features = [],
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [step, setStep] = useState<PaymentStep>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');

  const resetState = () => {
    setStep('select');
    setSelectedMethod('');
    setPhoneNumber('');
    setTransactionId('');
    setIsProcessing(false);
    setHasError(false);
    setErrorMessage('');
    setCountdown(5);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  // Auto-close countdown on success
  useEffect(() => {
    if (step === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [step, countdown]);

  // This is called from a button click, not from effect
  const handleAutoClose = () => {
    onPaymentSuccess?.();
    resetState();
    onOpenChange(false);
  };

  const getStepIndex = (s: PaymentStep) =>
    STEP_CONFIG.findIndex((cfg) => cfg.key === s);

  const canProceedToMethod = true; // Plan is pre-selected
  const canProceedToDetails = selectedMethod !== '' && phoneNumber.length >= 11;
  const canSubmitPayment = transactionId.length >= 6;

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setHasError(false);
    // Simulate payment processing
    setTimeout(() => {
      // 90% success rate simulation
      if (Math.random() > 0.1) {
        setIsProcessing(false);
        setStep('success');
        setCountdown(5);
      } else {
        setIsProcessing(false);
        setHasError(true);
        setErrorMessage('পেমেন্ট যাচাই করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    }, 3000);
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    handleProcessPayment();
  };

  const selectedMethodData = paymentMethods.find((m) => m.id === selectedMethod);

  const getActivationDate = () => {
    const now = new Date();
    return now.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getExpiryDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg p-0 overflow-hidden gap-0"
        showCloseButton={step !== 'details' || !isProcessing}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-5 pb-4 text-white overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              পেমেন্ট করুন
            </DialogTitle>
            <DialogDescription className="text-emerald-100 text-sm mt-1">
              {planName} — ৳{price} টাকা
            </DialogDescription>
          </DialogHeader>

          {/* Step progress indicator */}
          <div className="flex items-center justify-between mt-4 px-2">
            {STEP_CONFIG.map((cfg, i) => {
              const currentIdx = getStepIndex(step);
              const isCompleted = currentIdx > i;
              const isCurrent = currentIdx === i;
              const IconComp = cfg.icon;

              return (
                <React.Fragment key={cfg.key}>
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-white text-emerald-700'
                          : isCurrent
                          ? 'bg-white/20 text-white ring-2 ring-white/50'
                          : 'bg-white/10 text-white/50'
                      }`}
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <IconComp className="w-4 h-4" />
                      )}
                    </motion.div>
                    <span
                      className={`text-[10px] ${
                        isCurrent
                          ? 'text-white font-medium'
                          : isCompleted
                          ? 'text-white/80'
                          : 'text-white/40'
                      }`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {i < STEP_CONFIG.length - 1 && (
                    <div className="flex-1 mx-1">
                      <div
                        className={`h-0.5 rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-white' : 'bg-white/20'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 min-h-[300px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Plan Selection / Confirmation */}
            {step === 'select' && (
              <motion.div
                key="select"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  পরিকল্পনার বিবরণ
                </h3>

                {/* Plan summary card */}
                <Card className="border-2 border-emerald-200 dark:border-emerald-800 mb-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                          {planName}
                        </h4>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                            ৳{price}
                          </span>
                          <span className="text-sm text-emerald-600 dark:text-emerald-500">/মাস</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Package className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                  {features.length > 0 && (
                    <CardContent className="p-4 pt-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        অন্তর্ভুক্ত সুবিধাসমূহ:
                      </p>
                      <ul className="space-y-1.5">
                        {features.slice(0, 6).map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>

                {/* Money-back guarantee */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <Shield className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      ৭ দিনের টাকা ফেরত গ্যারান্টি
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500">
                      সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত পাবেন
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Shield className="w-3.5 h-3.5" />
                    নিরাপদ পেমেন্ট
                  </div>
                  <Button
                    onClick={() => setStep('method')}
                    disabled={!canProceedToMethod}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    পরবর্তী
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment Method Selection */}
            {step === 'method' && (
              <motion.div
                key="method"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setStep('select')}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    পেমেন্ট মাধ্যম নির্বাচন করুন
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                        selectedMethod === method.id
                          ? `${method.borderColor} shadow-lg`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedMethod === method.id && (
                        <motion.div
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      <div className="flex flex-col items-center gap-3">
                        {/* Logo circle */}
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${method.gradientFrom} ${method.gradientTo} flex items-center justify-center shadow-md`}
                        >
                          <span className="text-2xl font-black text-white">
                            {method.id === 'bkash' ? 'b' : 'N'}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                            {method.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {method.label}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Instructions for selected method */}
                <AnimatePresence>
                  {selectedMethod && selectedMethodData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`rounded-lg border ${selectedMethodData.borderColor}/30 ${selectedMethodData.bgColor} ${selectedMethodData.darkBgColor} p-3 mb-4`}
                      >
                        <p className={`text-xs font-semibold mb-2`} style={{ color: selectedMethodData.color }}>
                          {selectedMethodData.name} পেমেন্ট নির্দেশনা:
                        </p>
                        <ol className="space-y-1">
                          {selectedMethodData.instructions.map((inst, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span
                                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                                style={{ backgroundColor: selectedMethodData.color }}
                              >
                                {i + 1}
                              </span>
                              {inst}
                            </li>
                          ))}
                        </ol>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            পাঠানোর নম্বর:
                          </span>
                          <span className="text-xs font-bold" style={{ color: selectedMethodData.color }}>
                            {selectedMethodData.sendToNumber}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Shield className="w-3.5 h-3.5" />
                    নিরাপদ পেমেন্ট
                  </div>
                  <Button
                    onClick={() => setStep('details')}
                    disabled={!canProceedToMethod}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    পরবর্তী
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment Details & Processing */}
            {step === 'details' && (
              <motion.div
                key="details"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setStep('method')}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <div className="flex items-center gap-2">
                    {selectedMethodData && (
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedMethodData.gradientFrom} ${selectedMethodData.gradientTo} flex items-center justify-center`}
                      >
                        <span className="text-sm font-bold text-white">
                          {selectedMethod === 'bkash' ? 'b' : 'N'}
                        </span>
                      </div>
                    )}
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMethodData?.name} দিয়ে পেমেন্ট
                    </h3>
                  </div>
                </div>

                {/* Price summary */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 mb-5 flex items-center justify-between">
                  <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                    পরিকল্পনা
                  </span>
                  <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                    {planName} — ৳{price}
                  </span>
                </div>

                {isProcessing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 flex flex-col items-center text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 rounded-full border-4 border-emerald-100 dark:border-emerald-900 border-t-emerald-600 mb-5"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      পেমেন্ট প্রক্রিয়াধীন
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      অনুগ্রহ করে অপেক্ষা করুন, আপনার পেমেন্ট যাচাই করা হচ্ছে...
                    </p>
                    {selectedMethodData && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Smartphone className="w-4 h-4" />
                        {selectedMethodData.name} — ৳{price}
                      </div>
                    )}
                  </motion.div>
                ) : hasError ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6 flex flex-col items-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4"
                    >
                      <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      পেমেন্ট ব্যর্থ!
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400 max-w-xs mb-5">
                      {errorMessage}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep('method')}
                        className="gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        ফিরে যান
                      </Button>
                      <Button
                        onClick={handleRetry}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        আবার চেষ্টা করুন
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {/* Phone number input */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          মোবাইল নম্বর
                        </Label>
                        <div className="flex">
                          <div className="flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                            +880
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="১XXXXXXXXXX"
                            value={phoneNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setPhoneNumber(val.slice(0, 10));
                            }}
                            className="h-11 text-base rounded-l-none"
                            maxLength={10}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          আপনার {selectedMethodData?.name} অ্যাকাউন্টের মোবাইল নম্বর দিন
                        </p>
                      </div>

                      {/* Transaction ID input */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="trxId"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                        >
                          <Receipt className="w-4 h-4" />
                          Transaction ID
                        </Label>
                        <Input
                          id="trxId"
                          type="text"
                          placeholder="TRXXXXXXXXXXXXX"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                          className="h-11 text-base font-mono tracking-wider"
                          maxLength={20}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedMethodData?.name} থেকে পাওয়া Transaction ID দিন
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Shield className="w-3.5 h-3.5" />
                        আপনার তথ্য সুরক্ষিত
                      </div>
                      <Button
                        onClick={handleProcessPayment}
                        disabled={!canSubmitPayment || !canProceedToDetails}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      >
                        পেমেন্ট নিশ্চিত করুন
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 4: Success / Confirmation */}
            {step === 'success' && (
              <motion.div
                key="success"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="py-4 flex flex-col items-center text-center"
              >
                {/* Success check animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.3 }}
                    >
                      <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>
                    {/* Ripple effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-emerald-400"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, delay: 0.5, repeat: 2 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    পেমেন্ট সফল! 🎉
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-1">
                    আপনার{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {planName}
                    </span>{' '}
                    সফলভাবে অ্যাক্টিভেট হয়েছে
                  </p>
                </motion.div>

                {/* Receipt */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="w-full mt-4"
                >
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <Receipt className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        রশিদ
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">পরিকল্পনা</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {planName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">পরিমাণ</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          ৳{price}
                        </span>
                      </div>
                      {selectedMethodData && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">মাধ্যম</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {selectedMethodData.name}
                          </span>
                        </div>
                      )}
                      {transactionId && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                          <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {transactionId}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          অ্যাক্টিভেশন
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {getActivationDate()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          মেয়াদ শেষ
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {getExpiryDate()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAutoClose}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base font-semibold gap-2"
                  >
                    পড়াশোনা শুরু করুন
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {countdown > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
                      স্বয়ংক্রিয়ভাবে বন্ধ হবে{' '}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {countdown}
                      </span>{' '}
                      সেকেন্ডে
                    </p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
