import Navbar from '@/components/layout/Navbar';
import BackgroundDecor from '@/components/layout/BackgroundDecor';
import HeroSection from '@/components/landing/HeroSection';
import FeatureBar from '@/components/landing/FeatureBar';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PopularNichesSection from '@/components/landing/PopularNichesSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <main className="relative">
      <BackgroundDecor />
      <Navbar />
      <HeroSection />
      <FeatureBar />
      <HowItWorksSection />
      <PopularNichesSection />
      <PricingSection />
      <CTASection />
    </main>
  );
}
