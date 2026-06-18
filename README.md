# Medi Lexi

**medilexi.vercel.app** · Built by [372dev](https://github.com/372dev)

A multilingual medical terminology reference and study platform for students, medical interpreters, and translators. Combines a structured glossary with interactive learning tools — flashcards and word-part breakdowns.

---

## Who it's for

| Audience | Use case |
|---|---|
| Medical interpreters | Bilingual reference for clinical and healthcare settings |
| Medical students | Build vocabulary across specialties with importance levels |
| Medical translators | Reference tool for written translation of medical documents |

---

## Features

- **1000+ medical terms** — English high/low register, abbreviations, definitions, fields, importance levels
- **Korean glossary & flashcard** — bilingual display, EN↔KO direction toggle
- **Word parts** — 400+ prefixes, roots, and suffixes with etymology and examples
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
| Search | Fuse.js v7 |
| Data | JSON files in `src/data/` |
| Hosting | Vercel — auto-deploys on every push |

---

## Routes

| URL | Page |
|---|---|
| `/` | Landing page |
| `/glossary` | English glossary |
| `/glossary/ko` | Korean–English glossary |
| `/wordparts` | Word parts glossary |
| `/wordparts/flashcard` | Word parts flashcard |
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
