# Inter Lexi term layer — candidate queue

**The intake queue for the working-vocabulary layer.** Separate from
`meta/staging.md`, which feeds Medi Lexi's 4-step gate and is filled by teaching
interest. **This one is filled by frequency**: what people actually say out loud
in an encounter (`COMPANION_PLAN.md` §20b).

Names and target areas only. The method lives in `INTERLEXI_BRIEF.md` (private).

---

## Measured coverage, 2026-08-08

Against the frozen parity clips, matching every term in `bench/clips/*.terms.txt`
with the shipping matcher and the compiled 1700-term pack:

> **24 of 34 spoken terms missed. 29% coverage.**

Recompute it with the script — it lives in the data lane's own toolbox, so this
never requires reaching into the Inter Lexi repo by hand:

```
.\scripts\coverage_interlexi.ps1 [-TgtLang fr] [-ShowMissed]
```

**Clip 5 is excluded, deliberately.** It is the accented-speech test clip and
its vocabulary is railway engineering (`inspection trolley`, `Nilgiri Mountain
Railway`, `crowbars`), so counting it reports a number the terminology layer can
never move. An earlier draft of this file said **24% (10 of 42)** by including
it; the honest clinical figure is **29% (10 of 34)**.

**This number is the point of the whole layer.** It is the metric §20a asks for,
and it is the one to move. Re-measure after each batch and record it below.

---

## Batch 1 — the measured misses (SHIPPED KO 2026-08-08, coverage 29% -> 91%)

Straight from the clips above, already run through
`scripts\dedup_interlexi.ps1`. Clip 5 is excluded: it is the accented-speech
test clip and its vocabulary is railway engineering, not clinical.

### New terms — draft a pair (`terms_ko.json` / `terms_fr.json`)

**Electrolytes and labs**
`electrolytes` · `magnesium` · `uric acid`

**Dosing vocabulary**
`thiazide` · `hydrochlorothiazide` · `milligrams` · `medications` ·
`pain medication` · `blood thinner`

**Clotting**
`blood clot` · `clotting`

**Symptoms and plain speech**
`dizzy` · `irregular heartbeat`

**Care setting and process**
`hospice` · `end-of-life` · `psychosocial` · `admitted` · `assessment`

### Alias instead — Medi Lexi already has the concept (`aliases.json`)

| Say this | Medi Lexi has | Note |
|---|---|---|
| `potassium` | Serum potassium | the compound is there, the bare word is not |
| `sodium` | Serum sodium | same |
| `dose` | Loading dose · Maintenance dose · Radiation dose | same |
| `social worker` | Medical social worker | same |
| `diuretic` | Antidiuretic hormone | **not** an alias, that is a different concept. Diuretic is a genuine new term |

### Skip — already matched

`edema` · `gout` · `hyperglycemia` · `hyperlipidemia` · `hypokalemia` ·
`hyponatremia`, and the plurals `palpitations` / `arrhythmias` / `discharged`,
which the matcher's morphology rule already reduces to their lemmas.

---

## The standing sweep (§20b) — target 500 to 800 terms

Fill by category, by frequency, not by interest. Roughly in priority order:

1. **Electrolytes and common labs** — the whole basic metabolic panel, CBC,
   lipid panel, A1c, INR, troponin, creatinine, in the words people say.
2. **Vitals** — and the plain-speech forms, not only the chart names.
3. **Dosing vocabulary** — dose, route, frequency, units. `twice a day`, `by
   mouth`, `as needed`, `milligram`, `millilitre`, `IV`, `IM`, `subcutaneous`.
4. **The most-prescribed drug classes**, plus the twenty or thirty individual
   drugs an interpreter actually hears.
5. **Plain-speech body parts** — what a patient calls it, not the anatomy term.
6. **The ordinary verbs of clinical instruction** — swallow, hold your breath,
   push, squeeze, roll over, take a deep breath, follow my finger.

3. **The unknowns queue**, once users exist, becomes the permanent engine
   (§13c) — reaching us only through explicit per-term sharing.

---

## Log

| Date | Batch | Terms | Coverage after |
|---|---|---|---|
| 2026-08-08 | (baseline) | — | **29%** (10 of 34, clip 5 excluded) |
| 2026-08-08 | Batch 1 (measured misses) | 16 new + 7 aliases (KO) | **91%** (31 of 34, clip 5 excluded) |
| 2026-08-08 | Batch 2 (standing sweep) | 93 new + 13 aliases (KO) | **94%** (32 of 34, clip 5 excluded) |
| 2026-08-08 | Batch 3 (general sweep) | 88 new + 16 aliases (KO) | **94%** (benchmark saturated; see note) |
| 2026-08-08 | Batch 4 (drugs, conditions, mental, body) | 89 new + 7 aliases (KO) | 94% (breadth metric now) |
| 2026-08-08 | Batch 5 (diseases, drugs, womens health) | 60 new + 9 aliases (KO) | 94% (breadth metric now) |
| 2026-08-08 | *(coder)* multi-word plural fix | no data change | **97%** (33 of 34) |

**CODER NOTE 2026-08-08 (bench/recall.py): the bottleneck has MOVED off this
layer.** End to end on the same clips, the interpreter now gets a rendering for
**79%** of spoken terms. Pack coverage is 94%; ASR term recall is 85%; 79% is
the product of the two. **The remaining loss is the decoder mishearing the word,
not the pack lacking it** -- which is the data lane's own conclusion below,
confirmed from the other side.

**Running total after batch 5: 346 native terms + 91 alias keys (KO).** Coverage held at 94% throughout (2 non-data misses); per the manager the goal is now raw quantity/breadth of general medical vocabulary, not the frozen benchmark.

**Batch 2 SHIPPED (KO). Only 2 misses remain, both NON-DATA (the terminology layer has maxed this benchmark):**
- ~~`blood clots`~~ **FIXED by the coder 2026-08-08.** Correctly routed, and it
  was worse than reported: `loading doses` did not merely miss, it matched the
  WRONG term (*Dose*), silently dropping "loading". Coverage 94% -> 97%.
- `hypochlorothiazide` — an ASR mishearing of *hydrochlorothiazide* (hypo/hydro). Not worth seeding a wrong spelling; watch.
- `blood glucose` (batch-1 miss) is now **covered** — added as an `aka` on the new *Blood sugar* term.

The 34-clip benchmark is small; batch 2's real value is broad coverage of the 500-800 sweep (§20b), which this benchmark only samples. Re-measure will need fresh clips to keep showing signal.

**Batch 3 (2026-08-08): the benchmark is now saturated at 94%** (only the 2 non-data misses left). Per the manager, the goal shifted from the benchmark to raw quantity/breadth of general medical vocabulary. Native layer is now **197 terms + 75 alias keys**. Coverage will stay flat on these clips regardless of batch size, so **the metric to watch is now term count and category breadth, not clip coverage, until fresh benchmark clips exist** (§20a).
