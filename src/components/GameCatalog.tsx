import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, LayoutGrid, Monitor, Search, Smartphone } from "lucide-react";
import { useLocation } from "react-router-dom";
import GameCard from "./GameCard";
import { getGamesByPlatformFromList, type Platform } from "@/data/games";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  consumeStoreSearchFocus,
  smoothScrollTo,
  STORE_SEARCH_EVENT,
} from "@/lib/store-search-intent";

const platformTabs: { label: string; value: Platform | "All"; icon: ReactNode }[] = [
  { label: "All Games", value: "All", icon: <LayoutGrid className="h-4 w-4" /> },
  { label: "PC", value: "PC", icon: <Monitor className="h-4 w-4" /> },
  { label: "Mobile", value: "Mobile", icon: <Smartphone className="h-4 w-4" /> },
  { label: "PlayStation", value: "PlayStation", icon: <Gamepad2 className="h-4 w-4" /> },
];

const GameCatalog = () => {
  const { catalogGames } = useSiteSettings();
  const [activePlatform, setActivePlatform] = useState<Platform | "All">("All");
  const [query, setQuery] = useState("");
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const gamesByPlatform = useMemo(
    () => getGamesByPlatformFromList(catalogGames, activePlatform),
    [catalogGames, activePlatform],
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
    <section id="store" className="gradient-section py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold uppercase tracking-wider text-foreground md:text-4xl">
            Game <span className="text-primary neon-text">Store</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Browse by platform and search instantly by title or genre
          </p>
        </div>

        <div className="mx-auto mb-6 flex max-w-xl items-center rounded-lg border border-border bg-card px-3 py-2">
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

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {platformTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActivePlatform(tab.value)}
              className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                activePlatform === tab.value
                  ? "bg-primary text-primary-foreground shadow-[var(--neon-glow)]"
                  : "border border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mb-6 text-center font-body text-sm text-muted-foreground">
          Showing <span className="font-bold text-primary">{filteredGames.length}</span> of{" "}
          <span className="font-bold text-primary">{gamesByPlatform.length}</span> games
          {activePlatform !== "All" && ` for ${activePlatform}`}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activePlatform}-${query}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          >
            {filteredGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredGames.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-8 text-center">
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
