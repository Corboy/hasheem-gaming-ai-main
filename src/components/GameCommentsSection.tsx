import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Reply, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useGameComments, type GameComment } from "@/contexts/GameCommentsContext";

interface GameCommentsSectionProps {
  gameId: string;
}

interface ThreadNode extends GameComment {
  replies: ThreadNode[];
}

function buildCommentTree(comments: GameComment[]): ThreadNode[] {
  const nodes = new Map<string, ThreadNode>();
  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, replies: [] });
  });

  const roots: ThreadNode[] = [];
  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.replies.push(node);
      return;
    }

    roots.push(node);
  });

  const sortNodes = (items: ThreadNode[]) => {
    items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    items.forEach((item) => sortNodes(item.replies));
  };

  sortNodes(roots);
  return roots;
}

function formatCommentDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const baseInputClasses =
  "w-full rounded-md border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const GameCommentsSection = ({ gameId }: GameCommentsSectionProps) => {
  const { isAdmin } = useAuth();
  const { getCommentsByGame, createComment } = useGameComments();
  const gameComments = getCommentsByGame(gameId);
  const commentsTree = useMemo(() => buildCommentTree(gameComments), [gameComments]);

  const [guestName, setGuestName] = useState("");
  const [newCommentBody, setNewCommentBody] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});

  const handleCreateComment = () => {
    const next = createComment({
      gameId,
      authorName: isAdmin ? "hasheem" : guestName,
      body: newCommentBody,
      isAdmin,
    });

    if (!next) {
      toast.error("Weka jina na comment yako kwanza.");
      return;
    }

    setNewCommentBody("");
    toast.success("Comment posted.");
  };

  const handleCreateReply = (parentId: string) => {
    const body = replyBodies[parentId] ?? "";
    const next = createComment({
      gameId,
      parentId,
      authorName: isAdmin ? "hasheem" : guestName,
      body,
      isAdmin,
    });

    if (!next) {
      toast.error("Weka jina na majibu yako kwanza.");
      return;
    }

    setReplyBodies((previous) => ({ ...previous, [parentId]: "" }));
    setActiveReplyId(null);
    toast.success("Reply posted.");
  };

  const renderNode = (node: ThreadNode, depth = 0) => {
    const showReplyForm = activeReplyId === node.id;

    return (
      <article
        key={node.id}
        className={`rounded-xl border border-white/8 bg-card/70 p-4 ${depth > 0 ? "ml-4 mt-3 border-l-2" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-sm font-semibold text-foreground">{node.authorName}</p>
          {node.isAdmin && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide text-primary">
              Admin
            </span>
          )}
          <span className="font-body text-xs text-muted-foreground">{formatCommentDate(node.createdAt)}</span>
        </div>

        <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{node.body}</p>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setActiveReplyId((previous) => (previous === node.id ? null : node.id))}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-body text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
          >
            <Reply className="h-3.5 w-3.5" />
            Reply
          </button>
        </div>

        {showReplyForm && (
          <div className="mt-3 space-y-2 rounded-lg border border-border bg-background/70 p-3">
            {!isAdmin && (
              <p className="font-body text-xs text-muted-foreground">
                Replying as <span className="font-semibold text-foreground">{guestName || "Guest"}</span>
              </p>
            )}
            {isAdmin && (
              <p className="font-body text-xs text-muted-foreground">
                Replying as <span className="font-semibold text-primary">hasheem</span>
              </p>
            )}
            <textarea
              value={replyBodies[node.id] ?? ""}
              onChange={(event) =>
                setReplyBodies((previous) => ({ ...previous, [node.id]: event.target.value }))
              }
              rows={3}
              placeholder="Write a reply..."
              className={baseInputClasses}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleCreateReply(node.id)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 font-body text-xs font-semibold text-primary-foreground shadow-[var(--primary-shadow)]"
              >
                <Send className="h-3.5 w-3.5" />
                Send Reply
              </button>
            </div>
          </div>
        )}

        {node.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {node.replies.map((reply) => renderNode(reply, depth + 1))}
          </div>
        )}
      </article>
    );
  };

  return (
    <section id="comments" className="mt-12 rounded-2xl border border-white/10 bg-card/50 p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <MessageCircle className="h-4 w-4" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground md:text-2xl">
            Comments ({gameComments.length})
          </h2>
        </div>
        {!isAdmin && (
          <Link to="/login" className="font-body text-xs text-muted-foreground underline hover:text-primary">
            Admin? Login to reply as hasheem
          </Link>
        )}
      </div>

      <div className="mb-6 space-y-3 rounded-xl border border-border bg-background/70 p-4">
        {!isAdmin && (
          <input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            placeholder="Your name"
            className={baseInputClasses}
          />
        )}
        {isAdmin && (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 font-body text-xs text-primary">
            Admin mode active: your comments and replies will show as <strong>hasheem</strong>.
          </p>
        )}
        <textarea
          value={newCommentBody}
          onChange={(event) => setNewCommentBody(event.target.value)}
          rows={4}
          placeholder="Write your comment..."
          className={baseInputClasses}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreateComment}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-body text-sm font-semibold text-primary-foreground shadow-[var(--primary-shadow)]"
          >
            <Send className="h-4 w-4" />
            Post Comment
          </button>
        </div>
      </div>

      {commentsTree.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 p-6 text-center">
          <p className="font-body text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts on this game.
          </p>
        </div>
      ) : (
        <div className="space-y-3">{commentsTree.map((node) => renderNode(node))}</div>
      )}
    </section>
  );
};

export default GameCommentsSection;

