'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Check, Clock, Video, Gauge, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  mode1Plans,
  mode2Plans,
  freePlan,
  type LandingPlan,
} from '@/data/pricing';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06 },
  }),
};

type ModeKey = 'mode_1' | 'mode_2';

const MODES: {
  key: ModeKey;
  label: string;
  tag: string;
  blurb: string;
  plans: LandingPlan[];
}[] = [
  {
    key: 'mode_1',
    label: 'Cinematic',
    tag: 'Mode 1',
    blurb: 'One image per scene with transitions + motion effects.',
    plans: mode1Plans,
  },
  {
    key: 'mode_2',
    label: 'Enhanced',
    tag: 'Mode 2',
    blurb: 'Three images per scene for a polished cinematic feel.',
    plans: mode2Plans,
  },
];

function SpecRow({ icon: Icon, children }: { icon: typeof Video; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <Icon className="w-4 h-4 text-primary/70 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function PlanCard({ plan, index }: { plan: LandingPlan; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className={cn(
        'relative rounded-2xl p-7 flex flex-col',
        plan.highlighted ? 'glass glow-blue gradient-border z-10' : 'glass glass-hover'
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full gradient-brand text-xs font-semibold text-white whitespace-nowrap shadow-sm">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header: name + price */}
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
        {plan.name}
      </p>
      <div className="flex items-end gap-1.5">
        <span className="text-4xl font-bold text-text">${plan.price}</span>
        <span className="text-text-muted text-sm mb-1.5">/ {plan.period}</span>
      </div>

      {/* Uniform spec block — same order on every card for easy comparison */}
      <div className="flex flex-col gap-2.5 mt-6 pb-6 border-b border-border">
        <SpecRow icon={Video}>
          <b className="text-text font-semibold">{plan.videos}</b> {plan.videosSub}
        </SpecRow>
        <SpecRow icon={Clock}>{plan.maxDuration}</SpecRow>
        <SpecRow icon={Gauge}>{plan.queue}</SpecRow>
      </div>

      {/* Value-add features */}
      <ul className="flex flex-col gap-2.5 mt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={cn(
          'mt-8 w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200',
          plan.highlighted ? 'btn-neon' : 'btn-secondary'
        )}
      >
        {plan.cta}
      </Link>
    </motion.div>
  );
}

export default function PricingSection() {
  const [mode, setMode] = useState<ModeKey>('mode_1');
  const active = MODES.find((m) => m.key === mode)!;

  return (
    <section id="pricing" className="py-20 relative scroll-mt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-text">
            Simple <span className="gradient-text-cta">Pricing</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Start free. Scale as you grow. No surprise fees.
          </p>
        </motion.div>

        {/* Mode toggle — pick quality tier first, then compare plans within it */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="relative inline-flex p-1 rounded-full glass">
            {MODES.map((m) => {
              const isActive = m.key === mode;
              return (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={cn(
                    'relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200',
                    isActive ? 'text-white' : 'text-text-muted hover:text-text'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="mode-pill"
                      className="absolute inset-0 rounded-full gradient-brand -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  {m.label}
                  <span className={cn('ml-1.5 text-xs opacity-70')}>{m.tag}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-text-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary/70" />
            {active.blurb}
          </p>
        </div>

        {/* Plan cards for the selected mode */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'grid gap-6 items-stretch mx-auto',
              active.plans.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-3xl'
                : 'grid-cols-1 md:grid-cols-3'
            )}
          >
            {active.plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Free-trial strip — lightweight, not a full card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 glass rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="hidden sm:flex w-10 h-10 rounded-xl bg-primary-50 items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </span>
            <div>
              <p className="font-semibold text-text">Just exploring? Try it free.</p>
              <p className="text-sm text-text-muted">
                1 free 30s video · Cinematic motion (Mode 1).
              </p>
            </div>
          </div>
          <Link
            href={freePlan.ctaHref}
            className="btn-secondary px-6 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap"
          >
            Start Free
          </Link>
        </motion.div>

        {/* Fine print — mirrors Faith's brief "core principle" */}
        <p className="text-center text-xs text-text-muted mt-6">
          Hard limits · no rollover · all limits reset monthly.
        </p>
      </div>
    </section>
  );
}
