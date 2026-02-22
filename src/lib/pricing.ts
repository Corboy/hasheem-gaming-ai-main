const USD_TO_TSH_RATE = 2600;

function toNumericValue(raw: string): number {
  const normalized = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(normalized) ? normalized : 0;
}

export function parsePriceToTshAmount(value: string): number {
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

  if (value.includes("$")) {
    return Math.round(numericValue * USD_TO_TSH_RATE);
  }

  return Math.round(numericValue);
}

export function formatTshAmount(amount: number): string {
  return `TSh ${new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 }).format(
    Math.max(0, Math.round(amount)),
  )}`;
}

export function toTshPriceString(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "FREE";
  }

  return formatTshAmount(amount);
}

export function formatPriceForDisplay(value: string): string {
  const amount = parsePriceToTshAmount(value);
  if (amount <= 0) {
    return "FREE";
  }

  return formatTshAmount(amount);
}

export function isFreePrice(value: string): boolean {
  return parsePriceToTshAmount(value) <= 0;
}
