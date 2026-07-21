-- Medi Lexi · first server-side table.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).
--
-- Holds anything a human sends us: French-review corrections today, site
-- feedback next. One table with a `kind` discriminator rather than one table
-- per form, so a new intake needs a new value here and nothing else.

create table if not exists public.submissions (
  id         uuid primary key default gen_random_uuid(),
  kind       text        not null check (kind in ('fr_review', 'feedback')),
  batch      text,                      -- e.g. 'Cardiologie'; null for general feedback
  payload    jsonb       not null,      -- the corrections array, or the feedback body
  note       text,                      -- optional free-text from the sender
  created_at timestamptz not null default now()
);

comment on table public.submissions is
  'Inbound submissions. Server-only: written with the service-role key, never from the browser.';

-- Row-level security ON with ZERO policies is a deliberate deny-all: the anon
-- and authenticated keys can neither read nor write this table. The server
-- inserts with the service-role key, which bypasses RLS by design. If a policy
-- is ever added here, it widens access - do it on purpose, not by habit.
alter table public.submissions enable row level security;

create index if not exists submissions_kind_created_idx
  on public.submissions (kind, created_at desc);
