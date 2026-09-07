-- Medi Lexi · generalize `submissions` for multi-language review.
--
-- Adds a `lang` dimension and a generic `review` kind so ONE table holds the
-- reviewer submissions for every language (FR / KO / ES / JA). The original
-- `fr_review` rows keep working untouched: they predate this column, so their
-- `lang` is NULL, and the pull script treats a NULL lang on a fr_review row as
-- French. New submissions use kind='review' with lang set.
--
-- Run once in the Supabase SQL editor (Dashboard -> SQL -> New query), after
-- 0001_submissions.sql.

alter table public.submissions
  add column if not exists lang text;

-- Widen the kind check to allow the generic 'review' kind. The 0001 inline
-- check is auto-named submissions_kind_check by Postgres.
alter table public.submissions
  drop constraint if exists submissions_kind_check;
alter table public.submissions
  add constraint submissions_kind_check
  check (kind in ('review', 'fr_review', 'feedback'));

-- Newest-snapshot-per-(lang, batch) reads: order by created_at desc within a
-- (kind, lang, batch) group. Complements the existing kind/created index.
create index if not exists submissions_review_idx
  on public.submissions (kind, lang, batch, created_at desc);

comment on column public.submissions.lang is
  'Review language (fr|ko|es|ja) for kind=review rows; NULL for feedback and legacy fr_review.';
