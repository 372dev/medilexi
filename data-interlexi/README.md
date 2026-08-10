# `data-interlexi/` — the Inter Lexi native term layer

**This directory is NOT part of the Medi Lexi website and NOT under the 4-step
data gate.** It is a second *source* feeding the same compiled Inter Lexi packs,
distinguished by provenance (`COMPANION_PLAN.md` §21).

| | `src/data/` | here |
|---|---|---|
| Purpose | a **learning** entry | a **working** pair |
| Gate | 4-step (§5 of `CLAUDE.md`) | **2-step** (§21c) |
| Carries | definitions ×3, word parts, level, register curation | the pair, register, field |
| Provenance in the pack | `medilexi` | `interlexi` |
| Deep link to a term page | **yes** | no |
| Imported by the website | yes | **never** |

## Why this exists

Medi Lexi's pipeline costs roughly 12k tokens per batch of 40–50, capped at one
batch a week. Closing a 500–800 term coverage gap that way takes **three to five
months**, and most of that work is wasted on the terms we are actually missing:
`dose`, `sodium`, `blood clot` need no word-part decomposition, no difficulty
grade, and no original definition. **They need to be correct.** That is a smaller
claim and a much cheaper one to verify.

Adding them to `src/data/` would also make the glossary worse at its own job — a
study site earns its value from curation, and several hundred low-teaching-value
entries dilute it.

## Why it lives in this repo but outside `src/data/`

§21e recommends a sibling data set here so the existing scripts extend rather
than duplicate, and §15g settles the public question (pack files are public and
ungated anyway). Both hold.

**A sibling directory rather than a sibling file, though:** `src/data/*.json` is
what the Next.js app imports *and* what `CLAUDE.md` §3b enumerates as gated.
Dropping a 2-step-gated file in there invites a data session to apply the wrong
gate, and puts a file the website never uses on the website's import path.

## The 2-step gate (§21c)

1. **Propose** — term list plus target pairs, with register and field tags.
2. **Native review of the pair only** — is this what a practitioner says? Check
   against a reference where one exists; **flag and omit where none does.**

Dropped: definitions in any language, word parts, level grading, the register
*curation* pass. **Kept: correctness, and omit-rather-than-guess.**

## Two rules that keep the layers from rotting (§21d)

- **Graduation, not duplication.** An `interlexi` term that turns out to be
  genuinely teachable enters Medi Lexi later through the normal 4-step gate, and
  gains its definitions and its deep link then.
- **Disagreement is a signal, never a silent overwrite.** If a term exists in
  both layers with different Korean, **both remain candidates** and the conflict
  queues for review. The compiler implements this: it merges into the existing
  term rather than replacing it or creating a duplicate id.

## Files

| File | Holds |
|---|---|
| `aliases.json` | English **match keys** attached to existing Medi Lexi terms. Language-neutral, so one file serves the KO and FR packs. |
| `terms_ko.json` · `terms_fr.json` | **New** source terms Medi Lexi does not have at all, with their target pairs. |

### `aliases.json` — read this before adding one

An alias is a **match key**, and the test is not "would a patient say this?" but:

> **If I hear this phrase, does it reliably mean this concept?**

Those are different questions, and conflating them is what produced `back` →
`Posterior` on "call me back at four". Concretely, from the existing `en_l`
values:

| `en_l` | Good match key? | |
|---|---|---|
| High blood pressure | **yes** | multi-word, unambiguous |
| Heart attack | **yes** | dominant sense in any register |
| Pink eye | **yes** | names nothing else |
| Back | **no** | the everyday sense dominates real speech |
| Blood clot in deep legs | **no** | a description, not a name. And "blood clot" alone must not resolve to DVT specifically |
| Fainting / passing out | **split** | two terms in one display string; add them as two aliases or neither |

`en_l` is a display field and is compiled to `lay`. It is **never** promoted to a
key automatically. Every entry in `aliases.json` is one a human considered.

## Validate before committing

```
.\scripts\validate_interlexi.ps1
```

It fails on an `of` that names no term, a duplicate surface, a bad register, and
an empty pair; it **warns** on a single-word alias, which is where the `back`
class of mistake lives and which no script can decide for you.
