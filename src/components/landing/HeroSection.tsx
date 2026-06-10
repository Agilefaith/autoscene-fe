'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Play, ArrowRight, Star, Zap, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { HERO_AVATARS } from '@/data/hero';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

interface Particle {
  width: string;
  height: string;
  top: string;
  left: string;
  opacity: number;
  animation: string;
  animationDelay: string;
}

export default function HeroSection() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setParticles(
      Array.from({ length: 25 }, () => ({
        width: Math.random() * 2 + 1 + 'px',
        height: Math.random() * 2 + 1 + 'px',
        top: Math.random() * 100 + '%',
        left: Math.random() * 40 + '%',
        opacity: Math.random() * 0.3 + 0.05,
        animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
        animationDelay: Math.random() * 4 + 's',
      }))
    );
  }, []);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-[72px] overflow-hidden bg-[#050507]"
    >
      <div className="absolute inset-y-0 right-0 w-[65%] pointer-events-none">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/video/hero-poster.jpg"
        >
          <source src="/video/hero-bg.webm" type="video/webm" />
          <source src="/video/hero-bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[#050507]/30" />
        <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-[#050507] via-[#050507]/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050507] to-transparent" />
      </div>

      <button
        onClick={toggleMute}
        className="absolute top-24 right-6 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-black/60 transition-all"
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div key={i} className="absolute rounded-full bg-[#8A2BE2]" style={p} />
        ))}
      </div>

      <div className="relative z-10 w-full min-h-screen flex items-center">
        <div className="w-full px-8 xl:px-16 2xl:px-24 flex items-center">

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-[46%] flex flex-col gap-6 pt-6 pb-16"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#8A2BE2]/30 text-sm text-[#8A2BE2] font-medium">
                <Zap className="w-3.5 h-3.5" />
                AI Video Platform
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              Create AI Influencer Videos on{' '}
              <span className="gradient-text">Autopilot</span>
            </motion.h1>

            <motion.p variants={item} className="text-lg text-[#A1A1AA] leading-relaxed">
              Generate high-converting UGC-style videos with AI avatars, voice, motion, and editing. It&apos;s all automated.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="btn-neon px-7 py-3.5 rounded-xl text-base font-semibold flex items-center gap-2 cursor-pointer"
              >
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#demo"
                className="px-7 py-3.5 rounded-xl text-base font-medium border border-white/[0.08] text-[#A1A1AA] hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </a>
            </motion.div>

            <motion.div variants={item} className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {HERO_AVATARS.map((color, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-[#050507] flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `${color}99` }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                  <span className="text-sm font-semibold text-white ml-1">4.9</span>
                </div>
                <p className="text-xs text-[#52525B]">Loved by creators worldwide</p>
              </div>
            </motion.div>
          </motion.div>

          <div className="flex-1" />

        </div>
      </div>
    </section>
  );
}
