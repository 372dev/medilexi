export const ALL_LEVELS = [3, 2, 1] as const
export type LvlNum = 1 | 2 | 3

export const STARS: Record<number, string> = {
  3: '⭐⭐⭐', 2: '⭐⭐', 1: '⭐',
}

export const STAR_CLASS: Record<number, string> = {
  3: 'c-stars--3', 2: 'c-stars--2', 1: 'c-stars--1',
}

export const LVL_CARD_CLASS: Record<number, string> = {
  3: 'c-card--lvl3', 2: 'c-card--lvl2', 1: 'c-card--lvl1',
}

export const LVL_LABEL: Record<number, string> = {
  3: '⭐⭐⭐ Essential', 2: '⭐⭐ Important', 1: '⭐ Good to know',
}

// Emoji-free label for screen readers (used as aria-label on the star spans).
export const LVL_TEXT: Record<number, string> = {
  3: 'Essential', 2: 'Important', 1: 'Good to know',
}

export function normalizeLvl(v: unknown): LvlNum {
  if (v === 3 || v === '⭐⭐⭐ Essential') return 3
  if (v === 2 || v === '⭐⭐ Important') return 2
  return 1
}
