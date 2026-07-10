# Medi Lexi — candidate targets

**What to look for**, for a job that proposes new English term candidates. It does one thing:
suggest medical term *names* that aren't in the glossary yet. Everything after that — how a term
is worded, rated, translated, and validated — is done separately by a human-reviewed process and
is **not** described here.

Two inputs are all you need:
1. **The current entry list** — `meta/en_h.txt` (every `en_h`, one per line, sorted). A candidate
   is only new if it is **not** in that file.
2. **The target areas below** — the clinical areas that are under-covered and want more terms.

Output: append proposed term names under the matching area. Do not add anything to the glossary
data itself; a person reviews every candidate before it becomes an entry.

---

## Already well-covered — look elsewhere

Pain descriptors · body systems · medical specialties · medical staff roles · neurology ·
reproductive & OB-GYN · cardiopulmonary · cardiovascular / GI / urology · dermatology, infectious
disease & pediatrics · musculoskeletal · oncology / hematology / immunology.

These are broadly filled in. New candidates in them are welcome only if genuinely missing from
`meta/en_h.txt` — check there, it is the source of truth, not this summary.

## Target areas — want more terms

Terms a medical interpreter or translator would actually meet: intake forms, clinical notes,
patient conversations, discharge instructions. Prefer common terms over rare academic ones.

- **Dentistry / oral & maxillofacial**
- **Ophthalmology**
- **Pharmacology** — drug classes, common agents, routes, properties
- **Anatomy & imaging** — planes, regions, structures, procedures
- **Healthcare administration** — insurance, billing, consent paperwork, referrals, discharge,
  care coordination (non-clinical health-system terms)
- **Endocrinology**, **Otolaryngology**, **Ophthalmology**, **Urology** — spot-check for gaps

## Already queued (a person picked these — don't repeat them)

Alveoloplasty · Resorption · Osseointegration · Maxillofacial · Periodontal · Bruxism ·
Mandibular arch · Maxillary arch · Choroidal degeneration · Macular dystrophy · Visual acuity ·
YAG laser · Anxiolytic · Pharmacokinetics · Biotin · Coronal plane · Ear canal · Drape ·
Coordination · Fine motor skill · Loop electrosurgical excision procedure · Systolic · HIPAA ·
Explanation of benefits · Verbal consent form · Discharge · Case management.

---

Proposed candidates are raw suggestions. A human decides whether each one is added, how it is
worded, and everything else.
