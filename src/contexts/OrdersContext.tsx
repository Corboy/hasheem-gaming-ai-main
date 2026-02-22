/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { games } from "@/data/games";
import type { GameCategory } from "@/data/categories";
import { logAdminActivity } from "@/lib/admin-activity";
import { formatTZS, parsePriceToAmount } from "@/lib/pricing";

export type OrderStatus = "Pending" | "Paid" | "Completed";
export type PaymentMethod = "M-Pesa" | "Tigo Pesa" | "Visa";
export type DeliveryStatus = "Link Sent" | "Pending" | "Expired";

export interface OrderItem {
  gameId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  image: string;
  category: GameCategory;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface NewOrderItemInput {
  gameId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  image: string;
  category: GameCategory;
}

interface OrdersContextValue {
  orders: OrderRecord[];
  isLoading: boolean;
  createOrder: (input: { customerName?: string; customerPhone?: string; items: NewOrderItemInput[] }) => OrderRecord;
  resendDownloadLink: (orderId: string) => boolean;
  markOrderPaid: (orderId: string) => boolean;
  totalRevenue: number;
}

const ORDERS_STORAGE_KEY = "hasheem_admin_orders_v1";
const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);
const PAYMENT_METHODS: PaymentMethod[] = ["M-Pesa", "Tigo Pesa", "Visa"];
const DELIVERY_STATUSES: DeliveryStatus[] = ["Link Sent", "Pending", "Expired"];

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${random}`;
}

function pickByIndex<T>(items: T[], index: number): T {
  return items[index % items.length];
}

function createSeedOrders(): OrderRecord[] {
  const seedGames = games.slice(0, 4);
  const now = Date.now();

  return seedGames.map((game, index) => {
    const quantity = index % 2 === 0 ? 1 : 2;
    const unitPrice = parsePriceToAmount(game.price);
    const createdAt = new Date(now - index * 1000 * 60 * 60 * 12).toISOString();

    return {
      id: createId("ORD"),
      customerName: ["Amina", "Kelvin", "Juma", "Neema"][index] ?? "Customer",
      customerPhone: ["0627001001", "0711002121", "0755003003", "0688004004"][index] ?? "0000000000",
      status: index % 3 === 0 ? "Completed" : index % 2 === 0 ? "Paid" : "Pending",
      paymentMethod: pickByIndex(PAYMENT_METHODS, index),
      deliveryStatus: pickByIndex(DELIVERY_STATUSES, index + 1),
      createdAt,
      totalAmount: unitPrice * quantity,
      items: [
        {
          gameId: game.id,
          title: game.title,
          quantity,
          unitPrice,
          image: game.image,
          category: (game.platforms[0] ?? "PC") as GameCategory,
        },
      ],
    };
  });
}

function normalizeOrder(input: unknown, fallbackId: string): OrderRecord | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.items) || value.items.length === 0) {
    return null;
  }

  const items = value.items
    .map((item): OrderItem | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      const title = typeof raw.title === "string" ? raw.title.trim() : "";
      if (!title) {
        return null;
      }

      return {
        gameId: typeof raw.gameId === "string" ? raw.gameId : createId("GAME"),
        title,
        quantity:
          typeof raw.quantity === "number" && raw.quantity > 0
            ? Math.round(raw.quantity)
            : 1,
        unitPrice:
          typeof raw.unitPrice === "number" && Number.isFinite(raw.unitPrice) && raw.unitPrice > 0
            ? Math.round(raw.unitPrice)
            : 0,
        image: typeof raw.image === "string" ? raw.image : "",
        category:
          raw.category === "Mobile" || raw.category === "PlayStation" || raw.category === "PC"
            ? raw.category
            : "PC",
      };
    })
    .filter((entry): entry is OrderItem => entry !== null);

  if (items.length === 0) {
    return null;
  }

  const totalAmount =
    typeof value.totalAmount === "number" && Number.isFinite(value.totalAmount) && value.totalAmount >= 0
      ? Math.round(value.totalAmount)
      : items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

  return {
    id: typeof value.id === "string" && value.id.trim().length > 0 ? value.id.trim() : fallbackId,
    customerName:
      typeof value.customerName === "string" && value.customerName.trim().length > 0
        ? value.customerName.trim()
        : "Walk-in Customer",
    customerPhone:
      typeof value.customerPhone === "string" && value.customerPhone.trim().length > 0
        ? value.customerPhone.trim()
        : "N/A",
    status:
      value.status === "Pending" || value.status === "Paid" || value.status === "Completed"
        ? value.status
        : "Pending",
    paymentMethod:
      value.paymentMethod === "M-Pesa" ||
      value.paymentMethod === "Tigo Pesa" ||
      value.paymentMethod === "Visa"
        ? value.paymentMethod
        : "M-Pesa",
    deliveryStatus:
      value.deliveryStatus === "Link Sent" ||
      value.deliveryStatus === "Pending" ||
      value.deliveryStatus === "Expired"
        ? value.deliveryStatus
        : "Pending",
    createdAt:
      typeof value.createdAt === "string" && value.createdAt.trim().length > 0
        ? value.createdAt.trim()
        : new Date().toISOString(),
    totalAmount,
    items,
  };
}

function loadOrders(): OrderRecord[] {
  if (typeof window === "undefined") {
    return createSeedOrders();
  }

  const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) {
    return createSeedOrders();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return createSeedOrders();
    }

    const normalized = parsed
      .map((entry, index) => normalizeOrder(entry, `order-${index + 1}`))
      .filter((entry): entry is OrderRecord => entry !== null);

    return normalized.length > 0 ? normalized : createSeedOrders();
  } catch {
    return createSeedOrders();
  }
}

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<OrderRecord[]>(loadOrders);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const value = useMemo<OrdersContextValue>(() => {
    const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      orders: sorted,
      isLoading,
      createOrder: ({ customerName, customerPhone, items }) => {
        const now = new Date().toISOString();
        const normalizedItems = items.map((item) => ({
          ...item,
          quantity: Math.max(1, Math.round(item.quantity || 1)),
          unitPrice: Math.max(0, Math.round(item.unitPrice || 0)),
        }));

        const totalAmount = normalizedItems.reduce(
          (total, item) => total + item.quantity * item.unitPrice,
          0,
        );

        const order: OrderRecord = {
          id: createId("ORD"),
          customerName: customerName?.trim() || "Walk-in Customer",
          customerPhone: customerPhone?.trim() || "N/A",
          status: "Paid",
          paymentMethod: pickByIndex(PAYMENT_METHODS, sorted.length),
          deliveryStatus: "Pending",
          createdAt: now,
          totalAmount,
          items: normalizedItems,
        };

        setOrders((previous) => [order, ...previous]);
        logAdminActivity({
          message: `Order ${order.id} marked as Paid`,
          href: "/admin/orders",
          level: "success",
        });
        return order;
      },
      resendDownloadLink: (orderId) => {
        let changed = false;
        setOrders((previous) =>
          previous.map((order) => {
            if (order.id !== orderId) {
              return order;
            }

            changed = true;
            return { ...order, deliveryStatus: "Link Sent" };
          }),
        );

        if (changed) {
          logAdminActivity({
            message: `Download link resent for ${orderId}`,
            href: "/admin/orders",
            level: "info",
          });
        }
        return changed;
      },
      markOrderPaid: (orderId) => {
        let changed = false;
        setOrders((previous) =>
          previous.map((order) => {
            if (order.id !== orderId) {
              return order;
            }

            if (order.status !== "Paid") {
              changed = true;
            }

            return { ...order, status: "Paid" };
          }),
        );

        if (changed) {
          logAdminActivity({
            message: `Order ${orderId} marked as Paid`,
            href: "/admin/orders",
            level: "success",
          });
        }
        return changed;
      },
      totalRevenue: sorted.reduce((total, order) => total + order.totalAmount, 0),
    };
  }, [orders, isLoading]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used inside OrdersProvider");
  }

  return context;
}

export function orderAmountLabel(amount: number): string {
  if (amount <= 0) {
    return "FREE";
  }

  return formatTZS(amount);
}
