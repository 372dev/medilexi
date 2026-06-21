export const ALL_LEVELS = ['⭐⭐⭐ Essential', '⭐⭐ Important', '⭐ Good to know'] as const

export const STARS: Record<string, string> = {
  '⭐⭐⭐ Essential': '⭐⭐⭐', '⭐⭐ Important': '⭐⭐', '⭐ Good to know': '⭐',
}

export const STAR_CLASS: Record<string, string> = {
  '⭐⭐⭐ Essential': 'c-stars--3', '⭐⭐ Important': 'c-stars--2', '⭐ Good to know': 'c-stars--1',
}
