import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useSeo } from "@/hooks/use-seo";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const inputClasses =
  "w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();
  const { loginAdmin } = useAuth();
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@hasheemgaming.com");
  const [passcode, setPasscode] = useState("");

  useSeo({
    title: `Admin Login | ${settings.seo.siteName}`,
    description: "Secure login for HASHEEM admin dashboard.",
    image: settings.seo.ogImage,
    siteName: settings.seo.siteName,
    twitterHandle: settings.seo.twitterHandle,
    noindex: true,
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Jina linahitajika / Name is required.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email inahitajika / Email is required.");
      return;
    }

    if (!passcode.trim()) {
      toast.error("Weka passcode ya admin.");
      return;
    }

    const ok = loginAdmin({ name, email, passcode });
    if (!ok) {
      toast.error("Passcode sio sahihi. Jaribu tena.");
      return;
    }

    toast.success("Karibu Admin Dashboard.");
    const redirectTo =
      typeof location.state === "object" &&
      location.state !== null &&
      "from" in location.state &&
      typeof location.state.from === "string"
        ? location.state.from
        : "/admin";
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto flex min-h-[75vh] items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
              Admin Login
            </h1>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Beginner mode: enter admin passcode then open dashboard.
            </p>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Full Name
              </label>
              <input
                className={inputClasses}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Hasheem Admin"
              />
              <p className="mt-1 font-body text-xs text-muted-foreground">
                Hii inaonyesha juu ya dashboard.
              </p>
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                className={inputClasses}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@hasheemgaming.com"
              />
              <p className="mt-1 font-body text-xs text-muted-foreground">
                Tumia email yoyote ya admin.
              </p>
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Admin Passcode
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  className={`${inputClasses} pl-9`}
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  placeholder="Enter admin passcode"
                />
              </div>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                Default: <code className="rounded bg-muted px-1">hasheem2026</code> (can change via
                <code className="ml-1 rounded bg-muted px-1">VITE_ADMIN_PASSCODE</code>).
              </p>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-md bg-primary px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:shadow-[var(--primary-shadow)]"
            >
              Open Admin
            </button>
          </form>

          <div className="mt-5 border-t border-border pt-4 text-center">
            <Link to="/" className="font-body text-sm text-muted-foreground underline hover:text-primary">
              Back to Store
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
