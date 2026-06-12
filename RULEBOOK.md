# SageMed Glossary — Development Rulebook

This file documents all conventions, schema definitions, and editorial rules for the SageMed Glossary project. It is the single source of truth for data curation and development decisions.

---

## 1. Vocabulary Schema

**File:** `src/data/medical_vocab_v1.18.json`

```json
{
  "en_h": "Hypertension",
  "en_l": "High blood pressure",
  "abbr": "HTN",
  "ko_h": "고혈압",
  "ko_l": "혈압이 높음",
  "f": ["Family Medicine", "Cardiology", "Internal Medicine"],
  "d": "Persistently elevated arterial blood pressure...",
  "lvl": "⭐⭐⭐ Essential",
  "parts": { "p": ["hyper-"], "r": [], "s": [] }
}
```

| Field | Description |
|---|---|
| `en_h` | English high register — clinical/formal term |
| `en_l` | English low register — natural patient-facing term (optional) |
| `abbr` | Abbreviation (optional) |
| `ko_h` | Korean high register — pure Hangul only, no 한자 |
| `ko_l` | Korean low register — optional, must differ from ko_h |
| `f` | Array of medical fields — max 3, most relevant first |
| `d` | Definition — clinically accurate, concise |
| `lvl` | Importance level — see section 4 |
| `parts` | Word parts — see section 5 (omit key entirely if nothing applies) |

---

## 2. Register Rules

- `en_l` and `ko_l` are **independent** — one can exist without the other
- Within the same language, **high ≠ low** register — identical strings → remove low register
- Low register = short, natural, actually used by patients/laypeople (e.g. "Heart attack" not "Cardiac muscle ischemic event")
- Low register is NOT a description or paraphrase
- If `ko_h` is already the natural everyday term → no `ko_l` needed

---

## 3. Fields

**30 official fields:**
Anesthesiology, Cardiology, Colorectal Surgery, Critical Care, Dermatology,
Emergency Medicine, Endocrinology, Family Medicine, Gastroenterology,
General Medicine, Hematology, Immunology, Infectious Disease, Internal Medicine,
Nephrology, Neurology, Neurosurgery, OBGYN, Oncology, Ophthalmology,
Orthopedics, Otolaryngology, Pathology, Pediatrics, Pharmacology, Psychiatry,
Pulmonology, Radiology, Rehabilitation Medicine, Rheumatology, Surgery, Urology,
Vascular Surgery

**Rules:**
- Max **3 fields** per entry
- **Most relevant field first**
- `General Medicine` and `Family Medicine` are meta-categories for cross-specialty terms
- Anatomy terms → `General Medicine` leads
- Acute/emergency presentations → `Emergency Medicine` leads
- Drug classes → `Pharmacology` leads
- Specialty names as vocab entries → that specialty leads

---

## 4. Importance Levels

| Level | String | Criteria | Target % |
|---|---|---|---|
| Essential | `⭐⭐⭐ Essential` | Universal — any clinical setting, missing = real risk | ~22% |
| Important | `⭐⭐ Important` | Specialty-core, common in rotations and clinical encounters | ~74% |
| Good to know | `⭐ Good to know` | Subspecialty, advanced, lower frequency | ~4% |

Only three valid strings — no variations allowed.

---

## 5. Word Parts

**File:** `src/data/medical_wordparts_simple_v1.05.json`

```json
{ "wp": "cardi/o", "t": "r", "d": "heart" }
```

| Field | Values |
|---|---|
| `wp` | Canonical form (e.g. `hyper-`, `cardi/o`, `-itis`) |
| `t` | `p` (prefix), `r` (root), `s` (suffix) |
| `d` | Short meaning |
| `alt` | Original merged card label (on split entries only) |

**Vocab `parts` sub-schema:**
```json
"parts": {
  "p": ["hyper-"],
  "r": ["cardi/o"],
  "s": ["-itis"]
}
```
- Only include keys (`p`, `r`, `s`) that have values
- Omit `parts` key entirely if no parts apply
- Empty array `[]` is not allowed — omit the key instead

**Tagging rules:**
1. Only use parts that exist in the enum (`medical_wordparts_simple_v1.05.json`)
2. The literal form of the part must be **visibly present** in the term's spelling (accounting for connecting vowels `/o`, `/i`, `/e`)
3. Must be a **genuine etymological match** — not a coincidental character match
4. **Prefixes** → word-start only; **Suffixes** → word-end only; **Roots** → anywhere
5. Connecting vowels may vary (`cardi/o` matches "cardi" in "Cardiology", "Myocardial")
6. Verify uncertain cases against etymology references before tagging
7. **Never** invent parts not in the enum — suggest adding to enum instead
8. Eponyms (Alzheimer's, Parkinson's, Crohn's) → no `parts`
9. French-origin words, pure English compounds, abbreviations used as terms → no `parts`
10. If a new part is clearly medical and used in 3+ terms → suggest adding to enum with example words

**Etymology pairs kept separate** (not merged):
`ot/o` vs `aur/o`, `nas/o` vs `rhin/o`, `gloss/o` vs `lingu/o`,
`arthr/o` vs `articul/o`, `gluc/o` vs `glyc/o`, `lip/o` vs `adip/o`

---

## 6. Korean Rules

- Pure Hangul only — no Chinese characters (한자), no Latin mixed in
- `ko_h` must be the standard clinical Korean term
- `ko_l` must be short and natural — the word a patient would actually say
- `ko_h` and `ko_l` must not be identical strings
- Long descriptive ko_l (>15 characters) → review and shorten or remove
- Typos found and fixed: 인순린→인슐린, 파시성→파종성

---

## 7. Definitions

- Clinically accurate — verified against medical references
- Concise — one to two sentences
- Not scoped to a single specialty context (e.g. don't scope a general term to stroke-only)
- Use current clinical definitions (e.g. Sepsis-3 criteria, not SIRS)
- Anatomy definitions should name the organ's function, not just its location
- No informal language

---

## 8. Duplicate Rules

- No duplicate `en_h` entries
- When merging duplicates: keep most clinically accurate definition + most useful fields + shortest natural low register
- Always show draft before applying any data changes

---

## 9. General Development Rules

- Always show draft/proposal before applying any data changes
- Never hallucinate word parts outside the enum
- Version format: vocab = `v1.18`, `v1.19`...; wordparts = `wordparts_simple_v1.05`+
- Data files live in `src/data/`
- Hero image lives in `public/images/hero.jpg`
- Parts tagging: work in batches of 50, confirm each batch before applying
- Korean review: work in batches of 30, confirm each batch before applying
- Field review: work in batches of 50, confirm each batch before applying
- Definition review: work in batches of 50, flag suspect definitions, confirm before applying

---

## 10. Web Stack

| Item | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules |
| Fonts | Press Start 2P (display), Inter + Noto Sans KR (body) |
| Hosting | Vercel — auto-deploys on every GitHub push |
| Repo | github.com/372dev/sage-glossary |
| Domain | sm-glossary.vercel.app |

**Color palette:**
| Variable | Hex | Use |
|---|---|---|
| `--color-bg` | `#0D0B2B` | Page background |
| `--color-panel` | `#1A1650` | Cards, panels |
| `--color-border` | `#2A2280` | Borders, dividers |
| `--color-gold` | `#F0B429` | Headings, accents, active states |
| `--color-gold-dim` | `#A07820` | Shadows, muted gold |
| `--color-text` | `#E8E0FF` | Primary text |
| `--color-text-dim` | `#8880AA` | Secondary text |
| `--color-red` | `#C94040` | Essential badges, suffix highlights |

**Word part highlight colors:**
- Prefix → blue (`#3B82F6`)
- Root → green (`#3BAA6A`)
- Suffix → red (`#C94040`)

---

## 11. Roadmap

- [x] Data curation (398 entries, 30 fields)
- [x] Word parts tagging (238/398 entries)
- [x] Importance re-tagging
- [x] Korean register review
- [x] Definition accuracy review
- [x] Landing page
- [x] English Glossary page
- [ ] Korean Glossary page
- [ ] Flashcard mode
- [ ] Blog
- [ ] Japanese support
- [ ] AdSense

---

*Last updated: June 2026*
