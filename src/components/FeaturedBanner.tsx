import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { trackEvent } from "@/lib/analytics";
import { formatPriceForDisplay } from "@/lib/pricing";

const FeaturedBanner = () => {
  const { settings, catalogGames } = useSiteSettings();
  const featured =
    catalogGames.find((game) => game.id === settings.featuredGameId) ?? catalogGames[0];

  if (!featured) {
    return null;
  }

  return (
    <section id="deals" className="relative overflow-hidden border-b border-border py-20">
      <div className="absolute inset-0">
        <img src={featured.image} alt="" className="h-full w-full object-cover opacity-20 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
              <Flame className="h-4 w-4 text-accent" />
              <span className="font-body text-sm font-semibold uppercase tracking-wider text-accent">
                Featured Deal
              </span>
            </div>
            <h2 className="mb-4 font-display text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
              {featured.title}
            </h2>
            <p className="mb-6 max-w-lg font-body text-base leading-relaxed text-muted-foreground">
              {featured.description.slice(0, 200)}...
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/game/${featured.id}`}
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-[var(--neon-glow-strong)]"
                onClick={() =>
                  trackEvent({
                    action: "open_featured_game",
                    category: "Conversion",
                    label: featured.title,
                  })
                }
              >
                View Game
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="inline-flex items-center gap-2 font-display text-2xl font-black text-foreground">
                {formatPriceForDisplay(featured.price)}
              </span>
              {featured.originalPrice && (
                <span className="inline-flex items-center font-body text-sm text-muted-foreground line-through">
                  {formatPriceForDisplay(featured.originalPrice)}
                </span>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block"
          >
            <Link to={`/game/${featured.id}`} className="block overflow-hidden rounded-xl neon-border">
              <img
                src={featured.image}
                alt={featured.title}
                className="mx-auto aspect-[3/4] w-full max-w-xs rounded-xl object-cover transition-transform duration-500 hover:scale-105"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
