'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clapperboard, Captions } from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/animations';
import { TEMPLATES, templateCover } from '@/data/templates';

export default function TemplatesPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-bold text-text">Templates</h1>
        <p className="text-sm text-text-muted mt-1">Preconfigured starting points. Pick one to open the create flow with everything set — just add your script.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((t) => (
          <Link
            key={t.id}
            href={`/create?template=${t.id}`}
            className="group glass glass-hover rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
          >
            <div className="relative aspect-video overflow-hidden bg-primary-50">
              <img src={templateCover(t)} alt={t.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1C1530]/70 text-white backdrop-blur">{t.tag}</span>
              <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-primary backdrop-blur">{t.config.format}</span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="text-sm font-semibold text-text">{t.name}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed flex-1">{t.description}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-text-muted">
                <span className="inline-flex items-center gap-1"><Clapperboard className="w-3.5 h-3.5" /> {t.config.render_mode === 'mode_2' ? 'Enhanced' : 'Cinematic'}</span>
                <span className="inline-flex items-center gap-1"><Captions className="w-3.5 h-3.5" /> {t.config.subtitle.enabled ? 'Subtitles' : 'No subtitles'}</span>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Use template <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
