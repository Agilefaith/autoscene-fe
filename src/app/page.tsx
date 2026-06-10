import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import LivePreviewSection from '@/components/landing/LivePreviewSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import SiteFooter from '@/components/layout/SiteFooter';

export default function LandingPage() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <LivePreviewSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <SiteFooter />
    </main>
  );
}
