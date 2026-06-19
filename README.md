# Medi Lexi

**v1.20** · [medilexi.vercel.app](https://medilexi.vercel.app) · Built by [372dev](https://github.com/372dev)

A multilingual medical terminology reference and study platform for students, medical interpreters, and translators. Combines a structured glossary with interactive learning tools — flashcards and word-part breakdowns.

---

## Version history

| Version | Notes |
|---|---|
| v1.20 | Jamo-level Korean fuzzy search · word parts expanded to 4 examples each · click-to-expand cards · UI accuracy pass |
| v1.19 | Korean glossary & flashcard · word parts glossary & flashcard · EN↔KO direction toggle |

---

## Who it's for

| Audience | Use case |
|---|---|
| Medical interpreters | Bilingual reference for clinical and healthcare settings |
| Medical students | Build vocabulary across specialties with importance levels |
| Medical translators | Reference tool for written translation of medical documents |

---

## Features

- **999 medical terms** — English high/low register, abbreviations, definitions, fields, importance levels
- **Korean glossary & flashcard** — bilingual display, EN↔KO direction toggle, Jamo-level fuzzy search (초성 shortcut)
- **Word parts** — 408 prefixes, roots, and suffixes with 4 examples each, click-to-expand cards
- **Flashcard modes** — Study (free navigation) and Quiz (mark known/missed, retry missed cards)
- **Day / Night theme**
- **Fuse.js search** — fuzzy, field-filtered, IME-safe for Korean

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Global CSS (`src/app/globals.css`) |
| Search | Fuse.js v7 + custom Hangul jamo decomposition |
| Data | JSON files in `src/data/` |
| Hosting | Vercel — auto-deploys on every push |

---

## Data files

| File | Purpose |
|---|---|
| `src/data/medical_vocab.json` | Base vocab — 999 English terms + metadata |
| `src/data/medical_vocab_ko.json` | Korean translation layer |
| `src/data/medical_wordparts.json` | Word parts master (lvl + 4 examples each) |
| `src/data/medical_wordparts_simple.json` | Word parts flat file (used by glossary highlight) |

---

## Routes

| URL | Page |
|---|---|
| `/` | Landing page |
| `/glossary` | English glossary |
| `/glossary/ko` | Korean–English glossary |
| `/wordparts` | Word parts glossary |
| `/wordparts/flashcard` | Word parts flashcard |
| `/wordparts/quiz` | Word parts quiz |
| `/flashcards` | English vocab flashcard |
| `/flashcards/ko` | Korean vocab flashcard |
| `/about` | About & Sources |

---

## Local development

```bash
git clone https://github.com/372dev/medilexi
cd medilexi
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## License

© 2026 Medi Lexi · All rights reserved
