import { useMemo, useState, type ComponentType } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CircleHelp,
  ExternalLink,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Search,
  Store,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useGameCatalog } from "@/contexts/GameCatalogContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

type AdminNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Games",
    href: "/admin/games",
    icon: Store,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ListOrdered,
  },
  {
    label: "Support",
    href: "/admin/support",
    icon: CircleHelp,
  },
];

const navItemClasses = ({ isActive }: { isActive: boolean }) =>
  `inline-flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 font-body text-sm transition-colors ${
    isActive
      ? "border-primary/30 bg-primary/10 text-foreground"
      : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground"
  }`;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const { user, logout } = useAuth();
  const { games } = useGameCatalog();
  const { orders } = useOrders();

  const currentSection = useMemo(() => {
    const found = navItems.find((item) =>
      item.href === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.href),
    );
    return found?.label ?? "Admin";
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (normalized.length < 2) {
      return [];
    }

    const gameMatches = games
      .filter((game) => game.title.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((game) => ({
        id: game.id,
        label: game.title,
        subtitle: "Game title match",
        type: "game" as const,
      }));

    const orderMatches = orders
      .filter((order) => order.id.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        label: order.id,
        subtitle: `Order for ${order.customerName}`,
        type: "order" as const,
      }));

    return [...gameMatches, ...orderMatches].slice(0, 8);
  }, [games, orders, searchQuery]);

  const openSearchResult = (result: (typeof searchResults)[number]) => {
    setSearchQuery("");
    if (result.type === "game") {
      navigate(`/admin/games/${result.id}/edit`);
      return;
    }

    navigate(`/admin/orders?order=${encodeURIComponent(result.id)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className={`grid min-h-screen ${sidebarCollapsed ? "md:grid-cols-[96px_1fr]" : "md:grid-cols-[290px_1fr]"}`}>
        <aside className="hidden border-r border-border bg-card p-3 md:block">
          <Link
            to="/"
            className={`mb-4 block rounded-xl border border-border bg-background p-4 transition-all ${
              sidebarCollapsed ? "text-center" : ""
            }`}
          >
            <p className="font-display text-sm font-semibold text-primary">
              {settings.brandName}
            </p>
            {!sidebarCollapsed && (
              <p className="mt-1 font-body text-xs text-muted-foreground">Admin workspace</p>
            )}
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={(state) =>
                    `${navItemClasses(state)} ${sidebarCollapsed ? "justify-center px-2" : ""}`
                  }
                  end={item.href === "/admin"}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                  {!sidebarCollapsed && <p className="truncate font-medium">{item.label}</p>}
                </NavLink>
              );
            })}
          </nav>

          <div className={`mt-6 rounded-lg border border-border bg-background p-3 ${sidebarCollapsed ? "text-center" : ""}`}>
            {!sidebarCollapsed && (
              <>
                <p className="font-body text-xs text-muted-foreground">Signed in as</p>
                <p className="font-body text-sm font-semibold text-foreground">{user?.name ?? "Admin"}</p>
                <p className="font-body text-xs text-muted-foreground">{user?.email ?? "-"}</p>
              </>
            )}
            <button
              type="button"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 font-body text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground ${sidebarCollapsed ? "" : "mt-3"}`}
              onClick={() => {
                logout();
                toast.success("Logged out.");
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
                  onClick={() => setMobileOpen((previous) => !previous)}
                  aria-label="Toggle admin navigation"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                <button
                  type="button"
                  className="hidden rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
                  onClick={() => setSidebarCollapsed((previous) => !previous)}
                  aria-label="Toggle sidebar"
                >
                  {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>

                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    {currentSection}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Calm, guided tools for your store
                  </p>
                </div>
              </div>

              <div className="relative w-full max-w-xl flex-1 md:flex-none">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => window.setTimeout(() => setSearchFocused(false), 160)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        if (searchResults.length > 0) {
                          openSearchResult(searchResults[0]);
                          return;
                        }
                        toast.message("No results yet. TODO: expand global search index.");
                      }
                    }}
                    placeholder="Search game title or Order ID..."
                    className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {searchFocused && searchQuery.trim().length >= 2 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-lg border border-border bg-card p-2 shadow-2xl">
                    {searchResults.length === 0 ? (
                      <p className="px-2 py-2 font-body text-xs text-muted-foreground">
                        No direct match. TODO: expand search to customers and payments.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            type="button"
                            onClick={() => openSearchResult(result)}
                            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-secondary"
                          >
                            <div>
                              <p className="font-body text-sm font-semibold text-foreground">{result.label}</p>
                              <p className="font-body text-xs text-muted-foreground">{result.subtitle}</p>
                            </div>
                            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                              {result.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Store
                </Link>
              </div>
            </div>

            {mobileOpen && (
              <div className="border-t border-border bg-card p-3 md:hidden">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={`${item.href}-mobile`}
                        to={item.href}
                        className={navItemClasses}
                        end={item.href === "/admin"}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <p className="font-medium">{item.label}</p>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            )}
          </header>

          <main className="flex-1 p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
