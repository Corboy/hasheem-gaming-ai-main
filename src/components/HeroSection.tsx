import heroBg from "@/assets/hero-bg.jpg";
import { ChevronRight, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <img
        src={heroBg}
        alt="Gaming hero background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="gradient-hero absolute inset-0" />

      <div className="container relative z-10 mx-auto px-4 pt-16">
        <div className="max-w-2xl animate-slide-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-body text-sm font-semibold uppercase tracking-wider text-primary">
              New Releases Available
            </span>
          </div>

          <h1 className="mb-6 font-display text-5xl font-black uppercase leading-tight tracking-tight text-foreground md:text-7xl">
            Level Up Your{" "}
            <span className="text-primary neon-text">Gaming</span>{" "}
            Experience
          </h1>

          <p className="mb-8 max-w-lg font-body text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
            Discover the latest titles, exclusive deals, and unbeatable prices.
            Your next adventure starts at HASHEEM GAMING.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#store"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-[var(--neon-glow-strong)]"
            >
              Browse Store
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#deals"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-foreground transition-all hover:border-primary/50 hover:shadow-[var(--neon-glow)]"
            >
              Weekly Deals
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
