import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, Edit3, Eye, PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { GAME_CATEGORIES, GAME_STATUS_OPTIONS } from "@/data/categories";
import { useGameCatalog } from "@/contexts/GameCatalogContext";
import { formatPriceForDisplay } from "@/lib/pricing";

const inputClasses =
  "w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const AdminGamesPage = () => {
  const navigate = useNavigate();
  const { games, deleteGame, duplicateGame, isLoading } = useGameCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | (typeof GAME_CATEGORIES)[number]>("All");
  const [status, setStatus] = useState<"All" | (typeof GAME_STATUS_OPTIONS)[number]>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const list = games.filter((game) => {
      const queryOk = normalizedQuery ? game.title.toLowerCase().includes(normalizedQuery) : true;
      const categoryOk = category === "All" ? true : game.category === category;
      const statusOk = status === "All" ? true : game.status === status;
      return queryOk && categoryOk && statusOk;
    });

    return list.sort((a, b) => {
      return sortOrder === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt);
    });
  }, [games, query, category, status, sortOrder]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-black uppercase tracking-wide text-foreground">
              Edit Games
            </h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Search, filter, and manage all games. Safe for beginners.
            </p>
          </div>
          <Link
            to="/admin/games/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-primary-foreground transition-all hover:shadow-[var(--primary-shadow)]"
          >
            <PlusCircle className="h-4 w-4" />
            Add a New Game
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Search by title
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className={`${inputClasses} pl-9`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type game title..."
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </span>
            <select
              className={inputClasses}
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as "All" | (typeof GAME_CATEGORIES)[number])
              }
            >
              <option value="All">All Categories</option>
              {GAME_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <select
              className={inputClasses}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "All" | (typeof GAME_STATUS_OPTIONS)[number])
              }
            >
              <option value="All">All Status</option>
              {GAME_STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground">
            Sort by date:
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <span className="rounded-full bg-secondary px-2 py-1 font-body text-xs text-muted-foreground">
            {filteredGames.length} games shown
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-3 md:p-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={`games-table-skeleton-${index}`} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center">
            <p className="font-body text-sm text-muted-foreground">
              No games found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border font-body text-sm">
              <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Game</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGames.map((game) => (
                  <tr key={game.id}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={game.image}
                          alt={game.title}
                          className="h-10 w-10 rounded-md object-cover"
                          loading="lazy"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{game.title}</p>
                          <p className="text-xs text-muted-foreground">{game.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full border border-border bg-background px-2 py-1 text-xs text-foreground">
                        {game.category}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          game.status === "Published"
                            ? "bg-primary/15 text-primary"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-foreground">
                      {formatPriceForDisplay(game.price)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                          className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                          aria-label={`Edit ${game.title}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = duplicateGame(game.id);
                            if (!copy) {
                              toast.error("Failed to duplicate game.");
                              return;
                            }

                            toast.success("Game duplicated as draft.");
                          }}
                          className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                          aria-label={`Duplicate ${game.title}`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (game.status === "Published") {
                              window.open(`/game/${game.id}`, "_blank", "noopener,noreferrer");
                              return;
                            }

                            toast.message("Draft preview available inside Edit page.");
                            navigate(`/admin/games/${game.id}/edit`);
                          }}
                          className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                          aria-label={`Preview ${game.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const sure = window.confirm(
                              `Delete "${game.title}"?\n\nAction hii haiwezi kurudishwa.`,
                            );
                            if (!sure) {
                              return;
                            }

                            const ok = deleteGame(game.id);
                            if (!ok) {
                              toast.error("Failed to delete game.");
                              return;
                            }

                            toast.success("Game deleted.");
                          }}
                          className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                          aria-label={`Delete ${game.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default AdminGamesPage;
