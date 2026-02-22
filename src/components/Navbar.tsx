import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Gamepad2, Menu, Search, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { useCommerce } from "@/contexts/CommerceContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { trackEvent } from "@/lib/analytics";
import {
  dispatchStoreSearchFocus,
  requestStoreSearchFocus,
  smoothScrollTo,
} from "@/lib/store-search-intent";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useSiteSettings();
  const { openCart, cartCount } = useCommerce();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAnchorNavigation = (href: string) => {
    const sectionId = href.replace("#", "");

    if (location.pathname !== "/") {
      navigate(`/${href}`);
      return;
    }

    smoothScrollTo(sectionId);
    window.history.replaceState({}, "", href);
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith("#")) {
      handleAnchorNavigation(href);
      return;
    }

    if (href.startsWith("/")) {
      navigate(href);
      return;
    }

    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  const runSearchAction = () => {
    requestStoreSearchFocus();
    trackEvent({ action: "open_search", category: "Engagement", label: "Navbar Search" });

    if (location.pathname !== "/") {
      navigate("/#store");
      return;
    }

    smoothScrollTo("store");
    dispatchStoreSearchFocus();
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
          aria-label="Go to homepage"
        >
          <Gamepad2 className="h-7 w-7 text-primary neon-text" />
          <span className="font-display text-lg font-bold tracking-wider text-primary neon-text">
            {settings.brandName}
          </span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {settings.navLinks.map((link) => (
            <button
              key={`${link.label}-${link.href}`}
              type="button"
              onClick={() => handleLinkClick(link.href)}
              className="font-body text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:text-primary"
            onClick={runSearchAction}
            aria-label="Search store"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:text-primary"
            onClick={() => {
              openCart();
              trackEvent({ action: "open_cart", category: "Commerce", label: "Navbar Cart" });
            }}
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-body text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((previous) => !previous)}
            className="rounded-md p-2 text-muted-foreground md:hidden"
            aria-label="Toggle mobile navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {settings.navLinks.map((link) => (
              <button
                key={`${link.label}-${link.href}-mobile`}
                type="button"
                className="rounded-md px-4 py-3 text-left font-body text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                onClick={() => {
                  handleLinkClick(link.href);
                  setMobileOpen(false);
                }}
              >
                {link.label}
              </button>
            ))}

            <button
              type="button"
              className="rounded-md px-4 py-3 text-left font-body text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              onClick={() => {
                runSearchAction();
                setMobileOpen(false);
              }}
            >
              Search Store
            </button>

            <button
              type="button"
              className="rounded-md px-4 py-3 text-left font-body text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              onClick={() => {
                openCart();
                toast.success("Cart opened.");
                setMobileOpen(false);
              }}
            >
              Open Cart ({cartCount})
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
