import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, LayoutGrid, Monitor, Search, Smartphone } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameCard from "./GameCard";
import { GAME_CATEGORIES } from "@/data/categories";
import { getGamesByPlatformFromList, type Platform } from "@/data/games";
import { useGameCatalog } from "@/contexts/GameCatalogContext";
import {
  consumeStoreSearchFocus,
  smoothScrollTo,
  STORE_SEARCH_EVENT,
} from "@/lib/store-search-intent";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIconMap: Record<Platform, ReactNode> = {
  PC: <Monitor className="h-4 w-4" />,
  Mobile: <Smartphone className="h-4 w-4" />,
  PlayStation: <Gamepad2 className="h-4 w-4" />,
};

const platformTabs: { label: string; value: Platform | "All"; icon: ReactNode }[] = [
  { label: "All Games", value: "All", icon: <LayoutGrid className="h-4 w-4" /> },
  ...GAME_CATEGORIES.map((category) => ({
    label: category,
    value: category,
    icon: categoryIconMap[category],
  })),
];

const GameCatalog = () => {
  const { publishedGames, isLoading } = useGameCatalog();
  const [activePlatform, setActivePlatform] = useState<Platform | "All">("All");
  const [query, setQuery] = useState("");
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const gamesByPlatform = useMemo(
    () => getGamesByPlatformFromList(publishedGames, activePlatform),
    [publishedGames, activePlatform],
  );

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return gamesByPlatform;
    }

    return gamesByPlatform.filter((game) => {
      return (
        game.title.toLowerCase().includes(normalizedQuery) ||
        game.genre.toLowerCase().includes(normalizedQuery) ||
        game.platforms.some((platform) => platform.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [gamesByPlatform, query]);

  useEffect(() => {
    const focusSearch = () => {
      setActivePlatform("All");
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    };

    if (consumeStoreSearchFocus()) {
      focusSearch();
    }

    window.addEventListener(STORE_SEARCH_EVENT, focusSearch);
    return () => window.removeEventListener(STORE_SEARCH_EVENT, focusSearch);
  }, []);

  useEffect(() => {
    if (location.hash === "#store") {
      smoothScrollTo("store");
    }
  }, [location.hash]);

  return (
    <section id="store" className="section-shell">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 font-display text-3xl font-semibold text-foreground md:text-5xl">
            Game Store
          </h2>
          <p className="mx-auto max-w-2xl font-body text-base text-muted-foreground md:text-lg">
            Browse curated titles by platform and find your next download in seconds.
          </p>
        </div>

        <div className="mx-auto mb-8 flex max-w-xl items-center rounded-lg border border-white/10 bg-card px-3 py-2.5">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games, genres, or platforms"
            className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search games"
          />
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          {platformTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActivePlatform(tab.value)}
              className={`button-lift inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-wide transition-all ${
                activePlatform === tab.value
                  ? "bg-primary text-primary-foreground shadow-[var(--primary-shadow)]"
                  : "border border-white/10 bg-secondary text-muted-foreground hover:border-white/20 hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mb-7 text-center font-body text-sm text-muted-foreground">
          Showing <span className="font-bold text-primary">{filteredGames.length}</span> of{" "}
          <span className="font-bold text-primary">{gamesByPlatform.length}</span> games
          {activePlatform !== "All" && ` for ${activePlatform}`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <article
                key={`skeleton-game-${index}`}
                className="overflow-hidden rounded-xl border border-white/5 bg-card"
              >
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activePlatform}-${query}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            >
              {filteredGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {filteredGames.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-card p-8 text-center">
            <p className="font-body text-sm text-muted-foreground">
              No games match your current filters. Try a different keyword.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default GameCatalog;
