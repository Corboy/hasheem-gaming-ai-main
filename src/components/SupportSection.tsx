import { Link } from "react-router-dom";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const SupportSection = () => {
  const { settings } = useSiteSettings();

  return (
    <section id="support" className="section-shell">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-white/10 bg-card p-8 md:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              Need Help With an Order?
            </h2>
            <p className="mt-3 font-body text-base text-muted-foreground">
              Fast support for payments, activation and refund questions.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="button-lift rounded-md bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-[var(--primary-shadow)]"
              >
                Contact Support
              </Link>
              <Link
                to="/refund-policy"
                className="button-lift rounded-md border border-white/15 px-6 py-3 font-body text-sm font-semibold text-foreground hover:border-white/30"
              >
                View Refund Policy
              </Link>
            </div>

            <p className="mt-5 font-body text-sm text-muted-foreground">
              {settings.supportEmail} • {settings.supportPhone}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
