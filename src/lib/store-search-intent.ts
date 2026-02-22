const STORE_SEARCH_REQUEST_KEY = "hasheem_open_store_search_v1";
export const STORE_SEARCH_EVENT = "hasheem:open-store-search";

export function requestStoreSearchFocus(): void {
  try {
    window.sessionStorage.setItem(STORE_SEARCH_REQUEST_KEY, "1");
  } catch {
    // Ignore browser storage failures.
  }
}

export function consumeStoreSearchFocus(): boolean {
  try {
    const hasRequest = window.sessionStorage.getItem(STORE_SEARCH_REQUEST_KEY) === "1";
    if (hasRequest) {
      window.sessionStorage.removeItem(STORE_SEARCH_REQUEST_KEY);
    }
    return hasRequest;
  } catch {
    return false;
  }
}

export function smoothScrollTo(sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function dispatchStoreSearchFocus(): void {
  window.dispatchEvent(new Event(STORE_SEARCH_EVENT));
}
