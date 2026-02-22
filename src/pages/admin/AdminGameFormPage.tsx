import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, ImagePlus, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  GAME_CATEGORIES,
  GAME_STATUS_OPTIONS,
  type GameCategory,
  type GameStatus,
} from "@/data/categories";
import { useGameCatalog, type ManagedGameDraft } from "@/contexts/GameCatalogContext";
import { formatPriceForDisplay } from "@/lib/pricing";

interface GameFormState {
  title: string;
  category: GameCategory;
  status: GameStatus;
  price: string;
  salePrice: string;
  coverImage: string;
  galleryInput: string;
  gallery: string[];
  trailerUrl: string;
  shortDescription: string;
  fullDescription: string;
  systemRequirements: string;
  tags: string;
}

const inputClasses =
  "w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

function createEmptyState(): GameFormState {
  return {
    title: "",
    category: "PC",
    status: "Draft",
    price: "",
    salePrice: "",
    coverImage: "",
    galleryInput: "",
    gallery: [],
    trailerUrl: "",
    shortDescription: "",
    fullDescription: "",
    systemRequirements: "",
    tags: "",
  };
}

const stepTitles = [
  "Step 1: Basic Info",
  "Step 2: Media",
  "Step 3: Details",
  "Step 4: Review & Publish",
];

const AdminGameFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const { getGameById, createGame, updateGame } = useGameCatalog();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<GameFormState>(createEmptyState);

  const existingGame = useMemo(() => (id ? getGameById(id) : undefined), [getGameById, id]);

  useEffect(() => {
    if (!editing) {
      setForm(createEmptyState());
      return;
    }

    if (!existingGame) {
      return;
    }

    const livePrice = formatPriceForDisplay(existingGame.price);
    const originalPrice = existingGame.originalPrice
      ? formatPriceForDisplay(existingGame.originalPrice)
      : "";
    const price = originalPrice || livePrice;
    const salePrice = originalPrice ? livePrice : "";

    setForm({
      title: existingGame.title,
      category: existingGame.category,
      status: existingGame.status,
      price: String(price.replace(/[^0-9]/g, "")),
      salePrice: String(salePrice.replace(/[^0-9]/g, "")),
      coverImage: existingGame.image,
      galleryInput: "",
      gallery: existingGame.gallery ?? [],
      trailerUrl: existingGame.trailerUrl ?? "",
      shortDescription: existingGame.shortDescription,
      fullDescription: existingGame.fullDescription,
      systemRequirements: existingGame.systemRequirements ?? "",
      tags: existingGame.tags.join(", "),
    });
  }, [editing, existingGame]);

  const previewPrice = Number(form.price) || 0;
  const previewSalePrice = Number(form.salePrice) || 0;
  const hasPreviewSale = previewSalePrice > 0 && previewSalePrice < previewPrice;
  const previewLivePrice = hasPreviewSale ? previewSalePrice : previewPrice;

  const mapToDraft = (statusOverride?: GameStatus): ManagedGameDraft => {
    const tags = form.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      title: form.title.trim(),
      category: form.category,
      status: statusOverride ?? form.status,
      price: Number(form.price) || 0,
      salePrice: Number(form.salePrice) || undefined,
      coverImage: form.coverImage.trim(),
      gallery: form.gallery,
      trailerUrl: form.trailerUrl.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      systemRequirements: form.systemRequirements.trim(),
      tags,
    };
  };

  const validateStep = (value: number): boolean => {
    if (value === 1) {
      if (!form.title.trim()) {
        toast.error("Title is required.");
        return false;
      }

      if (!(Number(form.price) > 0)) {
        toast.error("Weka bei ya TZS kubwa kuliko sifuri.");
        return false;
      }

      if (Number(form.salePrice) > 0 && Number(form.salePrice) >= Number(form.price)) {
        toast.error("Sale price inatakiwa iwe chini ya bei ya kawaida.");
        return false;
      }
    }

    if (value === 2 && !form.coverImage.trim()) {
      toast.error("Cover image inahitajika (URL au upload).");
      return false;
    }

    if (value === 3) {
      if (!form.shortDescription.trim()) {
        toast.error("Short description inahitajika.");
        return false;
      }

      if (!form.fullDescription.trim()) {
        toast.error("Full description inahitajika.");
        return false;
      }
    }

    return true;
  };

  const saveGame = (mode: "draft" | "publish" | "save") => {
    if (![1, 2, 3].every((item) => validateStep(item))) {
      setStep(1);
      return;
    }

    const forcedStatus = mode === "draft" ? "Draft" : mode === "publish" ? "Published" : undefined;
    const payload = mapToDraft(forcedStatus);

    if (editing && id) {
      const updated = updateGame(id, payload);
      if (!updated) {
        toast.error("Failed to save game changes.");
        return;
      }

      toast.success("Game updated successfully.");
      navigate("/admin/games");
      return;
    }

    const created = createGame(payload);
    toast.success(
      created.status === "Published"
        ? "Game published successfully."
        : "Draft saved successfully.",
    );
    navigate(`/admin/games/${created.id}/edit`);
  };

  const openPreview = () => {
    if (!validateStep(Math.min(step, 3))) {
      return;
    }

    const previewPanel = document.getElementById("game-preview-panel");
    previewPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast.success("Preview refreshed.");
  };

  const uploadCoverImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) {
        toast.error("Failed to read image.");
        return;
      }

      setForm((previous) => ({ ...previous, coverImage: value }));
      toast.success("Cover image uploaded.");
    };
    reader.readAsDataURL(file);
  };

  const uploadGalleryImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) {
        toast.error("Failed to read image.");
        return;
      }

      setForm((previous) => ({ ...previous, gallery: [...previous.gallery, value] }));
      toast.success("Gallery image uploaded.");
    };
    reader.readAsDataURL(file);
  };

  if (editing && !existingGame) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="font-body text-sm text-muted-foreground">Game not found.</p>
        <Link to="/admin/games" className="mt-3 inline-block text-sm text-primary underline">
          Back to Games
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-black uppercase tracking-wide text-foreground">
              {editing ? "Edit Game" : "Add a New Game"}
            </h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Guided wizard for beginners. Fuata hatua moja baada ya nyingine.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              onClick={openPreview}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <Link
              to="/admin/games"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-4">
          {stepTitles.map((title, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === step;
            const completed = stepNumber < step;
            return (
              <button
                key={title}
                type="button"
                onClick={() => setStep(stepNumber)}
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-primary bg-primary/10"
                    : completed
                      ? "border-primary/40 bg-secondary"
                      : "border-border bg-background"
                }`}
              >
                <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                  {completed ? "Done" : `Step ${stepNumber}`}
                </p>
                <p className="font-body text-sm font-semibold text-foreground">{title.replace(/^Step \d: /, "")}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-border bg-card p-4 md:p-5">
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                Basic Info
              </h2>
              <label>
                <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title *
                </span>
                <input
                  className={inputClasses}
                  value={form.title}
                  onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="Example: Street Drift Legends"
                />
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Jina la game litakaloonekana kwenye store.
                </p>
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label>
                  <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Category *
                  </span>
                  <select
                    className={inputClasses}
                    value={form.category}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        category: event.target.value as GameCategory,
                      }))
                    }
                  >
                    {GAME_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    Chagua platform kuu ya game.
                  </p>
                </label>

                <label>
                  <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </span>
                  <select
                    className={inputClasses}
                    value={form.status}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        status: event.target.value as GameStatus,
                      }))
                    }
                  >
                    {GAME_STATUS_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    Draft = haionekani store, Published = inaonekana store.
                  </p>
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label>
                  <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Price (TZS) *
                  </span>
                  <input
                    type="number"
                    className={inputClasses}
                    value={form.price}
                    onChange={(event) => setForm((previous) => ({ ...previous, price: event.target.value }))}
                    placeholder="65000"
                  />
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    Weka bei kamili ya game kwa TZS.
                  </p>
                </label>

                <label>
                  <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sale Price (optional)
                  </span>
                  <input
                    type="number"
                    className={inputClasses}
                    value={form.salePrice}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, salePrice: event.target.value }))
                    }
                    placeholder="55000"
                  />
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    Ikiwa ni discount, weka bei ya promo hapa.
                  </p>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">Media</h2>
              <label>
                <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cover Image URL *
                </span>
                <input
                  className={inputClasses}
                  value={form.coverImage}
                  onChange={(event) => setForm((previous) => ({ ...previous, coverImage: event.target.value }))}
                  placeholder="https://..."
                />
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Unaweza paste URL au upload file hapa chini.
                </p>
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                <Upload className="h-4 w-4" />
                Upload Cover Image
                <input type="file" accept="image/*" className="hidden" onChange={uploadCoverImage} />
              </label>

              <div className="rounded-xl border border-border bg-background p-3">
                <label>
                  <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Gallery Image URL (optional)
                  </span>
                  <div className="flex gap-2">
                    <input
                      className={inputClasses}
                      value={form.galleryInput}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, galleryInput: event.target.value }))
                      }
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      onClick={() => {
                        if (!form.galleryInput.trim()) {
                          toast.error("Weka URL kwanza.");
                          return;
                        }

                        setForm((previous) => ({
                          ...previous,
                          gallery: [...previous.gallery, previous.galleryInput.trim()],
                          galleryInput: "",
                        }));
                        toast.success("Image added to gallery.");
                      }}
                    >
                      Add
                    </button>
                  </div>
                </label>

                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                  <ImagePlus className="h-4 w-4" />
                  Upload Gallery Image
                  <input type="file" accept="image/*" className="hidden" onChange={uploadGalleryImage} />
                </label>

                {form.gallery.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {form.gallery.map((item, index) => (
                      <div key={`${item}-${index}`} className="relative overflow-hidden rounded-md border border-border">
                        <img src={item} alt={`Gallery ${index + 1}`} className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-xs text-foreground"
                          onClick={() =>
                            setForm((previous) => ({
                              ...previous,
                              gallery: previous.gallery.filter((_, idx) => idx !== index),
                            }))
                          }
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label>
                <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Trailer URL (YouTube optional)
                </span>
                <input
                  className={inputClasses}
                  value={form.trailerUrl}
                  onChange={(event) => setForm((previous) => ({ ...previous, trailerUrl: event.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Optional video preview ya game.
                </p>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">Details</h2>

              <label>
                <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Short Description
                </span>
                <textarea
                  className={`${inputClasses} min-h-20`}
                  value={form.shortDescription}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, shortDescription: event.target.value }))
                  }
                  placeholder="One short summary about this game..."
                />
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Hii inaonekana haraka kwenye cards na admin list.
                </p>
              </label>

              <label>
                <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full Description
                </span>
                <textarea
                  className={`${inputClasses} min-h-32`}
                  value={form.fullDescription}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, fullDescription: event.target.value }))
                  }
                  placeholder="Write detailed gameplay, story, features..."
                />
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Maelezo marefu ya product page.
                </p>
              </label>

              {form.category === "PC" && (
                <label>
                  <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    System Requirements (PC only)
                  </span>
                  <textarea
                    className={`${inputClasses} min-h-24`}
                    value={form.systemRequirements}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, systemRequirements: event.target.value }))
                    }
                    placeholder="OS, CPU, RAM, GPU..."
                  />
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    Onesha minimum specs kwa PC users.
                  </p>
                </label>
              )}

              <label>
                <span className="mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tags / Genres
                </span>
                <input
                  className={inputClasses}
                  value={form.tags}
                  onChange={(event) => setForm((previous) => ({ ...previous, tags: event.target.value }))}
                  placeholder="Action, Racing, Multiplayer"
                />
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Tenganisha tags kwa comma (,).
                </p>
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                Review & Publish
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                Kagua taarifa zote. Ukiridhika, save as draft au publish.
              </p>

              <div className="rounded-lg border border-border bg-background p-4">
                <ul className="space-y-2 font-body text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Title:</strong> {form.title || "-"}
                  </li>
                  <li>
                    <strong className="text-foreground">Category:</strong> {form.category}
                  </li>
                  <li>
                    <strong className="text-foreground">Status:</strong> {form.status}
                  </li>
                  <li>
                    <strong className="text-foreground">Price:</strong>{" "}
                    {previewLivePrice > 0 ? formatPriceForDisplay(previewLivePrice) : "FREE"}
                  </li>
                  <li>
                    <strong className="text-foreground">Original Price:</strong>{" "}
                    {hasPreviewSale ? formatPriceForDisplay(previewPrice) : "-"}
                  </li>
                </ul>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  onClick={() => saveGame("draft")}
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[var(--primary-shadow)]"
                  onClick={() => saveGame("publish")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Publish
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  onClick={() => saveGame("save")}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              disabled={step === 1}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setStep((previous) => Math.max(1, previous - 1))}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              disabled={step === 4}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                if (!validateStep(step)) {
                  return;
                }
                setStep((previous) => Math.min(4, previous + 1));
              }}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </article>

        <aside id="game-preview-panel" className="rounded-2xl border border-border bg-card p-4 md:p-5 lg:sticky lg:top-20 lg:h-fit">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">Live Preview</h3>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            Hii ndiyo card ya game utakavyoiona karibu na store.
          </p>

          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-background">
            <div className="aspect-[3/4] bg-secondary">
              {form.coverImage ? (
                <img src={form.coverImage} alt={form.title || "Preview"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No cover image
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-body text-xs uppercase tracking-wide text-primary">{form.category}</p>
              <h4 className="mt-1 font-display text-sm font-bold uppercase text-foreground">
                {form.title || "Game Title"}
              </h4>
              <p className="mt-2 font-display text-lg font-black text-foreground">
                {previewLivePrice > 0 ? formatPriceForDisplay(previewLivePrice) : "FREE"}
              </p>
              {hasPreviewSale && (
                <p className="font-body text-sm text-muted-foreground line-through">
                  {formatPriceForDisplay(previewPrice)}
                </p>
              )}
              <p className="mt-2 line-clamp-3 font-body text-xs text-muted-foreground">
                {form.shortDescription || "Short description will appear here."}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AdminGameFormPage;
