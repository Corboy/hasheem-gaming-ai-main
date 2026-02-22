import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/use-seo";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const NotFound = () => {
  const { settings } = useSiteSettings();

  useSeo({
    title: `Page Not Found | ${settings.seo.siteName}`,
    description: "The requested page does not exist.",
    image: settings.seo.ogImage,
    siteName: settings.seo.siteName,
    twitterHandle: settings.seo.twitterHandle,
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex min-h-[70vh] items-center justify-center px-4 pt-24">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="mb-3 font-display text-4xl font-black text-foreground">404</h1>
          <p className="mb-5 font-body text-base text-muted-foreground">
            The page you requested could not be found.
          </p>
          <Link
            to="/"
            className="inline-flex rounded-md bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-primary-foreground"
          >
            Return to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
