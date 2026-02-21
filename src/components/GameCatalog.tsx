import { useState } from "react";
import GameCard from "./GameCard";
import { games, getGamesByPlatform, type Platform } from "@/data/games";
import { Monitor, Laptop, Gamepad2, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const platformTabs: { label: string; value: Platform | "All"; icon: React.ReactNode }[] = [
  { label: "All Games", value: "All", icon: <LayoutGrid className="h-4 w-4" /> },
  { label: "PC", value: "PC", icon: <Monitor className="h-4 w-4" /> },
  { label: "Laptop", value: "Laptop", icon: <Laptop className="h-4 w-4" /> },
  { label: "PlayStation", value: "PlayStation", icon: <Gamepad2 className="h-4 w-4" /> },
];

const GameCatalog = () => {
  const [activePlatform, setActivePlatform] = useState<Platform | "All">("All");
  const filteredGames = getGamesByPlatform(activePlatform);

  return (
    <section id="store" className="gradient-section py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold uppercase tracking-wider text-foreground md:text-4xl">
            Game <span className="text-primary neon-text">Store</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Browse by platform — find games for your setup
          </p>
        </div>

        {/* Platform Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {platformTabs.map((tab) => (
            <button
              key={tab.value}
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

        {/* Game count */}
        <p className="mb-6 text-center font-body text-sm text-muted-foreground">
          Showing <span className="font-bold text-primary">{filteredGames.length}</span> games
          {activePlatform !== "All" && ` for ${activePlatform}`}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePlatform}
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
      </div>
    </section>
  );
};

export default GameCatalog;
