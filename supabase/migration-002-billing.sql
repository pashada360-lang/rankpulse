-- RankPulse — billing fields. Paste into Supabase → SQL Editor → Run. Idempotent.

alter table accounts add column if not exists region_limit   int  not null default 2;
alter table accounts add column if not exists billing_cycle  text;                 -- monthly | annual
alter table accounts add column if not exists plan_started   timestamptz;
alter table accounts add column if not exists plan_renews    timestamptz;
alter table accounts add column if not exists razorpay_customer_id     text;
alter table accounts add column if not exists razorpay_subscription_id text;

-- one row per payment event, for reconciliation
create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references accounts(id) on delete cascade,
  provider      text not null default 'razorpay',
  provider_id   text,                       -- payment / subscription id
  plan          text not null,
  cycle         text not null,              -- monthly | annual
  amount_inr    int  not null,
  status        text not null,              -- created | paid | failed | refunded
  raw           jsonb,
  created_at    timestamptz default now()
);
alter table payments enable row level security;
drop policy if exists own_payments on payments;
create policy own_payments on payments
  for select using (account_id = current_account_id());

-- keep keyword inserts inside the plan limit, server-side, so the limit can't be bypassed
create or replace function enforce_keyword_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare lim int; cnt int;
begin
  select a.keyword_limit into lim
    from sites s join accounts a on a.id = s.account_id
   where s.id = new.site_id;
  select count(*) into cnt from keywords where site_id = new.site_id;
  if cnt >= lim then
    raise exception 'Keyword limit reached (% on your plan). Upgrade to add more.', lim;
  end if;
  return new;
end; $$;
drop trigger if exists keywords_limit on keywords;
create trigger keywords_limit before insert on keywords
  for each row execute function enforce_keyword_limit();
