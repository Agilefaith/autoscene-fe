'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/animations';

// Sample renders (SDXL, same prompt + seed — only the style preset differs).
const SAMPLE_BASE = 'https://s3.us-west-004.backblazeb2.com/ai-influencer-app/style-samples';

const STYLES = [
  { value: 'stickman', label: 'Stickman', desc: 'Minimalist black stick-figure line drawings on white.' },
  { value: 'cartoon', label: 'Cartoon', desc: 'Bold flat cartoon with thick outlines and vibrant colors.' },
  { value: 'ghibli', label: 'Ghibli', desc: 'Studio Ghibli look: soft hand-painted, warm and whimsical.' },
  { value: 'family_guy', label: 'Family Guy Style', desc: 'Flat adult-cartoon TV look with bold outlines.' },
];

export default function StylesPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-bold text-text">Styles</h1>
        <p className="text-sm text-text-muted mt-1">Preview each visual style, then start a project with it in one click.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STYLES.map((s) => (
          <Link
            key={s.value}
            href={`/create?style=${s.value}`}
            className="group glass glass-hover rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
          >
            <div className="relative aspect-video overflow-hidden bg-primary-50">
              <img
                src={`${SAMPLE_BASE}/${s.value}.png`}
                alt={s.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute bottom-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1C1530]/70 text-white backdrop-blur">
                {s.label}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="text-sm font-semibold text-text">{s.label}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed flex-1">{s.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Use this style <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
