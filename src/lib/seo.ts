export interface SeoPayload {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
  twitterHandle?: string;
  siteName?: string;
}

function upsertMetaByName(name: string, content: string): void {
  let element = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string): void {
  let element = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(url: string): void {
  let linkElement = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!linkElement) {
    linkElement = document.createElement("link");
    linkElement.setAttribute("rel", "canonical");
    document.head.appendChild(linkElement);
  }

  linkElement.setAttribute("href", url);
}

function toAbsoluteUrl(value: string): string {
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return window.location.origin;
  }
}

export function applySeo(payload: SeoPayload): void {
  const nextUrl = payload.url ? toAbsoluteUrl(payload.url) : window.location.href;
  const nextImage = payload.image ? toAbsoluteUrl(payload.image) : undefined;

  document.title = payload.title;

  upsertMetaByName("description", payload.description);
  upsertMetaByName("robots", payload.noindex ? "noindex, nofollow" : "index, follow");

  if (payload.twitterHandle) {
    upsertMetaByName("twitter:site", payload.twitterHandle);
  }

  upsertMetaByName("twitter:card", "summary_large_image");

  upsertMetaByProperty("og:title", payload.title);
  upsertMetaByProperty("og:description", payload.description);
  upsertMetaByProperty("og:type", payload.type ?? "website");
  upsertMetaByProperty("og:url", nextUrl);

  if (payload.siteName) {
    upsertMetaByProperty("og:site_name", payload.siteName);
  }

  if (nextImage) {
    upsertMetaByProperty("og:image", nextImage);
    upsertMetaByName("twitter:image", nextImage);
  }

  upsertCanonical(nextUrl);
}
