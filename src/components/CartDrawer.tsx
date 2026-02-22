import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useCommerce } from "@/contexts/CommerceContext";
import { useGameCatalog } from "@/contexts/GameCatalogContext";
import { useOrders } from "@/contexts/OrdersContext";
import { trackEvent } from "@/lib/analytics";
import { formatPriceForDisplay, formatTZS, parsePriceToAmount } from "@/lib/pricing";

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
  const { games } = useGameCatalog();
  const { createOrder } = useOrders();

  const detailedItems = cartItems
    .map((item) => {
      const game = games.find((entry) => entry.id === item.gameId);
      if (!game) {
        return null;
      }

      const unitPrice = parsePriceToAmount(game.price);
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

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
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
            <div className="rounded-xl border border-dashed border-white/10 bg-card p-8 text-center">
              <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-body text-sm text-muted-foreground">
                Your cart is empty. Add a game to get started.
              </p>
            </div>
          ) : (
            detailedItems.map((item) => (
              <div key={item.gameId} className="rounded-xl border border-white/10 bg-card p-3 transition-transform duration-300 hover:-translate-y-0.5">
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
                      <div className="inline-flex items-center rounded-md border border-white/10">
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

        <footer className="space-y-3 border-t border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">Subtotal</span>
            <span className="font-display text-xl font-black text-foreground">{formatTZS(subtotal)}</span>
          </div>

          <button
            type="button"
            className="button-lift w-full rounded-md bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground shadow-[var(--primary-shadow)]"
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

              createOrder({
                customerName: "Walk-in Customer",
                customerPhone: "N/A",
                items: detailedItems.map((item) => ({
                  gameId: item.game.id,
                  title: item.game.title,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  image: item.game.image,
                  category: item.game.category ?? "PC",
                })),
              });
              clearCart();
              toast.success("Checkout complete. Order saved.");
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
