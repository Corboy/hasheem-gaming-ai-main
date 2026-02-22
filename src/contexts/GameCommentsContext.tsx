/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface GameComment {
  id: string;
  gameId: string;
  parentId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  isAdmin: boolean;
}

interface CreateGameCommentInput {
  gameId: string;
  parentId?: string;
  authorName: string;
  body: string;
  isAdmin?: boolean;
}

interface GameCommentsContextValue {
  comments: GameComment[];
  getCommentsByGame: (gameId: string) => GameComment[];
  createComment: (input: CreateGameCommentInput) => GameComment | null;
}

const COMMENTS_STORAGE_KEY = "hasheem_game_comments_v1";
const ADMIN_COMMENT_NAME = "hasheem";
const GameCommentsContext = createContext<GameCommentsContextValue | undefined>(undefined);

function createCommentId(): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `cmt-${Date.now()}-${random}`;
}

function normalizeComment(input: unknown, fallbackId: string): GameComment | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const item = input as Record<string, unknown>;
  const gameId = typeof item.gameId === "string" ? item.gameId.trim() : "";
  const body = typeof item.body === "string" ? item.body.trim() : "";

  if (!gameId || !body) {
    return null;
  }

  const isAdmin = item.isAdmin === true;
  const authorName = isAdmin
    ? ADMIN_COMMENT_NAME
    : typeof item.authorName === "string" && item.authorName.trim().length > 0
      ? item.authorName.trim()
      : "Guest";

  return {
    id: typeof item.id === "string" && item.id.trim().length > 0 ? item.id.trim() : fallbackId,
    gameId,
    parentId:
      typeof item.parentId === "string" && item.parentId.trim().length > 0 ? item.parentId.trim() : null,
    authorName,
    body,
    createdAt:
      typeof item.createdAt === "string" && item.createdAt.trim().length > 0
        ? item.createdAt.trim()
        : new Date().toISOString(),
    isAdmin,
  };
}

function loadComments(): GameComment[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry, index) => normalizeComment(entry, `comment-${index + 1}`))
      .filter((entry): entry is GameComment => entry !== null);
  } catch {
    return [];
  }
}

export const GameCommentsProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<GameComment[]>(loadComments);

  useEffect(() => {
    window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  }, [comments]);

  const value = useMemo<GameCommentsContextValue>(
    () => ({
      comments,
      getCommentsByGame: (gameId) =>
        comments
          .filter((comment) => comment.gameId === gameId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      createComment: (input) => {
        const gameId = input.gameId.trim();
        const body = input.body.trim();
        const isAdmin = input.isAdmin === true;
        const authorName = isAdmin ? ADMIN_COMMENT_NAME : input.authorName.trim();

        if (!gameId || !body || (!isAdmin && !authorName)) {
          return null;
        }

        const parentId = input.parentId?.trim() ?? "";
        const canReplyToParent =
          parentId.length > 0 &&
          comments.some((comment) => comment.id === parentId && comment.gameId === gameId);

        const nextComment: GameComment = {
          id: createCommentId(),
          gameId,
          parentId: canReplyToParent ? parentId : null,
          authorName: isAdmin ? ADMIN_COMMENT_NAME : authorName,
          body,
          createdAt: new Date().toISOString(),
          isAdmin,
        };

        setComments((previous) => [...previous, nextComment]);
        return nextComment;
      },
    }),
    [comments],
  );

  return <GameCommentsContext.Provider value={value}>{children}</GameCommentsContext.Provider>;
};

export function useGameComments(): GameCommentsContextValue {
  const context = useContext(GameCommentsContext);
  if (!context) {
    throw new Error("useGameComments must be used inside GameCommentsProvider");
  }

  return context;
}

