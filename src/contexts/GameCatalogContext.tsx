/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { games, type Game } from "@/data/games";
import { GAME_CATEGORIES, type GameCategory, type GameStatus } from "@/data/categories";
import { logAdminActivity } from "@/lib/admin-activity";
import { formatTZS, parsePriceToAmount } from "@/lib/pricing";

export interface ManagedGame extends Game {
  status: GameStatus;
  category: GameCategory;
  createdAt: string;
  updatedAt: string;
  shortDescription: string;
  fullDescription: string;
  systemRequirements?: string;
  tags: string[];
  trailerUrl?: string;
  gallery: string[];
}

export interface ManagedGameDraft {
  title: string;
  category: GameCategory;
  status: GameStatus;
  price: number;
  salePrice?: number;
  coverImage: string;
  gallery: string[];
  trailerUrl?: string;
  shortDescription: string;
  fullDescription: string;
  systemRequirements?: string;
  tags: string[];
}

interface GameCatalogContextValue {
  games: ManagedGame[];
  publishedGames: ManagedGame[];
  isLoading: boolean;
  createGame: (draft: ManagedGameDraft) => ManagedGame;
  updateGame: (id: string, draft: ManagedGameDraft) => ManagedGame | null;
  deleteGame: (id: string) => boolean;
  duplicateGame: (id: string) => ManagedGame | null;
  getGameById: (id: string) => ManagedGame | undefined;
}

const GAME_STORAGE_KEY = "hasheem_admin_games_v4";
const GameCatalogContext = createContext<GameCatalogContextValue | undefined>(undefined);

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createSeedGames(): ManagedGame[] {
  return games.map((game) => {
    const category = (game.platforms[0] ?? "PC") as GameCategory;
    const createdAt = new Date(game.releaseDate).toISOString();
    const shortDescription =
      game.description.length > 140 ? `${game.description.slice(0, 137)}...` : game.description;

    return {
      ...game,
      status: "Published",
      category,
      createdAt,
      updatedAt: createdAt,
      shortDescription,
      fullDescription: game.description,
      systemRequirements:
        category === "PC"
          ? "OS: Windows 10+, RAM: 8GB, CPU: Intel i5/Ryzen 5, GPU: 4GB VRAM"
          : "",
      tags: game.features.slice(0, 4),
      trailerUrl: "",
      gallery: game.screenshots.slice(1),
      platforms: [category],
      description: game.description,
      price: formatTZS(parsePriceToAmount(game.price)),
      originalPrice: game.originalPrice
        ? formatTZS(parsePriceToAmount(game.originalPrice))
        : undefined,
    };
  });
}

function isValidCategory(value: unknown): value is GameCategory {
  return typeof value === "string" && GAME_CATEGORIES.includes(value as GameCategory);
}

function normalizeManagedGame(input: unknown, fallbackId: string): ManagedGame | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const item = input as Record<string, unknown>;
  const title = typeof item.title === "string" ? item.title.trim() : "";
  const image = typeof item.image === "string" ? item.image.trim() : "";
  const category = isValidCategory(item.category) ? item.category : "PC";
  const status = item.status === "Draft" ? "Draft" : "Published";
  const price = typeof item.price === "string" ? item.price : "";
  const parsedPrice = parsePriceToAmount(price);

  if (!title || !image || parsedPrice < 0) {
    return null;
  }

  const parsedGallery = Array.isArray(item.gallery)
    ? item.gallery.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];

  const parsedScreenshots = Array.isArray(item.screenshots)
    ? item.screenshots.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];

  const screenshots = parsedScreenshots.length > 0 ? parsedScreenshots : [image, ...parsedGallery];

  return {
    id: typeof item.id === "string" && item.id.trim().length > 0 ? item.id.trim() : fallbackId,
    title,
    image,
    screenshots: screenshots.length > 0 ? screenshots : [image],
    price: parsedPrice > 0 ? formatTZS(parsedPrice) : "FREE",
    originalPrice:
      typeof item.originalPrice === "string" && item.originalPrice.trim().length > 0
        ? formatTZS(parsePriceToAmount(item.originalPrice))
        : undefined,
    rating:
      typeof item.rating === "number" && Number.isFinite(item.rating)
        ? Math.max(1, Math.min(5, Math.round(item.rating)))
        : 4,
    genre: typeof item.genre === "string" && item.genre.trim().length > 0 ? item.genre.trim() : "Action",
    platforms: [category],
    description:
      typeof item.description === "string" && item.description.trim().length > 0
        ? item.description.trim()
        : "Description pending update.",
    releaseDate:
      typeof item.releaseDate === "string" && item.releaseDate.trim().length > 0
        ? item.releaseDate.trim()
        : new Date().toISOString().slice(0, 10),
    developer:
      typeof item.developer === "string" && item.developer.trim().length > 0
        ? item.developer.trim()
        : "Independent Studio",
    publisher:
      typeof item.publisher === "string" && item.publisher.trim().length > 0
        ? item.publisher.trim()
        : "HASHEEM Publishing",
    features: Array.isArray(item.features)
      ? item.features.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      : [],
    status,
    category,
    createdAt:
      typeof item.createdAt === "string" && item.createdAt.trim().length > 0
        ? item.createdAt.trim()
        : new Date().toISOString(),
    updatedAt:
      typeof item.updatedAt === "string" && item.updatedAt.trim().length > 0
        ? item.updatedAt.trim()
        : new Date().toISOString(),
    shortDescription:
      typeof item.shortDescription === "string" && item.shortDescription.trim().length > 0
        ? item.shortDescription.trim()
        : "",
    fullDescription:
      typeof item.fullDescription === "string" && item.fullDescription.trim().length > 0
        ? item.fullDescription.trim()
        : typeof item.description === "string"
          ? item.description
          : "",
    systemRequirements:
      typeof item.systemRequirements === "string" ? item.systemRequirements.trim() : "",
    tags: Array.isArray(item.tags)
      ? item.tags.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      : [],
    trailerUrl: typeof item.trailerUrl === "string" ? item.trailerUrl.trim() : "",
    gallery: parsedGallery,
  };
}

function normalizeGames(input: unknown): ManagedGame[] {
  if (!Array.isArray(input)) {
    return createSeedGames();
  }

  const usedIds = new Set<string>();
  const normalized = input
    .map((entry, index) => normalizeManagedGame(entry, `game-${index + 1}`))
    .filter((entry): entry is ManagedGame => entry !== null)
    .map((entry) => {
      let id = entry.id;
      let suffix = 1;
      while (usedIds.has(id)) {
        id = `${entry.id}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);
      return { ...entry, id };
    });

  if (normalized.length === 0) {
    return createSeedGames();
  }

  return normalized;
}

function mergeWithSeedGames(list: ManagedGame[]): ManagedGame[] {
  const merged = new Map<string, ManagedGame>();
  createSeedGames().forEach((seed) => {
    merged.set(seed.id, seed);
  });
  list.forEach((game) => {
    merged.set(game.id, game);
  });
  return Array.from(merged.values());
}

function loadGames(): ManagedGame[] {
  if (typeof window === "undefined") {
    return createSeedGames();
  }

  const raw = window.localStorage.getItem(GAME_STORAGE_KEY);
  if (!raw) {
    return createSeedGames();
  }

  try {
    return mergeWithSeedGames(normalizeGames(JSON.parse(raw)));
  } catch {
    return createSeedGames();
  }
}

function createGameRecord(input: ManagedGameDraft, existingIds: Set<string>): ManagedGame {
  const now = new Date().toISOString();
  const baseId = slugify(input.title) || "new-game";
  let id = baseId;
  let suffix = 1;
  while (existingIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const primaryTag = input.tags[0] || "Action";
  const fullDescription = input.fullDescription.trim() || input.shortDescription.trim();
  const salePrice = typeof input.salePrice === "number" ? input.salePrice : 0;
  const hasValidSale = salePrice > 0 && salePrice < input.price;
  const livePrice = hasValidSale ? salePrice : input.price;

  return {
    id,
    title: input.title.trim(),
    image: input.coverImage,
    screenshots: [input.coverImage, ...input.gallery],
    price: livePrice > 0 ? formatTZS(livePrice) : "FREE",
    originalPrice: hasValidSale ? formatTZS(input.price) : undefined,
    rating: 4,
    genre: primaryTag,
    platforms: [input.category],
    description: fullDescription,
    releaseDate: now.slice(0, 10),
    developer: "HASHEEM Studio",
    publisher: "HASHEEM Publishing",
    features: input.tags,
    status: input.status,
    category: input.category,
    createdAt: now,
    updatedAt: now,
    shortDescription: input.shortDescription.trim(),
    fullDescription,
    systemRequirements: input.systemRequirements?.trim() ?? "",
    tags: input.tags,
    trailerUrl: input.trailerUrl?.trim() ?? "",
    gallery: input.gallery,
  };
}

function updateGameRecord(base: ManagedGame, input: ManagedGameDraft): ManagedGame {
  const now = new Date().toISOString();
  const fullDescription = input.fullDescription.trim() || input.shortDescription.trim();
  const salePrice = typeof input.salePrice === "number" ? input.salePrice : 0;
  const hasValidSale = salePrice > 0 && salePrice < input.price;
  const livePrice = hasValidSale ? salePrice : input.price;

  return {
    ...base,
    title: input.title.trim(),
    category: input.category,
    platforms: [input.category],
    status: input.status,
    price: livePrice > 0 ? formatTZS(livePrice) : "FREE",
    originalPrice: hasValidSale ? formatTZS(input.price) : undefined,
    image: input.coverImage,
    screenshots: [input.coverImage, ...input.gallery],
    description: fullDescription,
    genre: input.tags[0] || base.genre,
    features: input.tags,
    shortDescription: input.shortDescription.trim(),
    fullDescription,
    systemRequirements: input.systemRequirements?.trim() ?? "",
    tags: input.tags,
    trailerUrl: input.trailerUrl?.trim() ?? "",
    gallery: input.gallery,
    updatedAt: now,
  };
}

export const GameCatalogProvider = ({ children }: { children: ReactNode }) => {
  const [gamesState, setGamesState] = useState<ManagedGame[]>(loadGames);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gamesState));
  }, [gamesState]);

  const value = useMemo<GameCatalogContextValue>(() => {
    const sortedGames = [...gamesState].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      games: sortedGames,
      publishedGames: sortedGames.filter((game) => game.status === "Published"),
      isLoading,
      createGame: (draft) => {
        const next = createGameRecord(draft, new Set(gamesState.map((game) => game.id)));
        setGamesState((previous) => [next, ...previous]);
        logAdminActivity({
          message:
            next.status === "Published"
              ? `Game ${next.title} published`
              : `Draft created for ${next.title}`,
          href: "/admin/games",
          level: next.status === "Published" ? "success" : "info",
        });
        return next;
      },
      updateGame: (id, draft) => {
        let updated: ManagedGame | null = null;
        let previousPrice = "";
        setGamesState((previous) =>
          previous.map((game) => {
            if (game.id !== id) {
              return game;
            }

            previousPrice = game.price;
            updated = updateGameRecord(game, draft);
            return updated;
          }),
        );
        if (updated) {
          const priceChanged = previousPrice !== updated.price;
          logAdminActivity({
            message: priceChanged
              ? `Price updated for ${updated.title}`
              : `Game details updated for ${updated.title}`,
            href: `/admin/games/${updated.id}/edit`,
            level: "info",
          });
        }
        return updated;
      },
      deleteGame: (id) => {
        let deleted = false;
        let deletedTitle = "";
        setGamesState((previous) => {
          const filtered = previous.filter((game) => {
            const isMatch = game.id === id;
            if (isMatch) {
              deletedTitle = game.title;
            }
            return !isMatch;
          });
          deleted = filtered.length !== previous.length;
          return filtered;
        });
        if (deleted) {
          logAdminActivity({
            message: `Game ${deletedTitle || id} deleted`,
            href: "/admin/games",
            level: "warning",
          });
        }
        return deleted;
      },
      duplicateGame: (id) => {
        const source = gamesState.find((game) => game.id === id);
        if (!source) {
          return null;
        }

        const duplicateDraft: ManagedGameDraft = {
          title: `${source.title} Copy`,
          category: source.category,
          status: "Draft",
          price: source.originalPrice
            ? parsePriceToAmount(source.originalPrice)
            : parsePriceToAmount(source.price),
          salePrice: source.originalPrice ? parsePriceToAmount(source.price) : undefined,
          coverImage: source.image,
          gallery: source.gallery,
          trailerUrl: source.trailerUrl,
          shortDescription: source.shortDescription,
          fullDescription: source.fullDescription,
          systemRequirements: source.systemRequirements,
          tags: source.tags,
        };

        const clone = createGameRecord(duplicateDraft, new Set(gamesState.map((game) => game.id)));
        setGamesState((previous) => [clone, ...previous]);
        logAdminActivity({
          message: `Draft duplicated from ${source.title}`,
          href: `/admin/games/${clone.id}/edit`,
          level: "info",
        });
        return clone;
      },
      getGameById: (id) => gamesState.find((game) => game.id === id),
    };
  }, [gamesState, isLoading]);

  return <GameCatalogContext.Provider value={value}>{children}</GameCatalogContext.Provider>;
};

export function useGameCatalog(): GameCatalogContextValue {
  const context = useContext(GameCatalogContext);
  if (!context) {
    throw new Error("useGameCatalog must be used inside GameCatalogProvider");
  }

  return context;
}
