import type { Game } from "@/data/games";

export type StatIconKey = "games" | "users" | "downloads" | "uptime";

export type PerkIconKey = "shield" | "zap" | "credit-card" | "headphones";

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface HeroSettings {
  badgeText: string;
  headingLead: string;
  headingAccent: string;
  headingTail: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface StatSetting {
  icon: StatIconKey;
  value: string;
  label: string;
}

export interface PerkSetting {
  icon: PerkIconKey;
  title: string;
  desc: string;
}

export interface SeoSettings {
  defaultTitle: string;
  defaultDescription: string;
  siteName: string;
  ogImage: string;
  twitterHandle: string;
}

export interface FooterLinkSetting {
  label: string;
  href: string;
}

export interface FooterSettings {
  legalNote: string;
  links: FooterLinkSetting[];
}

export interface FeatureToggles {
  communitySectionEnabled: boolean;
}

export interface GameOverride {
  price: string;
  originalPrice: string;
  rating: number;
  genre: string;
}

export type GameOverrideMap = Record<string, GameOverride>;

export interface SiteSettings {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  navLinks: NavLinkItem[];
  hero: HeroSettings;
  stats: StatSetting[];
  perks: PerkSetting[];
  featuredGameId: string;
  seo: SeoSettings;
  footer: FooterSettings;
  features: FeatureToggles;
  gameOverrides: GameOverrideMap;
  customGames: Game[];
}
