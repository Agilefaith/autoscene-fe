'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Crown, Shield, Check, CreditCard, Plus,
  ChevronRight, Sparkles, Clock, Video, X, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanId = 'free' | 'pro' | 'premium';

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  avatar: string;
  videoLimit: string;
  features: string[];
  creditPackages?: CreditPackage[];
  color: string;
  icon: React.ReactNode;
}

interface CreditPackage {
  credits: number;
  price: number;
  mins: number;
  popular?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '$0 / mo',
    avatar: 'Avatar III',
    videoLimit: '2 videos',
    color: '#52525B',
    icon: <Shield className="w-5 h-5" />,
    features: [
      '1 free credit (30s video)',
      'Avatar III only',
      'Up to 2 videos',
      'Watermarked output',
      'Standard support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceLabel: '$29 / mo',
    avatar: 'Avatar III',
    videoLimit: '10 videos / mo',
    color: '#00D4FF',
    icon: <Zap className="w-5 h-5" />,
    features: [
      'Avatar III (high quality)',
      'FFmpeg editing engine',
      'Up to 10 personas',
      'Custom voice IDs',
      'Campaign scheduler',
      'Priority support',
    ],
    creditPackages: [
      { credits: 10, price: 10, mins: 5 },
      { credits: 40, price: 30, mins: 20, popular: true },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 79,
    priceLabel: '$79 / mo',
    avatar: 'Avatar IV',
    videoLimit: 'Unlimited',
    color: '#8A2BE2',
    icon: <Crown className="w-5 h-5" />,
    features: [
      'Avatar IV (natural realism)',
      'HeyGen motion prompts',
      'Unlimited videos',
      'Unlimited personas',
      'Voice cloning',
      'Dedicated support',
    ],
    creditPackages: [
      { credits: 40, price: 100, mins: 20, popular: true },
    ],
  },
];

// ─── Mock user state ──────────────────────────────────────────────────────────

const MOCK_USER = {
  plan: 'pro' as PlanId,
  creditsTotal: 40,
  creditsUsed: 14,
  videosGenerated: 7,
  card: { brand: 'Visa', last4: '4242', expiry: '06/28' },
};

// ─── Utils ────────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

function creditsToMins(credits: number, plan: PlanId) {
  const multiplier = plan === 'premium' ? 4 : 1;
  return Math.floor((credits * 30) / 60 / multiplier);
}

// ─── Buy Credits Modal ────────────────────────────────────────────────────────

function BuyCreditsModal({
  plan,
  onClose,
}: {
  plan: Plan;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-[#0F0F18] rounded-2xl border border-white/[0.10] p-6 flex flex-col gap-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Buy Credits</h2>
            <p className="text-xs text-[#52525B] mt-0.5">1 credit = 30s of video · {plan.name} plan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {plan.creditPackages?.map((pkg) => (
            <button
              key={pkg.price}
              onClick={() => setSelected(pkg.price)}
              className={cn(
                'relative w-full p-4 rounded-xl border text-left transition-all',
                selected === pkg.price
                  ? 'border-[#00D4FF]/60 bg-[#00D4FF]/[0.06]'
                  : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
              )}
            >
              {pkg.popular && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/30 text-[10px] font-bold text-[#00D4FF]">
                  Best Value
                </span>
              )}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl font-bold text-white">${pkg.price}</span>
                <span className="text-sm text-[#52525B]">for {pkg.credits} credits</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#52525B]">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ≈ {pkg.mins} mins of video</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {pkg.credits} credits</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#FBBF24]/[0.06] border border-[#FBBF24]/20">
          <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
          <p className="text-xs text-[#FBBF24]/80">Payments processed securely via Stripe. Credits never expire.</p>
        </div>

        <button
          disabled={selected === null}
          className={cn(
            'btn-neon py-3 rounded-xl text-sm font-semibold transition-all',
            selected === null && 'opacity-40 cursor-not-allowed'
          )}
        >
          {selected ? `Pay $${selected} via Stripe` : 'Select a package'}
        </button>
      </motion.div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isCurrent,
  onSelect,
}: {
  plan: Plan;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'glass rounded-2xl p-5 flex flex-col gap-4 relative transition-all',
        isCurrent && 'border border-opacity-40',
      )}
      style={isCurrent ? { borderColor: plan.color + '66' } : {}}
    >
      {isCurrent && (
        <div
          className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold border"
          style={{ background: plan.color + '1A', borderColor: plan.color + '40', color: plan.color }}
        >
          Current Plan
        </div>
      )}

      {/* Icon + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: plan.color + '1A', color: plan.color }}
        >
          {plan.icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{plan.name}</h3>
          <p className="text-xs" style={{ color: plan.color }}>{plan.avatar}</p>
        </div>
      </div>

      {/* Price */}
      <div>
        <span className="text-2xl font-bold text-white">{plan.priceLabel.split(' ')[0]}</span>
        <span className="text-sm text-[#52525B] ml-1">/ mo</span>
        <p className="text-xs text-[#52525B] mt-0.5">{plan.videoLimit}</p>
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-[#A1A1AA]">
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: plan.color }} />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        <div
          className="py-2.5 rounded-xl text-xs font-semibold text-center border"
          style={{ borderColor: plan.color + '30', color: plan.color, background: plan.color + '0D' }}
        >
          Active
        </div>
      ) : (
        <button
          onClick={onSelect}
          className="py-2.5 rounded-xl text-xs font-semibold border border-white/[0.10] text-[#A1A1AA] hover:text-white hover:border-white/30 transition-all"
        >
          {plan.price === 0 ? 'Downgrade' : 'Upgrade'} to {plan.name}
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const currentPlan = PLANS.find((p) => p.id === MOCK_USER.plan)!;
  const creditsRemaining = MOCK_USER.creditsTotal - MOCK_USER.creditsUsed;
  const creditPct = (creditsRemaining / MOCK_USER.creditsTotal) * 100;
  const minsRemaining = creditsToMins(creditsRemaining, MOCK_USER.plan);

  return (
    <>
      <AnimatePresence>
        {showBuyModal && (
          <BuyCreditsModal plan={currentPlan} onClose={() => setShowBuyModal(false)} />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto flex flex-col gap-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-sm text-[#52525B] mt-1">Manage your plan, credits, and payment method.</p>
        </motion.div>

        {/* ── Credits + Plan summary ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Credits card */}
          <div className="glass rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#00D4FF]" />
                </div>
                <span className="text-sm font-semibold text-white">Credits Balance</span>
              </div>
              {MOCK_USER.plan !== 'free' && (
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-semibold hover:bg-[#00D4FF]/20 transition-all"
                >
                  <Plus className="w-3 h-3" /> Buy Credits
                </button>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-white">{creditsRemaining}</span>
                <span className="text-sm text-[#52525B]">/ {MOCK_USER.creditsTotal} credits</span>
              </div>
              <p className="text-xs text-[#52525B] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ≈ {minsRemaining} mins of video remaining
              </p>
            </div>

            {/* Progress bar */}
            <div className="flex flex-col gap-1.5">
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${creditPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: creditPct > 40
                      ? 'linear-gradient(90deg, #00D4FF, #8A2BE2)'
                      : creditPct > 15
                        ? 'linear-gradient(90deg, #FBBF24, #F97316)'
                        : '#EF4444',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#3F3F46]">
                <span>{MOCK_USER.creditsUsed} used this cycle</span>
                <span>{creditsRemaining} remaining</span>
              </div>
            </div>

            {/* Formula note */}
            <p className="text-[10px] text-[#3F3F46] leading-relaxed pt-1 border-t border-white/[0.05]">
              1 credit = 30s · Avatar III = 1×/credit · Avatar IV = 4×/credit
            </p>
          </div>

          {/* Plan + usage card */}
          <div className="glass rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: currentPlan.color + '1A', color: currentPlan.color }}
              >
                {currentPlan.icon}
              </div>
              <span className="text-sm font-semibold text-white">Current Plan</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{currentPlan.name}</p>
                <p className="text-xs mt-0.5" style={{ color: currentPlan.color }}>
                  {currentPlan.avatar} · {currentPlan.priceLabel}
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-bold border"
                style={{ background: currentPlan.color + '1A', borderColor: currentPlan.color + '40', color: currentPlan.color }}
              >
                Active
              </div>
            </div>

            {/* Usage stats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/[0.03] rounded-xl p-3 flex flex-col gap-1">
                <Video className="w-4 h-4 text-[#52525B]" />
                <p className="text-xl font-bold text-white">{MOCK_USER.videosGenerated}</p>
                <p className="text-[10px] text-[#52525B]">Videos generated</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 flex flex-col gap-1">
                <Zap className="w-4 h-4 text-[#52525B]" />
                <p className="text-xl font-bold text-white">{MOCK_USER.creditsUsed}</p>
                <p className="text-[10px] text-[#52525B]">Credits used</p>
              </div>
            </div>

            <button className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] hover:bg-white/[0.03] transition-all group">
              <span className="text-xs text-[#A1A1AA] group-hover:text-white transition-colors">Manage subscription via Stripe</span>
              <ChevronRight className="w-4 h-4 text-[#3F3F46] group-hover:text-white transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* ── Plans ── */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8A2BE2]" />
            <h2 className="text-base font-semibold text-white">Plans</h2>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === MOCK_USER.plan}
                onSelect={() => console.log('Switch to', plan.id)}
              />
            ))}
          </motion.div>
        </motion.section>

        {/* ── Payment Method ── */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-white">Payment Method</h2>
          <div className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-white/[0.06] border border-white/[0.08] rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#52525B]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {MOCK_USER.card.brand} •••• {MOCK_USER.card.last4}
                </p>
                <p className="text-xs text-[#52525B]">Expires {MOCK_USER.card.expiry}</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl border border-white/[0.08] text-xs font-semibold text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all">
              Update
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-4 h-4 rounded bg-[#635BFF] flex items-center justify-center shrink-0">
              <span className="text-[8px] font-black text-white">S</span>
            </div>
            <p className="text-xs text-[#52525B]">
              Payments are securely processed by <span className="text-[#A1A1AA]">Stripe</span>. Vidora does not store your card details.
            </p>
          </div>
        </motion.section>
      </motion.div>
    </>
  );
}
