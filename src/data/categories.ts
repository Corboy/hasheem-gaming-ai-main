export const GAME_CATEGORIES = ["PC", "Mobile", "PlayStation"] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];

export const GAME_STATUS_OPTIONS = ["Draft", "Published"] as const;

export type GameStatus = (typeof GAME_STATUS_OPTIONS)[number];
