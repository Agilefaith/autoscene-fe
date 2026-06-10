'use client';

import { motion, type Variants } from 'framer-motion';
import { Layers } from 'lucide-react';
import { features, type Feature } from '@/data/features';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: 'easeOut' } },
};

function FeatureCard({ feature, wide }: { feature: Feature; wide?: boolean }) {
  const Icon = feature.icon;
  const { accent, accentDim } = feature;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -5,
        boxShadow: `0 0 0 1px ${accent}45, 0 8px 32px ${accent}18, 0 20px 60px rgba(0,0,0,0.45)`,
        transition: { duration: 0.22 },
      }}
      initial={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }}
      className={`relative rounded-2xl overflow-hidden cursor-default group${wide ? ' lg:col-span-2' : ''}`}
      style={{
        background: `linear-gradient(150deg, ${accentDim} 0%, rgba(11,11,18,0.97) 55%)`,
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, ${accent}70, ${accent}28, transparent 70%)`,
        }}
      />

      <div
        className="absolute -bottom-3 -right-3 opacity-[0.045] pointer-events-none
                   transition-opacity duration-300 group-hover:opacity-[0.07]"
      >
        <Icon
          style={{ width: wide ? 140 : 96, height: wide ? 140 : 96, color: accent }}
          strokeWidth={1.5}
        />
      </div>

      <div className={`relative z-10 p-6 pb-7${wide ? ' lg:flex lg:items-start lg:gap-7 lg:p-8 lg:pb-9' : ''}`}>
        <div
          className={`flex-shrink-0 rounded-xl flex items-center justify-center
                      transition-transform duration-300 group-hover:scale-105
                      ${wide ? 'w-14 h-14 mb-5 lg:mb-0 lg:mt-1' : 'w-11 h-11 mb-5'}`}
          style={{
            background: `linear-gradient(145deg, ${accentDim}, rgba(8,8,16,0.9))`,
            border: `1px solid ${accent}35`,
            boxShadow: `0 0 18px ${accent}14`,
          }}
        >
          <Icon className={wide ? 'w-6 h-6' : 'w-5 h-5'} style={{ color: accent }} />
        </div>

        <div>
          <h3 className={`font-semibold text-white mb-2 leading-snug${wide ? ' text-lg' : ' text-[15px]'}`}>
            {feature.title}
          </h3>
          <p className={`text-[#6B6B7A] leading-relaxed${wide ? ' text-[15px]' : ' text-sm'}`}>
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const featuresArr = features as unknown as Feature[];

  return (
    <section id="features" className="pt-12 pb-28 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[500px] rounded-full bg-[#8A2BE2]/[0.045] blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] rounded-full bg-[#00D4FF]/[0.035] blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#8A2BE2]/25 text-[13px] text-[#8A2BE2] font-medium mb-5">
            <Layers className="w-3.5 h-3.5" />
            Full production stack, zero crew
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto">
            Script to final render. One platform, five AI engines, zero manual work.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {featuresArr.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} wide={i === 0} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
