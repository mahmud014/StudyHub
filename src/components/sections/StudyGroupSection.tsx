'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, ArrowLeft, MessageCircle, FileText,
  Clock, Sparkles, UserPlus, LogOut, Send, Share2, HelpCircle,
  CalendarDays, ChevronRight, Activity, Eye, Crown, Shield,
  UserCheck, Hash, X, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useStudyHub } from '@/components/layout/StudyHubProvider';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toBengaliNum(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
}

function timeAgoBn(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'এইমাত্র';
  if (diffMin < 60) return `${toBengaliNum(diffMin)} মিনিট আগে`;
  if (diffHr < 24) return `${toBengaliNum(diffHr)} ঘণ্টা আগে`;
  if (diffDay < 7) return `${toBengaliNum(diffDay)} দিন আগে`;
  return `${toBengaliNum(Math.floor(diffDay / 7))} সপ্তাহ আগে`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityStatus = 'active' | 'quiet' | 'new';
type MemberRole = 'creator' | 'admin' | 'member';

interface SubjectData {
  id: string;
  name: string;
  nameBn: string;
  color: string | null;
}

interface MemberData {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; avatar: string | null };
}

interface StudyGroupAPI {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  creatorId: string;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
  subject: SubjectData;
  creator: { id: string; name: string; avatar: string | null };
  members: MemberData[];
  _count: { members: number };
}

// ─── Status Config ────────────────────────────────────────────────────────────

function getActivityStatus(group: StudyGroupAPI): ActivityStatus {
  const hoursSinceUpdate = (Date.now() - new Date(group.updatedAt).getTime()) / 3600000;
  const memberCount = group._count.members;
  if (memberCount <= 3 && hoursSinceUpdate > 48) return 'quiet';
  if (hoursSinceUpdate < 24 && memberCount > 3) return 'active';
  if (memberCount <= 2) return 'new';
  return hoursSinceUpdate < 48 ? 'active' : 'quiet';
}

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; bgColor: string; dotClass: string }> = {
  active: { label: 'সক্রিয়', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', dotClass: 'bg-emerald-500' },
  quiet: { label: 'শান্ত', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/30', dotClass: 'bg-amber-500' },
  new: { label: 'নতুন', color: 'text-sky-600 dark:text-sky-400', bgColor: 'bg-sky-50 dark:bg-sky-900/30', dotClass: 'bg-sky-500' },
};

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  creator: { label: 'স্রষ্টা', icon: Crown, color: 'text-amber-500' },
  admin: { label: 'অ্যাডমিন', icon: Shield, color: 'text-emerald-500' },
  member: { label: 'সদস্য', icon: UserCheck, color: 'text-slate-500' },
};

// ─── Avatar Stack ─────────────────────────────────────────────────────────────

function AvatarStack({ members, max = 4 }: { members: MemberData[]; max?: number }) {
  const displayMembers = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className="flex -space-x-2">
      {displayMembers.map((m) => (
        <Avatar key={m.id} className="h-7 w-7 border-2 border-white dark:border-slate-800">
          <AvatarFallback className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
            {m.user.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300">
          +{toBengaliNum(remaining)}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton Loading ─────────────────────────────────────────────────────────

function GroupCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-emerald-300 to-emerald-500 dark:from-emerald-700 dark:to-emerald-500 animate-pulse" />
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ type }: { type: 'my-groups' | 'discover' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/30 flex items-center justify-center mb-6"
      >
        <Users className="w-10 h-10 text-emerald-500" />
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {type === 'my-groups' ? 'কোনো গ্রুপে যোগ নেই' : 'কোনো গ্রুপ পাওয়া যায়নি'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
        {type === 'my-groups'
          ? '"আবিষ্কার" ট্যাব থেকে গ্রুপ খুঁজে যোগ দিন অথবা নতুন গ্রুপ তৈরি করুন!'
          : 'আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।'}
      </p>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudyGroupSection() {
  const { user } = useStudyHub();
  const [groups, setGroups] = useState<StudyGroupAPI[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('my-groups');
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupAPI | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Create group form state
  const [newGroup, setNewGroup] = useState({
    name: '',
    subjectId: '',
    description: '',
    maxMembers: 10,
  });

  // Fetch groups and subjects
  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsRes, subjectsRes] = await Promise.all([
          fetch('/api/study-groups'),
          fetch('/api/subjects'),
        ]);
        const groupsJson = await groupsRes.json();
        const subjectsJson = await subjectsRes.json();

        if (groupsJson.success && groupsJson.data) {
          setGroups(groupsJson.data);
        }
        if (subjectsJson.success && subjectsJson.data) {
          setSubjects(subjectsJson.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Determine which groups the user is a member of
  const myGroupIds = useMemo(() => {
    if (!user?.id) return new Set<string>();
    return new Set(
      groups
        .filter((g) => g.members.some((m) => m.userId === user.id))
        .map((g) => g.id)
    );
  }, [groups, user]);

  // Join group
  const handleJoinGroup = useCallback(async (groupId: string) => {
    if (!user?.id) {
      toast.error('প্রথমে লগইন করুন');
      return;
    }
    setJoining(groupId);
    try {
      const res = await fetch(`/api/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh groups
        const groupsRes = await fetch('/api/study-groups');
        const groupsJson = await groupsRes.json();
        if (groupsJson.success && groupsJson.data) {
          setGroups(groupsJson.data);
        }
        toast.success('গ্রুপে যোগ দিয়েছেন!');
      } else {
        toast.error(json.error || 'যোগ দিতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setJoining(null);
    }
  }, [user]);

  // Leave group
  const handleLeaveGroup = useCallback(async (groupId: string) => {
    if (!user?.id) return;
    try {
      // For leaving, we'll use the join endpoint with DELETE method
      // Or simply remove the member entry
      const res = await fetch(`/api/study-groups/${groupId}/join`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        const groupsRes = await fetch('/api/study-groups');
        const groupsJson = await groupsRes.json();
        if (groupsJson.success && groupsJson.data) {
          setGroups(groupsJson.data);
        }
        toast.success('গ্রুপ ছেড়ে দিয়েছেন');
      } else {
        toast.error('ছেড়ে দিতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    }
  }, [user]);

  // Create group handler
  const handleCreateGroup = useCallback(async () => {
    if (!newGroup.name || !newGroup.subjectId || !user?.id) return;

    setCreating(true);
    try {
      const res = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroup.name,
          description: newGroup.description || 'নতুন স্টাডি গ্রুপ',
          subjectId: newGroup.subjectId,
          creatorId: user.id,
          maxMembers: newGroup.maxMembers,
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh groups
        const groupsRes = await fetch('/api/study-groups');
        const groupsJson = await groupsRes.json();
        if (groupsJson.success && groupsJson.data) {
          setGroups(groupsJson.data);
        }
        setNewGroup({ name: '', subjectId: '', description: '', maxMembers: 10 });
        setCreateDialogOpen(false);
        toast.success('গ্রুপ তৈরি হয়েছে!');
      } else {
        toast.error(json.error || 'গ্রুপ তৈরি করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setCreating(false);
    }
  }, [newGroup, user]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.subject.nameBn.includes(searchQuery) ||
        g.description.includes(searchQuery);
      const matchesSubject = subjectFilter === 'all' || g.subjectId === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [groups, searchQuery, subjectFilter]);

  const myGroups = useMemo(() => filteredGroups.filter((g) => myGroupIds.has(g.id)), [filteredGroups, myGroupIds]);
  const discoverGroups = useMemo(() => filteredGroups.filter((g) => !myGroupIds.has(g.id)), [filteredGroups, myGroupIds]);

  // Stats
  const stats = useMemo(() => ({
    totalGroups: groups.length,
    myGroups: myGroupIds.size,
    totalMembers: groups.reduce((sum, g) => sum + g._count.members, 0),
    activeGroups: groups.filter((g) => getActivityStatus(g) === 'active').length,
  }), [groups, myGroupIds]);

  const currentUserId = user?.id || '';

  // ─── Group Card ───────────────────────────────────────────────────────────

  function GroupCard({ group }: { group: StudyGroupAPI }) {
    const isMember = myGroupIds.has(group.id);
    const activityStatus = getActivityStatus(group);
    const statusCfg = STATUS_CONFIG[activityStatus];
    const isFull = group._count.members >= group.maxMembers;
    const isJoining = joining === group.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="cursor-pointer"
        onClick={() => setSelectedGroup(group)}
      >
        <Card className="overflow-hidden h-full group/card hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 border-slate-200/60 dark:border-slate-700/60">
          <div
            className="h-1.5"
            style={{ background: `linear-gradient(to right, ${group.subject.color || '#43A047'}, ${group.subject.color || '#43A047'}88)` }}
          />
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate text-base">
                  {group.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="mt-1 text-[11px] font-medium border"
                  style={{
                    borderColor: (group.subject.color || '#43A047') + '44',
                    backgroundColor: (group.subject.color || '#43A047') + '15',
                    color: group.subject.color || '#43A047',
                  }}
                >
                  {group.subject.nameBn}
                </Badge>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusCfg.bgColor} ${statusCfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} ${activityStatus === 'active' ? 'animate-pulse' : ''}`} />
                {statusCfg.label}
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
              {group.description}
            </p>

            <div className="flex items-center justify-between mb-3">
              <AvatarStack members={group.members} />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {toBengaliNum(group._count.members)}/{toBengaliNum(group.maxMembers)} জন
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timeAgoBn(group.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {toBengaliNum(group._count.members)} সদস্য
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Crown className="w-3 h-3 text-amber-500" />
                {group.creator.name}
              </span>
              <Button
                size="sm"
                variant={isMember ? 'outline' : 'default'}
                className={
                  isMember
                    ? 'h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30'
                    : 'h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white'
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMember) {
                    handleLeaveGroup(group.id);
                  } else {
                    handleJoinGroup(group.id);
                  }
                }}
                disabled={!isMember && (isFull || !!isJoining)}
              >
                {isJoining ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                ) : isMember ? (
                  <><LogOut className="w-3 h-3 mr-1" /> ছেড়ে দিন</>
                ) : isFull ? (
                  <><X className="w-3 h-3 mr-1" /> পূর্ণ</>
                ) : (
                  <><UserPlus className="w-3 h-3 mr-1" /> যোগ দিন</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ─── Group Detail View ───────────────────────────────────────────────────

  function GroupDetailView({ group }: { group: StudyGroupAPI }) {
    const isMember = myGroupIds.has(group.id);
    const sortedMembers = useMemo(() => {
      const roleOrder: Record<string, number> = { admin: 0, member: 1 };
      return [...group.members].sort((a, b) => (roleOrder[a.role] ?? 2) - (roleOrder[b.role] ?? 2));
    }, [group.members]);

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          onClick={() => setSelectedGroup(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          ফিরে যান
        </Button>

        <Card className="overflow-hidden mb-6 border-slate-200/60 dark:border-slate-700/60">
          <div
            className="h-2"
            style={{ background: `linear-gradient(to right, ${group.subject.color || '#43A047'}, ${group.subject.color || '#43A047'}66)` }}
          />
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-100">{group.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium border"
                    style={{
                      borderColor: (group.subject.color || '#43A047') + '44',
                      backgroundColor: (group.subject.color || '#43A047') + '15',
                      color: group.subject.color || '#43A047',
                    }}
                  >
                    {group.subject.nameBn}
                  </Badge>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[getActivityStatus(group)].bgColor} ${STATUS_CONFIG[getActivityStatus(group)].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[getActivityStatus(group)].dotClass} ${getActivityStatus(group) === 'active' ? 'animate-pulse' : ''}`} />
                    {STATUS_CONFIG[getActivityStatus(group)].label}
                  </div>
                </div>
              </div>
              <Button
                variant={isMember ? 'outline' : 'default'}
                className={
                  isMember
                    ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }
                onClick={() => isMember ? handleLeaveGroup(group.id) : handleJoinGroup(group.id)}
                disabled={!!joining}
              >
                {joining ? 'লোড হচ্ছে...' : isMember ? (
                  <><LogOut className="w-4 h-4 mr-2" /> গ্রুপ ছেড়ে দিন</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> যোগ দিন</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{group.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{toBengaliNum(group._count.members)}</div>
                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">সদস্য</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{toBengaliNum(group.maxMembers - group._count.members)}</div>
                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">খালি জায়গা</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{timeAgoBn(group.createdAt)}</div>
                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">তৈরি</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{group.creator.name}</div>
                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">স্রষ্টা</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200/60 dark:border-slate-700/60">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">দ্রুত কাজ</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Share2, label: 'নোট শেয়ার', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                    { icon: HelpCircle, label: 'প্রশ্ন করুন', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                    { icon: CalendarDays, label: 'সেশন নির্ধারণ', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className={`flex flex-col items-center gap-1.5 h-auto py-3 ${action.bg} hover:opacity-80`}
                    >
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/60 dark:border-slate-700/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Users className="w-4 h-4 text-emerald-600" />
                  সদস্য ({toBengaliNum(group._count.members)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-72">
                  <div className="space-y-2">
                    {sortedMembers.map((member) => {
                      const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;
                      const RoleIcon = roleCfg.icon;
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                              {member.user.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                              {member.user.name}
                              {member.userId === currentUserId && (
                                <span className="text-emerald-600 dark:text-emerald-400 ml-1">(আপনি)</span>
                              )}
                            </p>
                            <div className="flex items-center gap-1">
                              <RoleIcon className={`w-3 h-3 ${roleCfg.color}`} />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">{roleCfg.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  if (selectedGroup) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <GroupDetailView group={selectedGroup} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">স্টাডি গ্রুপ</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">একসাথে শিখুন, একসাথে বড় হন</p>
          </div>
        </div>
        <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full" />
      </motion.div>

      {/* Stats Bar */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: 'মোট গ্রুপ', value: stats.totalGroups, icon: Users, gradient: 'from-emerald-500 to-emerald-600' },
            { label: 'আমার গ্রুপ', value: stats.myGroups, icon: UserCheck, gradient: 'from-teal-500 to-teal-600' },
            { label: 'মোট সদস্য', value: stats.totalMembers, icon: Eye, gradient: 'from-green-500 to-green-600' },
            { label: 'সক্রিয় গ্রুপ', value: stats.activeGroups, icon: Activity, gradient: 'from-lime-500 to-lime-600' },
          ].map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{toBengaliNum(stat.value)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="গ্রুপ খুঁজুন..."
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="বিষয় ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব বিষয়</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.nameBn}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
              <Plus className="w-4 h-4 mr-2" />
              গ্রুপ তৈরি
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                নতুন স্টাডি গ্রুপ তৈরি করুন
              </DialogTitle>
              <DialogDescription>
                আপনার বন্ধুদের সাথে একসাথে পড়াশোনা করুন
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="group-name">গ্রুপের নাম *</Label>
                <Input
                  id="group-name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))}
                  placeholder="যেমন: বীজগণিত মাস্টার্স"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="group-subject">বিষয় *</Label>
                <Select value={newGroup.subjectId} onValueChange={(v) => setNewGroup((p) => ({ ...p, subjectId: v }))}>
                  <SelectTrigger id="group-subject" className="mt-1">
                    <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nameBn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="group-desc">বিবরণ</Label>
                <Textarea
                  id="group-desc"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((p) => ({ ...p, description: e.target.value }))}
                  placeholder="গ্রুপের উদ্দেশ্য ও লক্ষ্য লিখুন..."
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="max-members">সর্বোচ্চ সদস্য</Label>
                <Select
                  value={String(newGroup.maxMembers)}
                  onValueChange={(v) => setNewGroup((p) => ({ ...p, maxMembers: parseInt(v) }))}
                >
                  <SelectTrigger id="max-members" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25, 30].map((n) => (
                      <SelectItem key={n} value={String(n)}>{toBengaliNum(n)} জন</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleCreateGroup}
                disabled={!newGroup.name || !newGroup.subjectId || creating}
              >
                {creating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-1" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                তৈরি করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="my-groups" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-1.5" />
            আমার গ্রুপ ({toBengaliNum(myGroups.length)})
          </TabsTrigger>
          <TabsTrigger value="discover" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-1.5" />
            আবিষ্কার ({toBengaliNum(discoverGroups.length)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <GroupCardSkeleton key={i} />)}
            </div>
          ) : myGroups.length === 0 ? (
            <EmptyState type="my-groups" />
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {myGroups.map((g) => <GroupCard key={g.id} group={g} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="discover">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <GroupCardSkeleton key={i} />)}
            </div>
          ) : discoverGroups.length === 0 ? (
            <EmptyState type="discover" />
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {discoverGroups.map((g) => <GroupCard key={g.id} group={g} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
