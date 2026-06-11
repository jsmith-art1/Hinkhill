create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  requester text not null,
  category text not null,
  priority text not null,
  timeline text not null,
  title text not null,
  details text not null,
  location text,
  budget text,
  success text,
  created_label text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.help_requests enable row level security;

create policy "Anyone can add help requests"
on public.help_requests
for insert
to anon
with check (true);

create policy "Anyone can read help requests"
on public.help_requests
for select
to anon
using (true);
