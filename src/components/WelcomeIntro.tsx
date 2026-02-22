import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const WELCOME_INTRO_KEY = "hasheem_welcome_intro_v1";

const WelcomeIntro = () => {
  const shouldReduceMotion = useReducedMotion();
  const { settings } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const alreadyShown = window.sessionStorage.getItem(WELCOME_INTRO_KEY) === "1";
    if (alreadyShown) {
      return;
    }

    setIsVisible(true);
    window.sessionStorage.setItem(WELCOME_INTRO_KEY, "1");
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timeout = window.setTimeout(
      () => setIsVisible(false),
      shouldReduceMotion ? 500 : 2200,
    );

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible, shouldReduceMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/94 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
        >
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-primary/18 blur-3xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
            />
            <motion.div
              className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-primary/12 blur-3xl"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
            />
          </div>

          <motion.div
            className="relative mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-card/90 p-7 shadow-[var(--elevated-shadow)]"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: "easeOut" }}
          >
            <h2 className="text-center font-display text-2xl font-semibold text-foreground">
              {settings.brandName}
            </h2>
            <p className="mt-2 text-center font-body text-sm text-muted-foreground">
              Welcome back. Preparing your gaming storefront.
            </p>

            <div className="mt-6 flex items-center justify-center">
              <div className="loader" aria-hidden="true">
                <div className="loader-orbits">
                  <div className="loader-orbits__electron" />
                  <div className="loader-orbits__electron" />
                  <div className="loader-orbits__electron" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeIntro;
