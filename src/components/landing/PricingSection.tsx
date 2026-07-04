'use client';

import { motion, type Variants } from 'framer-motion';
import { Check, Clock, Video } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { plans } from '@/data/pricing';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 relative scroll-mt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1536px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-text">
            Simple <span className="gradient-text-cta">Pricing</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Start free. Scale as you grow. No surprise fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className={cn(
                'relative rounded-2xl p-7 flex flex-col gap-6 transition-all duration-300',
                plan.highlighted
                  ? 'glass glow-blue gradient-border z-10'
                  : 'glass glass-hover min-h-[520px]'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full gradient-brand text-xs font-semibold text-white whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-text">${plan.price}</span>
                  <span className="text-text-muted text-sm mb-1">/{plan.period}</span>
                </div>
                <p className="text-xs text-primary font-medium">{plan.mode}</p>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-xs text-text-muted flex items-center gap-1.5">
                    <Video className="w-3 h-3" /> {plan.quota}
                  </p>
                  <p className="text-xs text-text-muted flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {plan.maxDuration}
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-2.5">
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
                  'mt-auto w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                  plan.highlighted
                    ? 'btn-neon'
                    : 'btn-secondary'
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
