import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useGameCatalog } from "@/contexts/GameCatalogContext";
import { useOrders, type OrderRecord } from "@/contexts/OrdersContext";
import { useAdminActivities } from "@/hooks/use-admin-activities";
import { formatTZS } from "@/lib/pricing";

const cardBase =
  "rounded-2xl border border-border bg-card p-6 md:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.24)]";

function getPaymentBadgeClasses(status: OrderRecord["status"]): string {
  return status === "Pending"
    ? "border border-amber-500/25 bg-amber-500/15 text-amber-200"
    : "border border-emerald-500/25 bg-emerald-500/15 text-emerald-200";
}

function getDeliveryBadgeClasses(status: OrderRecord["deliveryStatus"]): string {
  return status === "Pending" || status === "Expired"
    ? "border border-amber-500/25 bg-amber-500/15 text-amber-200"
    : "border border-emerald-500/25 bg-emerald-500/15 text-emerald-200";
}

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { games, isLoading: gamesLoading } = useGameCatalog();
  const { orders, totalRevenue, isLoading: ordersLoading } = useOrders();
  const activities = useAdminActivities();
  const loading = gamesLoading || ordersLoading;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const awaitingDelivery = orders.filter((order) => order.deliveryStatus === "Pending").length;
  const recentOrders = orders.slice(0, 5);

  const draftCount = games.filter((game) => game.status === "Draft").length;
  const missingCoverCount = games.filter((game) => !game.image.trim()).length;
  const pendingPayments = orders.filter((order) => order.status === "Pending").length;
  const recentActivities = activities.slice(0, 6);

  return (
    <div className="space-y-8">
      <section className={cardBase}>
        <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
          Welcome back, {user?.name ?? "Admin"}
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          You have {pendingOrders} {pendingOrders === 1 ? "order" : "orders"} pending and{" "}
          {awaitingDelivery} awaiting delivery.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <article key={`kpi-skeleton-${index}`} className={cardBase}>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-10 w-40" />
            </article>
          ))
        ) : (
          <>
            <article className={cardBase}>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="mt-4 font-body text-sm text-muted-foreground">Total revenue</p>
              <p className="mt-1 font-display text-3xl font-semibold text-foreground">
                {formatTZS(totalRevenue)}
              </p>
            </article>

            <article className={cardBase}>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <p className="mt-4 font-body text-sm text-muted-foreground">Total orders</p>
              <p className="mt-1 font-display text-3xl font-semibold text-foreground">{totalOrders}</p>
            </article>
          </>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <article className={cardBase}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Recent orders</h2>
              <p className="font-body text-sm text-muted-foreground">
                Latest customer orders in a simple view.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="font-body text-sm font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={`order-row-${index}`} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
              <p className="font-body text-sm text-muted-foreground">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full divide-y divide-border font-body text-sm">
                <thead className="bg-secondary/65 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">Order</th>
                    <th className="px-3 py-2.5 text-left font-medium">Customer</th>
                    <th className="px-3 py-2.5 text-left font-medium">Payment</th>
                    <th className="px-3 py-2.5 text-left font-medium">Delivery</th>
                    <th className="px-3 py-2.5 text-right font-medium">Total</th>
                    <th className="px-3 py-2.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-foreground">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{order.customerName}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full border border-border bg-background px-2 py-1 text-xs text-foreground">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${getDeliveryBadgeClasses(
                            order.deliveryStatus,
                          )}`}
                        >
                          {order.deliveryStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-foreground">
                        {formatTZS(order.totalAmount)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/orders?order=${encodeURIComponent(order.id)}`)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className={`${cardBase} space-y-4`}>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Quick start</h2>
            <p className="font-body text-sm text-muted-foreground">
              One main action, then small links for the next steps.
            </p>
          </div>

          <Link
            to="/admin/games/new"
            className="inline-flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-[var(--primary-shadow)] transition-all hover:-translate-y-0.5"
          >
            Add New Game
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="space-y-2">
            <Link
              to="/admin/games"
              className="block font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Edit existing games
            </Link>
            <Link
              to="/admin/orders"
              className="block font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Review customer orders
            </Link>
            <Link
              to="/admin/support"
              className="block font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Open support guide
            </Link>
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <details className="rounded-2xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 [&::-webkit-details-marker]:hidden">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Store health</h2>
              <p className="font-body text-sm text-muted-foreground">
                Optional checks to keep your store safe and complete.
              </p>
            </div>
            <span className="font-body text-xs text-muted-foreground">Open</span>
          </summary>

          <div className="space-y-2 border-t border-border px-6 pb-6 pt-4">
            <Link
              to="/admin/games"
              className="flex items-start justify-between rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <span className="font-body text-sm text-foreground">
                {missingCoverCount > 0
                  ? `${missingCoverCount} game${missingCoverCount === 1 ? "" : "s"} missing cover image`
                  : "All games have a cover image"}
              </span>
              {missingCoverCount > 0 ? (
                <CircleAlert className="h-4 w-4 text-amber-300" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              )}
            </Link>

            <Link
              to="/admin/games"
              className="flex items-start justify-between rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <span className="font-body text-sm text-foreground">
                {draftCount > 0
                  ? `${draftCount} game${draftCount === 1 ? "" : "s"} still in draft`
                  : "No games waiting in draft"}
              </span>
              {draftCount > 0 ? (
                <CircleAlert className="h-4 w-4 text-amber-300" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              )}
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-start justify-between rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <span className="font-body text-sm text-foreground">
                {pendingPayments > 0
                  ? `${pendingPayments} payment${pendingPayments === 1 ? "" : "s"} need review`
                  : "All payments look good"}
              </span>
              {pendingPayments > 0 ? (
                <CircleAlert className="h-4 w-4 text-amber-300" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              )}
            </Link>
          </div>
        </details>

        <details className="rounded-2xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 [&::-webkit-details-marker]:hidden">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Recent activity</h2>
              <p className="font-body text-sm text-muted-foreground">
                Optional activity log for updates and actions.
              </p>
            </div>
            <span className="font-body text-xs text-muted-foreground">Open</span>
          </summary>

          <div className="space-y-2 border-t border-border px-6 pb-6 pt-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`activity-skeleton-${index}`} className="h-11 w-full rounded-lg" />
              ))
            ) : recentActivities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">
                  No activity yet. Actions will appear here automatically.
                </p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <Link
                  key={activity.id}
                  to={activity.href}
                  className="flex items-start justify-between rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/35"
                >
                  <div>
                    <p className="font-body text-sm text-foreground">{activity.message}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${getPaymentBadgeClasses(
                      activity.level === "warning" ? "Pending" : "Paid",
                    )}`}
                  >
                    {activity.level}
                  </span>
                </Link>
              ))
            )}
          </div>
        </details>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
