'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, ShieldCheck, WandSparkles, Cloud, type LucideIcon } from 'lucide-react';

interface BarItem {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const ITEMS: BarItem[] = [
  { icon: Sparkles, title: 'AI-Powered Everything', subtitle: 'From script to video' },
  { icon: Zap, title: 'Lightning Fast Rendering', subtitle: 'Minutes, not hours' },
  { icon: ShieldCheck, title: 'Cinematic Quality Visuals', subtitle: 'For every niche' },
  { icon: WandSparkles, title: 'Fully Customizable Everything', subtitle: 'Your style, your way' },
  { icon: Cloud, title: 'Cloud-Based & Secure', subtitle: 'Access anywhere' },
];

export default function FeatureBar() {
  return (
    <section id="feature-bar" className="relative z-20 -mt-10 lg:-mt-20 scroll-mt-24">
      <div className="max-w-[1536px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl bg-white border border-border glow-panel px-4 py-6 sm:px-6
                     grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-6"
        >
          {ITEMS.map(({ icon: Icon, title, subtitle }, i) => (
            <div
              key={title}
              className={`flex items-center gap-4 px-4 lg:px-6 ${
                i > 0 ? 'lg:border-l lg:border-border' : ''
              }`}
            >
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-text text-[15px] leading-snug">{title}</p>
                <p className="text-text-muted text-sm mt-0.5">{subtitle}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
