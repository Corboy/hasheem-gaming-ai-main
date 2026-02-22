import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { formatPriceForDisplay, parsePriceToTshAmount } from "@/lib/pricing";

type Message = { role: "user" | "assistant"; content: string };

function buildAssistantReply(input: string, games: { title: string; price: string; originalPrice?: string }[]): string {
  const normalized = input.toLowerCase();

  const deals = games
    .filter((game) => game.originalPrice)
    .slice(0, 3)
    .map((game) => {
      const originalPriceLabel = game.originalPrice
        ? ` (was ${formatPriceForDisplay(game.originalPrice)})`
        : "";
      return `${game.title} - ${formatPriceForDisplay(game.price)}${originalPriceLabel}`;
    })
    .join("\n");

  const featured = games
    .slice(0, 5)
    .map((game) => `${game.title} - ${formatPriceForDisplay(game.price)}`)
    .join("\n");

  if (normalized.includes("deal") || normalized.includes("sale") || normalized.includes("discount")) {
    return deals || "No active discount is listed right now. Check the deals section for updates.";
  }

  if (normalized.includes("recommend") || normalized.includes("best") || normalized.includes("suggest")) {
    return `Top picks right now:\n${featured}`;
  }

  if (normalized.includes("price") || normalized.includes("cost") || normalized.includes("how much")) {
    const numericPrices = games
      .map((game) => parsePriceToTshAmount(game.price))
      .filter((value) => Number.isFinite(value) && value > 0);

    const minPrice = numericPrices.length > 0 ? formatPriceForDisplay(String(Math.min(...numericPrices))) : "FREE";
    const maxPrice = numericPrices.length > 0 ? formatPriceForDisplay(String(Math.max(...numericPrices))) : "FREE";

    return `Current catalog prices range from ${minPrice} to ${maxPrice}.`;
  }

  if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("hey")) {
    return "Welcome. I can help you find titles, compare prices, or jump to current deals.";
  }

  return "Ask about deals, recommendations, pricing, or specific game genres and I will guide you.";
}

const HasheemAI = () => {
  const { settings, catalogGames } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to quick support. Ask about deals, recommendations, game prices, or store navigation.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const assistantGames = useMemo(
    () => catalogGames.map((game) => ({ title: game.title, price: game.price, originalPrice: game.originalPrice })),
    [catalogGames],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!settings.features.assistantEnabled) {
    return null;
  }

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setMessages((previous) => [...previous, { role: "user", content: trimmed }]);
    setInput("");

    window.setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: buildAssistantReply(trimmed, assistantGames) },
      ]);
    }, 350);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:shadow-[var(--neon-glow-strong)] active:scale-95 md:right-6"
        aria-label="Open support assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-3 z-50 flex h-[500px] w-[min(360px,calc(100vw-1.5rem))] animate-slide-up flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:right-6">
          <div className="flex items-center gap-3 border-b border-border bg-secondary px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {settings.brandName} Support
              </h4>
              <span className="font-body text-xs text-primary">Online</span>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] whitespace-pre-line rounded-lg px-3 py-2 font-body text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    send();
                  }
                }}
                placeholder="Ask about prices, deals, or genres"
                className="flex-1 rounded-md border border-border bg-muted px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={send}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HasheemAI;
