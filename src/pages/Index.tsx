import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import GameCatalog from "@/components/GameCatalog";
import FeaturedBanner from "@/components/FeaturedBanner";
import PerksSection from "@/components/PerksSection";
import HasheemAI from "@/components/HasheemAI";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <GameCatalog />
      <FeaturedBanner />
      <PerksSection />
      <Footer />
      <HasheemAI />
    </div>
  );
};

export default Index;
