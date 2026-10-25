-- RankPulse — AI-answer tracking + keyword opportunities. Idempotent. Run after migration-all-billing.sql.

-- ───────── buyer questions put to each AI engine ─────────
create table if not exists ai_prompts (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references sites(id) on delete cascade,
  prompt     text not null,
  stage      text not null default 'Vendor evaluation',
  created_at timestamptz default now(),
  unique (site_id, prompt)
);
create index if not exists ai_prompts_site_idx on ai_prompts(site_id);

-- ───────── one row per prompt × month × engine ─────────
-- engine: chatgpt | perplexity | gemini | claude | google
create table if not exists ai_citations (
  id          bigserial primary key,
  site_id     uuid not null references sites(id) on delete cascade,
  prompt_id   uuid not null references ai_prompts(id) on delete cascade,
  month       text not null,
  engine      text not null,
  answered    boolean not null default false,
  cited       boolean not null default false,
  mention     boolean not null default false,
  src_rank    int,
  sources     int default 0,
  comps       text[] default '{}',
  org_pos     int,                        -- google organic position for the same question
  measured_at timestamptz default now(),
  unique (prompt_id, month, engine)
);
create index if not exists ai_citations_site_month_idx on ai_citations(site_id, month);

-- ───────── keyword opportunities discovered for a site ─────────
create table if not exists opportunities (
  id          bigserial primary key,
  site_id     uuid not null references sites(id) on delete cascade,
  month       text not null,
  phrase      text not null,
  cls         text not null default 'Commercial',   -- Commercial | Blog | Comparison | Integration
  demand      boolean default true,                 -- came from Google Autocomplete
  score       int default 0,
  position    int,                                  -- our position if verified (null = unverified, 0 = not page 1)
  top_domains text[] default '{}',
  updated_at  timestamptz default now(),
  unique (site_id, phrase)
);
create index if not exists opportunities_site_idx on opportunities(site_id);

-- what the AI scan should track per site; engines limited by plan at run time
alter table sites add column if not exists ai_enabled boolean default true;
alter table sites add column if not exists category text;          -- "hotel booking API" — used in prompt templates
alter table runs  add column if not exists ai_status text;         -- queued | running | done | skipped | failed
alter table runs  add column if not exists opps_status text;

-- ───────── RLS ─────────
alter table ai_prompts    enable row level security;
alter table ai_citations  enable row level security;
alter table opportunities enable row level security;

drop policy if exists own_ai_prompts on ai_prompts;
create policy own_ai_prompts on ai_prompts
  for all using (site_id in (select id from sites where account_id = current_account_id()))
  with check (site_id in (select id from sites where account_id = current_account_id()));

drop policy if exists own_ai_citations on ai_citations;
create policy own_ai_citations on ai_citations
  for select using (site_id in (select id from sites where account_id = current_account_id()));

drop policy if exists own_opportunities on opportunities;
create policy own_opportunities on opportunities
  for select using (site_id in (select id from sites where account_id = current_account_id()));

-- ───────── months a site has data for (drives the dashboard columns, from signup forward) ─────────
create or replace view site_months
with (security_invoker = true) as
select site_id, month from rankings group by site_id, month
union
select site_id, month from ai_citations group by site_id, month;
