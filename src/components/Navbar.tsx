import { useState } from "react";
import { Gamepad2, Menu, X, ShoppingCart, Search } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = ["Store", "Library", "Community", "Support"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2">
          <Gamepad2 className="h-7 w-7 text-primary neon-text" />
          <span className="font-display text-lg font-bold tracking-wider text-primary neon-text">
            HASHEEM GAMING
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-body text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-md p-2 text-muted-foreground transition-colors hover:text-primary">
            <Search className="h-5 w-5" />
          </button>
          <button className="rounded-md p-2 text-muted-foreground transition-colors hover:text-primary">
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-muted-foreground md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="rounded-md px-4 py-3 font-body text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
