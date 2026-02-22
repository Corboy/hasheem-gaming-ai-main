import { useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const Footer = () => {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold tracking-wider text-primary">
                {settings.brandName}
              </span>
            </button>
            <p className="mt-3 max-w-sm font-body text-sm text-muted-foreground">
              {settings.footer.legalNote}
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-foreground">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {settings.footer.links.map((link) => (
                <button
                  key={`${link.label}-${link.href}`}
                  type="button"
                  className="text-left font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => {
                    if (link.href.startsWith("http")) {
                      window.open(link.href, "_blank", "noopener,noreferrer");
                      return;
                    }

                    if (link.href.startsWith("#")) {
                      navigate(`/${link.href}`);
                      return;
                    }

                    navigate(link.href);
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-foreground">
              Support
            </h4>
            <p className="font-body text-sm text-muted-foreground">{settings.supportEmail}</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">{settings.supportPhone}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-4">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 {settings.brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
