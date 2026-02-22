import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrders, type OrderRecord } from "@/contexts/OrdersContext";
import { formatTZS } from "@/lib/pricing";

function StatusBadge({ value }: { value: OrderRecord["status"] }) {
  const classes =
    value === "Pending"
      ? "border border-amber-500/25 bg-amber-500/15 text-amber-200"
      : "border border-emerald-500/25 bg-emerald-500/15 text-emerald-200";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>{value}</span>;
}

function DeliveryBadge({ value }: { value: OrderRecord["deliveryStatus"] }) {
  const classes =
    value === "Pending" || value === "Expired"
      ? "border border-amber-500/25 bg-amber-500/15 text-amber-200"
      : "border border-emerald-500/25 bg-emerald-500/15 text-emerald-200";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>{value}</span>;
}

const AdminOrdersPage = () => {
  const [searchParams] = useSearchParams();
  const focusOrderId = searchParams.get("order") ?? "";
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const { orders, totalRevenue, isLoading, resendDownloadLink, markOrderPaid } = useOrders();

  const summary = useMemo(
    () => ({
      pending: orders.filter((order) => order.status === "Pending").length,
      paid: orders.filter((order) => order.status === "Paid").length,
      completed: orders.filter((order) => order.status === "Completed").length,
    }),
    [orders],
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <h1 className="font-display text-xl font-black uppercase tracking-wide text-foreground">
          Customer Orders
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Track payments and delivery links in one place.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`summary-skeleton-${index}`} className="rounded-lg border border-border bg-background p-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-7 w-16" />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Total Orders</p>
                <p className="mt-1 font-display text-2xl font-black text-foreground">{orders.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
                <p className="mt-1 font-display text-2xl font-black text-zinc-300">{summary.pending}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Paid</p>
                <p className="mt-1 font-display text-2xl font-black text-foreground">{summary.paid}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Total Revenue</p>
                <p className="mt-1 font-display text-xl font-black text-foreground">{formatTZS(totalRevenue)}</p>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-3 md:p-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={`order-list-skeleton-${index}`} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center">
            <PackageSearch className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-body text-sm text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border font-body text-sm">
              <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Payment Method</th>
                  <th className="px-3 py-2 text-left">Delivery Status</th>
                  <th className="px-3 py-2 text-left">Payment Status</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className={focusOrderId === order.id ? "bg-primary/5" : ""}>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-foreground">{order.customerName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{order.customerPhone}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full border border-border bg-background px-2 py-1 text-xs text-foreground">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <DeliveryBadge value={order.deliveryStatus} />
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge value={order.status} />
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-foreground">
                      {formatTZS(order.totalAmount)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                          onClick={() => {
                            const ok = resendDownloadLink(order.id);
                            if (!ok) {
                              toast.error("Failed to resend link.");
                              return;
                            }
                            toast.success("Download link resent.");
                          }}
                        >
                          Resend Download Link
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                          onClick={() => {
                            const ok = markOrderPaid(order.id);
                            if (!ok) {
                              toast.message("Order already marked as Paid.");
                              return;
                            }
                            toast.success("Order marked as Paid.");
                          }}
                        >
                          Mark Paid
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-black uppercase tracking-wide text-foreground">
              Order Details
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-muted-foreground">
              Review payment and items before support action.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-2 rounded-lg border border-border bg-background p-3 font-body text-sm">
                <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Delivery:</strong> {selectedOrder.deliveryStatus}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Total:</strong> {formatTZS(selectedOrder.totalAmount)}</p>
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <p className="mb-2 font-body text-sm font-semibold text-foreground">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={`${selectedOrder.id}-${item.gameId}`} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {item.title} x{item.quantity}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatTZS(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersPage;
