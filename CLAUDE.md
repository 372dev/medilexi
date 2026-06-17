# Medi Lexi — Project Guide

Multilingual medical glossary and study tool for students, medical interpreters & translators.
Repo: github.com/372dev/sage-glossary · Hosted on Vercel (auto-deploy on push)

---

## 1. Tech Stack

| Item | Detail |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | **Global CSS only** — `src/app/globals.css`. No CSS module files. |
| Fonts | Press Start 2P (pixel display), Inter + Noto Sans KR (body) |
| Search | Fuse.js v7 — `threshold: 0.4`, `ignoreLocation: true`, `includeMatches: true` |
| Hosting | Vercel |

---

## 2. Styling Rules

- **Global CSS only** — all styles go in `src/app/globals.css`. Never create `.module.css` files.
- **Press Start 2P minimum: `0.5rem`** — never smaller. Non-negotiable.
- **Day/Night theme** via `body.day` class, persisted in `localStorage('theme')`.
- Toggle is in `layout.tsx` via `toggleMode()` + `isDay` state.

### CSS Tokens

| Variable | Night | Day | Use |
|---|---|---|---|
| `--color-bg` | `#0D0B2B` | `#F0EEF8` | Page background |
| `--color-panel` | `#1A1650` | `#FFFFFF` | Cards, panels |
| `--color-border` | `#2A2280` | `#D0CCF0` | Borders, dividers |
| `--color-gold` | `#F0B429` | `#B45309` | Headings, active states |
| `--color-gold-dim` | `#A07820` | `#D97706` | Muted gold |
| `--color-text` | `#E8E0FF` | `#1A1650` | Primary text |
| `--color-text-dim` | `#8880AA` | `#6B7280` | Secondary text |
| `--color-accent` | `#9B8FEF` | `#6D28D9` | Level-2 borders, toggles, links |

### Key CSS Components

```css
/* Segmented control — used for Mode/Direction/Count in flashcards, def-lang toggle */
.c-toggle { display: inline-flex; border: 1px solid var(--color-border); overflow: hidden; }
.c-toggle__btn { font-family: var(--font-pixel); font-size: 0.5rem; ... }
.c-toggle__btn--active { background: var(--color-gold); color: var(--color-bg); }

/* Sticky filter bar — has ::before to seal gap with header */
.c-filter-bar { position: sticky; top: 57px; ... }
.c-filter-bar::before { content:''; position:absolute; left:0; right:0; top:-10px; height:10px; background:var(--color-bg); }
```

### Word Part Highlight Colors
- Prefix → blue `#3B82F6`
- Root → green `#3BAA6A`
- Suffix → red `#C94040`

---

## 3. Data Architecture

### Current File Versions

| File | Location | Purpose |
|---|---|---|
| `medical_vocab_v1.19.json` | `src/data/` | Base vocab — English + metadata |
| `medical_vocab_ko.json` | `src/data/` | Korean translation layer |
| `medical_wordparts_v1.07.json` | `src/data/` | Word parts master (full schema) |
| `medical_wordparts_simple_v1.07.json` | `src/data/` | Word parts flat file (for web integration) |

- Version format: vocab → `v1.19`, `v1.20`...; wordparts → `v1.07`, `v1.08`...
- When upgrading a data version, update all imports across all pages simultaneously.

### Data Split Pattern

The vocabulary is split across two files merged at runtime by `en_h` key:
- **Base file** — English terms, fields, level, word parts (used for `/glossary`)
- **Language files** — `en_h` match key + translated fields (merged for `/glossary/ko` etc.)

---

## 4. Vocabulary Schema

### Base Entry (`medical_vocab_v1.19.json`)

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

| Field | Description |
|---|---|
| `en_h` | English high register — clinical/formal term. Primary key (unique). |
| `en_l` | English low register — natural patient-facing term (optional) |
| `abbr` | Abbreviation (optional) |
| `f` | Array of medical fields — max 3, most relevant first |
| `d` | English definition — clinically accurate, concise (1–2 sentences) |
| `lvl` | Importance level — exactly one of three strings (see Section 6) |
| `parts` | Word parts — omit key entirely if nothing applies; no empty arrays |

### Korean Language Entry (`medical_vocab_ko.json`)

```json
{
  "en_h": "Hypertension",
  "ko_h": "고혈압",
  "ko_l": "혈압이 높음",
  "d_ko": "지속적으로 높은 동맥 혈압..."
}
```

| Field | Description |
|---|---|
| `en_h` | Match key — must exactly match base entry `en_h` |
| `ko_h` | Korean high register — pure Hangul only, no 한자 |
| `ko_l` | Korean low register (optional) — must differ from `ko_h` |
| `d_ko` | Korean definition — written in natural Korean medical language |

---

## 5. Word Parts Schema

### Master File (`medical_wordparts_v1.07.json`)

```json
{
  "wp": "cardi/o",
  "t": "r",
  "lvl": 3,
  "d": "(Greek) Heart",
  "ex": [
    ["Cardiology", "Study of the heart and its diseases"],
    ["Cardiomegaly", "Abnormal enlargement of the heart"]
  ]
}
```

| Field | Values |
|---|---|
| `wp` | Canonical form — prefix: `hyper-`, root: `cardi/o`, suffix: `-itis` |
| `t` | `"p"` prefix · `"r"` root · `"s"` suffix |
| `lvl` | `1` good to know · `2` frequently used · `3` essential |
| `d` | Short definition prefixed with `(Greek)`, `(Latin)`, etc. |
| `ex` | Exactly **two** `[example word, definition]` pairs — always two |

### Simple File (`medical_wordparts_simple_v1.07.json`)

```json
{ "wp": "aur/o", "t": "r", "d": "Ear (Latin)", "alt": "aur/o, ot/o" }
```

- Used by web pages for word part highlighting on vocab cards
- Combined cards (e.g. `aur/o, ot/o`) are split into individual entries
- `alt` field present only on split entries, points back to original combined form

---

## 6. Content Rules (Summary)

### Fields (31 official)
Anatomy, Anesthesiology, Cardiology, Colorectal Surgery, Critical Care, Dermatology,
Emergency Medicine, Endocrinology, Family Medicine, Gastroenterology, General Medicine,
Hematology, Immunology, Infectious Disease, Internal Medicine, Nephrology, Neurology,
Neurosurgery, OBGYN, Oncology, Ophthalmology, Orthopedics, Otolaryngology, Pathology,
Pediatrics, Pharmacology, Psychiatry, Pulmonology, Radiology, Rehabilitation Medicine,
Rheumatology, Surgery, Urology, Vascular Surgery

- Max **3 fields** per entry · Most relevant field first
- Anatomy terms → `Anatomy` leads · Emergency presentations → `Emergency Medicine` leads
- Drug classes → `Pharmacology` leads

### Importance Levels

| Level | Exact string | Criteria |
|---|---|---|
| Essential | `⭐⭐⭐ Essential` | Must-know in most clinical settings — interpreter cannot function without this |
| Important | `⭐⭐ Important` | Core for a specific specialty — essential when assigned there |
| Good to know | `⭐ Good to know` | Subspecialty or academic — rare in everyday clinical interpretation |

Only these three exact strings are valid. No variations.

### Register Rules
- `en_l` / `ko_l` are independent — one can exist without the other
- High ≠ low register — identical strings → remove low register
- Low register = short, natural, patient-facing (not a description or paraphrase)

### Word Parts Tagging Rules
1. Only use parts that exist in the simple file enum
2. Part's literal form must be **visibly present** in the term's spelling (accounting for connecting vowels `/o`, `/i`, `/e`)
3. Must be a **genuine etymological match** — not coincidental characters
4. Prefixes → word-start only · Suffixes → word-end only · Roots → anywhere
5. Omit `parts` key entirely if nothing applies; no empty arrays allowed
6. Eponyms, French-origin words, pure English compounds → no `parts`
7. Never invent parts not in the enum — suggest adding instead

### Etymology Pairs — Keep SEPARATE (do not merge)
`ot/o` vs `aur/o` · `rhin/o` vs `nas/o` · `gloss/o` vs `lingu/o`
`arthr/o` vs `articul/o` · `gluc/o` vs `glyc/o` · `lip/o` vs `adip/o`

*(Exception: `ocul/o, ophthalm/o` and `odont/o, dent/i` are intentionally merged)*

---

## 7. Page Structure

| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing page (no header, hero image layout) |
| `/glossary` | `src/app/glossary/page.tsx` | English glossary |
| `/glossary/ko` | `src/app/glossary/ko/page.tsx` | Korean glossary (KO IME-safe search) |
| `/wordparts` | `src/app/wordparts/page.tsx` | Word parts glossary |
| `/wordparts/flashcard` | `src/app/wordparts/flashcard/page.tsx` | Word parts flashcard |
| `/flashcards` | `src/app/flashcards/page.tsx` | English vocab flashcard |
| `/flashcards/ko` | `src/app/flashcards/ko/page.tsx` | Korean vocab flashcard |
| `/about` | `src/app/about/page.tsx` | About & Sources |
| `layout.tsx` | `src/app/layout.tsx` | Root layout — header, hero image, theme toggle |

### Layout Notes
- Landing page (`isHome`) uses full-screen flex layout with hero image in `layout.tsx`
- Hero image: `hero.jpg` (night) / `hero-day.png` (day) — toggled by `isDay` state
- Inner pages use 3-column grid: ad | content | ad
- Ad columns are placeholders for future AdSense

### Korean IME Search Pattern
Korean search must use composition events to avoid intermediate jamo triggering Fuse:
```tsx
const [inputValue, setInputValue] = useState('')
const [searchQuery, setSearchQuery] = useState('')
const composingRef = useRef(false)
// onChange: update inputValue; only update searchQuery if !composingRef.current
// onCompositionEnd: set composingRef false, then update both states
```

---

## 8. Workflow Rules

- **Always show draft/proposal before applying any data changes** — no exceptions
- **Never change `ko_h` (or any `[lang]_h`) without explicit confirmation** — high register terms are deliberate clinical decisions
- **Never hallucinate word parts** outside the enum
- Work in batches and confirm each batch:
  - Korean definitions: 10 entries at a time
  - Parts tagging: 50 entries at a time
  - Definition review: 50 entries at a time
- **Claude chat sessions** must only work on data JSON files — never code files
  - After Claude chat: run `git diff --stat`, restore any code files touched with `git restore`

---

## 9. Roadmap

### Completed ✅
- English Glossary (`/glossary`)
- Korean Glossary (`/glossary/ko`) with KO IME search
- Word Parts Glossary + Flashcard (`/wordparts`, `/wordparts/flashcard`)
- English Flashcard (`/flashcards`)
- Korean Flashcard (`/flashcards/ko`)
- Landing page with day/night hero image
- Field badge → clickable filter on glossary pages
- About page (`/about`)

### Pending
| Milestone | Task |
|---|---|
| Content | English definition rewrites (~774 remaining — Claude chat) |
| Content | Korean `d_ko` translation (587/998 complete) |
| Content | Word parts tagging entries 251+ |
| UI | Google Form feedback link in `/about` (URL needed) |
| UI | Site icon redesign |
| UI | Card sort control (deferred) |
| UI | Card expand animation (deferred) |
| Milestone 3 | Quiz mode (multiple choice) |
| Milestone 4 | Content expansion to 1,000 entries |
| Milestone 5 | French language layer |
| Milestone 5 | Japanese language layer |
| Milestone 7 | AdSense integration |
