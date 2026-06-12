# Sage's Medical Glossary

**sm-glossary.vercel.app** · Built by [372dev](https://github.com/372dev)

A bilingual English–Korean medical reference tool designed for **medical interpreters**, **nursing students**, and **medical students**. Clean, fast, and built to grow.

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
| Data | JSON (medical_vocab_v1.18.json, medical_wordparts_simple_v1.05.json) |
| Hosting | Vercel |
| Repo | github.com/372dev/sage-glossary |

---

## Data

### Vocabulary (`medical_vocab_v1.18.json`)
- **398 entries** across **30 medical fields**
- Schema: `en_h`, `en_l`, `abbr`, `ko_h`, `ko_l`, `f`, `d`, `lvl`, `parts`
- Curated manually with clinical accuracy review

### Word Parts (`medical_wordparts_simple_v1.05.json`)
- **368 entries** — prefixes, roots, suffixes
- Schema: `wp`, `t`, `d` (and `alt` for merged-origin entries)
- Used to generate inline etymology highlights on glossary cards

---

## Roadmap

- [x] Landing page (hub with language × tool grid)
- [x] English Glossary (search, filter, word part highlights)
- [ ] Korean Glossary
- [ ] Flashcard mode (EN/KO flip cards, filtered by field and level)
- [ ] Blog
- [ ] Japanese support
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
