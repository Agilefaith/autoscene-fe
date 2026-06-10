'use client';

import { motion, type Variants } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { plans } from '@/data/pricing';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00D4FF]/04 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto">
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
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#00D4FF] text-xs font-semibold text-white whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-[#52525B] uppercase tracking-widest mb-2">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-[#52525B] text-sm mb-1">/{plan.period}</span>
                </div>
                {plan.avatarTier && (
                  <p className="text-xs text-[#8A2BE2] font-medium">{plan.avatarTier}</p>
                )}
                <p className="text-xs text-[#52525B] mt-0.5">
                  {typeof plan.personaLimit === 'number'
                    ? `Up to ${plan.personaLimit} personas`
                    : 'Unlimited personas'}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                    <Check className="w-4 h-4 text-[#8A2BE2] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.creditPacks.length > 0 && (
                <div className="border-t border-white/[0.06] pt-5">
                  <p className="text-xs font-medium text-[#52525B] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Credit Packs
                  </p>
                  <div className="flex flex-col gap-2">
                    {plan.creditPacks.map((pack) => (
                      <div
                        key={pack.price}
                        className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.05]"
                      >
                        <div>
                          <span className="text-sm font-semibold text-white">${pack.price}</span>
                          <span className="text-xs text-[#52525B] ml-1.5">→ {pack.credits} credits</span>
                        </div>
                        <span className="text-[10px] text-[#52525B]">
                          ≈ {pack.approxMinutes} min of video
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={plan.ctaHref}
                className={cn(
                  'mt-auto w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                  plan.highlighted
                    ? 'btn-neon'
                    : 'border border-white/[0.08] text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] hover:border-white/20'
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
