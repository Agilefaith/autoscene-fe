'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, Mail, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/lib/animations';
import { inputClass } from '@/lib/styles';
import { authedFetch, authedJson } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useConfirm, useToast } from '@/components/ui/ConfirmProvider';

interface Invite {
  id: string;
  email: string;
  plan_id: string;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
  accepted_at?: string | null;
}
interface PlanOption {
  id: string; name: string; price_ngn: number;
  credits_per_month: number;
}

const STATUS_STYLE: Record<Invite['status'], string> = {
  pending: 'bg-[#F59E0B]/10 text-[#B45309] border-[#F59E0B]/25',
  accepted: 'bg-[#22C55E]/10 text-[#15803D] border-[#22C55E]/25',
  revoked: 'bg-surface-muted text-text-muted border-border',
};

export default function TeamPage() {
  const { profile } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState('starter');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = profile?.role === 'admin';

  const load = useCallback(async () => {
    if (!isAdmin) { setLoading(false); return; }
    try {
      const [inv, pl] = await Promise.all([
        authedJson<Invite[]>('/api/admin/invites'),
        authedJson<PlanOption[]>('/api/admin/plans'),
      ]);
      setInvites(inv); setPlans(pl);
    } catch { /* surfaced by the empty state */ }
    finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const invite = async () => {
    if (!email.trim()) { setError('Enter an email address.'); return; }
    setError(''); setSending(true);
    try {
      const res = await authedFetch('/api/admin/invites', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), plan_id: planId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.detail ?? 'Could not send the invitation.'); return; }
      setInvites((prev) => [data as Invite, ...prev]);
      setEmail('');
      toast(`Invitation sent to ${data.email}`);
    } catch (e) { setError((e as Error).message); }
    finally { setSending(false); }
  };

  const revoke = async (inv: Invite) => {
    const ok = await confirm({
      title: 'Revoke this invitation?',
      message: `${inv.email} will no longer be able to join, and the account created for them is removed.`,
      confirmLabel: 'Revoke', variant: 'danger',
    });
    if (!ok) return;
    try {
      const res = await authedFetch(`/api/admin/invites/${inv.id}/revoke`, { method: 'POST' });
      if (!res.ok) { toast('Could not revoke that invitation', 'error'); return; }
      setInvites((prev) => prev.map((x) => x.id === inv.id ? { ...x, status: 'revoked' } : x));
      toast('Invitation revoked');
    } catch { toast('Could not revoke that invitation', 'error'); }
  };

  if (!loading && !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto glass rounded-2xl p-10 text-center">
        <ShieldCheck className="w-8 h-8 text-text-muted mx-auto mb-3" />
        <h1 className="text-lg font-semibold text-text">Admins only</h1>
        <p className="text-sm text-text-muted mt-1">Only the account administrator can invite people to AutoScene.</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-bold text-text">Team access</h1>
        <p className="text-sm text-text-muted mt-1">
          AutoScene is invite-only. Invite someone by email and choose the plan they start on.
          They receive an invitation and set their own password.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-text">Invite someone</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-3 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Email address</label>
            <input className={inputClass} type="email" placeholder="name@example.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Plan</label>
            <select className="w-full px-3 py-2.5 rounded-xl border border-border-strong bg-white text-sm text-text"
              value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.credits_per_month} credits / month
                </option>
              ))}
            </select>
          </div>
          <button onClick={invite} disabled={sending}
            className="btn-cta inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send invite
          </button>
        </div>
        {error && <p className="flex items-center gap-1.5 text-xs text-[#EF4444]"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}</p>}
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Invitations</h2>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center text-sm text-text-muted gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : invites.length === 0 ? (
          <p className="p-8 text-sm text-text-muted text-center">Nobody has been invited yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((inv) => (
              <li key={inv.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{inv.email}</p>
                  <p className="text-xs text-text-muted">
                    {plans.find((p) => p.id === inv.plan_id)?.name ?? inv.plan_id}
                    {' · '}invited {new Date(inv.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize', STATUS_STYLE[inv.status])}>
                  {inv.status === 'accepted' && <Check className="w-3 h-3 inline mr-1" />}
                  {inv.status}
                </span>
                {inv.status === 'pending' && (
                  <button onClick={() => revoke(inv)} title="Revoke invitation"
                    className="p-2 rounded-lg text-text-muted hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}
