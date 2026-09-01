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
  'nav.wordparts':     { en: 'Word parts',    ko: '어원' },
  'nav.glossary':      { en: 'Glossary',      ko: '사전' },
  'nav.abbreviations': { en: 'Abbreviations', ko: '약어' },
  'nav.about':         { en: 'About',         ko: '소개' },
  'nav.feedback':      { en: 'Send feedback', ko: '신고' },
  'nav.menu':          { en: 'Menu',          ko: '메뉴' },
  'common.soon':       { en: 'soon',          ko: '준비 중' },
  'common.close':      { en: 'Close',         ko: '닫기' },

  // Word-part types (badges, sheet, term page)
  'parts.prefix': { en: 'Prefix', ko: '접두사' },
  'parts.root':   { en: 'Root',   ko: '어근' },
  'parts.suffix': { en: 'Suffix', ko: '접미사' },

  // Mobile word-parts sheet
  'sheet.alsoCalled': { en: 'Also called',    ko: '다른 이름:' },
  'sheet.seeFull':    { en: 'See full entry',  ko: '전체 항목 보기' },

  // Term page. "More in <Field>" wraps the (English) field name; Korean puts the
  // suffix after it ("Cardiology 더 보기").
  'term.moreInPre':  { en: 'More in ', ko: '' },
  'term.moreInPost': { en: '',         ko: ' 더 보기' },

  // Level labels (from vocab-constants LVL_TEXT)
  'lvl.3':   { en: 'Essential',    ko: '필수' },
  'lvl.2':   { en: 'Important',    ko: '중요' },
  'lvl.1':   { en: 'Good to know', ko: '알아두면 좋음' },
  'lvl.all': { en: 'All levels',   ko: '전체' },

  // Filters
  'filter.allFields': { en: 'All fields', ko: '모든 분야' },
  'filter.filters':   { en: 'Filters',    ko: '필터' },

  // Glossary page
  'gloss.searchAria':        { en: 'Search medical terms',              ko: '의학 용어 검색' },
  'gloss.searchPlaceholder':   { en: 'Search terms and abbreviations...', ko: '용어 및 약어 검색...' },
  'gloss.searchPlaceholderKo': { en: 'Search terms in English or Korean...', ko: '영어 또는 한국어로 검색...' },
  'gloss.searchPlaceholderFr': { en: 'Search terms in French or English...', ko: '프랑스어 또는 영어로 검색...' },
  'gloss.searchAriaKo':      { en: 'Search medical terms in English or Korean', ko: '영어 또는 한국어로 의학 용어 검색' },
  'gloss.searchAriaFr':      { en: 'Search medical terms in French or English', ko: '프랑스어 또는 영어로 의학 용어 검색' },
  'gloss.specialtyAria':     { en: 'Filter by specialty',               ko: '분야별 필터' },
  'gloss.definition':        { en: 'Definition',                        ko: '정의' },
  'gloss.langKorean':        { en: 'Korean',                            ko: '한국어' },
  'gloss.langEnglish':       { en: 'English',                           ko: '영어' },
  'gloss.langFrench':        { en: 'French',                            ko: '프랑스어' },
  'gloss.flashcard':         { en: 'Flashcard',                         ko: '플래시카드' },
  // Count unit — rendered right after the number with no separator in JSX, so
  // the English value carries a leading space ("1274 terms") while Korean stays
  // tight ("1274개").
  'gloss.terms':             { en: ' terms',                            ko: '개' },
  'gloss.browseAZ':          { en: 'Browse all A–Z',                    ko: '전체 A–Z 보기' },
  'gloss.noResults':         { en: 'No terms found.',                   ko: '검색 결과가 없습니다.' },
  // No-exact banner wraps the query: <pre>{query}<post>.
  'gloss.noExactPre':        { en: 'No exact match for “',              ko: '“' },
  'gloss.noExactPost':       { en: '”. Showing related terms.',         ko: '”에 대한 정확한 일치 항목이 없습니다. 관련 용어를 표시합니다.' },

  // ── Flashcards ──
  'fc.setup':           { en: 'Flashcard setup',   ko: '플래시카드 설정' },
  'fc.mode':            { en: 'Mode',              ko: '모드' },
  'fc.study':           { en: 'Study',             ko: '학습' },
  'fc.quiz':            { en: 'Quiz',              ko: '퀴즈' },
  'fc.direction':       { en: 'Direction',         ko: '방향' },
  'fc.level':           { en: 'Level',             ko: '레벨' },
  'fc.all':             { en: 'All',               ko: '전체' },
  'fc.specialty':       { en: 'Specialty',         ko: '분야' },
  'fc.allSpecialties':  { en: 'All specialties',   ko: '모든 분야' },
  'fc.cardsPerSession': { en: 'Cards per session', ko: '세션당 카드 수' },
  'fc.cardsSelected':   { en: 'cards selected',    ko: '개 선택됨' },
  // "random from N" — Korean puts the phrase after the number ("120개 중 무작위").
  'fc.randomFromPre':   { en: 'random from ',      ko: '' },
  'fc.randomFromPost':  { en: '',                  ko: '개 중 무작위' },
  'fc.start':           { en: 'Start',             ko: '시작' },
  'fc.backGlossary':    { en: 'Back to Glossary',  ko: '사전으로 돌아가기' },
  'fc.backMain':        { en: 'Back to Main',      ko: '메인으로 돌아가기' },
  'fc.sessionSettings': { en: 'Session settings',  ko: '세션 설정' },
  'fc.orTapReveal':     { en: 'or tap to reveal',  ko: '또는 탭하여 보기' },
  'fc.prev':            { en: 'Prev',              ko: '이전' },
  'fc.next':            { en: 'Next',              ko: '다음' },
  'fc.review':          { en: 'Review',            ko: '몰라요' },
  'fc.knowIt':          { en: 'Know it',           ko: '알아요' },
  'fc.remaining':       { en: 'remaining',         ko: '남음' },
  'fc.known':           { en: 'known',             ko: '아는 것' },
  'fc.missed':          { en: 'missed',            ko: '모르는 것' },
  'fc.perfect':         { en: 'Perfect! All cards known.', ko: '완벽해요! 모든 카드를 익혔어요.' },
  'fc.greatJob':        { en: 'Great job!',        ko: '잘했어요!' },
  'fc.keepPracticing':  { en: 'Keep practicing!',  ko: '계속 연습하세요!' },
  'fc.reviewList':      { en: 'Review list',       ko: '복습 목록' },
  'fc.retry':           { en: 'Retry',             ko: '다시 하기' },
  'fc.startOver':       { en: 'Start over',        ko: '다시 시작' },
  'fc.newSession':      { en: 'New session',       ko: '새 세션' },
  'fc.allDone':         { en: 'All done',          ko: '완료' },
  // "N cards reviewed." — Korean after the number ("40개 카드를 복습했어요").
  'fc.cardsReviewed':   { en: ' cards reviewed.',  ko: '개 카드를 복습했어요.' },
  // Keyboard hint fragments (desktop fine print)
  'fc.browseFreely':    { en: 'Browse freely.',    ko: '자유롭게 살펴보세요.' },
  'fc.markEachCard':    { en: 'Mark each card.',   ko: '각 카드를 표시하세요.' },
  'fc.toFlip':          { en: 'to flip',           ko: '뒤집기' },
  'fc.toNavigate':      { en: 'to navigate',       ko: '이동' },
  'fc.flip':            { en: 'flip',              ko: '뒤집기' },
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

/** A localized text node usable from SERVER components (e.g. the static term
   page). It renders English on the server, then this small client island swaps
   to the saved locale on hydration — the same behavior as the rest of the UI. */
export function Tr({ k }: { k: MsgKey }) {
  const t = useT()
  return <>{t(k)}</>
}

/** Returns a `t(key)` lookup bound to the current locale, English as fallback. */
export function useT() {
  const { locale } = useContext(LocaleCtx)
  return (key: MsgKey): string => {
    const entry = MESSAGES[key]
    return entry[locale] || entry.en
  }
}
