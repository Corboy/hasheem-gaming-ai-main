import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ImagePlus,
  Lock,
  PlusCircle,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { games, type Game, type Platform } from "@/data/games";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useSeo } from "@/hooks/use-seo";
import { formatTshAmount, parsePriceToTshAmount, toTshPriceString } from "@/lib/pricing";
import type { SiteSettings } from "@/types/site-settings";

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? "hasheem2026";

const platformOptions: Platform[] = ["PC", "Mobile", "PlayStation"];

interface NewGameForm {
  title: string;
  genre: string;
  description: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  priceTsh: string;
  originalPriceTsh: string;
  features: string;
  image: string;
  screenshotUrl: string;
  platforms: Record<Platform, boolean>;
}

function cloneSettings(value: SiteSettings): SiteSettings {
  return JSON.parse(JSON.stringify(value)) as SiteSettings;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function clampRating(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
}

function toOptionalTsh(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  return formatTshAmount(amount);
}

function createEmptyGameForm(): NewGameForm {
  return {
    title: "",
    genre: "Action",
    description: "",
    developer: "",
    publisher: "HASHEEM Publishing",
    releaseDate: "2026-12-01",
    priceTsh: "0",
    originalPriceTsh: "",
    features: "",
    image: "",
    screenshotUrl: "",
    platforms: {
      PC: true,
      Mobile: false,
      PlayStation: false,
    },
  };
}

const inputClasses =
  "w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const sectionClasses = "rounded-2xl border border-border bg-card p-5 md:p-6";

const Admin = () => {
  const { settings, saveSettings, resetSettings } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(() => cloneSettings(settings));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [newGame, setNewGame] = useState<NewGameForm>(createEmptyGameForm);

  useEffect(() => {
    setDraft(cloneSettings(settings));
  }, [settings]);

  useSeo({
    title: `Admin Console | ${settings.seo.siteName}`,
    description: "Beginner-friendly dashboard to manage content, prices, and game catalog.",
    image: settings.seo.ogImage,
    noindex: true,
    siteName: settings.seo.siteName,
    twitterHandle: settings.seo.twitterHandle,
  });

  const baseGameIds = useMemo(() => new Set(games.map((game) => game.id)), []);

  const draftCatalogGames = useMemo(() => {
    return [...games, ...draft.customGames].map((game) => {
      const override = draft.gameOverrides[game.id];
      if (!override) {
        return game;
      }

      return {
        ...game,
        price: override.price,
        originalPrice: override.originalPrice || undefined,
        rating: clampRating(override.rating),
        genre: override.genre,
      };
    });
  }, [draft]);

  const featuredTitle =
    draftCatalogGames.find((game) => game.id === draft.featuredGameId)?.title ?? "Not selected";

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings],
  );

  const updateDraft = (updater: (previous: SiteSettings) => SiteSettings) => {
    setDraft((previous) => updater(previous));
  };

  const handleSave = () => {
    saveSettings(draft);
    toast.success("Changes saved. Store updated.");
  };

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to default.");
  };

  const updateGameMeta = (
    gameId: string,
    field: "genre" | "rating" | "price" | "originalPrice",
    value: string | number,
  ) => {
    updateDraft((previous) => {
      const next = cloneSettings(previous);
      const customGameIndex = next.customGames.findIndex((game) => game.id === gameId);

      if (customGameIndex >= 0) {
        const currentGame = next.customGames[customGameIndex];
        if (field === "genre" && typeof value === "string") {
          next.customGames[customGameIndex] = { ...currentGame, genre: value };
        }
        if (field === "rating" && typeof value === "number") {
          next.customGames[customGameIndex] = { ...currentGame, rating: clampRating(value) };
        }
        if (field === "price" && typeof value === "number") {
          next.customGames[customGameIndex] = { ...currentGame, price: toTshPriceString(value) };
        }
        if (field === "originalPrice" && typeof value === "number") {
          next.customGames[customGameIndex] = {
            ...currentGame,
            originalPrice: toOptionalTsh(value) || undefined,
          };
        }

        return next;
      }

      const baseGame = games.find((game) => game.id === gameId);
      const fallback = {
        price: baseGame?.price ?? "FREE",
        originalPrice: baseGame?.originalPrice ?? "",
        rating: baseGame?.rating ?? 4,
        genre: baseGame?.genre ?? "Action",
      };
      const currentOverride = next.gameOverrides[gameId] ?? fallback;

      if (field === "genre" && typeof value === "string") {
        next.gameOverrides[gameId] = { ...currentOverride, genre: value };
      }
      if (field === "rating" && typeof value === "number") {
        next.gameOverrides[gameId] = { ...currentOverride, rating: clampRating(value) };
      }
      if (field === "price" && typeof value === "number") {
        next.gameOverrides[gameId] = { ...currentOverride, price: toTshPriceString(value) };
      }
      if (field === "originalPrice" && typeof value === "number") {
        next.gameOverrides[gameId] = {
          ...currentOverride,
          originalPrice: toOptionalTsh(value),
        };
      }

      return next;
    });
  };

  const handleCustomGamePlatformToggle = (gameId: string, platform: Platform, checked: boolean) => {
    updateDraft((previous) => {
      const next = cloneSettings(previous);
      const customGameIndex = next.customGames.findIndex((game) => game.id === gameId);
      if (customGameIndex < 0) {
        return next;
      }

      const currentPlatforms = new Set(next.customGames[customGameIndex].platforms);
      if (checked) {
        currentPlatforms.add(platform);
      } else {
        currentPlatforms.delete(platform);
      }

      if (currentPlatforms.size === 0) {
        currentPlatforms.add("PC");
      }

      next.customGames[customGameIndex].platforms = Array.from(currentPlatforms);
      return next;
    });
  };

  const handleAddGame = () => {
    if (!newGame.title.trim()) {
      toast.error("Enter game title first.");
      return;
    }
    if (!newGame.image.trim()) {
      toast.error("Add game image URL or upload image file.");
      return;
    }

    const selectedPlatforms = (Object.entries(newGame.platforms) as [Platform, boolean][])
      .filter(([, selected]) => selected)
      .map(([platform]) => platform);

    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform category.");
      return;
    }

    const existingIds = new Set([...games.map((game) => game.id), ...draft.customGames.map((game) => game.id)]);
    const baseSlug = slugify(newGame.title) || "new-game";
    let uniqueId = baseSlug;
    let suffix = 1;

    while (existingIds.has(uniqueId)) {
      uniqueId = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const features = newGame.features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean);

    const gameToAdd: Game = {
      id: uniqueId,
      title: newGame.title.trim(),
      image: newGame.image.trim(),
      screenshots: [newGame.screenshotUrl.trim() || newGame.image.trim()],
      price: toTshPriceString(Number(newGame.priceTsh)),
      originalPrice: toOptionalTsh(Number(newGame.originalPriceTsh)) || undefined,
      rating: 4,
      genre: newGame.genre.trim() || "Action",
      platforms: selectedPlatforms,
      description: newGame.description.trim() || "Description pending update.",
      releaseDate: newGame.releaseDate,
      developer: newGame.developer.trim() || "Independent Studio",
      publisher: newGame.publisher.trim() || "HASHEEM Publishing",
      features: features.length > 0 ? features : ["Single Player"],
    };

    updateDraft((previous) => {
      const next = cloneSettings(previous);
      next.customGames.push(gameToAdd);
      return next;
    });

    setNewGame(createEmptyGameForm());
    toast.success("New game added to catalog draft. Click Save Changes.");
  };

  const handleRemoveCustomGame = (gameId: string) => {
    updateDraft((previous) => {
      const next = cloneSettings(previous);
      next.customGames = next.customGames.filter((game) => game.id !== gameId);

      if (next.featuredGameId === gameId) {
        next.featuredGameId = games[0]?.id ?? "";
      }

      return next;
    });

    toast.success("Custom game removed from draft.");
  };

  const handleGameImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const encoded = typeof reader.result === "string" ? reader.result : "";
      if (!encoded) {
        toast.error("Failed to read image file.");
        return;
      }

      setNewGame((previous) => ({
        ...previous,
        image: encoded,
        screenshotUrl: previous.screenshotUrl || encoded,
      }));
      toast.success("Image uploaded for new game form.");
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 pt-24">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
                Admin Access
              </h1>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Enter passcode to open beginner dashboard.
              </p>
            </div>

            <input
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              className={inputClasses}
              placeholder="Enter admin passcode"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  if (passcode === ADMIN_PASSCODE) {
                    setIsAuthenticated(true);
                    setPasscode("");
                  } else {
                    toast.error("Invalid passcode.");
                  }
                }
              }}
            />

            <button
              type="button"
              className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:shadow-[var(--neon-glow)]"
              onClick={() => {
                if (passcode === ADMIN_PASSCODE) {
                  setIsAuthenticated(true);
                  setPasscode("");
                } else {
                  toast.error("Invalid passcode.");
                }
              }}
            >
              Open Dashboard
            </button>

            <p className="mt-4 font-body text-xs text-muted-foreground">
              Default passcode is <code className="rounded bg-muted px-1">hasheem2026</code>. Change using
              <code className="ml-1 rounded bg-muted px-1">VITE_ADMIN_PASSCODE</code>.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto space-y-5 px-4 pb-20 pt-24">
        <header className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-black uppercase tracking-wide text-foreground md:text-3xl">
                Beginner Admin Dashboard
              </h1>
              <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
                Use this page step-by-step: update brand, add new games, choose platform category,
                and manage all prices in Tanzanian Shillings (TSh).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                onClick={() => {
                  setIsAuthenticated(false);
                  toast.success("Logged out from admin dashboard.");
                }}
              >
                Logout
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                Reset Defaults
              </button>
              <button
                type="button"
                disabled={!hasChanges}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:shadow-[var(--neon-glow)] disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <article className={sectionClasses}>
            <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Total Games</p>
            <p className="mt-2 font-display text-3xl font-black text-foreground">{draftCatalogGames.length}</p>
          </article>
          <article className={sectionClasses}>
            <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Custom Games</p>
            <p className="mt-2 font-display text-3xl font-black text-foreground">{draft.customGames.length}</p>
          </article>
          <article className={sectionClasses}>
            <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Featured Game</p>
            <p className="mt-2 font-body text-sm font-semibold text-foreground">{featuredTitle}</p>
          </article>
          <article className={sectionClasses}>
            <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Support Contact</p>
            <p className="mt-2 font-body text-sm font-semibold text-foreground">{draft.supportEmail}</p>
          </article>
        </section>

        <section className={sectionClasses}>
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
              Step 1: Basic Store Setup
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Brand Name
              </label>
              <input
                className={inputClasses}
                value={draft.brandName}
                onChange={(event) =>
                  updateDraft((previous) => ({ ...previous, brandName: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Support Email
              </label>
              <input
                className={inputClasses}
                value={draft.supportEmail}
                onChange={(event) =>
                  updateDraft((previous) => ({ ...previous, supportEmail: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Support Phone
              </label>
              <input
                className={inputClasses}
                value={draft.supportPhone}
                onChange={(event) =>
                  updateDraft((previous) => ({ ...previous, supportPhone: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Featured Game
              </label>
              <select
                className={inputClasses}
                value={draft.featuredGameId}
                onChange={(event) =>
                  updateDraft((previous) => ({ ...previous, featuredGameId: event.target.value }))
                }
              >
                {draftCatalogGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                SEO Title
              </label>
              <input
                className={inputClasses}
                value={draft.seo.defaultTitle}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    seo: { ...previous.seo, defaultTitle: event.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                SEO Description
              </label>
              <textarea
                className={`${inputClasses} min-h-20`}
                value={draft.seo.defaultDescription}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    seo: { ...previous.seo, defaultDescription: event.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background/70 p-4">
            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-foreground">
              Homepage Hero Text
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className={inputClasses}
                value={draft.hero.badgeText}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    hero: { ...previous.hero, badgeText: event.target.value },
                  }))
                }
                placeholder="Badge text"
              />
              <input
                className={inputClasses}
                value={draft.hero.headingLead}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    hero: { ...previous.hero, headingLead: event.target.value },
                  }))
                }
                placeholder="Heading start"
              />
              <input
                className={inputClasses}
                value={draft.hero.headingAccent}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    hero: { ...previous.hero, headingAccent: event.target.value },
                  }))
                }
                placeholder="Highlight word"
              />
              <input
                className={inputClasses}
                value={draft.hero.headingTail}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    hero: { ...previous.hero, headingTail: event.target.value },
                  }))
                }
                placeholder="Heading ending"
              />
              <textarea
                className={`${inputClasses} md:col-span-2 min-h-20`}
                value={draft.hero.description}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    hero: { ...previous.hero, description: event.target.value },
                  }))
                }
                placeholder="Homepage description"
              />
            </div>
          </div>
        </section>

        <section className={sectionClasses}>
          <div className="mb-4 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
              Step 2: Add New Game (Beginner Form)
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Game Title
              </label>
              <input
                className={inputClasses}
                value={newGame.title}
                onChange={(event) => setNewGame((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Example: Street Drift Legends"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Genre
              </label>
              <input
                className={inputClasses}
                value={newGame.genre}
                onChange={(event) => setNewGame((previous) => ({ ...previous, genre: event.target.value }))}
                placeholder="Racing"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </label>
              <textarea
                className={`${inputClasses} min-h-24`}
                value={newGame.description}
                onChange={(event) =>
                  setNewGame((previous) => ({ ...previous, description: event.target.value }))
                }
                placeholder="Describe gameplay, story, and key features..."
              />
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Developer
              </label>
              <input
                className={inputClasses}
                value={newGame.developer}
                onChange={(event) =>
                  setNewGame((previous) => ({ ...previous, developer: event.target.value }))
                }
                placeholder="Studio name"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Publisher
              </label>
              <input
                className={inputClasses}
                value={newGame.publisher}
                onChange={(event) =>
                  setNewGame((previous) => ({ ...previous, publisher: event.target.value }))
                }
              />
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Price (TSh)
              </label>
              <input
                type="number"
                className={inputClasses}
                value={newGame.priceTsh}
                onChange={(event) =>
                  setNewGame((previous) => ({ ...previous, priceTsh: event.target.value }))
                }
                placeholder="35000"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Original Price (TSh, optional)
              </label>
              <input
                type="number"
                className={inputClasses}
                value={newGame.originalPriceTsh}
                onChange={(event) =>
                  setNewGame((previous) => ({ ...previous, originalPriceTsh: event.target.value }))
                }
                placeholder="50000"
              />
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Release Date
              </label>
              <input
                type="date"
                className={inputClasses}
                value={newGame.releaseDate}
                onChange={(event) =>
                  setNewGame((previous) => ({ ...previous, releaseDate: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Features (comma separated)
              </label>
              <input
                className={inputClasses}
                value={newGame.features}
                onChange={(event) =>
                  setNewGame((previous) => ({ ...previous, features: event.target.value }))
                }
                placeholder="Multiplayer, Controller Support, 60 FPS"
              />
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Game Image URL
              </label>
              <input
                className={inputClasses}
                value={newGame.image}
                onChange={(event) => setNewGame((previous) => ({ ...previous, image: event.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Screenshot URL (optional)
              </label>
              <input
                className={inputClasses}
                value={newGame.screenshotUrl}
                onChange={(event) =>
                  setNewGame((previous) => ({ ...previous, screenshotUrl: event.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Category / Platform
              </label>
              <div className="flex flex-wrap gap-3">
                {platformOptions.map((platform) => (
                  <label
                    key={platform}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-body text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={newGame.platforms[platform]}
                      onChange={(event) =>
                        setNewGame((previous) => ({
                          ...previous,
                          platforms: {
                            ...previous.platforms,
                            [platform]: event.target.checked,
                          },
                        }))
                      }
                    />
                    {platform}
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Or Upload Game Image
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 font-body text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground">
                <ImagePlus className="h-4 w-4" />
                Choose Image File
                <input type="file" accept="image/*" className="hidden" onChange={handleGameImageUpload} />
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-primary-foreground transition-all hover:shadow-[var(--neon-glow)]"
              onClick={handleAddGame}
            >
              Add Game To Catalog
            </button>
            <button
              type="button"
              className="rounded-md border border-border px-5 py-2.5 font-body text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground"
              onClick={() => setNewGame(createEmptyGameForm())}
            >
              Clear Form
            </button>
          </div>
        </section>

        <section className={sectionClasses}>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-foreground">
            Step 3: Manage All Game Prices (TSh)
          </h2>
          <p className="mb-4 font-body text-sm text-muted-foreground">
            Update prices for every game from one place. Base games and custom games are both shown.
          </p>

          <div className="space-y-3">
            {draftCatalogGames.map((game) => {
              const isBaseGame = baseGameIds.has(game.id);

              return (
                <article key={game.id} className="rounded-xl border border-border bg-background/70 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                        {game.title}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground">
                        {isBaseGame ? "Base Game" : "Custom Game"} • ID: {game.id}
                      </p>
                    </div>

                    {!isBaseGame && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        onClick={() => handleRemoveCustomGame(game.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Price (TSh)
                      </label>
                      <input
                        type="number"
                        className={inputClasses}
                        value={parsePriceToTshAmount(game.price)}
                        onChange={(event) =>
                          updateGameMeta(game.id, "price", Number(event.target.value) || 0)
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Original Price
                      </label>
                      <input
                        type="number"
                        className={inputClasses}
                        value={parsePriceToTshAmount(game.originalPrice ?? "")}
                        onChange={(event) =>
                          updateGameMeta(game.id, "originalPrice", Number(event.target.value) || 0)
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className={inputClasses}
                        value={game.rating}
                        onChange={(event) =>
                          updateGameMeta(game.id, "rating", Number(event.target.value) || 1)
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Genre
                      </label>
                      <input
                        className={inputClasses}
                        value={game.genre}
                        onChange={(event) => updateGameMeta(game.id, "genre", event.target.value)}
                      />
                    </div>
                  </div>

                  {!isBaseGame && (
                    <div className="mt-3">
                      <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Platforms
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {platformOptions.map((platform) => (
                          <label
                            key={`${game.id}-${platform}`}
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-body text-xs text-foreground"
                          >
                            <input
                              type="checkbox"
                              checked={game.platforms.includes(platform)}
                              onChange={(event) =>
                                handleCustomGamePlatformToggle(game.id, platform, event.target.checked)
                              }
                            />
                            {platform}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className={sectionClasses}>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-foreground">
            Step 4: Navigation & Footer
          </h2>

          <div className="space-y-2">
            {draft.navLinks.map((link, index) => (
              <div key={`${link.href}-${index}`} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                <input
                  className={inputClasses}
                  value={link.label}
                  onChange={(event) =>
                    updateDraft((previous) => {
                      const next = cloneSettings(previous);
                      next.navLinks[index].label = event.target.value;
                      return next;
                    })
                  }
                />
                <input
                  className={inputClasses}
                  value={link.href}
                  onChange={(event) =>
                    updateDraft((previous) => {
                      const next = cloneSettings(previous);
                      next.navLinks[index].href = event.target.value;
                      return next;
                    })
                  }
                />
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-2 font-body text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
                  onClick={() =>
                    updateDraft((previous) => {
                      const next = cloneSettings(previous);
                      next.navLinks.splice(index, 1);
                      return next;
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 font-body text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground"
              onClick={() =>
                updateDraft((previous) => ({
                  ...previous,
                  navLinks: [...previous.navLinks, { label: "New Link", href: "#store" }],
                }))
              }
            >
              Add Nav Link
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background/70 p-4">
            <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Footer Note
            </label>
            <input
              className={inputClasses}
              value={draft.footer.legalNote}
              onChange={(event) =>
                updateDraft((previous) => ({
                  ...previous,
                  footer: { ...previous.footer, legalNote: event.target.value },
                }))
              }
            />
          </div>

          <div className="mt-3 space-y-2">
            {draft.footer.links.map((link, index) => (
              <div key={`${link.href}-footer-${index}`} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                <input
                  className={inputClasses}
                  value={link.label}
                  onChange={(event) =>
                    updateDraft((previous) => {
                      const next = cloneSettings(previous);
                      next.footer.links[index].label = event.target.value;
                      return next;
                    })
                  }
                />
                <input
                  className={inputClasses}
                  value={link.href}
                  onChange={(event) =>
                    updateDraft((previous) => {
                      const next = cloneSettings(previous);
                      next.footer.links[index].href = event.target.value;
                      return next;
                    })
                  }
                />
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-2 font-body text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
                  onClick={() =>
                    updateDraft((previous) => {
                      const next = cloneSettings(previous);
                      next.footer.links.splice(index, 1);
                      return next;
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 font-body text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground"
              onClick={() =>
                updateDraft((previous) => ({
                  ...previous,
                  footer: {
                    ...previous.footer,
                    links: [...previous.footer.links, { label: "New Link", href: "/about" }],
                  },
                }))
              }
            >
              Add Footer Link
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-body text-sm text-foreground">
              <input
                type="checkbox"
                checked={draft.features.assistantEnabled}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    features: {
                      ...previous.features,
                      assistantEnabled: event.target.checked,
                    },
                  }))
                }
              />
              Enable Assistant Widget
            </label>

            <label className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-body text-sm text-foreground">
              <input
                type="checkbox"
                checked={draft.features.communitySectionEnabled}
                onChange={(event) =>
                  updateDraft((previous) => ({
                    ...previous,
                    features: {
                      ...previous.features,
                      communitySectionEnabled: event.target.checked,
                    },
                  }))
                }
              />
              Enable Community Reviews Section
            </label>
          </div>
        </section>

        <div className="rounded-2xl border border-border bg-card p-4 font-body text-xs text-muted-foreground">
          Beginner tip: after editing, always click <strong>Save Changes</strong>. Then check homepage and
          one game detail page to confirm everything.
        </div>

        <div className="text-center font-body text-sm text-muted-foreground">
          Need page content help? open <Link className="text-primary underline" to="/about">About</Link>.
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
