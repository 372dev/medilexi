// Route → page title. Shared by the server layout (metadata + document title)
// and the client shell (header title) so the two never drift.
export const PAGE_TITLES: Record<string, string> = {
  '/glossary':            'English Glossary',
  '/terms':               'All Terms A–Z',
  '/glossary/ko':         'Korean Glossary',
  '/glossary/fr':         'French Glossary',
  '/wordparts':           'Medical Word Parts',
  '/wordparts/flashcard': 'Word Parts Flashcard',
  '/wordparts/quiz':      'Word Parts Quiz',
  '/wordparts/exam':      'Word Parts Exam',
  '/flashcards':          'English Flashcard',
  '/flashcards/ko':       'Korean Flashcard',
  '/flashcards/abbr':     'Abbreviation Flashcard',
  '/flashcards/fr':       'French Flashcard',
  '/about':               'About',
  '/privacy':             'Privacy Policy',
}
