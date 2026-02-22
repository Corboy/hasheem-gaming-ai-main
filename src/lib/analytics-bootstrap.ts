interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

export function bootstrapAnalytics(measurementId?: string): void {
  if (!measurementId || typeof window === "undefined") {
    return;
  }

  const windowWithAnalytics = window as AnalyticsWindow;

  if (windowWithAnalytics.gtag) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  windowWithAnalytics.dataLayer = windowWithAnalytics.dataLayer ?? [];

  windowWithAnalytics.gtag = (...args: unknown[]) => {
    windowWithAnalytics.dataLayer?.push(args);
  };

  windowWithAnalytics.gtag("js", new Date());
  windowWithAnalytics.gtag("config", measurementId);
}
