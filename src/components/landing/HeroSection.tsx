'use client';

import { motion, type Variants } from 'framer-motion';
import {
  Play, ArrowRight, Star, Sparkles, Check,
  FileText, Image as ImageIcon, Mic, Palette, Settings, Type,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { HERO_AVATARS } from '@/data/hero';
import { HERO_THUMBS, HERO_MAIN_SCENE } from '@/data/heroPanel';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const SIDEBAR = [
  { icon: FileText, label: 'Script' },
  { icon: ImageIcon, label: 'Scenes', active: true },
  { icon: Mic, label: 'Voiceover' },
  { icon: Palette, label: 'Styles' },
  { icon: Settings, label: 'Settings' },
];

const STEPS = [
  { label: 'Script', state: 'done' },
  { label: 'Scenes', state: 'done' },
  { label: 'Configure', state: 'current' },
  { label: 'Generate', state: 'pending' },
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-8 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-[1536px] mx-auto px-6 grid lg:grid-cols-[1fr_1.4fr] gap-6 items-center pt-6 pb-16">
        {/* ── Left column ── */}
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary/15 text-sm text-primary font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered • Fast • Cinematic • Affordable
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display font-black leading-[1.04] tracking-tight text-text"
          >
            <span className="block text-5xl xl:text-6xl">Turn Your Scripts</span>
            <span className="block text-5xl xl:text-6xl">Into Stunning Videos</span>
            <span className="block text-6xl xl:text-7xl leading-[1.12] pb-2 gradient-text-cta">Automatically.</span>
          </motion.h1>

          <motion.p variants={item} className="text-lg text-text-muted leading-relaxed max-w-xl">
            AutoScene transforms your ideas into fully edited videos with AI-generated visuals,
            voiceovers, motion, and subtitles — in minutes, not hours.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="btn-cta px-7 py-3.5 rounded-xl text-base font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Create Your First Video
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary px-7 py-3.5 rounded-xl text-base font-medium flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-primary" />
              Watch Demo
            </a>
          </motion.div>

          <motion.div variants={item} className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {HERO_AVATARS.map((color, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ background: color }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm">
                +9K
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-star text-star" />
                ))}
              </div>
              <p className="text-sm text-text-muted">Loved by 10,000+ creators worldwide</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right column: product mockup (3D, split panels) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:mr-4 xl:mr-8"
          style={{ perspective: '2000px' }}
        >
          {/* dotted texture (top-right) */}
          <div
            className="absolute -right-2 -top-6 w-40 h-28 pointer-events-none hidden lg:block opacity-70"
            style={{
              backgroundImage: 'radial-gradient(rgba(124,58,237,0.30) 1.4px, transparent 1.6px)',
              backgroundSize: '14px 14px',
              WebkitMaskImage: 'radial-gradient(70% 70% at 100% 0%, #000, transparent 75%)',
              maskImage: 'radial-gradient(70% 70% at 100% 0%, #000, transparent 75%)',
            }}
          />

          {/* 3D tilted group */}
          <div
            className="relative"
            style={{ transform: 'rotateY(-12deg) rotateX(4deg) scale(1.0)', transformStyle: 'preserve-3d' }}
          >
            {/* ── separate sidebar panel (behind, peeking left) ── */}
            <div
              className="absolute left-0 top-10 bottom-10 w-44 rounded-3xl bg-white border border-border p-3 flex flex-col gap-1.5 shadow-[0_24px_60px_rgba(82,50,168,0.16)]"
              style={{ transform: 'translateZ(-55px)' }}
            >
              <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Editor</p>
              {SIDEBAR.map(({ icon: Icon, label, active }) => (
                <div
                  key={label}
                  className={
                    active
                      ? 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary-50 text-primary text-[13px] font-semibold'
                      : 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-text-secondary text-[13px] font-medium hover:bg-surface-muted'
                  }
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {label}
                </div>
              ))}
            </div>

            {/* ── main panel (front, larger) ── */}
            <div
              className="relative ml-36 rounded-3xl bg-white border border-border p-5 shadow-[0_40px_90px_rgba(82,50,168,0.22)]"
              style={{ transform: 'translateZ(10px)' }}
            >
              {/* step progress */}
              <div className="flex items-center px-1 pb-5 text-[13px] font-medium">
                {STEPS.map((s, i) => (
                  <div key={s.label} className="flex items-center shrink-0 last:flex-none flex-1">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={
                        s.state === 'done'
                          ? 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white'
                          : s.state === 'current'
                          ? 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold'
                          : 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-muted text-text-muted border border-border-strong text-xs'
                      }>
                        {s.state === 'done' ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </span>
                      <span className={
                        s.state === 'current' ? 'text-text font-bold'
                        : s.state === 'pending' ? 'text-text-muted' : 'text-text'
                      }>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && <span className="flex-1 h-px bg-border-strong mx-2 min-w-3" />}
                  </div>
                ))}
              </div>

              {/* BIG video preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-muted shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                <Image
                  src={HERO_MAIN_SCENE}
                  alt="Scene preview"
                  fill
                  sizes="(max-width: 1024px) 90vw, 720px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    aria-label="Play preview"
                    className="w-[76px] h-[76px] rounded-full gradient-brand glow-cta flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </button>
                </div>
              </div>

              {/* timeline / slider */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-[12px] font-medium text-text-muted tabular-nums shrink-0">03:00 / 05:00</span>
                <div className="relative flex-1 h-1.5 rounded-full bg-border">
                  <div className="absolute left-0 top-0 h-full w-[55%] gradient-brand rounded-full" />
                  <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-white shadow" />
                </div>
              </div>

              {/* thumbnail strip */}
              <div className="mt-4 grid grid-cols-5 gap-2.5">
                {HERO_THUMBS.map((src, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-surface-muted">
                    <Image src={src} alt={`Scene ${i + 1}`} fill sizes="140px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-medium text-white">00:10</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── floating chips (popped forward in 3D) ── */}
            <div className="absolute -right-8 top-12 z-30" style={{ transform: 'translateZ(80px)' }}>
              <div className="w-[68px] h-[68px] rounded-2xl bg-white glow-float flex items-center justify-center animate-float">
                <Mic className="w-7 h-7 text-primary" />
                <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-accent-pink" />
              </div>
            </div>
            <div className="absolute -right-11 top-1/2 z-30" style={{ transform: 'translateZ(95px)' }}>
              <div className="w-[68px] h-[68px] rounded-2xl bg-white glow-float flex items-center justify-center animate-float" style={{ animationDelay: '1.2s' }}>
                <Type className="w-7 h-7 text-primary" />
                <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="absolute left-2 bottom-14 z-30" style={{ transform: 'translateZ(88px)' }}>
              <div className="w-[68px] h-[68px] rounded-2xl bg-white glow-float flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                <span className="font-display font-black text-xl gradient-text-cta">AI</span>
                <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-accent-pink" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
