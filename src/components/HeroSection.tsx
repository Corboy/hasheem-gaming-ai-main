import { ChevronRight, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { trackEvent } from "@/lib/analytics";

const HeroSection = () => {
  const { settings } = useSiteSettings();
  const hero = settings.hero;

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
              {hero.badgeText}
            </span>
          </div>

          <h1 className="mb-6 font-display text-5xl font-black uppercase leading-tight tracking-tight text-foreground md:text-7xl">
            {hero.headingLead}{" "}
            <span className="text-primary neon-text">{hero.headingAccent}</span>{" "}
            {hero.headingTail}
          </h1>

          <p className="mb-8 max-w-lg font-body text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
            {hero.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href={hero.primaryCtaHref}
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-[var(--neon-glow-strong)]"
              onClick={() =>
                trackEvent({
                  action: "hero_primary_cta",
                  category: "Conversion",
                  label: hero.primaryCtaLabel,
                })
              }
            >
              {hero.primaryCtaLabel}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-foreground transition-all hover:border-primary/50 hover:shadow-[var(--neon-glow)]"
              onClick={() =>
                trackEvent({
                  action: "hero_secondary_cta",
                  category: "Conversion",
                  label: hero.secondaryCtaLabel,
                })
              }
            >
              {hero.secondaryCtaLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
