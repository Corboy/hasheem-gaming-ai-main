interface AnalyticsWindow extends Window {
  gtag?: (...args: unknown[]) => void;
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export function trackEvent(event: AnalyticsEvent): void {
  const windowWithAnalytics = window as AnalyticsWindow;

  if (typeof windowWithAnalytics.gtag === "function") {
    windowWithAnalytics.gtag("event", event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
}
