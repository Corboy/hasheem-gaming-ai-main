/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { games, type Game, type Platform } from "@/data/games";
import { SITE_SETTINGS_STORAGE_KEY, defaultSiteSettings } from "@/data/site-settings";
import type { GameOverrideMap, SiteSettings } from "@/types/site-settings";

interface SiteSettingsContextValue {
  settings: SiteSettings;
  setSettings: Dispatch<SetStateAction<SiteSettings>>;
  saveSettings: (nextSettings: SiteSettings) => void;
  resetSettings: () => void;
  catalogGames: Game[];
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

const allowedPlatforms = new Set<Platform>(["PC", "Mobile", "PlayStation"]);

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function clampRating(value: number): number {
  const nextValue = Number.isFinite(value) ? Math.round(value) : 1;
  return Math.min(5, Math.max(1, nextValue));
}

function normalizePlatforms(input: unknown): Platform[] {
  if (!Array.isArray(input)) {
    return ["PC"];
  }

  const platforms = input
    .map((entry) => (entry === "Laptop" ? "Mobile" : entry))
    .filter(
      (entry): entry is Platform =>
        typeof entry === "string" && allowedPlatforms.has(entry as Platform),
    );

  if (platforms.length === 0) {
    return ["PC"];
  }

  return platforms;
}

function normalizeCustomGame(input: unknown, fallbackId: string): Game | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const item = input as Record<string, unknown>;
  const image = typeof item.image === "string" ? item.image.trim() : "";
  if (!image) {
    return null;
  }

  const rawScreenshots = Array.isArray(item.screenshots)
    ? item.screenshots.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];

  const screenshots = rawScreenshots.length > 0 ? rawScreenshots : [image];

  return {
    id:
      typeof item.id === "string" && item.id.trim().length > 0 ? item.id.trim() : fallbackId,
    title:
      typeof item.title === "string" && item.title.trim().length > 0
        ? item.title.trim()
        : "New Game",
    image,
    screenshots,
    price:
      typeof item.price === "string" && item.price.trim().length > 0
        ? item.price.trim()
        : "FREE",
    originalPrice:
      typeof item.originalPrice === "string" && item.originalPrice.trim().length > 0
        ? item.originalPrice.trim()
        : undefined,
    rating:
      typeof item.rating === "number" ? clampRating(item.rating) : 4,
    genre:
      typeof item.genre === "string" && item.genre.trim().length > 0
        ? item.genre.trim()
        : "Action",
    platforms: normalizePlatforms(item.platforms),
    description:
      typeof item.description === "string" && item.description.trim().length > 0
        ? item.description.trim()
        : "No description provided.",
    releaseDate:
      typeof item.releaseDate === "string" && item.releaseDate.trim().length > 0
        ? item.releaseDate.trim()
        : "2026-01-01",
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
  };
}

function normalizeCustomGames(input: unknown): Game[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const usedIds = new Set(games.map((game) => game.id));

  return input
    .map((entry, index) => normalizeCustomGame(entry, `custom-game-${index + 1}`))
    .filter((entry): entry is Game => entry !== null)
    .map((entry) => {
      let uniqueId = entry.id;
      let suffix = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${entry.id}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(uniqueId);

      return { ...entry, id: uniqueId };
    });
}

function mergeGameOverrides(overrides: unknown): GameOverrideMap {
  const fallback = deepClone(defaultSiteSettings.gameOverrides);

  if (!overrides || typeof overrides !== "object") {
    return fallback;
  }

  for (const game of games) {
    const rawOverride = (overrides as Record<string, unknown>)[game.id];
    if (!rawOverride || typeof rawOverride !== "object") {
      continue;
    }

    const overrideRecord = rawOverride as Record<string, unknown>;
    fallback[game.id] = {
      price: typeof overrideRecord.price === "string" ? overrideRecord.price : fallback[game.id].price,
      originalPrice:
        typeof overrideRecord.originalPrice === "string"
          ? overrideRecord.originalPrice
          : fallback[game.id].originalPrice,
      rating:
        typeof overrideRecord.rating === "number"
          ? clampRating(overrideRecord.rating)
          : fallback[game.id].rating,
      genre: typeof overrideRecord.genre === "string" ? overrideRecord.genre : fallback[game.id].genre,
    };
  }

  return fallback;
}

function normalizeSettings(input: unknown): SiteSettings {
  const fallback = deepClone(defaultSiteSettings);

  if (!input || typeof input !== "object") {
    return fallback;
  }

  const record = input as Record<string, unknown>;
  const maybeHero = (record.hero ?? {}) as Record<string, unknown>;
  const maybeSeo = (record.seo ?? {}) as Record<string, unknown>;
  const maybeFooter = (record.footer ?? {}) as Record<string, unknown>;
  const maybeFeatures = (record.features ?? {}) as Record<string, unknown>;

  const navLinks = Array.isArray(record.navLinks) && record.navLinks.length > 0
    ? record.navLinks
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const nextItem = item as Record<string, unknown>;
          const label = typeof nextItem.label === "string" ? nextItem.label : "";
          const href = typeof nextItem.href === "string" ? nextItem.href : "";

          if (!label || !href) {
            return null;
          }

          return { label, href };
        })
        .filter((item): item is { label: string; href: string } => item !== null)
    : fallback.navLinks;

  const stats = Array.isArray(record.stats) && record.stats.length > 0
    ? record.stats
        .map((item, index) => {
          if (!item || typeof item !== "object") {
            return fallback.stats[index] ?? null;
          }

          const nextItem = item as Record<string, unknown>;
          const base = fallback.stats[index] ?? fallback.stats[0];

          return {
            icon:
              (typeof nextItem.icon === "string" ? nextItem.icon : base.icon) as SiteSettings["stats"][number]["icon"],
            value: typeof nextItem.value === "string" ? nextItem.value : base.value,
            label: typeof nextItem.label === "string" ? nextItem.label : base.label,
          };
        })
        .filter((item): item is SiteSettings["stats"][number] => item !== null)
    : fallback.stats;

  const perks = Array.isArray(record.perks) && record.perks.length > 0
    ? record.perks
        .map((item, index) => {
          if (!item || typeof item !== "object") {
            return fallback.perks[index] ?? null;
          }

          const nextItem = item as Record<string, unknown>;
          const base = fallback.perks[index] ?? fallback.perks[0];

          return {
            icon:
              (typeof nextItem.icon === "string" ? nextItem.icon : base.icon) as SiteSettings["perks"][number]["icon"],
            title: typeof nextItem.title === "string" ? nextItem.title : base.title,
            desc: typeof nextItem.desc === "string" ? nextItem.desc : base.desc,
          };
        })
        .filter((item): item is SiteSettings["perks"][number] => item !== null)
    : fallback.perks;

  const footerLinks = Array.isArray(maybeFooter.links) && maybeFooter.links.length > 0
    ? maybeFooter.links
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const nextItem = item as Record<string, unknown>;
          const label = typeof nextItem.label === "string" ? nextItem.label : "";
          const href = typeof nextItem.href === "string" ? nextItem.href : "";
          if (!label || !href) {
            return null;
          }

          return { label, href };
        })
        .filter((item): item is { label: string; href: string } => item !== null)
    : fallback.footer.links;

  return {
    brandName: typeof record.brandName === "string" ? record.brandName : fallback.brandName,
    supportEmail: typeof record.supportEmail === "string" ? record.supportEmail : fallback.supportEmail,
    supportPhone: typeof record.supportPhone === "string" ? record.supportPhone : fallback.supportPhone,
    navLinks,
    hero: {
      badgeText:
        typeof maybeHero.badgeText === "string" ? maybeHero.badgeText : fallback.hero.badgeText,
      headingLead:
        typeof maybeHero.headingLead === "string" ? maybeHero.headingLead : fallback.hero.headingLead,
      headingAccent:
        typeof maybeHero.headingAccent === "string"
          ? maybeHero.headingAccent
          : fallback.hero.headingAccent,
      headingTail:
        typeof maybeHero.headingTail === "string" ? maybeHero.headingTail : fallback.hero.headingTail,
      description:
        typeof maybeHero.description === "string" ? maybeHero.description : fallback.hero.description,
      primaryCtaLabel:
        typeof maybeHero.primaryCtaLabel === "string"
          ? maybeHero.primaryCtaLabel
          : fallback.hero.primaryCtaLabel,
      primaryCtaHref:
        typeof maybeHero.primaryCtaHref === "string"
          ? maybeHero.primaryCtaHref
          : fallback.hero.primaryCtaHref,
      secondaryCtaLabel:
        typeof maybeHero.secondaryCtaLabel === "string"
          ? maybeHero.secondaryCtaLabel
          : fallback.hero.secondaryCtaLabel,
      secondaryCtaHref:
        typeof maybeHero.secondaryCtaHref === "string"
          ? maybeHero.secondaryCtaHref
          : fallback.hero.secondaryCtaHref,
    },
    stats,
    perks,
    featuredGameId:
      typeof record.featuredGameId === "string" ? record.featuredGameId : fallback.featuredGameId,
    seo: {
      defaultTitle:
        typeof maybeSeo.defaultTitle === "string"
          ? maybeSeo.defaultTitle
          : fallback.seo.defaultTitle,
      defaultDescription:
        typeof maybeSeo.defaultDescription === "string"
          ? maybeSeo.defaultDescription
          : fallback.seo.defaultDescription,
      siteName: typeof maybeSeo.siteName === "string" ? maybeSeo.siteName : fallback.seo.siteName,
      ogImage: typeof maybeSeo.ogImage === "string" ? maybeSeo.ogImage : fallback.seo.ogImage,
      twitterHandle:
        typeof maybeSeo.twitterHandle === "string"
          ? maybeSeo.twitterHandle
          : fallback.seo.twitterHandle,
    },
    footer: {
      legalNote:
        typeof maybeFooter.legalNote === "string"
          ? maybeFooter.legalNote
          : fallback.footer.legalNote,
      links: footerLinks,
    },
    features: {
      assistantEnabled:
        typeof maybeFeatures.assistantEnabled === "boolean"
          ? maybeFeatures.assistantEnabled
          : fallback.features.assistantEnabled,
      communitySectionEnabled:
        typeof maybeFeatures.communitySectionEnabled === "boolean"
          ? maybeFeatures.communitySectionEnabled
          : fallback.features.communitySectionEnabled,
    },
    gameOverrides: mergeGameOverrides(record.gameOverrides),
    customGames: normalizeCustomGames(record.customGames),
  };
}

function getInitialSettings(): SiteSettings {
  if (typeof window === "undefined") {
    return deepClone(defaultSiteSettings);
  }

  const storedValue = window.localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
  if (!storedValue) {
    return deepClone(defaultSiteSettings);
  }

  try {
    return normalizeSettings(JSON.parse(storedValue));
  } catch {
    return deepClone(defaultSiteSettings);
  }
}

function withGameOverrides(baseGames: Game[], settings: SiteSettings): Game[] {
  return baseGames.map((game) => {
    const override = settings.gameOverrides[game.id];
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
}

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(getInitialSettings);

  useEffect(() => {
    window.localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const catalogGames = useMemo(() => {
    const mergedGames = [...games, ...settings.customGames];
    return withGameOverrides(mergedGames, settings);
  }, [settings]);

  const value = useMemo<SiteSettingsContextValue>(
    () => ({
      settings,
      setSettings,
      saveSettings: (nextSettings) => setSettings(normalizeSettings(nextSettings)),
      resetSettings: () => setSettings(deepClone(defaultSiteSettings)),
      catalogGames,
    }),
    [settings, catalogGames],
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
};

export function useSiteSettings(): SiteSettingsContextValue {
  const context = useContext(SiteSettingsContext);

  if (!context) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }

  return context;
}
