import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const SupportSection = () => {
  const { settings } = useSiteSettings();

  return (
    <section id="support" className="py-20">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground md:text-4xl">
                Support <span className="text-primary">Center</span>
              </h2>
              <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-muted-foreground">
                Need help with orders, key activation, or account access? Our support team responds
                quickly and can guide you through every step.
              </p>

              <div className="mt-5 space-y-3">
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 font-body text-sm text-foreground transition-colors hover:border-primary/50"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  {settings.supportEmail}
                </a>
                <a
                  href={`tel:${settings.supportPhone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-background px-4 py-2 font-body text-sm text-foreground transition-colors hover:border-primary/50"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {settings.supportPhone}
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/70 p-6">
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-foreground">
                What we can help with
              </h3>
              <ul className="mt-4 space-y-2 font-body text-sm text-muted-foreground">
                <li>Order confirmation and delivery checks</li>
                <li>Refund and billing questions</li>
                <li>Activation or platform troubleshooting</li>
                <li>Account and security guidance</li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="rounded-md bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-primary-foreground transition-all hover:shadow-[var(--neon-glow)]"
                >
                  Contact Support
                </Link>
                <Link
                  to="/refund-policy"
                  className="rounded-md border border-border px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-foreground transition-colors hover:border-primary/50"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
