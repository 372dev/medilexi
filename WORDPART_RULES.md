# SageMed Word Parts Glossary — Full Project Brief

This document covers everything about the medical word parts glossary we have built: the data files, schema rules, editorial conventions, etymology decisions, and the interactive UI layout. Intended as a handoff to any agent or developer continuing this work.

---

## 1. What We Built

An interactive medical word parts reference and flashcard system, built as a Claude artifact (inline HTML widget). It covers prefixes, roots, and suffixes used in medical terminology, each with a definition, clinical importance rating, and two real clinical examples.

The data is maintained in two parallel JSON files that are always kept in sync:

| File | Entries | Purpose |
|---|---|---|
| `medical_wordparts_v1.05.json` | 320 | Master file — full schema, used for the glossary UI and flashcard quiz |
| `medical_wordparts_simple_v1.05.json` | 367 | Flat file — simplified schema, intended for web app integration (e.g. SageMed Glossary) |

The simple file has more rows because combined cards (e.g. `aur/o, ot/o`) are split into individual entries.

---

## 2. Master File Schema (`medical_wordparts_v1.05.json`)

Every entry has exactly 5 fields:

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

| Field | Description |
|---|---|
| `wp` | Word part — the canonical display form |
| `t` | Type: `"p"` (prefix), `"r"` (root), `"s"` (suffix) |
| `lvl` | Importance level: `1` (good to know), `2` (frequently used), `3` (essential/high-yield) |
| `d` | Definition — short, plain English, prefixed with etymology origin e.g. `(Greek)`, `(Latin)`, or `(Greek: wp) meaning; (Latin: wp) meaning` for merged cards |
| `ex` | Exactly two `[example word, definition]` pairs — always two, never one, never three |

---

## 3. Simple File Schema (`medical_wordparts_simple_v1.05.json`)

```json
{ "wp": "aur/o", "t": "r", "d": "Ear (Latin)", "alt": "aur/o, ot/o" }
```

| Field | Description |
|---|---|
| `wp` | Individual word part (split from combined cards) |
| `t` | Same as master: `"p"`, `"r"`, `"s"` |
| `d` | Short plain definition — no `lvl`, no `ex` |
| `alt` | Present only if this entry was split from a combined master card. Value is the original combined `wp` string |

This is the file to use for web app integration. Each word part is its own searchable row.

---

## 4. Canonical Form Conventions

- **Prefixes** end with `-` → `hyper-`, `pre-`, `anti-`
- **Roots** use combining vowel notation → `cardi/o`, `derm/o`, `dent/i`, `tox/i`
- **Suffixes** start with `-` → `-itis`, `-ectomy`, `-pathy`
- Combined cards use `, ` separator → `aur/o, ot/o` / `hemi-, semi-`
- No spaces inside individual word parts

---

## 5. Etymology Rules

Every `d` field is prefixed with the language of origin:

```
(Greek) Inflammation
(Latin) Kidney
(Greek: gloss/o) Tongue; (Latin: lingu/o) Tongue
(Latin: sub-) Below, under; (Latin: infra-) Below, beneath
```

For combined cards with two different origins, both are annotated inline separated by `;`.

**Etymology pairs kept SEPARATE — do not merge these:**

These roots have different Greek/Latin origins and appear in completely different clinical terms. They must remain as individual cards in both the master and simple files.

| Greek | Latin | Meaning |
|---|---|---|
| `ot/o` | `aur/o` | Ear |
| `rhin/o` | `nas/o` | Nose |
| `gloss/o` | `lingu/o` | Tongue |
| `arthr/o` | `articul/o` | Joint |
| `gluc/o` | `glyc/o` | Sugar/glucose |
| `lip/o` | `adip/o` | Fat |
| `ophthalm/o` | `ocul/o` | Eye (merged as `ocul/o, ophthalm/o` — keep together) |
| `odont/o` | `dent/i` | Tooth (merged as `odont/o, dent/i` — keep together) |

Note: `ocul/o, ophthalm/o` and `odont/o, dent/i` are intentionally merged because their clinical usage overlaps more than the pairs above.

**Color roots moved to prefixes:**
`cyano-`, `erythro-`, `leuko-`, `melano-` are classified as `t: "p"` (prefix), not roots, because they function as color-descriptor prefixes in clinical terminology.

---

## 6. Importance Level (lvl) Guidelines

| lvl | Label | Description |
|---|---|---|
| 1 | Good to know | Rare, specialized, or low-frequency clinical use |
| 2 | Frequently used | Regular clinical and medical documentation use |
| 3 | Essential / high-yield | Core vocabulary — appears constantly in clinical settings |

Most entries are lvl 2 or 3. lvl 1 is reserved for color prefixes, rare anatomical roots, and very specialized suffixes.

---

## 7. Current Entry Counts (v1.05)

**Master file — 320 entries:**
- 75 prefixes
- 173 roots
- 72 suffixes
- 44 combined (merged) cards

**Simple file — 367 entries:**
- 100 prefixes
- 184 roots
- 83 suffixes

---

## 8. UI Layout (Glossary Widget)

The interactive widget has two tabs:

### Tab 1: Word Parts

- **Search bar** — live search across `wp`, `d`, and example words
- **Type filter pills** — All / Prefixes (n) / Roots (n) / Suffixes (n) with live counts
- **Level filter pills** — ★★★ / ★★ / ★ (amber when active)
- **Legend** — explains the three star levels
- **Card grid** — responsive, auto-fill columns, min 280px per card

**Each card shows:**
- Top-left: colored type badge
  - Prefix → blue `#E6F1FB / #185FA5`
  - Root → green `#EAF3DE / #3B6D11`
  - Suffix → pink `#FBEAF0 / #993556`
- Top-right: 1–3 gold stars `#EF9F27` (importance level)
- Large term (`wp`) in 18px / 500 weight
- Definition below in muted 13px
- Two example pill boxes: **Bold term** — definition

### Tab 2: Flashcard Quiz

- **Type filter** — All / Prefixes / Roots / Suffixes
- **Level filter** — ★★★ Essential / ★★ Frequent / ★ Good to know (amber when active)
- **Progress bar** + counter (X / total) + score (✓ N)
- **Flip card** — tap to reveal; shows definition + both examples on the back; stars shown on card face
- **Got it / Miss buttons** — appear after flip
- **Restart button** — reshuffles the filtered deck

There is **no anatomy tab** — that was removed. Word parts and quiz only.

---

## 9. Version History

| Version | Changes |
|---|---|
| v1.0 | Initial 283 entries, two files established |
| v1.01 | Added `pharmac/o`, `somn/o`, `tom/o`, `lip/o`; replaced `-oscopy` with `-scopy` |
| v1.02 | Merged 12 etymology pairs with origin labels; moved `cyano-`, `erythro-`, `leuko-`, `melano-` to prefixes; removed `dors/o` root duplicate; applied origin labels to all entries |
| v1.03 | Added `auxill/o`, `gingiv/o`; merged `odont/o + dent/i`; added 5 new suffix group cards (`-ac/-ic/-tic`, `-al/-ous/-ary`, `-ism/-sis`, `-ia/-y`, `-ema/-ago`); merged `-osis + -pathy`; fixed `digit/o` example |
| v1.04 | Added `ather/o`, `pleur/o`, `retin/o`, `orth/o` |
| v1.05 | Added 26 entries: `glomerul/o`, `pyel/o`, `coagul/o`, `sarc/o`, `immun/o`, `men/o`, `iatr/o`, `sept/o`, `gnos/o`, `neutr/o`, `atri/o`, `cholang/o`, `choledoch/o`, `epiglott/o`, `fasci/o`, `kal/o`, `necr/o`, `ovar/o`, `pylor/o`, `synov/o`, `ten/o`, `ventricul/o`, `corne/o`, `ureter/o`, `urethr/o`, `-opia` |

---

## 10. Rules for Future Additions

1. **Always update both files** — master and simple — and export both when a new version is created.
2. **Always two examples per card** — no exceptions. Both must be real clinical terms.
3. **Always include origin label** in `d` — `(Greek)`, `(Latin)`, `(Old English)`, or `(Greek/Latin)` for ambiguous.
4. **Never merge etymology pairs** that are listed in Section 5 above.
5. **Check for duplicates** before adding — including checking whether a new entry can be constructed from existing prefix + root (like `epiderm/o` = `epi-` + `derm/o`).
6. **Confirm all changes with Sage before building** — no auto-applying.
7. **Never render the widget without confirmation** from Sage first.
8. **Version naming** — increment the minor version (v1.05 → v1.06) for additions/edits; major version (v2.0) reserved for structural schema changes.
9. **lvl assignment** — when in doubt, ★★ for anything used in standard clinical documentation, ★★★ for anything that appears in every clinical specialty.
10. **Combined cards** use `, ` as separator in `wp`; the simple file splits them automatically with `alt` pointing back to the original combined form.
