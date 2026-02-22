/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface CartItem {
  gameId: string;
  quantity: number;
}

interface CommerceContextValue {
  cartItems: CartItem[];
  wishlistIds: string[];
  isCartOpen: boolean;
  setCartOpen: Dispatch<SetStateAction<boolean>>;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (gameId: string) => void;
  removeFromCart: (gameId: string) => void;
  clearCart: () => void;
  incrementItem: (gameId: string) => void;
  decrementItem: (gameId: string) => void;
  toggleWishlist: (gameId: string) => boolean;
  isWishlisted: (gameId: string) => boolean;
  cartCount: number;
}

const CART_STORAGE_KEY = "hasheem_cart_v1";
const WISHLIST_STORAGE_KEY = "hasheem_wishlist_v1";

const CommerceContext = createContext<CommerceContextValue | undefined>(undefined);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const nextItem = item as Record<string, unknown>;
        const gameId = typeof nextItem.gameId === "string" ? nextItem.gameId : "";
        const quantity = typeof nextItem.quantity === "number" ? nextItem.quantity : 1;

        if (!gameId || quantity < 1) {
          return null;
        }

        return { gameId, quantity };
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

function loadWishlist(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export const CommerceProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
  const [wishlistIds, setWishlistIds] = useState<string[]>(loadWishlist);
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const value = useMemo<CommerceContextValue>(
    () => ({
      cartItems,
      wishlistIds,
      isCartOpen,
      setCartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      addToCart: (gameId) => {
        setCartItems((previous) => {
          const existing = previous.find((item) => item.gameId === gameId);
          if (existing) {
            return previous.map((item) =>
              item.gameId === gameId ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }

          return [...previous, { gameId, quantity: 1 }];
        });
      },
      removeFromCart: (gameId) => {
        setCartItems((previous) => previous.filter((item) => item.gameId !== gameId));
      },
      clearCart: () => setCartItems([]),
      incrementItem: (gameId) => {
        setCartItems((previous) =>
          previous.map((item) =>
            item.gameId === gameId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        );
      },
      decrementItem: (gameId) => {
        setCartItems((previous) =>
          previous
            .map((item) =>
              item.gameId === gameId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      toggleWishlist: (gameId) => {
        let isNowWishlisted = false;

        setWishlistIds((previous) => {
          if (previous.includes(gameId)) {
            isNowWishlisted = false;
            return previous.filter((item) => item !== gameId);
          }

          isNowWishlisted = true;
          return [...previous, gameId];
        });

        return isNowWishlisted;
      },
      isWishlisted: (gameId) => wishlistIds.includes(gameId),
      cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    }),
    [cartItems, isCartOpen, wishlistIds],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
};

export function useCommerce(): CommerceContextValue {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }

  return context;
}
