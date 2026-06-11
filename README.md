# Team Smith HQ Help Requests

A small static app for Jim and Linda to send household help requests to Justin from the Team Smith HQ page.

The family ops hub includes:

- Jim or Linda selection
- Household category, timing, and priority
- A short title, details, location, money note, and "done means" field
- Request preview with copy, email draft, and print actions
- Supabase sync for Justin's dashboard alerts when configured
- Local browser fallback with a pre-addressed email draft if Supabase is not configured or cannot sync

Open `index.html` in a browser to use it.

## Supabase setup

In `app.js`, fill in:

- `supabaseConfig.url`
- `supabaseConfig.anonKey`

Then run `supabase-schema.sql` in Supabase, or create this table and Row Level Security policy manually:

```sql
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
```

To send email draft fallbacks to a default recipient, set `submissionEmail` in `app.js`.
