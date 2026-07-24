'use client';

import { motion } from 'framer-motion';
import {
  PenLine, Clapperboard, Users, Palette, Layers, Camera, Mic, Captions,
  Proportions, Images, LayoutDashboard, Timer, type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: PenLine,
    title: 'Script Engine',
    desc: 'Paste your own script (used exactly as written — never rewritten) or let AI write one from a title, niche, tone, and target length.',
  },
  {
    icon: Clapperboard,
    title: 'Scene Breakdown',
    desc: 'Your script is split into ~10-second scenes, each with a detailed, storyboard-grade image prompt that matches exactly what that line narrates.',
  },
  {
    icon: Users,
    title: 'Character Identity Lock',
    desc: 'Upload a reference image per character and name them. Every scene that mentions a character reuses their locked look, so they stay recognizable across the whole video.',
  },
  {
    icon: Palette,
    title: 'Four Visual Styles',
    desc: 'Stickman (Modern Explainer), Cartoon (Animated Movie), Ghibli Anime (Soft Cinematic), and Cinematic — one style, enforced on every scene.',
  },
  {
    icon: Layers,
    title: 'Two Render Modes',
    desc: 'Cinematic Motion (one image per scene) for speed and scale, or Enhanced Motion (three images per scene, crossfaded) for a semi-animated feel.',
  },
  {
    icon: Camera,
    title: 'Cinematic Motion & Editing',
    desc: 'Fifteen camera moves — pans, zooms, drifts, crane and rotation — picked per scene by emotion, plus emotion-driven transitions and a per-style finishing grade.',
  },
  {
    icon: Mic,
    title: 'Voiceovers',
    desc: 'Pick a preset voice, paste a custom ElevenLabs/Minimax voice ID, or attach your own API key to use private cloned voices from your account.',
  },
  {
    icon: Captions,
    title: 'Auto Subtitles',
    desc: 'Narration is transcribed and burned in as readable phrases, with your choice of font, size, color, and position.',
  },
  {
    icon: Proportions,
    title: 'Formats for Every Platform',
    desc: '16:9 for YouTube or 9:16 for Shorts, Reels, and TikTok — scene images are generated natively in the chosen ratio.',
  },
  {
    icon: Timer,
    title: 'Short to Long-Form',
    desc: 'From 15-second shorts to 40-minute long-form storytelling, with scene visuals synced to the narration throughout.',
  },
  {
    icon: Images,
    title: 'Thumbnail Cloner',
    desc: 'Auto-generate two click-worthy thumbnail variations from a finished video, or clone the composition and energy of a competitor’s thumbnail.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Delivery',
    desc: 'Watch each stage complete in real time — scenes, images, voiceover, render — then download the finished MP4 straight from your dashboard.',
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl bg-white border border-border glow-panel p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-text text-base">{title}</h3>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
