import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import BackgroundDecor from '@/components/layout/BackgroundDecor';
import CTASection from '@/components/landing/CTASection';
import { FeaturesGrid } from './sections';

export const metadata: Metadata = {
  title: 'Features — AutoScene',
  description:
    'Everything AutoScene does: script-to-video scenes, character identity lock, four visual styles, cinematic motion, voiceovers, subtitles, and thumbnails.',
};

export default function FeaturesPage() {
  return (
    <main className="relative">
      <BackgroundDecor />
      <Navbar />

      <section className="relative pt-36 pb-4">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary text-xs font-semibold mb-4">
            Features
          </span>
          <h1 className="font-display text-[2.25rem] sm:text-[2.75rem] md:text-[3.25rem] font-bold leading-tight text-text">
            Everything you need to turn a script into a video
          </h1>
          <p className="text-text-muted text-base sm:text-lg mt-4 leading-relaxed">
            AutoScene breaks your script into scenes, generates a matching visual for every line,
            keeps your characters consistent, and delivers a finished MP4 with narration and
            subtitles — all from one dashboard.
          </p>
        </div>
      </section>

      <FeaturesGrid />
      <CTASection />
    </main>
  );
}
