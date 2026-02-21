import { useParams, Link } from "react-router-dom";
import { getGameById } from "@/data/games";
import { ArrowLeft, ShoppingCart, Star, Monitor, Laptop, Gamepad2, Heart, Share2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HasheemAI from "@/components/HasheemAI";

const platformIcons: Record<string, React.ReactNode> = {
  PC: <Monitor className="h-4 w-4" />,
  Laptop: <Laptop className="h-4 w-4" />,
  PlayStation: <Gamepad2 className="h-4 w-4" />,
};

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const game = getGameById(id || "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  if (!game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 font-display text-3xl font-bold text-foreground">Game Not Found</h1>
          <Link to="/" className="font-body text-primary underline">Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={game.screenshots[selectedImage] || game.image}
          alt={game.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left - Info */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-primary/20 px-2 py-0.5 font-body text-xs font-semibold uppercase tracking-widest text-primary">
                {game.genre}
              </span>
              {game.originalPrice && (
                <span className="rounded bg-accent/20 px-2 py-0.5 font-body text-xs font-bold uppercase text-accent">
                  Sale
                </span>
              )}
            </div>

            <h1 className="mb-4 font-display text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
              {game.title}
            </h1>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < game.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <span className="font-body text-sm text-muted-foreground">
                {game.rating}.0 / 5.0
              </span>
            </div>

            <div className="mb-6 flex items-center gap-3">
              {game.platforms.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 font-body text-xs font-semibold text-foreground"
                >
                  {platformIcons[p]}
                  {p}
                </span>
              ))}
            </div>

            <p className="mb-8 font-body text-lg leading-relaxed text-muted-foreground">
              {game.description}
            </p>

            {/* Screenshots */}
            <h3 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-foreground">
              Screenshots
            </h3>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {game.screenshots.map((ss, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === i ? "border-primary neon-border" : "border-border hover:border-primary/40"
                  }`}
                >
                  <img src={ss} alt={`Screenshot ${i + 1}`} className="aspect-video w-full object-cover" />
                </button>
              ))}
            </div>

            {/* Features */}
            <h3 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-foreground">
              Features
            </h3>
            <div className="flex flex-wrap gap-2">
              {game.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-border bg-muted px-4 py-1.5 font-body text-sm text-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right - Buy Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="sticky top-20 rounded-xl border border-border bg-card p-6">
              <img
                src={game.image}
                alt={game.title}
                className="mb-4 aspect-[3/4] w-full rounded-lg object-cover"
              />

              <div className="mb-4 flex items-end gap-3">
                <span className="font-display text-3xl font-black text-foreground">
                  {game.price === "$0.00" ? "FREE" : game.price}
                </span>
                {game.originalPrice && (
                  <span className="mb-1 font-body text-lg text-muted-foreground line-through">
                    {game.originalPrice}
                  </span>
                )}
              </div>

              <button className="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-[var(--neon-glow-strong)]">
                <ShoppingCart className="h-4 w-4" />
                {game.price === "$0.00" ? "Download Free" : "Add to Cart"}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 font-body text-sm font-semibold transition-all ${
                    wishlisted
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? "fill-accent" : ""}`} />
                  Wishlist
                </button>
                <button className="flex items-center justify-center rounded-md border border-border px-3 py-2.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-6">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Developer</span>
                  <span className="text-foreground">{game.developer}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Publisher</span>
                  <span className="text-foreground">{game.publisher}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Release</span>
                  <span className="text-foreground">{game.releaseDate}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
      <HasheemAI />
    </div>
  );
};

export default GameDetail;
