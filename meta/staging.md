# Medi Lexi — candidate queue

Terms proposed for addition to the glossary. **This is a to-do list, not data.**
Read `meta/DATA_RULES.md` before working from it, and dedup against `meta/en_h.txt`.

> This is the public, agent-readable slice of a larger private working file.
> Process notes, decisions, and pending field-level updates live outside the repo.

---

## Status

- **Glossary:** 1,345 entries per file (`medical_vocab.json` / `_ko` / `_fr` — always equal).
- **Index:** `meta/en_h.txt`, 1,345 lines, sorted. **Generated** — never hand-edit.
- **`en_h` convention:** sentence case (see DATA_RULES §2).

## Already shipped — do NOT re-propose

Pain descriptors · body systems · the 38 field/specialty entries · medical staff roles ·
neurology · reproductive & OB-GYN · cardiopulmonary · cardiovascular/GI/urology ·
dermatology, infectious disease & pediatrics · musculoskeletal · oncology/hematology/immunology.

Everything in these clusters is in `meta/en_h.txt`. **Always dedup against that file** rather than
trusting this list — it is a summary, not an inventory.

---

## Open queue

### Dentistry / oral-maxillofacial
- Alveoloplasty
- Resorption
- Osseointegration
- Maxillofacial
- Periodontal
- Bruxism
- Mandibular arch
- Maxillary arch

### Ophthalmology
- Choroidal degeneration
- ~~Nearsightedness~~ — **Myopia already exists**; this is an `en_l` update, not an add
- Macular dystrophy
- Visual acuity
- YAG laser

### Pharmacology
- Benzodiazepine — singular; drug class, so the `d` may carry the drug-example clause
- Anxiolytic
- Pharmacokinetics
- Biotin
- Water soluble — adjective; consider **Water solubility**
- Sulphate — standardize to **Sulfate**

### Anatomy / imaging / general
- Coronal plane
- Ear canal
- Drape
- Coordination
- Fine motor skill
- Loop electrosurgical excision procedure — `abbr` LEEP
- Ultrasonography — this is a **rename** of the existing `Ultrasound`, not an add

### Healthcare Administration
_Small cluster; the `Healthcare Administration` field is new and barely used._
- Health Insurance Portability and Accountability Act — `abbr` HIPAA
- Explanation of benefits — `abbr` EOB
- Verbal consent form
- Discharge
- Case management

### Stragglers
- Systolic — confirmed new (deduped 2026-07-10).
- ~~Referral~~, ~~Myomectomy~~ — already exist; removed from the queue.

---

## Notes for whoever works this queue

- **Do not add entries directly.** Propose them; a human approves English, then Korean, then
  French, before anything is written.
- Run intake in the order given in DATA_RULES §9: in-list dedup → standardize → dedup the
  **standardized** forms against `meta/en_h.txt`.
- Several items above are adjectives (`Periodontal`, `Maxillofacial`, `Water soluble`) or plurals
  (`Benzodiazepines`). Standardize them before deduping — the noun form may already exist.
