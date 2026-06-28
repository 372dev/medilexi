# Changelog

Notable changes to **Medi Lexi**, newest first. The site auto-deploys to Vercel on
every push. From **v1.188** the version number tracks the commit count — each notable
change is logged as the next number (v1.189, v1.190, …). Earlier entries (v1.19, v1.20)
used the older semantic scheme.

---

## v1.188 — 2026-06-28

### 2026-06-28 — Search ranking overhaul
- **Relevance-tier ranking** across the English, French, and Korean glossaries and the word-parts page, replacing the old "which field matched" sort: exact → field prefix → word-start → substring → fuzzy term → definition-only. An exact abbreviation (e.g. `EEG`) now ranks first instead of being buried under stray fuzzy hits.
- **Glossary Fuse threshold tightened** 0.4 → 0.3 to cut no-match noise (e.g. `Bursitis`).
- **Korean typo tolerance** — added a jamo-level fuzzy fallback (한글 → `ㅎㅏㄴㄱㅡㄹ`) below the exact hangul matcher, so a single mistyped jamo (간염 → 감염) still surfaces results. The precise matcher (초성 shortcut, partial syllable) is unchanged and still ranks first.
- **"No exact match — showing related terms"** notice when only fuzzy/related results exist.

### 2026-06-28 — Word-part glossary additions
- Added **16 reviewed word parts** (`phot/o`, `cry/o`, `muc/o`, `later/o`, `vag/o`, `acid/o`, `schiz/o`, `phren/o`, `cata-`, `ana-`, then `mot/o`, `physi/o`, `cortic/o`, `medi/o`, `part/o`, `quadri-`) — master 565 → 580, simple 620 → 635 — each with 4 examples; replaced the malformed `quad/r-` slug.

### 2026-06-27 → 06-28 — Vocab word-part tagging
- Tagged prefix/root/suffix breakdowns across **all 1,083 vocabulary entries** (833 tagged; the rest intentionally unparted — eponyms, single-words, abbreviations).
- Caught recurring etymological coincidental-match errors (Hypertension `ten/o`, Sepsis/Septic Shock `sept/o`, Symptom `tom/o`, Myopia `my/o`, Normotensive…).
- Whole-file **non-visible-root cleanup** (a root not spelled in the term can't highlight): 60 entries stripped/swapped to spelled-in variants; single-word terms that don't spell-match left unmarked.
- Hid ad placeholders and disabled the French landing-page links (routes still live for direct access).

### 2026-06-26 — Word parts expansion
- Added 187 word parts, merged variant/synonym cards, re-leveled; UI count updated to **600+**.

---

## v1.20 — 2026-06-19 → 06-25 — Jamo search & richer word parts

- **Jamo-level Korean fuzzy search** in `/glossary/ko` — 초성 shortcut and partial-syllable matching.
- **Word part examples expanded 2 → 4 each** (89 prefixes, 208 roots, 78 suffixes); **click-to-expand** cards.
- **Word Parts Quiz** page (`/wordparts/quiz`); synonym (`syn`) cards on 27 pairs.
- **`lvl` migrated** from star-strings to integers (1/2/3) across all data files and pages.
- Search-match highlighting, card-in / skeleton / expand animations.
- Migrated `ko_h` / `ko_l` into `medical_vocab_ko.json`.
- Removed version numbers from data filenames.

---

## v1.19 (+ French & SEO) — 2026-06-16 → 06-23

- **Korean glossary & flashcard** with EN↔KO direction toggle; IME-safe composition handling.
- **French glossary & flashcard** (EN↔FR), `medical_vocab_fr.json` (998 entries) with `d_fr` across all levels.
- **Abbreviation flashcard**; word-parts breakdown shown on the vocab flashcard back.
- Landing page restructured to a **2×2 grid** (EN / Abbr / KO / FR).
- **SEO & compliance:** privacy policy, robots.txt, App-Router sitemap, cookie notice, per-page Open Graph / JSON-LD / hreflang / canonical URLs.
- Flashcard setup modal; missed-card review & retry; `kbd` key hints.
- Default to day mode on first visit; feedback form and Terms of Use on About.
- Data: full Korean translation pass (999/999), one-sentence definition trims, original MeSH-aligned rewrites, anatomy + psychiatry batches with KO/FR.

---

## Initial build — 2026-06-11 → 06-15

- Landing page with day/night hero-image swap.
- **English glossary** — Fuse.js fuzzy search, field & level filters, word-part highlights, clickable field badges.
- **English flashcard** — Study and Quiz modes.
- Word parts glossary; CLAUDE.md rulebook consolidated (kept outside the repo).
- Vercel analytics; global-CSS layout and styling foundation.
