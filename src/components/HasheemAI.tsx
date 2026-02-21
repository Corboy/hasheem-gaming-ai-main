import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const PRESET_RESPONSES: Record<string, string> = {
  hello: "Hey gamer! 🎮 Welcome to HASHEEM GAMING. I can help you find games, check prices, or learn about our deals. What are you looking for?",
  hi: "Hey gamer! 🎮 Welcome to HASHEEM GAMING. I can help you find games, check prices, or learn about our deals. What are you looking for?",
  games: "We have an amazing catalog! Check out our featured titles:\n\n🗡️ **Shadow Blade: Reckoning** - $39.99 (was $59.99)\n🔫 **Cyber Warfare 2087** - $49.99\n🏎️ **Neon Velocity** - $29.99 (was $44.99)\n👻 **The Last Corridor** - $19.99\n⚔️ **Kingdoms of Ash** - $59.99\n🤖 **Titan Command** - $44.99 (was $59.99)",
  deals: "🔥 **Hot Deals This Week:**\n\n• Shadow Blade: Reckoning — **33% OFF** → $39.99\n• Neon Velocity — **33% OFF** → $29.99\n• Titan Command — **25% OFF** → $44.99\n\nGrab them before they're gone!",
  recommend: "Based on what's trending, I'd recommend:\n\n1. **Shadow Blade: Reckoning** — Incredible combat, epic story, and it's on sale!\n2. **Kingdoms of Ash** — If you love open worlds, this is a must-play.\n3. **The Last Corridor** — Perfect for horror fans, and it's only $19.99!",
  price: "Our prices range from $19.99 to $59.99. We frequently run sales with discounts up to 33% off! Check the deals section for current offers.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("deal") || lower.includes("sale") || lower.includes("discount")) return PRESET_RESPONSES.deals;
  if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("best")) return PRESET_RESPONSES.recommend;
  if (lower.includes("game") || lower.includes("catalog") || lower.includes("list")) return PRESET_RESPONSES.games;
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) return PRESET_RESPONSES.price;
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return PRESET_RESPONSES.hello;
  return "I'm HASHEEM AI — your gaming assistant! 🎮 Ask me about games, deals, recommendations, or prices. I'm here to help you find your next favorite game!";
}

const HasheemAI = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm **HASHEEM AI** 🤖 — your personal gaming assistant. Ask me about games, deals, or recommendations!" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: getResponse(trimmed) }]);
    }, 600);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:shadow-[var(--neon-glow-strong)] active:scale-95"
        aria-label="Open HASHEEM AI"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] animate-slide-up flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-secondary px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                HASHEEM AI
              </h4>
              <span className="font-body text-xs text-primary">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 font-body text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {msg.content.split("\n").map((line, li) => (
                    <span key={li}>
                      {line.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={pi}>{part.slice(2, -2)}</strong>
                        ) : (
                          part
                        )
                      )}
                      {li < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask HASHEEM AI..."
                className="flex-1 rounded-md border border-border bg-muted px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button
                onClick={send}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
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
