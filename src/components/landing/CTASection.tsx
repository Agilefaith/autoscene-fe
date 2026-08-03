'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section id="cta" className="relative overflow-hidden py-20">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-accent-pink/[0.08] blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-magenta/25 to-transparent" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-8 glow-cta">
            <Sparkles className="w-7 h-7 text-white" />
          </div>

          <h2 className="font-display text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-bold mb-6 whitespace-nowrap leading-tight text-text">
            Start Creating AI Videos <span className="gradient-text-cta">in Minutes</span>
          </h2>

          <p className="text-text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Upload your image, configure your settings, and receive a fully rendered
            professional video. No editing skills required.
          </p>

          <Link
            href="/login"
            className="btn-neon inline-flex items-center px-10 py-4 rounded-2xl text-lg font-semibold"
          >
            Start Creating
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
