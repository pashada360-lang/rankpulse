-- RankPulse — recurring billing. Paste into Supabase → SQL Editor → Run. Idempotent.

-- cache of Razorpay Plan ids, created by the app on first use (tier:cycle:currency → plan_id)
create table if not exists rzp_plans (
  id         text primary key,
  plan_id    text not null,
  created_at timestamptz default now()
);
alter table rzp_plans enable row level security;   -- service role only; no policies on purpose

alter table accounts add column if not exists currency text default 'USD';
alter table payments add column if not exists currency text default 'INR';
alter table payments add column if not exists amount   int;             -- minor units, any currency

-- webhook events we've already processed, so a retried delivery can't double-apply
create table if not exists webhook_events (
  id          text primary key,         -- razorpay event id
  event       text not null,
  received_at timestamptz default now()
);
alter table webhook_events enable row level security;
