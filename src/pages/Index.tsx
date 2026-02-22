import { useSeo } from "@/hooks/use-seo";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import GameCatalog from "@/components/GameCatalog";
import FeaturedBanner from "@/components/FeaturedBanner";
import PerksSection from "@/components/PerksSection";
import CommunitySection from "@/components/CommunitySection";
import SupportSection from "@/components/SupportSection";
import HasheemAI from "@/components/HasheemAI";
import Footer from "@/components/Footer";

const Index = () => {
  const { settings } = useSiteSettings();

  useSeo({
    title: settings.seo.defaultTitle,
    description: settings.seo.defaultDescription,
    image: settings.seo.ogImage,
    siteName: settings.seo.siteName,
    twitterHandle: settings.seo.twitterHandle,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <GameCatalog />
      <FeaturedBanner />
      {settings.features.communitySectionEnabled && <CommunitySection />}
      <PerksSection />
      <SupportSection />
      <Footer />
      <HasheemAI />
    </div>
  );
};

export default Index;
