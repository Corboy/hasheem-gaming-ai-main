import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { Bot, Loader2, Send, Sparkles, Trash2, X } from "lucide-react";
import { useGameCatalog } from "@/contexts/GameCatalogContext";
import { formatPriceForDisplay, parsePriceToAmount } from "@/lib/pricing";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "hasheem_ai_chat_v1";
const MAX_STORED_MESSAGES = 20;
const LAUNCHER_LABEL = "Chat with Hasheem AI";

const QUICK_PROMPTS = [
  "Show top deals",
  "Best PlayStation games",
  "Games under 50,000",
  "Need refund support",
];

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hello, I'm Hasheem AI. Ask for deals, platform picks, or budget-based recommendations.",
};

function pickTopDeals(games: { title: string; price: string; originalPrice?: string }[]): string {
  const deals = games
    .filter((game) => game.originalPrice)
    .slice(0, 4)
    .map((game, index) => {
      const current = formatPriceForDisplay(game.price);
      const previous = game.originalPrice ? formatPriceForDisplay(game.originalPrice) : "";
      return `${index + 1}. ${game.title} - ${current} (was ${previous})`;
    });

  if (deals.length === 0) {
    return "No active discounted titles at the moment. Please check again shortly.";
  }

  return `Top live deals:\n${deals.join("\n")}`;
}

function pickByPlatform(
  games: { title: string; price: string; platforms: string[] }[],
  platform: "PC" | "Mobile" | "PlayStation",
): string {
  const matches = games
    .filter((game) => game.platforms.includes(platform))
    .slice(0, 5)
    .map((game, index) => `${index + 1}. ${game.title} - ${formatPriceForDisplay(game.price)}`);

  if (matches.length === 0) {
    return `No ${platform} titles are currently available.`;
  }

  return `Top ${platform} picks:\n${matches.join("\n")}`;
}

function pickBudgetGames(games: { title: string; price: string }[], budget: number): string {
  const matches = games
    .filter((game) => {
      const amount = parsePriceToAmount(game.price);
      return amount > 0 && amount <= budget;
    })
    .slice(0, 6)
    .map((game, index) => `${index + 1}. ${game.title} - ${formatPriceForDisplay(game.price)}`);

  if (matches.length === 0) {
    return `I couldn't find titles under ${formatPriceForDisplay(budget)} right now.`;
  }

  return `Games under ${formatPriceForDisplay(budget)}:\n${matches.join("\n")}`;
}

function createAssistantReply(
  userInput: string,
  games: { title: string; price: string; originalPrice?: string; platforms: string[] }[],
): string {
  const input = userInput.toLowerCase();

  if (input.includes("deal") || input.includes("discount") || input.includes("sale")) {
    return pickTopDeals(games);
  }

  if (input.includes("pc")) {
    return pickByPlatform(games, "PC");
  }

  if (input.includes("mobile")) {
    return pickByPlatform(games, "Mobile");
  }

  if (input.includes("playstation") || input.includes("ps")) {
    return pickByPlatform(games, "PlayStation");
  }

  if (input.includes("cheap") || input.includes("budget") || input.includes("under")) {
    const numericBudget = Number(input.replace(/[^0-9]/g, ""));
    if (Number.isFinite(numericBudget) && numericBudget > 0) {
      return pickBudgetGames(games, numericBudget);
    }
    return pickBudgetGames(games, 50000);
  }

  if (input.includes("support") || input.includes("refund") || input.includes("payment")) {
    return "For payment or refund help, open the Contact page and include your order reference.";
  }

  if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    return "Hello. I can help with deals, platform recommendations, and budget options.";
  }

  const quickTop = games
    .slice(0, 4)
    .map((game, index) => `${index + 1}. ${game.title} - ${formatPriceForDisplay(game.price)}`)
    .join("\n");

  return `Popular picks right now:\n${quickTop}\n\nAsk for deals, platform picks, or budget games.`;
}

const HasheemAI = () => {
  const shouldReduceMotion = useReducedMotion();
  const launcherControls = useAnimationControls();
  const { publishedGames } = useGameCatalog();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [showLauncherHint, setShowLauncherHint] = useState(false);
  const [showLauncherPing, setShowLauncherPing] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastNudgeAtRef = useRef(0);
  const hintTimeoutRef = useRef<number | null>(null);
  const pingTimeoutRef = useRef<number | null>(null);

  const assistantGames = useMemo(
    () =>
      publishedGames.map((game) => ({
        title: game.title,
        price: game.price,
        originalPrice: game.originalPrice,
        platforms: game.platforms,
      })),
    [publishedGames],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedRaw = window.localStorage.getItem(STORAGE_KEY);
    if (!storedRaw) {
      setMessages([INITIAL_MESSAGE]);
      return;
    }

    try {
      const stored = JSON.parse(storedRaw) as { messages?: ChatMessage[] };
      if (Array.isArray(stored.messages) && stored.messages.length > 0) {
        setMessages(stored.messages);
        return;
      }
    } catch {
      // ignore storage parse errors
    }

    setMessages([INITIAL_MESSAGE]);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const trimmed = messages.slice(-MAX_STORED_MESSAGES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: trimmed }));
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [messages, isLoading, isOpen, shouldReduceMotion]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShowLauncherHint(false);
      setShowLauncherPing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isOpen || shouldReduceMotion) return;

    const cooldownMs = 12000;
    const minScrollY = 60;

    const nudge = () => {
      launcherControls.start({
        x: [0, -8, 6, 0],
        scale: [1, 1.05, 1],
        transition: { duration: 0.6, ease: "easeOut" },
      });

      setShowLauncherPing(true);
      if (pingTimeoutRef.current) {
        window.clearTimeout(pingTimeoutRef.current);
      }
      pingTimeoutRef.current = window.setTimeout(() => {
        setShowLauncherPing(false);
      }, 700);

      setShowLauncherHint(true);
      if (hintTimeoutRef.current) {
        window.clearTimeout(hintTimeoutRef.current);
      }
      hintTimeoutRef.current = window.setTimeout(() => {
        setShowLauncherHint(false);
      }, 2200);
    };

    const handleScroll = () => {
      if (window.scrollY < minScrollY) return;
      const now = Date.now();
      if (now - lastNudgeAtRef.current < cooldownMs) return;
      lastNudgeAtRef.current = now;
      nudge();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current);
      if (pingTimeoutRef.current) window.clearTimeout(pingTimeoutRef.current);
    };
  }, [isOpen, launcherControls, shouldReduceMotion]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isOpen) {
      setKeyboardInset(0);
      setPanelHeight(null);
      return;
    }

    const vv = window.visualViewport;
    const marginPx = 20;

    const update = () => {
      const visualHeight = vv?.height ?? window.innerHeight;
      const layoutHeight = document.documentElement.clientHeight || window.innerHeight;
      const inset = vv ? Math.max(0, layoutHeight - vv.height - vv.offsetTop) : 0;

      const maxHeight = Math.max(320, visualHeight - marginPx * 2);
      const height = Math.min(560, maxHeight);

      setKeyboardInset(inset);
      setPanelHeight(height);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, [isOpen]);

  const clearChat = () => {
    if (isLoading) return;
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  const canClearChat = !isLoading && messages.length > 1;

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 420);
    });

    const reply = createAssistantReply(trimmed, assistantGames);
    setMessages((current) => [...current, { role: "assistant", content: reply }]);
    setIsLoading(false);

    window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }, 10);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        animate={launcherControls}
        className={`group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-card text-primary shadow-[var(--soft-shadow)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          isOpen ? "pointer-events-none scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label="Open Hasheem AI"
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <span
          className={`pointer-events-none absolute right-[calc(100%+10px)] top-1/2 hidden -translate-y-1/2 rounded-md border border-white/10 bg-card/95 px-2.5 py-1 font-body text-xs font-medium text-foreground sm:block ${
            showLauncherHint ? "opacity-100" : "opacity-80"
          }`}
          aria-hidden="true"
        >
          {LAUNCHER_LABEL}
        </span>

        <AnimatePresence>
          {showLauncherPing && (
            <motion.span
              key="launcher-ping"
              className="pointer-events-none absolute inset-[-12px] rounded-full border border-primary/35"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: [0.08, 0.45, 0], scale: [0.95, 1.1, 1.2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <Bot className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.section
              className="fixed right-5 z-50 flex w-[min(92vw,400px)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-card/95 shadow-[var(--elevated-shadow)] backdrop-blur-xl"
              style={{
                bottom: `calc(1.25rem + ${keyboardInset}px)`,
                height: panelHeight ? `${panelHeight}px` : undefined,
              }}
              initial={{ opacity: 0, x: 22, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 18, scale: 0.98 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Hasheem AI Assistant"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="border-b border-white/10 bg-background/70 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-foreground">Hasheem AI Assistant</h3>
                      <p className="font-body text-[11px] text-muted-foreground">Online • fast store guidance</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={clearChat}
                      disabled={!canClearChat}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Clear chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="Close chat"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </header>

              <div className="border-b border-white/10 bg-background/35 px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        void sendMessage(prompt);
                      }}
                      className="rounded-full border border-white/12 bg-background px-3 py-1.5 font-body text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 min-h-0 space-y-3 overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: "easeOut" }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[84%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 font-body text-sm leading-relaxed ${
                        message.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm border border-white/10 bg-background/70 text-foreground"
                      }`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                    className="flex justify-start"
                  >
                    <div className="inline-flex items-center gap-2 rounded-xl rounded-bl-sm border border-white/10 bg-background/80 px-3 py-2 font-body text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Preparing reply...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <footer className="border-t border-white/10 bg-background/70 p-3">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about deals, platform, or budget"
                    className="h-11 flex-1 rounded-md border border-border bg-background px-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </footer>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HasheemAI;
