'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/* UI localization (i18n) for the site chrome — nav, buttons, filter labels,
   level names, and other static text. This is separate from the glossary DATA:
   the medical terms/definitions keep their own EN/KO/FR entries. This layer only
   swaps the interface language IN PLACE (no route change) so a reader can keep
   the page they are on and read the controls in their language.

   Languages ship one at a time (Korean first). Add a language by filling its
   column in MESSAGES; a missing value falls back to English so a half-translated
   language never renders a blank. */

export type Locale = 'en' | 'ko'

export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ko', label: '한국어', short: '한' },
]

type Entry = { en: string; ko: string }

// The string catalog. One key per piece of UI text; each key carries every
// language. Keep keys grouped by area (nav.*, lvl.*, filter.*, …).
export const MESSAGES = {
  // Header / nav
  'nav.wordparts':     { en: 'Word parts',    ko: '단어 구성' },
  'nav.glossary':      { en: 'Glossary',      ko: '용어집' },
  'nav.abbreviations': { en: 'Abbreviations', ko: '약어' },
  'nav.about':         { en: 'About',         ko: '소개' },
  'nav.feedback':      { en: 'Send feedback', ko: '의견 보내기' },
  'nav.menu':          { en: 'Menu',          ko: '메뉴' },
  'common.soon':       { en: 'soon',          ko: '준비 중' },

  // Level labels (from vocab-constants LVL_TEXT)
  'lvl.3':   { en: 'Essential',    ko: '필수' },
  'lvl.2':   { en: 'Important',    ko: '중요' },
  'lvl.1':   { en: 'Good to know', ko: '알아두면 좋음' },
  'lvl.all': { en: 'All levels',   ko: '모든 수준' },

  // Filters
  'filter.allFields': { en: 'All fields', ko: '모든 분야' },
  'filter.filters':   { en: 'Filters',    ko: '필터' },
} satisfies Record<string, Entry>

export type MsgKey = keyof typeof MESSAGES

const LocaleCtx = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: 'en',
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Always render 'en' on the server and the first client paint so hydration
  // matches; the saved locale is applied in the effect below. A reader who
  // toggles the language sees it change instantly (client state), which is the
  // common case; only a hard refresh with a non-English locale saved shows a
  // brief English flash first.
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('locale')
      if (saved === 'ko' || saved === 'en') {
        setLocaleState(saved)
        document.documentElement.lang = saved
      }
    } catch {}
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    try { localStorage.setItem('locale', l) } catch {}
    try { document.documentElement.lang = l } catch {}
  }

  return <LocaleCtx.Provider value={{ locale, setLocale }}>{children}</LocaleCtx.Provider>
}

export function useLocale() {
  return useContext(LocaleCtx)
}

/** Returns a `t(key)` lookup bound to the current locale, English as fallback. */
export function useT() {
  const { locale } = useContext(LocaleCtx)
  return (key: MsgKey): string => {
    const entry = MESSAGES[key]
    return entry[locale] || entry.en
  }
}
