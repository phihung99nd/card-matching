export type Difficulty = "easy" | "medium" | "hard" | "hell";

export interface GridSize {
  cols: number;
  rows: number;
}

export const FLIP_LIMITS: Record<Difficulty, number> = {
  easy: 24,
  medium: 36,
  hard: 60,
  hell: 70,
};

export const TIME_LIMITS: Record<Difficulty, number> = {
  easy: 30,
  medium: 60,
  hard: 90,
  hell: 120,
};

export function getGridSize(difficulty: Difficulty): GridSize {
  switch (difficulty) {
    case "easy":
      return { cols: 4, rows: 3 }; // 12 cards
    case "medium":
      return { cols: 6, rows: 3 }; // 18 cards
    case "hard":
      return { cols: 6, rows: 4 }; // 24 cards
    case "hell":
      return { cols: 7, rows: 4 }; // 28 cards
  }
}

export function getTimeLimit(difficulty: Difficulty): number {
  return TIME_LIMITS[difficulty];
}

export function getFlipLimit(difficulty: Difficulty): number {
  return FLIP_LIMITS[difficulty];
}

