'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Crown, Check, CreditCard,
  ChevronRight, Sparkles, Coins, Video, Infinity as InfinityIcon,
  ArrowDownLeft, ArrowUpRight, Loader2, ReceiptText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/lib/animations';
import { authedFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { BillingUsage, CreditTransaction } from '@/types/billing';
import {
  PLAN_CATALOG, TOPUP_PACKS, planById, formatNgn,
  type PlanDef, type PlanId, type TopupPackDef,
} from '@/data/plans';

// ─── Plan visuals ──────────────────────────────────────────────────────────────

const PLAN_COLOR: Record<PlanId, string> = {
  starter: '#0EA5E9', creator: '#7C3AED', pro: '#C026D3', scale: '#DB2777',
};
const NO_PLAN_COLOR = '#6E6A7C';

function planIcon(plan: PlanDef) {
  if (plan.id === 'pro' || plan.id === 'scale') return <Crown className="w-5 h-5" />;
  return <Zap className="w-5 h-5" />;
}

function formatTxType(type: string) {
  switch (type) {
    case 'deduction': return 'Video generated';
    case 'refund':    return 'Credits refunded';
    case 'topup':     return 'Credits purchased';
    case 'grant':     return 'Plan credits added';
    default:          return type;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="h-4 w-32 bg-surface-muted rounded-lg" />
      <div className="h-10 w-24 bg-surface-muted rounded-lg" />
      <div className="h-2 bg-surface-muted rounded-full" />
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, isCurrent }: { plan: PlanDef; isCurrent: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const color = PLAN_COLOR[plan.id];

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const res = await authedFetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          success_url: `${origin}/billing?upgraded=1`,
          cancel_url: `${origin}/billing`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url; // Paystack hosted checkout
        return;
      }
      setError(data?.detail ?? 'Failed to start checkout');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={cn('glass rounded-2xl p-5 flex flex-col gap-4 relative transition-all', isCurrent && 'border')}
      style={isCurrent ? { borderColor: color + '66' } : {}}
    >
      {plan.badge && !isCurrent && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gradient-brand text-[10px] font-bold text-white whitespace-nowrap">
          {plan.badge}
        </div>
      )}
      {isCurrent && (
        <div
          className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold border"
          style={{ background: color + '1A', borderColor: color + '40', color }}
        >
          Current Plan
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '1A', color }}>
          {planIcon(plan)}
        </div>
        <div>
          <h3 className="text-base font-bold text-text">{plan.name}</h3>
          <p className="text-xs" style={{ color }}>{plan.queue}</p>
        </div>
      </div>

      <div>
        <span className="text-2xl font-bold text-text">{formatNgn(plan.priceNgn)}</span>
        <span className="text-sm text-text-muted ml-1">/ mo</span>
        <p className="text-xs text-text-muted mt-0.5">
          {plan.creditsPerMonth} credits · ≈ {plan.creditsPerMonth} min of video / mo
        </p>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div
          className="py-2.5 rounded-xl text-xs font-semibold text-center border"
          style={{ borderColor: color + '30', color, background: color + '0D' }}
        >
          Active
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className={cn(
              'py-2.5 rounded-xl text-xs font-semibold border border-border text-text-secondary hover:text-text hover:border-primary/30 transition-all flex items-center justify-center gap-2',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Choose {plan.name}
          </button>
          {error && <p className="text-[10px] text-[#EF4444] text-center">{error}</p>}
        </div>
      )}
    </motion.div>
  );
}

// ─── Top-up Card ──────────────────────────────────────────────────────────────

function TopupCard({ pack }: { pack: TopupPackDef }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch('/api/billing/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: pack.id,
          success_url: `${window.location.origin}/billing?topped_up=1`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.detail ?? 'Failed to start checkout');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={itemVariants} className="glass rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text">{pack.credits} credits</h3>
          <p className="text-xs text-text-muted">≈ {pack.credits} min of video</p>
        </div>
      </div>
      <p className="text-2xl font-bold text-text">{formatNgn(pack.priceNgn)}</p>
      <p className="text-xs text-text-muted flex items-center gap-1.5">
        <InfinityIcon className="w-3.5 h-3.5 text-primary/70" />
        One-off purchase · these credits never expire
      </p>
      <button
        onClick={handleBuy}
        disabled={loading}
        className={cn(
          'py-2.5 rounded-xl text-xs font-semibold border border-border text-text-secondary hover:text-text hover:border-primary/30 transition-all flex items-center justify-center gap-2',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Buy credits
      </button>
      {error && <p className="text-[10px] text-[#EF4444] text-center">{error}</p>}
    </motion.div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: CreditTransaction }) {
  const isPositive = tx.amount > 0;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
        isPositive ? 'bg-[#22C55E]/10' : 'bg-[#EF4444]/10'
      )}>
        {isPositive
          ? <ArrowDownLeft className="w-3.5 h-3.5 text-[#22C55E]" />
          : <ArrowUpRight className="w-3.5 h-3.5 text-[#EF4444]" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text truncate">{formatTxType(tx.type)}</p>
        <p className="text-xs text-text-muted">{formatDate(tx.created_at)}</p>
      </div>
      <span className={cn('text-sm font-semibold shrink-0', isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]')}>
        {isPositive ? '+' : ''}{tx.amount} {Math.abs(tx.amount) === 1 ? 'credit' : 'credits'}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { user } = useAuth();
  const [usage, setUsage]             = useState<BillingUsage | null>(null);
  const [transactions, setTxs]        = useState<CreditTransaction[]>([]);
  const [loadingUsage, setLoadingUsage]   = useState(true);
  const [loadingTxs, setLoadingTxs]       = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user) return;
    setLoadingUsage(true);
    try {
      const res = await authedFetch('/api/billing/usage');
      if (res.ok) setUsage(await res.json());
    } finally {
      setLoadingUsage(false);
    }
  }, [user]);

  const fetchTxs = useCallback(async () => {
    if (!user) return;
    setLoadingTxs(true);
    try {
      const res = await authedFetch('/api/billing/transactions');
      if (res.ok) setTxs(await res.json());
    } finally {
      setLoadingTxs(false);
    }
  }, [user]);

  useEffect(() => { fetchUsage(); fetchTxs(); }, [fetchUsage, fetchTxs]);

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError]     = useState<string | null>(null);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await authedFetch('/api/billing/portal');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setPortalError(data?.detail ?? 'Could not open subscription portal');
    } catch {
      setPortalError('Network error. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const planId          = usage?.plan_tier ?? '';
  const currentPlan     = planById(planId);
  const color           = currentPlan ? PLAN_COLOR[currentPlan.id] : NO_PLAN_COLOR;
  const planCredits     = usage?.plan_credits ?? 0;
  const topupCredits    = usage?.topup_credits ?? 0;
  const quota           = usage?.monthly_quota ?? currentPlan?.creditsPerMonth ?? 0;
  const creditsUsed     = Math.max(0, quota - planCredits);
  const pct             = quota > 0 ? (planCredits / quota) * 100 : 0;
  const videosGenerated = usage?.videos_generated ?? 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto flex flex-col gap-8">

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">Billing</h1>
        <p className="text-sm text-text-muted mt-1">
          Your plan and credits. One credit is one minute of finished video.
        </p>
      </motion.div>

      {/* ── Credits + Plan summary ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {loadingUsage ? <CardSkeleton /> : (
          <div className="glass rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
                <Coins className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-sm font-semibold text-text">Credits this period</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-text">{planCredits}</span>
                <span className="text-sm text-text-muted">/ {quota} plan credits left</span>
              </div>
              <p className="text-xs text-text-muted">≈ {planCredits} min of video remaining</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: pct > 40 ? '#7C3AED' : pct > 15 ? 'linear-gradient(90deg, #FBBF24, #F97316)' : '#EF4444',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#6E6A7C]">
                <span>{creditsUsed} used this cycle</span>
                <span>{planCredits} remaining</span>
              </div>
            </div>

            {topupCredits > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary-50/60 border border-primary/15">
                <span className="text-xs text-text-secondary flex items-center gap-1.5">
                  <InfinityIcon className="w-3.5 h-3.5 text-primary" />
                  Pay-As-You-Go credits
                </span>
                <span className="text-sm font-bold text-primary">{topupCredits}</span>
              </div>
            )}

            <p className="text-[10px] text-[#6E6A7C] leading-relaxed pt-1 border-t border-border">
              {usage?.reset_date
                ? `Plan credits reset ${formatDate(usage.reset_date)} · no rollover. Pay-As-You-Go credits never expire.`
                : 'Subscribe to a plan for monthly credits, or top up as you go.'}
            </p>
          </div>
        )}

        {loadingUsage ? <CardSkeleton /> : (
          <div className="glass rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '1A', color }}>
                {currentPlan ? planIcon(currentPlan) : <Sparkles className="w-5 h-5" />}
              </div>
              <span className="text-sm font-semibold text-text">Current Plan</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-text">{currentPlan?.name ?? 'No plan'}</p>
                <p className="text-xs mt-0.5" style={{ color }}>
                  {currentPlan
                    ? `${currentPlan.queue} · ${formatNgn(currentPlan.priceNgn)}/mo`
                    : 'Choose a plan below to start creating'}
                </p>
              </div>
              {currentPlan && (
                <div
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border"
                  style={{ background: color + '1A', borderColor: color + '40', color }}
                >
                  Active
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-surface-muted rounded-xl p-3 flex flex-col gap-1">
                <Coins className="w-4 h-4 text-text-muted" />
                <p className="text-xl font-bold text-text">{planCredits + topupCredits}</p>
                <p className="text-[10px] text-text-muted">Credits available</p>
              </div>
              <div className="bg-surface-muted rounded-xl p-3 flex flex-col gap-1">
                <Video className="w-4 h-4 text-text-muted" />
                <p className="text-xl font-bold text-text">{videosGenerated}</p>
                <p className="text-[10px] text-text-muted">Videos generated (all time)</p>
              </div>
            </div>

            {currentPlan && (
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:bg-surface-muted transition-all group',
                    portalLoading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span className="text-xs text-text-secondary group-hover:text-text transition-colors flex items-center gap-2">
                    {portalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Manage subscription
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#6E6A7C] group-hover:text-text transition-colors" />
                </button>
                {portalError && <p className="text-[10px] text-[#EF4444]">{portalError}</p>}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Plans ── */}
      <motion.section variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-base font-semibold text-text">Plans</h2>
        </div>
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_CATALOG.map((plan) => (
            <PlanCard key={plan.id} plan={plan} isCurrent={plan.id === planId} />
          ))}
        </motion.div>
      </motion.section>

      {/* ── Pay-As-You-Go ── */}
      <motion.section variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-base font-semibold text-text">Pay-As-You-Go</h2>
        </div>
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {TOPUP_PACKS.map((pack) => (
            <TopupCard key={pack.id} pack={pack} />
          ))}
        </motion.div>
      </motion.section>

      {/* ── Payment Method ── */}
      <motion.section variants={itemVariants} className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-text">Payment Method</h2>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-muted border border-border">
          <div className="w-12 h-8 bg-surface border border-border rounded-lg flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-text-muted" />
          </div>
          <p className="text-xs text-text-muted">
            Payments are securely processed via <span className="text-text-secondary">Paystack</span> in Naira. AutoScene does not store your card details. Manage your card and cancellation from the subscription portal.
          </p>
        </div>
      </motion.section>

      {/* ── Transaction History ── */}
      <motion.section variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-text-muted" />
          <h2 className="text-base font-semibold text-text">Activity</h2>
        </div>

        <div className="glass rounded-2xl p-5">
          {loadingTxs ? (
            <div className="flex items-center justify-center py-8 gap-2 text-text-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading activity…</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <ReceiptText className="w-7 h-7 text-[#6E6A7C]" />
              <p className="text-sm text-text-muted">No activity yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </motion.section>

    </motion.div>
  );
}
