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
  'common.ok':         { en: 'OK',            ko: '확인' },

  // App shell — tooltips / aria, footer, cookie bar, skip link
  'shell.home':          { en: 'Inter Lexi home',        ko: 'Inter Lexi 홈' },
  'shell.language':      { en: 'Language',               ko: '언어' },
  'shell.changeLang':    { en: 'Change language',        ko: '언어 변경' },
  'shell.toNight':       { en: 'Switch to night mode',   ko: '야간 모드로 전환' },
  'shell.toDay':         { en: 'Switch to day mode',     ko: '주간 모드로 전환' },
  'shell.skip':          { en: 'Skip to content',        ko: '본문으로 건너뛰기' },
  'shell.disclaimer':    { en: '⚕ For educational purposes only · Not a substitute for professional medical advice, diagnosis, or treatment · Content is based on standard medical terminology references and may not reflect the latest clinical guidelines',
                           ko: '⚕ 교육 목적으로만 제공됩니다 · 전문적인 의학적 조언, 진단 또는 치료를 대체하지 않습니다 · 표준 의학 용어 참고 자료를 기반으로 하며 최신 임상 지침을 반영하지 않을 수 있습니다' },
  'shell.aboutSources':  { en: 'About & Sources',        ko: '소개 및 출처' },
  'shell.privacy':       { en: 'Privacy Policy',         ko: '개인정보 처리방침' },
  'shell.copyright':     { en: '© 2026 Medi Lexi · All rights reserved', ko: '© 2026 Medi Lexi · 모든 권리 보유' },
  'shell.cookieText':    { en: 'This site uses cookies for analytics.', ko: '이 사이트는 분석을 위해 쿠키를 사용합니다.' },
  'shell.learnMore':     { en: 'Learn more',             ko: '자세히 보기' },

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
  'fc.dirAbbrTerm':     { en: 'Abbr → Term',       ko: '약어 → 용어' },
  'fc.dirTermAbbr':     { en: 'Term → Abbr',       ko: '용어 → 약어' },
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
  'fc.backGlossaryKo':  { en: 'Back to Korean Glossary', ko: '한국어 사전으로 돌아가기' },
  'fc.backGlossaryFr':  { en: 'Back to French Glossary', ko: '프랑스어 사전으로 돌아가기' },
  'fc.backWordParts':   { en: 'Back to Word Parts', ko: '어원으로 돌아가기' },
  'fc.type':            { en: 'Type',              ko: '유형' },
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

  // ── Landing (/medical) ──
  'home.eyebrow':   { en: 'For students, interpreters & translators', ko: '학생, 통역사, 번역가를 위한' },
  'home.h1':        { en: 'The chart says one thing. The patient says another.', ko: '의료 용어와 환자 언어는 다릅니다' },
  'home.subtitle':  { en: 'Medi Lexi gives you both: the clinical term, its abbreviation, and the everyday word people actually use, across languages.',
                      ko: 'Medi Lexi는 임상 용어, 약어, 그리고 환자들이 실제로 쓰는 표현까지 다양한 언어로 제공합니다.' },
  'home.startHere': { en: 'Start here',            ko: '여기서 시작하세요' },
  'home.wpEntries': { en: '600+ entries',          ko: '600+ 항목' },
  'home.wpTitle':   { en: 'Prefix · Root · Suffix', ko: '접두사 · 어근 · 접미사' },
  // Word-parts explanation, interleaved with colored morphemes (brady / card / -ia / bradycardia).
  'home.wpBodyPre': { en: 'See that ', ko: '' },
  'home.wpBody1':   { en: ' means slow, ',  ko: '는 느림, ' },
  'home.wpBody2':   { en: ' heart, and ',   ko: '는 심장, ' },
  'home.wpBody3':   { en: ' a condition, and ', ko: '는 상태를 뜻하고, ' },
  'home.wpBody4':   { en: ' falls into place as a slow heart rate. Learn the parts, and the next unfamiliar term is already half-decoded.',
                      ko: '는 느린 심박수로 자연스럽게 이해됩니다. 구성 요소를 익히면 다음 낯선 용어는 이미 절반은 해독된 셈입니다.' },
  'home.pickLang':     { en: 'Then pick a language', ko: '언어를 선택하세요' },
  'home.mostComplete': { en: 'most complete',    ko: '가장 완성도 높음' },
  'home.forExample':   { en: 'For example',      ko: '예시' },
  'home.willInclude':  { en: 'Will include',     ko: '포함 예정' },
  'home.comingSoon':   { en: 'Coming soon',      ko: '출시 예정' },
  'home.wpPractice':   { en: 'Practice',         ko: '연습' },
  'home.wpExam':       { en: 'Exam ✦',           ko: '시험 ✦' },
  // Deck tags (EN kept as today; KO added)
  'home.tagEnglish': { en: 'English',       ko: '영어' },
  'home.tagAbbr':    { en: 'Abbreviations', ko: '약어' },
  'home.tagKorean':  { en: '한국어',         ko: '한국어' },
  'home.tagFrench':  { en: 'Français',      ko: '프랑스어' },
  'home.tagSpanish': { en: 'Español',       ko: '스페인어' },
  // Deck titles
  'home.titleEnglish': { en: 'English',           ko: '영어' },
  'home.titleAbbr':    { en: 'Medical Abbr',      ko: '의학 약어' },
  'home.titleKorean':  { en: 'Korean ↔ English',  ko: '한국어 ↔ 영어' },
  'home.titleFrench':  { en: 'French ↔ English',  ko: '프랑스어 ↔ 영어' },
  'home.titleSpanish': { en: 'Spanish ↔ English', ko: '스페인어 ↔ 영어' },
  // Deck notes
  'home.noteEn':        { en: '1,900+ clinical terms',        ko: '1,900+ 임상 용어' },
  'home.noteAbbr':      { en: '200+ · Abbr to Term',          ko: '200+ · 약어에서 용어로' },
  'home.noteBilingual': { en: 'Bilingual glossary + flashcards', ko: '이중 언어 사전 + 플래시카드' },
  'home.ctaStart':  { en: 'Start with word parts', ko: '어원부터 시작하기' },
  'home.heroHint':  { en: 'Hover any part of the word to see what it means.', ko: '단어의 각 부분을 눌러 뜻을 확인하세요.' },
  'home.heroSay':   { en: 'What people actually say', ko: '사람들이 실제로 쓰는 표현' },

  // ── Word Parts glossary ──
  'wp.searchAria':        { en: 'Search word parts',              ko: '어원 검색' },
  'wp.searchPlaceholder': { en: 'Search word parts and meanings...', ko: '어원과 의미 검색...' },
  'wp.entry':   { en: ' entry',   ko: '개' },
  'wp.entries': { en: ' entries', ko: '개' },
  'wp.more':    { en: ' more',    ko: '개 더' },

  // ── Word Parts practice (quiz) ──
  'quiz.instruction1':  { en: 'What does this mean?',        ko: '이것은 무슨 뜻일까요?' },
  'quiz.instruction2':  { en: 'Which word part means this?', ko: '이 뜻을 가진 어원은?' },
  'quiz.loading':       { en: 'Loading practice…',           ko: '연습 불러오는 중…' },
  'quiz.answered':      { en: 'Answered ',                   ko: '답변 ' },
  'quiz.retryMode':     { en: 'Retry ',                      ko: '재시도 ' },
  'quiz.endSession':    { en: 'End session',                 ko: '세션 종료' },
  'quiz.summaryNone':   { en: 'No questions answered yet.',  ko: '아직 답변한 문제가 없습니다.' },
  'quiz.summaryPerfect':{ en: 'Perfect! Every one right.',   ko: '완벽해요! 모두 맞혔어요.' },
  'quiz.summaryGreat':  { en: 'Great session!',              ko: '훌륭한 세션이었어요!' },
  'quiz.missed':        { en: 'Missed',                      ko: '틀린 문제' },
  'quiz.newPractice':   { en: 'New practice',                ko: '새 연습' },

  // ── Word Parts exam ──
  // Intro paragraph, wrapping EXAM_MINUTES, an emphasized "flag", and PASS_PCT.
  'exam.introPre':  { en: 'Curated 20-question exams, ', ko: '엄선된 20문항 시험, 각 ' },
  'exam.introMid':  { en: ' minutes each. You can move between questions, and', ko: '분씩 진행됩니다. 문제 사이를 자유롭게 이동할 수 있고, 끝내기 전에 다시 볼 문제를' },
  'exam.introFlag': { en: ' flag', ko: ' 플래그' },
  'exam.introMid2': { en: ' any question you want to come back to before you finish. Your score and the correct answers stay hidden until you submit. Pass mark ',
                      ko: ' 표시해 둘 수 있습니다. 점수와 정답은 제출 전까지 공개되지 않습니다. 합격 기준 ' },
  'exam.introPost': { en: '%.', ko: '%.' },
  'exam.qCount':     { en: '20 questions',   ko: '20문항' },
  'exam.last':       { en: ' · last: ',      ko: ' · 최근: ' },
  'exam.retake':     { en: 'Retake',         ko: '재시험' },
  'exam.loadError':  { en: 'Could not load the exam. Please try again.', ko: '시험을 불러오지 못했습니다. 다시 시도해 주세요.' },
  'exam.allExams':   { en: 'All exams',      ko: '모든 시험' },
  'exam.loadingExam':{ en: 'Loading exam…',  ko: '시험 불러오는 중…' },
  'exam.preparing':  { en: 'Preparing…',     ko: '준비 중…' },
  'exam.scoring':    { en: 'Scoring…',       ko: '채점 중…' },
  'exam.passPre':    { en: 'PASS · ',        ko: '합격 · ' },
  'exam.passPost':   { en: '% or above',     ko: '% 이상' },
  'exam.failPre':    { en: 'FAIL · you need ', ko: '불합격 · 합격하려면 ' },
  'exam.failPost':   { en: '% to pass',      ko: '% 필요' },
  'exam.resultSaved':{ en: ' · result saved (a retake replaces it)', ko: ' · 결과 저장됨 (재시험 시 대체됨)' },
  'exam.correct':    { en: 'Correct: ',      ko: '정답: ' },
  'exam.yourAnswer': { en: 'Your answer: ',  ko: '내 답: ' },
  'exam.notAnswered':{ en: '(not answered)', ko: '(미응답)' },
  'exam.answeredSuffix': { en: ' answered',  ko: ' 응답' },
  'exam.questionPre': { en: 'Question ',     ko: '문제 ' },
  'exam.questionOf':  { en: ' of ',          ko: ' / ' },
  'exam.flagTitle':  { en: 'Flag this question so you can come back to it before you submit', ko: '제출 전에 다시 볼 수 있도록 이 문제에 플래그를 표시하세요' },
  'exam.flagged':      { en: '⚑ Flagged',        ko: '⚑ 플래그됨' },
  'exam.flagForReview':{ en: '⚑ Flag for review', ko: '⚑ 다시 볼 문제 표시' },
  'exam.submit':     { en: 'Submit exam',    ko: '시험 제출' },
  'exam.submitNowPre':  { en: 'Submit now (', ko: '지금 제출 (' },
  'exam.submitNowPost': { en: ' answered)',   ko: ' 응답)' },
  'exam.notAnsweredLabel': { en: 'not answered',       ko: '미응답' },
  'exam.answeredLabel':    { en: 'answered',           ko: '응답함' },
  'exam.flaggedLabel':     { en: 'flagged for review', ko: '다시 볼 문제' },
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
