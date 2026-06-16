'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Mail, Lock, AlertCircle, GraduationCap } from 'lucide-react';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { ThemeProvider } from 'next-themes';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { login } = useStudyHub();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('ইমেইল ও পাসওয়ার্ড দুটোই প্রয়োজন।');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        // Successful login, redirect to callbackUrl
        router.push(callbackUrl);
      } else {
        setError(res.error || 'ইমেইল বা পাসওয়ার্ড ভুল।');
      }
    } catch {
      setError('লগইন করার সময় একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-6 gap-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Class 9/10 Study Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">শ্রেণি ৯ম-১০ম শিক্ষার্থীদের ডিজিটাল লার্নিং প্ল্যাটফর্ম</p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-center">লগইন করুন</CardTitle>
            <CardDescription className="text-center text-slate-500 dark:text-slate-400">
              আপনার একাউন্টে প্রবেশ করতে ইমেইল ও পাসওয়ার্ড লিখুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2.5 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@studyhub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    প্রবেশ করা হচ্ছে...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 justify-center">
                    <LogIn className="w-4 h-4" />
                    লগইন করুন
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500">ডেমো একাউন্টে কুইক লগইন</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('rafi@studyhub.com')}
                className="text-[11px] h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                শিক্ষার্থী (Student)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('teacher@studyhub.com')}
                className="text-[11px] h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                শিক্ষক (Teacher)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('guardian@studyhub.com')}
                className="text-[11px] h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                অভিভাবক (Guardian)
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800/50 py-3.5 bg-slate-50/50 dark:bg-slate-900/50">
            <Button variant="link" size="sm" onClick={() => router.push('/')} className="text-slate-500 dark:text-slate-400 text-xs hover:text-slate-800 dark:hover:text-slate-200">
              হোমপেজে ফিরে যান
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-sm text-slate-500">লোড হচ্ছে...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </ThemeProvider>
  );
}
