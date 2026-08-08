'use client';

import { motion } from 'framer-motion';
import { LogOut, Mail, Shield, Zap, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/lib/animations';
import { planById } from '@/data/plans';

export default function SettingsPage() {
  const { user, profile, credits, signOut } = useAuth();

  const name = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const email = user?.email ?? '—';
  const initials = String(name).split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  const plan = planById(profile?.plan_tier);

  const rows = [
    { icon: Mail, label: 'Email', value: email },
    { icon: BadgeCheck, label: 'Plan', value: plan?.name ?? 'No plan' },
    { icon: Shield, label: 'Account type', value: profile?.user_type ?? 'trial' },
    { icon: Zap, label: 'Credits left', value: `${(credits?.balance ?? 0) + (credits?.topup_balance ?? 0)}` },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-bold text-text">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Your account details.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center text-lg font-bold text-white">{initials}</div>
          <div>
            <p className="text-lg font-semibold text-text">{name}</p>
            <p className="text-sm text-text-muted">{email}</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-2xl divide-y divide-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary"><r.icon className="w-4 h-4" /></div>
            <span className="text-sm text-text-muted">{r.label}</span>
            <span className={cn('ml-auto text-sm font-medium text-text', r.label === 'Account type' && 'capitalize')}>{r.value}</span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <button onClick={() => signOut()} className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-error border-error/30 hover:bg-error/5">
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </motion.div>
    </motion.div>
  );
}
