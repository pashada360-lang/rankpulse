-- RankPulse — multi-tenant schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to re-run: every statement is idempotent.

create extension if not exists "pgcrypto";

-- ───────────────────────── accounts ─────────────────────────
create table if not exists accounts (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  company       text not null,
  plan          text not null default 'trial',    -- trial | monthly | annual
  status        text not null default 'active',   -- active | past_due | cancelled
  keyword_limit int  not null default 50,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at    timestamptz default now(),
  unique (owner_id)
);

-- ───────────────────────── sites ─────────────────────────
create table if not exists sites (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  domain      text not null,                      -- example.com, no scheme, no www
  brand_word  text,                               -- how the brand reads in prose
  regions     text[] not null default '{IN,US}',  -- ISO-ish keys: IN US ME EU
  created_at  timestamptz default now()
);
create index if not exists sites_account_idx on sites(account_id);

-- ───────────────────────── keywords ─────────────────────────
create table if not exists keywords (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references sites(id) on delete cascade,
  phrase     text not null,
  grp        text default 'General',
  tab        text default 'commercial',           -- commercial | priority | longtail
  created_at timestamptz default now(),
  unique (site_id, phrase)
);
create index if not exists keywords_site_idx on keywords(site_id);

-- ───────────────────────── runs ─────────────────────────
create table if not exists runs (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  month       text not null,                      -- '2026-10'
  status      text not null default 'queued',     -- queued | running | done | failed
  measured    int default 0,
  ranking     int default 0,
  errors      int default 0,
  note        text,
  started_at  timestamptz,
  finished_at timestamptz,
  unique (site_id, month)
);
create index if not exists runs_site_idx on runs(site_id);

-- ───────────────────────── rankings ─────────────────────────
-- position: null = not measured · 0 = measured, not in top 10 · 1-10 = real position
create table if not exists rankings (
  id          bigserial primary key,
  site_id     uuid not null references sites(id) on delete cascade,
  keyword_id  uuid not null references keywords(id) on delete cascade,
  month       text not null,
  region      text not null,
  position    int,
  top_domains text[],
  measured_at timestamptz default now(),
  unique (keyword_id, month, region)
);
create index if not exists rankings_site_month_idx on rankings(site_id, month);

-- ───────────────────────── helper ─────────────────────────
-- the account id belonging to the signed-in user
create or replace function current_account_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from accounts where owner_id = auth.uid() limit 1;
$$;

-- ───────────────────────── row level security ─────────────────────────
-- Every table is locked down: a customer can only ever read or write their own rows.
alter table accounts enable row level security;
alter table sites    enable row level security;
alter table keywords enable row level security;
alter table runs     enable row level security;
alter table rankings enable row level security;

drop policy if exists own_account on accounts;
create policy own_account on accounts
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists own_sites on sites;
create policy own_sites on sites
  for all using (account_id = current_account_id()) with check (account_id = current_account_id());

drop policy if exists own_keywords on keywords;
create policy own_keywords on keywords
  for all using (site_id in (select id from sites where account_id = current_account_id()))
  with check (site_id in (select id from sites where account_id = current_account_id()));

drop policy if exists own_runs on runs;
create policy own_runs on runs
  for all using (site_id in (select id from sites where account_id = current_account_id()))
  with check (site_id in (select id from sites where account_id = current_account_id()));

drop policy if exists own_rankings on rankings;
create policy own_rankings on rankings
  for select using (site_id in (select id from sites where account_id = current_account_id()));

-- ───────────────────────── auto-create an account on signup ─────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into accounts (owner_id, company)
  values (new.id, coalesce(new.raw_user_meta_data->>'company', split_part(new.email, '@', 1)))
  on conflict (owner_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ───────────────────────── dashboard view ─────────────────────────
-- one row per keyword with its month/region grid as JSON, ready for the UI
create or replace view keyword_grid
with (security_invoker = true) as
select
  k.id, k.site_id, k.phrase, k.grp, k.tab,
  coalesce(
    jsonb_object_agg(r.month || '|' || r.region, r.position)
      filter (where r.month is not null),
    '{}'::jsonb
  ) as cells
from keywords k
left join rankings r on r.keyword_id = k.id
group by k.id, k.site_id, k.phrase, k.grp, k.tab;
