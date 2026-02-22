import { Link } from "react-router-dom";
import { CircleHelp, Gamepad2, ListOrdered, UploadCloud } from "lucide-react";

const guides = [
  {
    title: "How to add a new game",
    icon: <UploadCloud className="h-4 w-4" />,
    steps: [
      "Open Add New Game from the dashboard button.",
      "Fill basic info first, then add media and details.",
      "Use Review step, then click Publish when ready.",
    ],
  },
  {
    title: "How to publish safely",
    icon: <Gamepad2 className="h-4 w-4" />,
    steps: [
      "Check title, category and price before publishing.",
      "Confirm cover image is clear and visible.",
      "If not ready, save as Draft and continue later.",
    ],
  },
  {
    title: "How to check customer orders",
    icon: <ListOrdered className="h-4 w-4" />,
    steps: [
      "Open Orders from the sidebar.",
      "Review payment and delivery status on each order.",
      "Use View Details for full order information.",
    ],
  },
];

const cardBase =
  "rounded-2xl border border-border bg-card p-6 md:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.24)]";

const AdminSupportPage = () => {
  return (
    <div className="space-y-8">
      <section className={cardBase}>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <CircleHelp className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground md:text-3xl">
          Support guide
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
          This page is made for first-time admins. Follow the short guides below whenever you feel
          unsure.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {guides.map((guide) => (
          <article key={guide.title} className={cardBase}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              <span className="text-primary">{guide.icon}</span>
              Guide
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{guide.title}</h2>
            <ol className="mt-3 space-y-2 font-body text-sm text-muted-foreground">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </section>

      <section className={cardBase}>
        <h2 className="font-display text-lg font-semibold text-foreground">Need direct help?</h2>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          If you have a payment or delivery issue, contact support and include the order ID.
        </p>
        <Link
          to="/contact"
          className="mt-4 inline-flex rounded-md border border-border px-4 py-2.5 font-body text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
        >
          Contact support
        </Link>
      </section>
    </div>
  );
};

export default AdminSupportPage;
