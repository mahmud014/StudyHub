'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Camera,
  User,
  BookOpen,
  Settings,
  LogOut,
  Trash2,
  Shield,
  Bell,
  Palette,
  Globe,
  Type,
  Lock,
  Save,
  Crown,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Bengali numerals helper
function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

const allSubjects = [
  { id: 'bangla', name: 'বাংলা' },
  { id: 'english', name: 'ইংরেজি' },
  { id: 'math', name: 'গণিত' },
  { id: 'physics', name: 'পদার্থবিজ্ঞান' },
  { id: 'chemistry', name: 'রসায়ন' },
  { id: 'biology', name: 'জীববিজ্ঞান' },
  { id: 'ict', name: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
  { id: 'bgs', name: 'বাংলাদেশ ও বিশ্বপরিচয়' },
];

const roleLabels: Record<string, string> = {
  student: 'শিক্ষার্থী',
  teacher: 'শিক্ষক',
  admin: 'অ্যাডমিন',
  guardian: 'অভিভাবক',
};

const planLabels: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  free: { name: 'ফ্রি', icon: <User className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  premium: { name: 'প্রিমিয়াম', icon: <Crown className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  pro: { name: 'প্রো', icon: <Sparkles className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

function getStoredProfile() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('studyhub_profile');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, setUser, logout } = useStudyHub();

  // Profile tab state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Academic tab state
  const [currentPlan, setCurrentPlan] = useState('free');
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>(
    allSubjects.map((s) => s.id)
  );
  const [studyHours, setStudyHours] = useState([4]);
  const [preferredTime, setPreferredTime] = useState('evening');
  const [notifExamReminder, setNotifExamReminder] = useState(true);
  const [notifAssignmentDeadline, setNotifAssignmentDeadline] = useState(true);
  const [notifNewContent, setNotifNewContent] = useState(true);
  const [notifLiveClass, setNotifLiveClass] = useState(true);

  // Settings tab state
  const [themePref, setThemePref] = useState('system');
  const [languagePref, setLanguagePref] = useState('bn');
  const [fontSize, setFontSize] = useState('medium');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  // Track previous open state to detect dialog opening
  const prevOpenRef = useRef(false);

  // Initialize form state when dialog opens
  const initializeForm = useCallback(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
    const profile = getStoredProfile();
    if (profile) {
      setSelectedClass(profile.selectedClass || '');
      setRollNumber(profile.rollNumber || '');
      setSchoolName(profile.schoolName || '');
      setDateOfBirth(profile.dateOfBirth || '');
      setCurrentPlan(profile.currentPlan || 'free');
      setEnrolledSubjects(profile.enrolledSubjects || allSubjects.map((s) => s.id));
      setStudyHours(profile.studyHours ? [profile.studyHours] : [4]);
      setPreferredTime(profile.preferredTime || 'evening');
      setNotifExamReminder(profile.notifExamReminder ?? true);
      setNotifAssignmentDeadline(profile.notifAssignmentDeadline ?? true);
      setNotifNewContent(profile.notifNewContent ?? true);
      setNotifLiveClass(profile.notifLiveClass ?? true);
      setThemePref(profile.themePref || 'system');
      setLanguagePref(profile.languagePref || 'bn');
      setFontSize(profile.fontSize || 'medium');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [user]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      // Initialize form when dialog opens
      if (newOpen && !prevOpenRef.current) {
        initializeForm();
      }
      prevOpenRef.current = newOpen;
      onOpenChange(newOpen);
    },
    [initializeForm, onOpenChange]
  );

  const handleSubjectToggle = (subjectId: string) => {
    setEnrolledSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((s) => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update user context (name + phone)
    if (user) {
      setUser({
        ...user,
        name: name.trim() || user.name,
        phone: phone.trim() || null,
      });
    }

    // Save extended profile to localStorage
    const profile = {
      selectedClass,
      rollNumber,
      schoolName,
      dateOfBirth,
      currentPlan,
      enrolledSubjects,
      studyHours: studyHours[0],
      preferredTime,
      notifExamReminder,
      notifAssignmentDeadline,
      notifNewContent,
      notifLiveClass,
      themePref,
      languagePref,
      fontSize,
    };
    localStorage.setItem('studyhub_profile', JSON.stringify(profile));

    setIsSaving(false);
    toast.success('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error('বর্তমান পাসওয়ার্ড দিন');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড মিলছে না');
      return;
    }
    toast.success('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    logout();
    onOpenChange(false);
    toast.success('অ্যাকাউন্ট মুছে ফেলা হয়েছে');
  };

  const handleLogoutAll = () => {
    toast.success('সকল ডিভাইস থেকে লগআউট হয়েছে');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const userRole = user?.role || 'student';
  const roleLabel = roleLabels[userRole] || 'শিক্ষার্থী';
  const planInfo = planLabels[currentPlan] || planLabels.free;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        {/* Profile Header - Emerald gradient */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 px-6 pt-6 pb-8">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold sr-only">
              প্রোফাইল সেটিংস
            </DialogTitle>
            <DialogDescription className="text-emerald-100 text-sm sr-only">
              আপনার প্রোফাইল এবং সেটিংস পরিচালনা করুন
            </DialogDescription>
          </DialogHeader>

          {/* Avatar and User Info */}
          <div className="flex flex-col items-center mt-2">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-4 border-white/30 shadow-lg">
                <AvatarFallback className="bg-emerald-500 text-white text-2xl font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="প্রোফাইল ছবি পরিবর্তন করুন"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
            <h3 className="text-white font-bold text-lg mt-3">
              {user?.name || 'ব্যবহারকারী'}
            </h3>
            <p className="text-emerald-200 text-sm">
              {user?.email || ''}
            </p>
            <Badge
              className={`mt-2 border-0 gap-1 ${
                userRole === 'admin'
                  ? 'bg-amber-500/90 text-white hover:bg-amber-500/90'
                  : userRole === 'teacher'
                    ? 'bg-sky-500/90 text-white hover:bg-sky-500/90'
                    : userRole === 'guardian'
                      ? 'bg-purple-500/90 text-white hover:bg-purple-500/90'
                      : 'bg-emerald-500/90 text-white hover:bg-emerald-500/90'
              }`}
            >
              <Shield className="w-3 h-3" />
              {roleLabel}
            </Badge>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full h-10 bg-muted/60">
              <TabsTrigger value="profile" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <User className="w-3.5 h-3.5" />
                প্রোফাইল
              </TabsTrigger>
              <TabsTrigger value="academic" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <BookOpen className="w-3.5 h-3.5" />
                পড়াশোনা
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <Settings className="w-3.5 h-3.5" />
                সেটিংস
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Profile */}
          <TabsContent value="profile" className="mt-0">
            <div className="max-h-[55vh] overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  নাম
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="h-10"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="profile-phone" className="text-sm font-medium flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ফোন নম্বর
                </Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১XXXXXXXXX"
                  className="h-10"
                  maxLength={11}
                />
              </div>

              {/* Class Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  শ্রেণি
                </Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">৯ম শ্রেণি</SelectItem>
                    <SelectItem value="10">১০ম শ্রেণি</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Roll Number */}
              <div className="space-y-2">
                <Label htmlFor="profile-roll" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  রোল নম্বর
                </Label>
                <Input
                  id="profile-roll"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="রোল নম্বর"
                  className="h-10"
                />
              </div>

              {/* School Name */}
              <div className="space-y-2">
                <Label htmlFor="profile-school" className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  প্রতিষ্ঠানের নাম
                </Label>
                <Input
                  id="profile-school"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="স্কুল/প্রতিষ্ঠানের নাম"
                  className="h-10"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="profile-dob" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  জন্ম তারিখ
                </Label>
                <Input
                  id="profile-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Academic */}
          <TabsContent value="academic" className="mt-0">
            <div className="max-h-[55vh] overflow-y-auto px-6 py-4 space-y-5 scrollbar-thin">
              {/* Current Subscription Plan */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  বর্তমান পরিকল্পনা
                </Label>
                <div className={`rounded-lg p-4 flex items-center gap-3 ${planInfo.color}`}>
                  <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center">
                    {planInfo.icon}
                  </div>
                  <div>
                    <p className="font-bold text-base">{planInfo.name} প্ল্যান</p>
                    <p className="text-xs opacity-80">
                      {currentPlan === 'free'
                        ? 'সীমিত ফিচার অ্যাক্সেস'
                        : currentPlan === 'premium'
                          ? 'সকল কন্টেন্ট ও পরীক্ষা আনলিমিটেড'
                          : 'প্রিমিয়াম + লাইভ ক্লাস + ব্যক্তিগত টিউটর'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subjects Enrolled */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ভর্তি বিষয়সমূহ
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {allSubjects.map((subject) => (
                    <label
                      key={subject.id}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-all text-sm ${
                        enrolledSubjects.includes(subject.id)
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Checkbox
                        checked={enrolledSubjects.includes(subject.id)}
                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <span
                        className={
                          enrolledSubjects.includes(subject.id)
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-muted-foreground'
                        }
                      >
                        {subject.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Study Goal - Daily Study Hours */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  দৈনিক পড়াশোনার সময়
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={studyHours}
                    onValueChange={setStudyHours}
                    min={1}
                    max={8}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>১ ঘণ্টা</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      {toBengaliNum(studyHours[0])} ঘণ্টা
                    </span>
                    <span>৮ ঘণ্টা</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Preferred Study Time */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  পড়াশোনার পছন্দের সময়
                </Label>
                <RadioGroup
                  value={preferredTime}
                  onValueChange={setPreferredTime}
                  className="grid grid-cols-2 gap-2"
                >
                  {[
                    { value: 'morning', label: 'সকাল', icon: <Sun className="w-4 h-4" /> },
                    { value: 'afternoon', label: 'দুপুর', icon: <Sun className="w-4 h-4" /> },
                    { value: 'evening', label: 'সন্ধ্যা', icon: <Moon className="w-4 h-4" /> },
                    { value: 'night', label: 'রাত', icon: <Moon className="w-4 h-4" /> },
                  ].map((time) => (
                    <label
                      key={time.value}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-all text-sm ${
                        preferredTime === time.value
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <RadioGroupItem
                        value={time.value}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <span
                        className={`flex items-center gap-1.5 ${
                          preferredTime === time.value
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {time.icon} {time.label}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Notification Preferences */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  বিজ্ঞপ্তি পছন্দ
                </Label>
                <div className="space-y-3">
                  {[
                    {
                      label: 'পরীক্ষার রিমাইন্ডার',
                      checked: notifExamReminder,
                      onChange: setNotifExamReminder,
                    },
                    {
                      label: 'অ্যাসাইনমেন্ট ডেডলাইন',
                      checked: notifAssignmentDeadline,
                      onChange: setNotifAssignmentDeadline,
                    },
                    {
                      label: 'নতুন কন্টেন্ট',
                      checked: notifNewContent,
                      onChange: setNotifNewContent,
                    },
                    {
                      label: 'লাইভ ক্লাস আপডেট',
                      checked: notifLiveClass,
                      onChange: setNotifLiveClass,
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <Switch
                        checked={item.checked}
                        onCheckedChange={item.onChange}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Settings */}
          <TabsContent value="settings" className="mt-0">
            <div className="max-h-[55vh] overflow-y-auto px-6 py-4 space-y-5 scrollbar-thin">
              {/* Theme Preference */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  থিম পছন্দ
                </Label>
                <RadioGroup
                  value={themePref}
                  onValueChange={setThemePref}
                  className="grid grid-cols-3 gap-2"
                >
                  {[
                    { value: 'light', label: 'লাইট', icon: <Sun className="w-5 h-5" /> },
                    { value: 'dark', label: 'ডার্ক', icon: <Moon className="w-5 h-5" /> },
                    { value: 'system', label: 'সিস্টেম', icon: <Monitor className="w-5 h-5" /> },
                  ].map((theme) => (
                    <label
                      key={theme.value}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-all ${
                        themePref === theme.value
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <RadioGroupItem value={theme.value} className="sr-only" />
                      <div
                        className={`p-2 rounded-full ${
                          themePref === theme.value
                            ? 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {theme.icon}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          themePref === theme.value
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {theme.label}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Language Preference */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ভাষা পছন্দ
                </Label>
                <RadioGroup
                  value={languagePref}
                  onValueChange={setLanguagePref}
                  className="flex gap-3"
                >
                  {[
                    { value: 'bn', label: 'বাংলা' },
                    { value: 'en', label: 'English' },
                  ].map((lang) => (
                    <label
                      key={lang.value}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2 cursor-pointer transition-all text-sm flex-1 justify-center ${
                        languagePref === lang.value
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <RadioGroupItem
                        value={lang.value}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <span
                        className={
                          languagePref === lang.value
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-muted-foreground'
                        }
                      >
                        {lang.label}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
                {languagePref === 'en' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    English ভাষা শীঘ্রই যুক্ত হবে
                  </p>
                )}
              </div>

              <Separator />

              {/* Font Size */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ফন্ট সাইজ
                </Label>
                <div className="flex gap-2">
                  {[
                    { value: 'small', label: 'ছোট', textSize: 'text-xs' },
                    { value: 'medium', label: 'মাঝারি', textSize: 'text-sm' },
                    { value: 'large', label: 'বড়', textSize: 'text-base' },
                  ].map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setFontSize(size.value)}
                      className={`flex-1 rounded-lg border px-3 py-2.5 transition-all font-medium ${
                        fontSize === size.value
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 text-muted-foreground hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className={size.textSize}>{size.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Change Password */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  পাসওয়ার্ড পরিবর্তন
                </Label>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="current-pw" className="text-xs text-muted-foreground">
                      বর্তমান পাসওয়ার্ড
                    </Label>
                    <Input
                      id="current-pw"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="বর্তমান পাসওয়ার্ড"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pw" className="text-xs text-muted-foreground">
                      নতুন পাসওয়ার্ড
                    </Label>
                    <Input
                      id="new-pw"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-pw" className="text-xs text-muted-foreground">
                      নতুন পাসওয়ার্ড নিশ্চিত করুন
                    </Label>
                    <Input
                      id="confirm-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                      className="h-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangePassword}
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1.5" />
                    পাসওয়ার্ড পরিবর্তন করুন
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  ঝুঁকিপূর্ণ অঞ্চল
                </Label>

                {/* Logout from all devices */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogoutAll}
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  সকল ডিভাইস থেকে লগআউট
                </Button>

                {/* Delete Account */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      অ্যাকাউন্ট মুছে ফেলুন
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        অ্যাকাউন্ট মুছে ফেলুন?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। আপনার সকল ডেটা, প্রোগ্রেস এবং সেটিংস স্থায়ীভাবে মুছে যাবে।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        হ্যাঁ, মুছে ফেলুন
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Separator />
        <div className="px-6 py-4 flex items-center justify-end gap-3 bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="min-w-[80px]"
          >
            বাতিল
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                সংরক্ষণ করুন
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
