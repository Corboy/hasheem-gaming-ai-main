import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Game } from "@/data/games";
import { trackEvent } from "@/lib/analytics";
import { formatPriceForDisplay, isFreePrice } from "@/lib/pricing";

const GameCard = ({ id, title, image, price, originalPrice, rating, genre, platforms }: Game) => {
  const isFree = isFreePrice(price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/game/${id}`}
        className="game-card-hover group block cursor-pointer overflow-hidden rounded-lg border border-border bg-card"
        onClick={() => trackEvent({ action: "select_item", category: "Commerce", label: title })}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {originalPrice && (
            <div className="absolute right-2 top-2 rounded bg-accent px-2 py-1 font-display text-xs font-bold text-accent-foreground">
              SALE
            </div>
          )}
          {isFree && (
            <div className="absolute left-2 top-2 rounded bg-primary px-2 py-1 font-display text-xs font-bold text-primary-foreground">
              FREE
            </div>
          )}
          {/* Platform badges */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {platforms.map((p) => (
              <span
                key={p}
                className="rounded bg-background/80 px-1.5 py-0.5 font-body text-[10px] font-bold uppercase text-foreground backdrop-blur-sm"
              >
                {p === "PlayStation" ? "PS" : p}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4">
          <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-widest text-primary">
            {genre}
          </span>
          <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-foreground line-clamp-1">
            {title}
          </h3>
          <div className="mb-3 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-foreground">
              {formatPriceForDisplay(price)}
            </span>
            {originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                {formatPriceForDisplay(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GameCard;
