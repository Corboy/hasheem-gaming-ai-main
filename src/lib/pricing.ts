const USD_TO_TZS_RATE = 2600;

function toNumericValue(raw: string): number {
  const normalized = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(normalized) ? normalized : 0;
}

export function parsePriceToAmount(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
  }

  if (!value) {
    return 0;
  }

  const lowered = value.toLowerCase();
  if (lowered.includes("free")) {
    return 0;
  }

  const numericValue = toNumericValue(value);
  if (numericValue <= 0) {
    return 0;
  }

  if (value.includes("$") || lowered.includes("usd")) {
    return Math.round(numericValue * USD_TO_TZS_RATE);
  }

  return Math.round(numericValue);
}

export function formatTZS(amount: number): string {
  return `TZS ${new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 }).format(
    Math.max(0, Math.round(amount)),
  )}`;
}

export function toPriceString(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "FREE";
  }

  return formatTZS(amount);
}

export function formatPriceForDisplay(value: string | number): string {
  const amount = parsePriceToAmount(value);
  if (amount <= 0) {
    return "FREE";
  }

  return formatTZS(amount);
}

export function isFreePrice(value: string | number): boolean {
  return parsePriceToAmount(value) <= 0;
}

// Backwards-compatible exports used in older files.
export const parsePriceToTshAmount = parsePriceToAmount;
export const formatTshAmount = formatTZS;
export const toTshPriceString = toPriceString;
