import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HasheemAI from "@/components/HasheemAI";
import { useSeo } from "@/hooks/use-seo";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface ContentSection {
  heading: string;
  body: string[];
}

interface ContentPageProps {
  title: string;
  description: string;
  sections: ContentSection[];
}

const ContentPage = ({ title, description, sections }: ContentPageProps) => {
  const { settings } = useSiteSettings();

  useSeo({
    title: `${title} | ${settings.seo.siteName}`,
    description,
    image: settings.seo.ogImage,
    siteName: settings.seo.siteName,
    twitterHandle: settings.seo.twitterHandle,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pb-16 pt-28">
        <header className="max-w-3xl">
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 font-body text-base text-muted-foreground md:text-lg">{description}</p>
        </header>

        <div className="mt-10 space-y-7">
          {sections.map((section) => (
            <section key={section.heading} className="rounded-xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
      <HasheemAI />
    </div>
  );
};

export default ContentPage;
