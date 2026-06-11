# Sage's Medical Glossary

**sm-glossary.vercel.app** · Built by [372dev](https://github.com/372dev)

A bilingual medical reference tool designed for **medical interpreters**, **nursing students**, and **medical students**. Built to grow — starting with English and Korean, with Japanese and other languages planned.

---

## What it is

Sage's Medical Glossary is a searchable, filterable reference for medical terminology. Every entry includes:

- **English** high register (clinical) and low register (patient-facing) terms
- **Korean** high register (한국어 임상 용어) and low register (환자 언어)
- **Abbreviation** where applicable
- **Definition** — clinically accurate, concise
- **Medical field(s)** — up to 3 per term
- **Importance level** — ⭐⭐⭐ Essential / ⭐⭐ Important / ⭐ Good to know
- **Word parts** — prefix, root, and suffix breakdown with meanings (shown on hover)

---

## Who it's for

| Audience | Use case |
|---|---|
| Medical interpreters | Quick bilingual reference during or before clinical encounters |
| Nursing students | Build vocabulary across specialties with importance levels as a study guide |
| Medical students | Learn word etymology and clinical terminology in context |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules |
| Data | JSON (see Data Architecture below) |
| Hosting | Vercel — auto-deploys on every GitHub push |
| Repo | github.com/372dev/sage-glossary |

---

## Data Architecture

The glossary uses a **modular data structure** — one base file per language pair:

| File | Contents |
|---|---|
| `medical_vocab_base.json` | English terms, definitions, fields, levels, word parts (429 entries) |
| `medical_vocab_ko.json` | Korean layer — `en_h` (key), `ko_h`, `ko_l`, `d_ko` |
| `medical_wordparts_simple_v1.05.json` | 368 word parts — prefixes, roots, suffixes with meanings |

The Korean glossary merges base + ko at render time by matching `en_h`.

Adding a new language = one new file (e.g. `medical_vocab_jp.json`), no changes to base data.

### Vocabulary entry schema (base)
```json
{
  "en_h": "Hypertension",
  "en_l": "High blood pressure",
  "abbr": "HTN",
  "f": ["Family Medicine", "Cardiology", "Internal Medicine"],
  "d": "Persistently elevated arterial blood pressure...",
  "lvl": "⭐⭐⭐ Essential",
  "parts": { "p": ["hyper-"], "r": ["ten/o"] }
}
```

### Language layer schema (e.g. ko)
```json
{
  "en_h": "Hypertension",
  "ko_h": "고혈압",
  "ko_l": "혈압이 높음",
  "d_ko": "지속적으로 높은 동맥 혈압..."
}
```

---

## Routes

| URL | Page |
|---|---|
| `/` | Landing page — language × tool hub |
| `/glossary` | English glossary |
| `/glossary/ko` | Korean–English glossary |
| `/flashcards` | *(coming soon)* |
| `/glossary/jp` | *(planned)* |

---

## Roadmap

- [x] Landing page (language × tool hub)
- [x] English Glossary (search, filter, word part highlights)
- [x] Korean–English Glossary
- [ ] Korean definition translations (in progress — batches of 30)
- [ ] Flashcard mode (EN/KO flip cards, filtered by field and level)
- [ ] Blog
- [ ] Japanese support
- [ ] Additional language pairs
- [ ] AdSense integration

---

## Local development

```bash
git clone https://github.com/372dev/sage-glossary
cd sage-glossary
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## License

© 2026 SageMed · All rights reserved
