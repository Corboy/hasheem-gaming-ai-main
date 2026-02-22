import { games } from "@/data/games";
import type { GameOverrideMap, PerkIconKey, SiteSettings, StatIconKey } from "@/types/site-settings";

export const SITE_SETTINGS_STORAGE_KEY = "hasheem_site_settings_v1";

export const statIconOptions: StatIconKey[] = ["games", "users", "downloads", "uptime"];
export const perkIconOptions: PerkIconKey[] = ["shield", "zap", "credit-card", "headphones"];

function createDefaultGameOverrides(): GameOverrideMap {
  return games.reduce<GameOverrideMap>((accumulator, game) => {
    accumulator[game.id] = {
      price: game.price,
      originalPrice: game.originalPrice ?? "",
      rating: game.rating,
      genre: game.genre,
    };
    return accumulator;
  }, {});
}

export const defaultSiteSettings: SiteSettings = {
  brandName: "HASHEEM GAMING",
  supportEmail: "support@hasheemgaming.com",
  supportPhone: "+1 (202) 555-0118",
  navLinks: [
    { label: "Store", href: "#store" },
    { label: "Deals", href: "#deals" },
    { label: "Community", href: "#community" },
    { label: "Support", href: "#support" },
  ],
  hero: {
    badgeText: "New Releases Available",
    headingLead: "Level Up Your",
    headingAccent: "Gaming",
    headingTail: "Experience",
    description:
      "Discover the latest titles, exclusive deals, and unbeatable prices. Your next adventure starts at HASHEEM GAMING.",
    primaryCtaLabel: "Browse Store",
    primaryCtaHref: "#store",
    secondaryCtaLabel: "Weekly Deals",
    secondaryCtaHref: "#deals",
  },
  stats: [
    { icon: "games", value: "500+", label: "Games Available" },
    { icon: "users", value: "2M+", label: "Active Gamers" },
    { icon: "downloads", value: "10M+", label: "Downloads" },
    { icon: "uptime", value: "99.9%", label: "Platform Uptime" },
  ],
  perks: [
    { icon: "shield", title: "Secure Payments", desc: "Encrypted checkout with trusted payment providers." },
    { icon: "zap", title: "Instant Delivery", desc: "Receive your game key immediately after purchase." },
    { icon: "credit-card", title: "Transparent Pricing", desc: "Clear pricing with highlighted savings on every deal." },
    { icon: "headphones", title: "24/7 Support", desc: "Get help anytime through chat or email support." },
  ],
  featuredGameId: "black-myth-wukong",
  seo: {
    defaultTitle: "HASHEEM GAMING | Digital Game Store",
    defaultDescription:
      "Buy premium and indie titles for PC, Mobile, and PlayStation with secure checkout, instant delivery, and weekly deals.",
    siteName: "HASHEEM GAMING",
    ogImage: "/og-image.jpg",
    twitterHandle: "@hasheemgaming",
  },
  footer: {
    legalNote: "Trusted digital marketplace for gamers worldwide.",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Admin", href: "/admin" },
    ],
  },
  features: {
    communitySectionEnabled: true,
  },
  gameOverrides: createDefaultGameOverrides(),
  customGames: [],
};
