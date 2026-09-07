-- Medi Lexi · the flagged review queue.
--
-- Per REVIEW_STAGE.md, reviewers judge only the entries WE flagged (Tier-1
-- candidates + Tier-2 concerns), each with a written concern, rather than a whole
-- specialty. This table is that queue, one row per (lang, en_h) flagged entry.
--
-- src_h / src_l / src_d hold the target triple for languages with no shipped data
-- file (ES/JA); for FR/KO they are NULL and the page reads the live data file.
-- Kept server-side only (RLS deny-all, service-role writes/reads) so unreviewed
-- ES/JA content and internal QC concerns never reach the public repo or browser.
--
-- Run once in the Supabase SQL editor, after 0001 and 0002.

create table if not exists public.review_items (
  id         uuid primary key default gen_random_uuid(),
  lang       text        not null,     -- fr | ko | es | ja
  en_h       text        not null,     -- glossary primary key
  batch      text,                     -- optional grouping (specialty slug or draft batch)
  concern    text,                     -- the specific question the reviewer answers
  src_h      text,                     -- target head  (ES/JA only; NULL for FR/KO)
  src_l      text,                     -- target lay   (ES/JA only)
  src_d      text,                     -- target def   (ES/JA only)
  created_at timestamptz not null default now()
);

comment on table public.review_items is
  'Flagged review queue. Server-only: read/written with the service-role key. One row per flagged (lang, en_h).';

-- One flag per (lang, en_h); the seed upserts on this.
create unique index if not exists review_items_lang_enh_idx
  on public.review_items (lang, en_h);
create index if not exists review_items_lang_batch_idx
  on public.review_items (lang, batch);

-- Deny-all RLS, same posture as submissions: the server reads with the
-- service-role key (which bypasses RLS); anon/authenticated get nothing.
alter table public.review_items enable row level security;
