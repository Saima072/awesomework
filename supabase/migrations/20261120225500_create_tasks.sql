-- Applied to the Supabase project on 2026-11-20.
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 200),
  due date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.tasks is 'Start-page dashboard tasks. Accessed only by the API server with the secret key.';

-- RLS on with no policies: the public (publishable/anon) key gets no access.
alter table public.tasks enable row level security;

create index tasks_due_idx on public.tasks (due);
