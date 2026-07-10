# Medi Lexi — Data Rules

Rules for proposing, standardizing, and validating glossary entries. Self-contained:
an agent with only this file, `en_h.txt`, and `staging.md` can run candidate intake correctly.

**Scope.** This covers the *data* (`src/data/*.json`). It is not the full project rulebook.

---

## 1. Files and keys

| File | Fields |
|---|---|
| `src/data/medical_vocab.json` | `en_h`, `en_l`, `abbr`, `f`, `d`, `lvl`, `parts` |
| `src/data/medical_vocab_ko.json` | `en_h`, `ko_h`, `ko_l`, `d_ko` |
| `src/data/medical_vocab_fr.json` | `en_h`, `fr_h`, `fr_l`, `d_fr` |

`en_h` is the **primary key**, shared across all three files, and must match **byte for byte**.
All three files always hold an equal number of entries.

**Required:** `en_h`, `f`, `d`, `lvl` (base) · `en_h`, `ko_h` (KO) · `en_h`, `fr_h` (FR).
**Optional:** `en_l`, `abbr`, `parts`, `ko_l`, `d_ko`, `fr_l`, `d_fr`.
Omit an optional field entirely rather than writing an empty string. A base entry with no KO or
FR counterpart simply doesn't appear on those pages — partial translation sets are always safe.

`f` is **always an array**, even with one value. `abbr` is **always a string**, never an array.

---

## 2. `en_h` — the headword

- The **clinical/technical** term, never the lay one. Lay terms go in `en_l`.
- **Sentence case.** Capitalize the first word only: `Myocardial infarction`, `Deep vein thrombosis`.
  Exceptions: the specialty/field-name entries below keep Title Case (`Critical Care`,
  `Emergency Medicine`, `Obstetrics & Gynecology`, `Thoracic Surgery`, `Nuclear Medicine`,
  `Palliative Care`, `Colorectal Surgery`, `Critical Care Medicine`, and the `f` values in §4);
  eponyms and proper nouns keep their capital (`Cushing's syndrome`, `Guillain-Barré syndrome`,
  `Kawasaki disease`); acronyms stay upper.
- **Standardize to the accepted clinical form.** Lay → clinical, adjective → noun, outdated →
  modern, plural → singular. Examples: `Prolapsed uterus` → **Uterine prolapse** ·
  `Pelvic exam` → **Pelvic examination** · `Uterine fibroid` → **Uterine leiomyoma** ·
  `Hermaphroditism` → **Intersex** · `Radiosensitive` → **Radiosensitivity** ·
  `Chondrocytes` → **Chondrocyte** · `ringworm` → **Tinea**.

## 3. `en_l` / `ko_l` / `fr_l` — the lower register

`en_l` holds **either** a genuine secondary/alternate name **or** a real lay/patient word.

- A **secondary name** exists across languages → `ko_l` / `fr_l` must carry the equivalent.
- A **lay term** is language-dependent → include `ko_l` / `fr_l` only if that language genuinely
  has one. Never invent, paraphrase, or transliterate.

**Omit `_l` when:** no simpler term exists · both terms sit at the same register · the headword is
already the everyday word · the candidate is an abbreviation (those go in `abbr`) · the candidate
is a descriptive paraphrase rather than a name ("blood pressure is high", "부정확한 서술") · the
candidate merely restates the headword plus a word ("심전도 검사" = 심전도 + 검사).

`ko_l` must be a real Korean word, not a romanization of the English. Keep it under 15 characters —
a long string is almost always a description, not patient speech.

## 4. `f` — field (closed enum, never invent a value)

`Anatomy` · `Anesthesiology` · `Cardiology` · `Critical Care` · `Dentistry` · `Dermatology` ·
`Emergency Medicine` · `Endocrinology` · `Family Medicine` · `Gastroenterology` ·
`General Medicine` · `Genetics` · `Healthcare Administration` · `Hematology` · `Immunology` ·
`Infectious Disease` · `Internal Medicine` · `Nephrology` · `Neurology` · `Neurosurgery` ·
`Obstetrics & Gynecology` · `Oncology` · `Ophthalmology` · `Orthopedics` · `Otolaryngology` ·
`Pathology` · `Pediatrics` · `Pharmacology` · `Plastic Surgery` · `Psychiatry` · `Pulmonology` ·
`Radiology` · `Rehabilitation Medicine` · `Rheumatology` · `Surgery` · `Thoracic Surgery` ·
`Urology` · `Vascular Surgery`

Max **3** fields, most relevant first. Anatomy terms lead with `Anatomy`; acute presentations with
`Emergency Medicine`; drug classes with `Pharmacology`. `Healthcare Administration` is for
**non-clinical** health-system terms only (insurance and billing, consent paperwork, care
coordination) — never for a clinical entry.

## 5. `lvl` — integer 1, 2, or 3

| Value | Meaning | Test |
|---|---|---|
| `3` | Essential | A general (non-specialist) interpreter would need it. Intake, consent, discharge. |
| `2` | Important | Common **within** a specialty; a specialist interpreter needs it. |
| `1` | Good to know | Subspecialty, rare, academic, historical, or eponymous. |

`lvl` reflects how often **the term** appears in clinical communication, not how common the
underlying condition is. Frequency beats complexity.

## 6. Definitions — `d`, `d_ko`, `d_fr`

- **Exactly one sentence**, one full stop, at the end. (Periods inside `H. pylori`, `e.g.`, and
  decimals don't count; a semicolon does not start a new sentence.)
- **Length:** `d` ≤ 200 chars · `d_fr` ≤ 200 · `d_ko` ≤ 120 (Hangul packs more per character).
- **Originally authored.** Never copied or closely paraphrased from any source. Read the
  reference, close it, then write. Approved factual sources: NLM MeSH (public domain), OpenStax
  Anatomy & Physiology **1e** (CC BY). Wikipedia for facts only, never text.
- **No system-specific thresholds.** Strip any number that varies by national guideline or
  measurement convention: BMI cutoffs, mmHg, mL/day, %, and guideline-variable time/age limits
  ("chronic = 3 months", "under age 18"). Use qualitative wording ("severely reduced",
  "long-lasting"). When one language carries a threshold, the other two usually do too — fix the
  entry in all three.
- **Keep fixed universal facts:** 46 chromosomes, 8 carpal bones, 206 bones, 12 thoracic
  vertebrae, the 28-day neonatal period, pregnancy trimesters, IV bioavailability 100%. The test:
  does it differ by national guideline (strip) or is it a fixed fact of human biology (keep)?
- **Pharmacology exception (English `d` only).** A drug-class or named-drug entry may append one
  clause after a semicolon: `…; warfarin (Coumadin), rivaroxaban (Xarelto), and apixaban (Eliquis)
  are widely used agents.` Name 2–3 agents as `generic (Brand)`. Never in `d_ko` / `d_fr`.
  Pharmacology *concepts* (Intravenous, Bioavailability, Pharmacist) get no drug list.

## 7. Translations — translate, then fact-check

`ko_h` translates `en_h`; `d_ko` translates `d`. Two steps, in order:

1. Translate the English field as a medical translator would, in clinical context.
2. **Fact-check the result against the reference** and adopt the reference's term where it differs.

**Korean references:** 질병관리청 국가건강정보포털 (health.kdca.go.kr) → KCD/심평원 → 위키백과 →
NLM MeSH. **Do not use:** 서울아산병원, 서울대학교병원, MSD 매뉴얼 한국어판, 나무위키.
**French references:** Vitrine linguistique OQLF (vitrinelinguistique.oqlf.gouv.qc.ca), WHO ICD
French (icd.who.int), fr.wikipedia (facts only). **Do not use:** MSD Manuel, Vidal, INSERM MeSH
bilingue, Larousse Médical.

`*_h` is the **established clinical term** in that language, not a literal translation.
If no standard equivalent exists, **omit the field and say so.** Never invent a term.

## 8. `parts` — word-part tagging

```json
{ "p": ["prefix-"], "r": ["root/o"], "s": ["-suffix"] }
```

Omit keys with no values; omit `parts` entirely if nothing applies.

1. Only values that exist **verbatim** in `src/data/medical_wordparts_simple.json` (`wp` = the
   part, `t` = type `p`/`r`/`s`). Never invent one.
2. The part's **literal** — hyphens and the trailing connecting vowel stripped (`cardi/o` → `cardi`,
   `-osis` → `osis`, `anti-` → `anti`) — must be an **exact lowercase substring of `en_h`**.
   A part that isn't a substring renders **no highlight and no tooltip**: it is dead data.
3. Must be a genuine **etymological** match, not a character coincidence.
4. Prefixes at word-start only; suffixes at word-end only; roots anywhere.
5. Prefer the **longer, more specific** form: `pulmon/o` over `pulm/o`, `-derma` over `derm/o`,
   `-ectomy` over `-tomy`, `-iasis` over `-sis`.
6. Check **variant spellings** before concluding a part is absent: `sclero-` exists where `scler/o`
   doesn't (and is typed a **root**, despite the hyphen); `tox/i` not `tox/o`; `leuko-` not `leuk/o`.
7. **Never** tag: eponyms, French-origin words, or abbreviations used as standalone terms.

**Known traps — the root looks present but means something else:**

| In the term | Looks like | Actually |
|---|---|---|
| `hyper**tens**ion` | `ten/o` (tendon) | Latin *tendere*, to stretch |
| `**sept**icemia` | `sept/o` (septum) | Greek *sēpein*, to rot |
| `sym**ptom**` | `tom/o` (cut) | *syn-* + *ptoma* |
| `**my**opia` | `my/o` (muscle) | *myo-*, to shut |
| `lum**bar**` | `bar/o` (weight) | *lumbus*, loin |
| `**con**dyle` | `con-` (with) | Greek *kondylos*, knuckle |
| `umb**ili**cus` | `ili/o` (hip bone) | *umbilicus* |
| `diffe**ren**tiation` | `ren/o` (kidney) | Latin *differre* |
| `thrombocy**top**enic` | `pen/o` (penis), `top/o` | *-penia*, deficiency |
| `**hemi**arthroplasty` | `hem/o` (blood) | `hemi-`, half |
| `im**plant**able` | `plant/o` (sole of foot) | *plantare*, to plant |
| `a**spir**ation` | `spir/o` (to breathe) | true etymology, but misleading here |
| `**cocc**us` | `coccyg/o` | `coccyg/o` is **tailbone** |

If reading the root literally would change the term's meaning, it's a trap.

---

## 9. Candidate intake — do these in order

Order matters. Standardizing **before** the glossary dedup is what catches renamed collisions.

1. **In-list dedup** — collapse duplicates, plurals, spelling variants, and near-synonyms within
   the candidate list itself.
2. **Standardize each `en_h`** per §2. Record what changed.
3. **Dedup the standardized forms** against `meta/en_h.txt` (one term per line, sorted,
   case-sensitive). Only then do you know what is genuinely new.

Why the order: `sebaceous cyst` → **Epidermoid cyst**, `ringworm` → **Tinea**, `stork bite` →
**Nevus simplex**, `rosacea` → **Acne rosacea**, `Anti-fungal cream` → **Antifungal** — every one
of these passed dedup in its raw spelling, and every one already existed under its standardized
name. Deduping the raw form finds nothing.

`meta/en_h.txt` is **generated** from `medical_vocab.json`. Never hand-edit it.

## 10. Never

- Never invent a word part, a field value, or a `ko_h`/`fr_h` term. Flag and omit instead.
- Never write to a data file without an explicit approval gate.
- Never reverse `_h` and `_l` register.
- Never let the three files disagree on `en_h` or on entry count.
