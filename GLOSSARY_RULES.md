# SageMed Glossary — Glossary Rules

This file documents all conventions, schema definitions, and editorial rules specific to the **medical vocabulary glossary**. For word parts rules, see `WORDPARTS_RULES.md` (coming soon).

---

## 1. Data Architecture

**Base file** (`medical_vocab_base.json`) — English + shared metadata:
- Language-neutral metadata: fields, level, word parts
- English terms and definitions
- Used standalone for the English glossary (`/glossary`)

**Language files** (e.g. `medical_vocab_ko.json`) — translation layers:
- Matched to base entries by `en_h` key
- Contains: `en_h`, high/low register in target language, translated definition (`d_ko`, `d_jp` etc.)
- Used merged with base for bilingual glossaries (e.g. `/glossary/ko`)
- `d_[lang]` starts as English placeholder, replaced with translation over time

**Word parts file** (`medical_wordparts_simple_v1.05.json`) — see WORDPARTS_RULES.md

---

## 2. Vocabulary Schema

### Base entry
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
| `en_h` | English high register — clinical/formal term. Also serves as the unique key across files |
| `en_l` | English low register — natural patient-facing term (optional) |
| `abbr` | Abbreviation (optional) |
| `f` | Array of medical fields — max 3, most relevant first |
| `d` | English definition — clinically accurate, concise |
| `lvl` | Importance level — see section 5 |
| `parts` | Word parts — see section 6 (omit key entirely if nothing applies) |

### Korean language entry
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
| `d_ko` | Korean definition — English placeholder until translated |

---

## 3. Register Rules

- `en_l` and `ko_l` are **independent** — one can exist without the other
- Within the same language, **high ≠ low register** — identical strings → remove low register
- Low register = short, natural, actually used by patients/laypeople
  - ✅ "Heart attack" (for Myocardial Infarction)
  - ❌ "Cardiac muscle ischemic necrotic event" (description, not natural speech)
- Low register is NOT a description or paraphrase
- If `ko_h` is already the natural everyday term → no `ko_l` needed

---

## 4. Fields

**31 official fields:**
Anatomy, Anesthesiology, Cardiology, Colorectal Surgery, Critical Care, Dermatology,
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
- **Anatomy terms** → `Anatomy` leads
- **Acute/emergency presentations** → `Emergency Medicine` leads
- **Drug classes** → `Pharmacology` leads
- **Specialty names as vocab entries** → that specialty leads
- Anatomy terms use `Anatomy` instead of `General Medicine` as primary field

---

## 5. Importance Levels

| Level | String | Criteria | Target % |
|---|---|---|---|
| Essential | `⭐⭐⭐ Essential` | Universal — any clinical setting, missing = real risk | ~22% |
| Important | `⭐⭐ Important` | Specialty-core, common in rotations and clinical encounters | ~74% |
| Good to know | `⭐ Good to know` | Subspecialty, advanced, lower frequency | ~4% |

Only three valid strings — no variations allowed.

---

## 6. Word Parts (`parts` field)

```json
"parts": {
  "p": ["hyper-"],
  "r": ["cardi/o"],
  "s": ["-itis"]
}
```

| Key | Meaning |
|---|---|
| `p` | Array of prefix `wp` keys |
| `r` | Array of root `wp` keys |
| `s` | Array of suffix `wp` keys |

**Rules:**
1. Only use parts that exist in `medical_wordparts_simple_v1.05.json`
2. The literal form of the part must be **visibly present** in the term's spelling (accounting for connecting vowels `/o`, `/i`, `/e`)
3. Must be a **genuine etymological match** — not coincidental characters
4. **Prefixes** → word-start only; **Suffixes** → word-end only; **Roots** → anywhere
5. Only include keys (`p`, `r`, `s`) that have values — omit empty arrays
6. Omit `parts` key entirely if no parts apply
7. Eponyms (Alzheimer's, Parkinson's), French-origin words, pure English compounds → no `parts`
8. If a new part is genuinely needed, suggest adding to the enum with 3+ example words

---

## 7. Korean Rules

- Pure Hangul only — no Chinese characters (한자), no Latin mixed in
- `ko_h` must be the standard clinical Korean term
- `ko_l` must be short and natural — the word a patient would actually say
- `ko_h` and `ko_l` must not be identical strings
- Long descriptive `ko_l` (>15 characters) → review and shorten or remove
- Korean definitions (`d_ko`) start as English placeholders — translate in batches of 30

---

## 8. Definitions

- Clinically accurate — verified against medical references
- Concise — one to two sentences
- Not scoped to a single specialty context
- Use current clinical definitions (e.g. Sepsis-3 criteria, not SIRS)
- Anatomy definitions: name the organ's function, not just its location
- No informal language

---

## 9. Duplicate Prevention

- `en_h` is the unique key — no two entries may share the same `en_h`
- Check for duplicates before adding any new entry
- When merging duplicates: keep most clinically accurate definition + most useful fields + shortest natural low register

---

## 10. Workflow Rules

- **Always show draft/proposal before applying any data changes** — no exceptions
- Work in batches and confirm each batch before applying
- Recommended batch sizes: 30 for Korean review, 50–60 for parts tagging, 50 for definition review
- Version format: `medical_vocab_base_v1.XX.json` on major updates
- Keep `medical_vocab_ko.json` in sync — every base entry must have a corresponding ko entry

---

## 11. Content Statistics (as of June 2026)

| Metric | Value |
|---|---|
| Total entries | 429 |
| Fields | 31 (including Anatomy) |
| Entries with word parts | 288 / 429 |
| Essential entries | ~22% |
| Important entries | ~74% |
| Good to know entries | ~4% |
| Korean definitions translated | 0 / 429 (in progress) |

---

*Last updated: June 2026*
