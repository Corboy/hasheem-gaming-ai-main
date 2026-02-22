import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useCommerce } from "@/contexts/CommerceContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { trackEvent } from "@/lib/analytics";
import { formatPriceForDisplay, formatTshAmount, parsePriceToTshAmount } from "@/lib/pricing";

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    incrementItem,
    decrementItem,
    removeFromCart,
    clearCart,
  } = useCommerce();
  const { catalogGames } = useSiteSettings();

  const detailedItems = cartItems
    .map((item) => {
      const game = catalogGames.find((entry) => entry.id === item.gameId);
      if (!game) {
        return null;
      }

      const unitPrice = parsePriceToTshAmount(game.price);
      return {
        ...item,
        game,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = detailedItems.reduce((total, item) => total + item.lineTotal, 0);

  if (!isCartOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={closeCart}
        aria-label="Close cart drawer"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
              Your Cart
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              {detailedItems.length} item{detailedItems.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={closeCart}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {detailedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-body text-sm text-muted-foreground">
                Your cart is empty. Add a game to get started.
              </p>
            </div>
          ) : (
            detailedItems.map((item) => (
              <div key={item.gameId} className="rounded-xl border border-border bg-card p-3">
                <div className="flex gap-3">
                  <img
                    src={item.game.image}
                    alt={item.game.title}
                    className="h-20 w-16 rounded-md object-cover"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/game/${item.game.id}`}
                      className="line-clamp-2 font-display text-xs font-bold uppercase tracking-wide text-foreground hover:text-primary"
                      onClick={closeCart}
                    >
                      {item.game.title}
                    </Link>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      {formatPriceForDisplay(item.game.price)}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          onClick={() => decrementItem(item.gameId)}
                          aria-label={`Decrease quantity for ${item.game.title}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2 font-body text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          onClick={() => incrementItem(item.gameId)}
                          aria-label={`Increase quantity for ${item.game.title}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => removeFromCart(item.gameId)}
                        aria-label={`Remove ${item.game.title} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="space-y-3 border-t border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">Subtotal</span>
            <span className="font-display text-xl font-black text-foreground">{formatTshAmount(subtotal)}</span>
          </div>

          <button
            type="button"
            className="w-full rounded-md bg-primary px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:shadow-[var(--neon-glow)]"
            onClick={() => {
              if (detailedItems.length === 0) {
                toast.error("Your cart is empty.");
                return;
              }

              trackEvent({
                action: "begin_checkout",
                category: "Commerce",
                label: `${detailedItems.length} items`,
                value: Math.round(subtotal),
              });
              toast.success("Checkout flow is ready for payment integration.");
            }}
          >
            Proceed to Checkout
          </button>

          <button
            type="button"
            className="w-full rounded-md border border-border px-4 py-2.5 font-body text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            onClick={() => {
              clearCart();
              toast.success("Cart cleared.");
            }}
          >
            Clear Cart
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default CartDrawer;
