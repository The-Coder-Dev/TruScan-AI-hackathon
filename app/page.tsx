import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Features } from "@/components/home/Features";
import { Metrics } from "@/components/home/Metrics";
import { Pricing } from "@/components/home/Pricing";
import { Testimonials } from "@/components/home/Testimonials";
import { CTABanner } from "@/components/home/CTABanner";
import { Footer } from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <Features />
      <Metrics />
      <Pricing />
      <Testimonials />
      <CTABanner />
      <Footer />
    </main>
  );
}   