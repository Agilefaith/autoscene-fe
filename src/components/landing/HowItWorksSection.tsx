'use client';

import { motion } from 'framer-motion';
import { Clapperboard } from 'lucide-react';
import { steps, type Step, HOW_IT_WORKS_STATS } from '@/data/howItWorks';

interface StepNodeProps {
  step: Step;
  index: number;
  prevAccent?: string;
  nextAccent?: string;
}

function StepNode({ step, index, prevAccent, nextAccent }: StepNodeProps) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: 'easeOut' }}
      className="flex flex-col items-center text-center group"
    >
      <span
        className="text-[15px] font-black tabular-nums leading-none mb-2.5"
        style={{ color: `${step.accent}90` }}
      >
        {step.n}
      </span>

      <div
        className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-3
                   transition-all duration-300 group-hover:scale-110"
        style={{
          background: `linear-gradient(145deg, ${step.accentDim}, #080810)`,
          border: `1.5px solid ${step.accent}50`,
          boxShadow: `0 0 22px ${step.accent}22, 0 0 48px ${step.accent}0c`,
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 0 1px ${step.accent}60, 0 0 32px ${step.accent}30` }}
        />
        <Icon className="w-6 h-6 relative z-10" style={{ color: step.accent }} />
      </div>

      <div className="relative w-full flex items-center justify-center mb-3" style={{ height: 28 }}>

        {prevAccent && (
          <div
            className="absolute hidden lg:block top-1/2 -translate-y-1/2"
            style={{
              left: 0,
              right: 'calc(50% + 7px)',
              height: 1,
              borderRadius: 1,
              background: 'rgba(255,255,255,0.12)',
            }}
          />
        )}

        {nextAccent && (
          <div
            className="absolute hidden lg:block top-1/2 -translate-y-1/2"
            style={{
              left: 'calc(50% + 7px)',
              right: 0,
              height: 1,
              borderRadius: 1,
              background: 'rgba(255,255,255,0.12)',
            }}
          />
        )}

        <motion.div
          className="relative z-10 w-3.5 h-3.5 rounded-full"
          style={{
            background: step.accent,
            boxShadow: `0 0 10px ${step.accent}90, 0 0 22px ${step.accent}45`,
          }}
          whileInView={{ scale: [0, 1.3, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.06 + 0.3 }}
        />
      </div>

      <p className="text-white text-[12px] font-semibold leading-snug px-1">
        {step.title}
      </p>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  const stepsArr = steps as unknown as Step[];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[700px] h-[400px] rounded-full bg-[#8A2BE2]/5 blur-[130px]" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[300px] rounded-full bg-[#00D4FF]/4 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#8A2BE2]/25 text-[13px] text-[#8A2BE2] font-medium mb-5">
            <Clapperboard className="w-3.5 h-3.5" />
            8 steps — fully automated
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto">
            From a single photo to a published MP4 in minutes. No studio, no crew, no manual editing.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-y-10 gap-x-3 lg:gap-x-0">
          {stepsArr.map((step, i) => (
            <StepNode
              key={step.n}
              step={step}
              index={i}
              prevAccent={i > 0 ? stepsArr[i - 1].accent : undefined}
              nextAccent={i < stepsArr.length - 1 ? stepsArr[i + 1].accent : undefined}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          {HOW_IT_WORKS_STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #8A2BE2, #00D4FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </p>
              <p className="text-[#52525B] text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
