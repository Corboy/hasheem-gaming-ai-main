import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useGameCatalog } from "@/contexts/GameCatalogContext";
import { trackEvent } from "@/lib/analytics";
import { formatPriceForDisplay } from "@/lib/pricing";

const FeaturedBanner = () => {
  const { settings } = useSiteSettings();
  const { publishedGames } = useGameCatalog();
  const featured =
    publishedGames.find((game) => game.id === settings.featuredGameId) ?? publishedGames[0];

  if (!featured) {
    return null;
  }

  return (
    <section id="deals" className="section-shell relative overflow-hidden border-y border-white/5">
      <div className="absolute inset-0">
        <img src={featured.image} alt="" className="h-full w-full object-cover opacity-12" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/80" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
              <Flame className="h-4 w-4 text-primary" />
              <span className="font-body text-sm font-semibold uppercase tracking-wide text-primary">
                Featured Deal
              </span>
            </div>
            <h2 className="mb-4 font-display text-3xl font-semibold text-foreground md:text-5xl">
              {featured.title}
            </h2>
            <p className="mb-6 max-w-lg font-body text-base leading-relaxed text-muted-foreground">
              {featured.description.slice(0, 200)}...
            </p>
            {featured.originalPrice && (
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/15 px-3 py-1 font-body text-xs font-semibold text-primary">
                Limited-time deal
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/game/${featured.id}`}
                className="button-lift group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-[var(--primary-shadow)]"
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
              <span className="inline-flex items-center gap-2 font-display text-3xl font-semibold text-foreground">
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
            <Link to={`/game/${featured.id}`} className="block overflow-hidden rounded-xl border border-white/10 bg-card">
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
