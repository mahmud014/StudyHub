'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  studentProfile?: {
    id: string;
    class: string;
    roll: string | null;
    school: string | null;
  } | null;
  guardian?: {
    id: string;
    children: Array<{
      id: string;
      class: string;
      roll: string | null;
      school: string | null;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  } | null;
}

interface StudyHubContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  hydrated: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
  selectedSubject: string | null;
  setSelectedSubject: (id: string | null) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const StudyHubContext = createContext<StudyHubContextType | undefined>(undefined);

// ─── localStorage helpers ──────────────────────────────────────────────────

function getInitialUser(): User | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('studyhub_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem('studyhub_user');
      }
    }
  }
  return null;
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function StudyHubProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSectionState] = useState<string>('home');
  const [selectedSubject, setSelectedSubjectState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sync activeSection with pathname changes
  useEffect(() => {
    if (!pathname) return;
    if (pathname === '/') {
      setActiveSectionState('home');
    } else if (pathname === '/dashboard') {
      setActiveSectionState('dashboard');
    } else if (pathname.startsWith('/dashboard/')) {
      const sec = pathname.split('/').pop();
      if (sec) {
        setActiveSectionState(sec);
      }
    }
  }, [pathname]);

  // ─── Read user from localStorage after hydration ─────────────────────────
  React.useEffect(() => {
    const storedUser = getInitialUser();
    if (storedUser) {
      setUserState(storedUser);
      const onboardingDone = localStorage.getItem('studyhub_onboarding_done');
      if (!onboardingDone) {
        setShowOnboarding(true);
      }
      
      // Auto-redirect to dashboard if on landing page
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        const role = storedUser.role;
        if (role === 'admin' || role === 'teacher') {
          setActiveSectionState('admin');
          router.replace('/dashboard/admin');
        } else if (role === 'guardian') {
          setActiveSectionState('guardian');
          router.replace('/dashboard/guardian');
        } else {
          setActiveSectionState('dashboard');
          router.replace('/dashboard');
        }
      }
    }
    setHydrated(true);
  }, [router]);

  // ─── Show onboarding when user logs in ───────────────────────────────────
  React.useEffect(() => {
    if (user && hydrated) {
      const onboardingDone = localStorage.getItem('studyhub_onboarding_done');
      if (!onboardingDone) {
        setShowOnboarding(true);
      }
    }
  }, [user, hydrated]);

  // ─── setUser callback ────────────────────────────────────────────────────
  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('studyhub_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('studyhub_user');
    }
  }, []);

  // ─── login callback ──────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || '' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        const role = data.data.role;
        if (role === 'admin' || role === 'teacher') {
          setActiveSectionState('admin');
          router.push('/dashboard/admin');
        } else if (role === 'guardian') {
          setActiveSectionState('guardian');
          router.push('/dashboard/guardian');
        } else {
          setActiveSectionState('dashboard');
          router.push('/dashboard');
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'লগইন ব্যর্থ' };
    } catch {
      return { success: false, error: 'নেটওয়ার্ক সমস্যা' };
    } finally {
      setIsLoading(false);
    }
  }, [setUser, router]);

  // ─── setActiveSection with App Router navigation ────────────────────────
  const setActiveSection = useCallback((section: string) => {
    if (section === 'home') {
      router.push('/');
    } else if (section === 'subject-detail') {
      router.push('/dashboard/subject-detail');
    } else if (section === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${section}`);
    }
  }, [router]);

  // ─── setSelectedSubject ──────────────────────────────────────────────────
  const setSelectedSubject = useCallback((id: string | null) => {
    setSelectedSubjectState(id);
  }, []);

  // ─── logout callback ─────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    setActiveSectionState('home');
    setSelectedSubjectState(null);
    setShowOnboarding(false);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error on logout call:', err);
    }

    router.push('/');
  }, [setUser, router]);

  return (
    <StudyHubContext.Provider value={{
      user, setUser, login, logout, isLoading, hydrated,
      activeSection, setActiveSection,
      selectedSubject, setSelectedSubject,
      showOnboarding, setShowOnboarding
    }}>
      {children}
    </StudyHubContext.Provider>
  );
}

export function useStudyHub() {
  const context = useContext(StudyHubContext);
  if (context === undefined) {
    throw new Error('useStudyHub must be used within a StudyHubProvider');
  }
  return context;
}
