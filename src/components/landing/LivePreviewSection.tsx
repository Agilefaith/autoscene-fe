'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Sparkles, ArrowLeftRight,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { VIDEO_CARDS, RATIO_WIDTH, LIVE_PREVIEW_STATS, type VideoCardData } from '@/data/livePreview';

const ROW_HEIGHT = 340;

function NetflixCard({ card }: { card: VideoCardData }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const width = RATIO_WIDTH[card.ratio];

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (hovered) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [hovered]);

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer shrink-0"
      style={{
        width: `${width}px`,
        height: `${ROW_HEIGHT}px`,
        border: hovered
          ? `1px solid ${card.accent}65`
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: hovered
          ? `0 0 0 1px ${card.accent}18, 0 8px 40px ${card.accent}30, 0 24px 64px rgba(0,0,0,0.55)`
          : '0 4px 20px rgba(0,0,0,0.4)',
        transform: hovered ? 'scale(1.025) translateY(-2px)' : 'scale(1) translateY(0)',
        transition: 'border 0.3s ease, box-shadow 0.3s ease, transform 0.35s ease',
        zIndex: hovered ? 10 : 1,
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={card.image}
        alt={card.label}
        fill
        className="object-cover transition-all duration-700"
        style={{
          transform: hovered && !card.videoSrc ? 'scale(1.08)' : 'scale(1)',
          opacity: hovered && card.videoSrc ? 0 : 1,
        }}
        sizes={`${width}px`}
      />

      {card.videoSrc && (
        <video
          ref={videoRef}
          src={card.videoSrc}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-black/10" />

      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `linear-gradient(145deg, ${card.accent}14 0%, transparent 65%)`,
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <div
          className="flex items-center justify-center rounded-full backdrop-blur-sm"
          style={{
            width: 46,
            height: 46,
            background: 'rgba(0,0,0,0.65)',
            border: `2px solid ${card.accent}95`,
            boxShadow: `0 0 28px ${card.accent}55, 0 0 60px ${card.accent}22`,
          }}
        >
          <Play className="text-white fill-white" style={{ width: 16, height: 16, marginLeft: 2 }} />
        </div>
      </div>

      {card.featured && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 border border-white/15 text-white backdrop-blur-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Featured
          </span>
        </div>
      )}

      <div className="absolute top-3 left-3 z-10">
        <span
          className="px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wide backdrop-blur-sm"
          style={{
            background: `${card.accent}22`,
            border: `1px solid ${card.accent}55`,
            color: card.accent,
          }}
        >
          {card.type}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] text-[#A1A1AA] backdrop-blur-sm">
          {card.duration}
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-3 z-10">
        <p className="text-[10px] text-[#A1A1AA] mb-0.5 truncate">{card.category}</p>
        <p className="font-bold text-white text-sm leading-snug truncate">{card.label}</p>
        {card.views && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[10px] text-[#A1A1AA]">{card.views}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LivePreviewSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [sliderPos, setSliderPos] = useState(48);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const nudge = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 440, behavior: 'smooth' });
  };

  const onSliderPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingSlider.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onSliderPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    setSliderPos(Math.min(97, Math.max(3, ((e.clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onSliderPointerUp = useCallback(() => {
    isDraggingSlider.current = false;
  }, []);

  return (
    <section id="demo" className="pt-20 pb-12 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-[#8A2BE2]/6 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-[#00D4FF]/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#8A2BE2]/25 text-[13px] text-[#8A2BE2] font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Every video generated from a single image
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            See What <span className="gradient-text">Vidora</span> Creates
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-md mx-auto">
            Real outputs. No actors. No cameras. Just your AI influencer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div
            className="absolute left-0 top-4 bottom-4 w-20 z-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to right, #050507 10%, transparent)',
              opacity: canScrollLeft ? 1 : 0,
            }}
          />
          {canScrollLeft && (
            <button
              onClick={() => nudge(-1)}
              aria-label="Scroll left"
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(11,11,18,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(138,43,226,0.5)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(138,43,226,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
              }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          <div
            className="absolute right-0 top-4 bottom-4 w-28 z-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to left, #050507 10%, transparent)',
              opacity: canScrollRight ? 1 : 0,
            }}
          />
          {canScrollRight && (
            <button
              onClick={() => nudge(1)}
              aria-label="Scroll right"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(11,11,18,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(138,43,226,0.5)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(138,43,226,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
              }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto py-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x proximity',
            }}
          >
            {VIDEO_CARDS.map((card) => (
              <NetflixCard key={card.label} card={card} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-8 mb-16"
        >
          {LIVE_PREVIEW_STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <Icon className="w-3.5 h-3.5 text-[#8A2BE2]" />
              <span className="text-white font-semibold">{value}</span>
              <span className="text-[#52525B]">{label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              One <span className="text-[#A1A1AA]">Photo</span>{' '}
              <span className="text-[#52525B]">→</span>{' '}
              <span className="gradient-text">Full Video</span>
            </h3>
            <p className="text-[#52525B] text-sm">Drag the handle to compare input vs output</p>
          </div>

          <div
            ref={sliderRef}
            className="relative w-full rounded-2xl overflow-hidden select-none touch-none"
            style={{
              aspectRatio: '16/6',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 0 80px rgba(138,43,226,0.14), 0 0 40px rgba(0,212,255,0.07)',
              cursor: 'col-resize',
            }}
            onPointerMove={onSliderPointerMove}
            onPointerUp={onSliderPointerUp}
          >
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80"
                alt="Input photo"
                fill
                className="object-cover"
                style={{ filter: 'grayscale(65%) brightness(0.72)', transform: 'scale(1.02)' }}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-[#0B0B12]/40" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.055) 3px, rgba(0,0,0,0.055) 4px)',
                }}
              />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8A2BE2]" />
                <span className="text-xs text-[#A1A1AA] font-medium">Input Photo</span>
              </div>
            </div>

            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80"
                alt="AI video output"
                fill
                className="object-cover"
                style={{ filter: 'saturate(1.35) brightness(1.06)', transform: 'scale(1.02)' }}
                sizes="100vw"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(138,43,226,0.08) 100%)',
                }}
              />
              <div className="absolute bottom-12 inset-x-0 flex justify-center pointer-events-none">
                <span className="px-4 py-1.5 rounded-lg bg-black/70 text-white text-sm font-semibold backdrop-blur-sm border border-white/10">
                  &ldquo;This product changed my life...&rdquo;
                </span>
              </div>
              <div className="absolute bottom-5 right-5 flex items-center gap-2 z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                <span className="text-xs text-[#00D4FF] font-medium">AI Video Output</span>
              </div>
            </div>

            <div
              className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              onPointerDown={onSliderPointerDown}
            >
              <div className="absolute inset-y-0 w-[2px] bg-white/55" />
              <div
                className="relative flex items-center justify-center rounded-full bg-white z-10 cursor-col-resize"
                style={{
                  width: 40,
                  height: 40,
                  boxShadow: '0 0 0 4px rgba(255,255,255,0.14), 0 4px 24px rgba(0,0,0,0.7)',
                }}
              >
                <ArrowLeftRight className="w-4 h-4 text-[#050507]" />
              </div>
            </div>

            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs text-[#A1A1AA] backdrop-blur-sm">
                Before
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/35 text-xs text-[#00D4FF] backdrop-blur-sm">
                After
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
