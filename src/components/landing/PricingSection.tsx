'use client';

import { motion, type Variants } from 'framer-motion';
import { Check, Coins, Gauge, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { plans, topupPacks, type LandingPlan } from '@/data/pricing';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06 },
  }),
};

function SpecRow({ icon: Icon, children }: { icon: typeof Coins; children: React.ReactNode }) {
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
      whileInView="show"
      viewport={{ once: true }}
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
        <span className="text-3xl font-bold text-text">{plan.price}</span>
        <span className="text-text-muted text-sm mb-1.5">/ {plan.period}</span>
      </div>

      {/* Uniform spec block — same order on every card for easy comparison */}
      <div className="flex flex-col gap-2.5 mt-6 pb-6 border-b border-border">
        <SpecRow icon={Coins}>
          <b className="text-text font-semibold">{plan.credits}</b>
        </SpecRow>
        <SpecRow icon={Zap}>{plan.creditsSub}</SpecRow>
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
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-text">
            Simple <span className="gradient-text-cta">Pricing</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            One credit is one minute of finished video. Pick the plan that fits how
            much you publish.
          </p>
        </motion.div>

        <div className="grid gap-6 items-stretch grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* Pay-As-You-Go — a one-off purchase, so it reads as a strip not a plan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 glass rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-5"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="hidden sm:flex w-10 h-10 rounded-xl bg-primary-50 items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </span>
            <div>
              <p className="font-semibold text-text">Pay-As-You-Go</p>
              <p className="text-sm text-text-muted">
                Top up any time. These credits never expire.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {topupPacks.map((pack) => (
              <div
                key={pack.id}
                className="rounded-xl border border-border px-4 py-2.5 text-center"
              >
                <p className="text-sm font-semibold text-text">{pack.credits}</p>
                <p className="text-xs text-text-muted">{pack.price}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fine print — mirrors Faith's brief "core principle" */}
        <p className="text-center text-xs text-text-muted mt-6">
          Plan credits reset monthly with no rollover · Pay-As-You-Go credits never expire.
        </p>
      </div>
    </section>
  );
}
