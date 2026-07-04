'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { PlanId } from '@/data/plans';

interface UserProfile {
  user_type: 'trial' | 'standard' | 'internal';
  plan_tier: PlanId;
}

interface Credits {
  balance: number;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  credits: Credits | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  credits: null,
  loading: true,
  signOut: async () => {},
  refreshCredits: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('user_type, plan_tier')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as UserProfile);
  };

  const refreshCredits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    if (data) setCredits(data as Credits);
  };

  useEffect(() => {
    let mounted = true;

    // Primary: getSession() to resolve loading immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        supabase
          .from('credits')
          .select('balance')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => { if (mounted && data) setCredits(data as Credits); });
      }
      setLoading(false);
    });

    // Secondary: keep session in sync on sign-in / sign-out / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        supabase
          .from('credits')
          .select('balance')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => { if (mounted && data) setCredits(data as Credits); });
      } else {
        setProfile(null);
        setCredits(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, credits, loading, signOut, refreshCredits }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
