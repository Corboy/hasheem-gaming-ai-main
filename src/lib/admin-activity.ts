export type ActivityLevel = "info" | "success" | "warning";

export interface AdminActivity {
  id: string;
  message: string;
  href: string;
  level: ActivityLevel;
  createdAt: string;
}

const ADMIN_ACTIVITY_STORAGE_KEY = "hasheem_admin_activity_v1";
export const ADMIN_ACTIVITY_EVENT = "hasheem:admin-activity-updated";

function createId(): string {
  return `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedActivities(): AdminActivity[] {
  const now = Date.now();
  return [
    {
      id: createId(),
      message: "Order #123 marked as Paid",
      href: "/admin/orders",
      level: "success",
      createdAt: new Date(now - 1000 * 60 * 20).toISOString(),
    },
    {
      id: createId(),
      message: "Price updated for Cyber Warfare 2087",
      href: "/admin/games",
      level: "info",
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
    },
    {
      id: createId(),
      message: "Game Shadow Blade: Reckoning published",
      href: "/admin/games",
      level: "success",
      createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
    },
  ];
}

function canUseWindow(): boolean {
  return typeof window !== "undefined";
}

function writeActivities(activities: AdminActivity[]): void {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(ADMIN_ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
}

export function getAdminActivities(): AdminActivity[] {
  if (!canUseWindow()) {
    return seedActivities();
  }

  const raw = window.localStorage.getItem(ADMIN_ACTIVITY_STORAGE_KEY);
  if (!raw) {
    const seed = seedActivities();
    writeActivities(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seed = seedActivities();
      writeActivities(seed);
      return seed;
    }

    const normalized = parsed
      .map((entry): AdminActivity | null => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const value = entry as Record<string, unknown>;
        const message = typeof value.message === "string" ? value.message.trim() : "";
        const href = typeof value.href === "string" ? value.href.trim() : "/admin";
        if (!message || !href) {
          return null;
        }

        return {
          id: typeof value.id === "string" ? value.id : createId(),
          message,
          href,
          level:
            value.level === "success" || value.level === "warning" || value.level === "info"
              ? value.level
              : "info",
          createdAt:
            typeof value.createdAt === "string" && value.createdAt.trim().length > 0
              ? value.createdAt
              : new Date().toISOString(),
        };
      })
      .filter((entry): entry is AdminActivity => entry !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (normalized.length > 0) {
      return normalized.slice(0, 30);
    }

    const seed = seedActivities();
    writeActivities(seed);
    return seed;
  } catch {
    const seed = seedActivities();
    writeActivities(seed);
    return seed;
  }
}

export function logAdminActivity(input: {
  message: string;
  href?: string;
  level?: ActivityLevel;
}): void {
  if (!canUseWindow()) {
    return;
  }

  const message = input.message.trim();
  if (!message) {
    return;
  }

  const existing = getAdminActivities();
  const next: AdminActivity = {
    id: createId(),
    message,
    href: input.href?.trim() || "/admin",
    level: input.level ?? "info",
    createdAt: new Date().toISOString(),
  };

  const updated = [next, ...existing].slice(0, 40);
  writeActivities(updated);
  window.dispatchEvent(new CustomEvent(ADMIN_ACTIVITY_EVENT));
}
