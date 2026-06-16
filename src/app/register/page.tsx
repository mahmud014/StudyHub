"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserPlus,
  Mail,
  Lock,
  AlertCircle,
  GraduationCap,
  User,
  Phone,
} from "lucide-react";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Field Validations
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য প্রদান করুন।");
      return;
    }

    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড দুটি মিলছে না!");
      return;
    }

    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          role,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("নিবন্ধন সফল হয়েছে! এখন লগইন করুন।");
        router.push(callbackUrl);
      } else {
        setError(data.error || "নিবন্ধন করার সময় একটি সমস্যা হয়েছে।");
        toast.error(data.error || "নিবন্ধন ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setError("সার্ভারে যোগাযোগ করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।");
      toast.error("সার্ভার ত্রুটি!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-6 gap-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Class 9/10 Study Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            শ্রেণি ৯ম-১০ম শিক্ষার্থীদের ডিজিটাল লার্নিং প্ল্যাটফর্ম
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-center">
              নতুন অ্যাকাউন্ট তৈরি করুন
            </CardTitle>
            <CardDescription className="text-center text-slate-500 dark:text-slate-400">
              নিচের ফর্মটি পূরণ করে স্টাডি হাবে যুক্ত হোন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2.5 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  আপনার নাম <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="যেমন: রাফি আহমেদ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  ইমেইল ঠিকানা <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@studyhub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">মোবাইল নম্বর (ঐচ্ছিক)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="যেমন: ০১৭XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <Label>আপনার ভূমিকা নির্ধারণ করুন</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={role === "student" ? "default" : "outline"}
                    onClick={() => setRole("student")}
                    className={`text-xs h-9 ${role === "student" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-slate-200 dark:border-slate-800"}`}
                  >
                    শিক্ষার্থী
                  </Button>
                  <Button
                    type="button"
                    variant={role === "teacher" ? "default" : "outline"}
                    onClick={() => setRole("teacher")}
                    className={`text-xs h-9 ${role === "teacher" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-slate-200 dark:border-slate-800"}`}
                  >
                    শিক্ষক
                  </Button>
                  <Button
                    type="button"
                    variant={role === "guardian" ? "default" : "outline"}
                    onClick={() => setRole("guardian")}
                    className={`text-xs h-9 ${role === "guardian" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-slate-200 dark:border-slate-800"}`}
                  >
                    অভিভাবক
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  পাসওয়ার্ড <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="কমপক্ষে ৬টি অক্ষর"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">
                  পাসওয়ার্ড নিশ্চিত করুন{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    অ্যাকাউন্ট তৈরি হচ্ছে...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 justify-center">
                    <UserPlus className="w-4 h-4" />
                    নিবন্ধন সম্পন্ন করুন
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 justify-center border-t border-slate-100 dark:border-slate-800/50 py-3.5 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <Button
                variant="link"
                size="sm"
                onClick={() => router.push("/login")}
                className="p-0 text-emerald-600 font-medium hover:underline"
              >
                লগইন করুন
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense
        fallback={
          <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-sm text-slate-500">লোড হচ্ছে...</span>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </ThemeProvider>
  );
}
