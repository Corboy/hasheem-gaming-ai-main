import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Game } from "@/data/games";
import { trackEvent } from "@/lib/analytics";
import { formatPriceForDisplay, isFreePrice } from "@/lib/pricing";

const GameCard = ({ id, title, image, price, originalPrice, rating, genre, platforms }: Game) => {
  const isFree = isFreePrice(price);
  const primaryCategory = platforms[0] ?? "PC";
  const hasDiscount = Boolean(originalPrice) && !isFree;
  const stockLeft = hasDiscount
    ? (id.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % 7) + 3
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/game/${id}`}
        className="game-card-hover group block cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-card"
        onClick={() => trackEvent({ action: "select_item", category: "Commerce", label: title })}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-2 top-2">
            <span className="rounded-full border border-white/15 bg-background/80 px-2 py-1 font-body text-[11px] font-semibold text-foreground backdrop-blur">
              {primaryCategory}
            </span>
          </div>

          {hasDiscount && (
            <div className="absolute right-2 top-2 rounded-full bg-primary px-2.5 py-1 font-body text-[11px] font-semibold text-primary-foreground">
              SALE
            </div>
          )}
          {isFree && (
            <div className="absolute right-2 top-2 rounded-full border border-white/15 bg-background/90 px-2.5 py-1 font-body text-[11px] font-semibold text-foreground">
              FREE
            </div>
          )}
        </div>

        <div className="p-4 md:p-5">
          <span className="mb-1 block font-body text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {genre}
          </span>
          <h3 className="mb-2 font-display text-base font-semibold text-foreground line-clamp-1">
            {title}
          </h3>
          <div className="mb-4 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <div className="flex items-end gap-2">
            <span className="font-display text-2xl font-semibold leading-none text-foreground">
              {formatPriceForDisplay(price)}
            </span>
            {hasDiscount && originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                {formatPriceForDisplay(originalPrice)}
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-1 font-body text-[11px] font-semibold text-primary">
                Limited-time deal
              </span>
              <span className="font-body text-xs font-semibold text-muted-foreground">
                Only <span className="text-foreground">{stockLeft}</span> left
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default GameCard;
