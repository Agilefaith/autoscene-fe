'use client';

import { motion } from 'framer-motion';
import {
  Cross, Landmark, Banknote, Flame, Brain, BookHeart, TrendingUp, MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

interface Niche {
  icon: LucideIcon;
  label: string;
  color: string;
}

const NICHES: Niche[] = [
  { icon: Cross, label: 'Bible Stories', color: '#7C3AED' },
  { icon: Landmark, label: 'History', color: '#8B5CF6' },
  { icon: Banknote, label: 'Finance & Money', color: '#22C55E' },
  { icon: Flame, label: 'Motivation', color: '#F59E0B' },
  { icon: Brain, label: 'Psychology', color: '#C026D3' },
  { icon: BookHeart, label: 'Life Stories', color: '#EC4899' },
  { icon: TrendingUp, label: 'Self-Improvement', color: '#FB923C' },
  { icon: MoreHorizontal, label: '+ Many More', color: '#7C3AED' },
];

export default function PopularNichesSection() {
  return (
    <section id="niches" className="py-16 relative overflow-hidden scroll-mt-24">
      {/* soft background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-primary/[0.05] blur-[150px]" />
      </div>

      <div className="max-w-[1280px] mx-auto px-6 relative">

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary mb-3">
            Popular Niches
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
            Built for Every Content Niche
          </h2>
          <p className="text-text-muted text-base md:text-lg">
            Whatever you create, AutoScene adapts to your style and audience.
          </p>
        </motion.div>

        {/* ── Niche grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {NICHES.map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="group relative flex flex-col items-center text-center gap-3 px-5 py-7 rounded-2xl bg-white border border-border glow-panel cursor-default transition-transform duration-300 hover:-translate-y-1"
            >
              {/* hover accent border */}
              <span
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1.5px ${color}55` }}
              />
              <span
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${color}14` }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </span>
              <span className="text-sm font-semibold text-text">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
