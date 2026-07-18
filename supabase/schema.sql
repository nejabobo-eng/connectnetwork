-- ConnectNetwork V1.1 - Supabase schema (distributors, payments, commissions)
-- Safe to run in Supabase SQL Editor. Idempotent where possible.

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'distributor_status') then
	create type distributor_status as enum ('pending','active','suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
	create type payment_status as enum ('pending','approved','rejected');
  end if;
  if not exists (select 1 from pg_type where typname = 'commission_status') then
	create type commission_status as enum ('pending','paid');
  end if;
end $$;

-- Distributor code sequence + generator
create sequence if not exists distributors_code_seq;

create or replace function public.gen_distributor_code()
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  n := nextval('distributors_code_seq');
  return 'CN' || lpad(n::text, 6, '0');
end; $$;

-- Distributors
create table if not exists public.distributors (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  full_name text not null,
  cell_number text not null,
  email text unique,
  address text,
  banking_details jsonb,
  referrer_id uuid references public.distributors(id) on delete set null,
  status distributor_status not null default 'pending',
  join_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Auto-assign code on insert
create or replace function public.distributors_before_insert()
returns trigger language plpgsql as $$
begin
  if new.code is null or new.code = '' then
	new.code := gen_distributor_code();
  end if;
  return new;
end; $$;

drop trigger if exists trg_distributors_before_insert on public.distributors;
create trigger trg_distributors_before_insert
before insert on public.distributors
for each row execute function public.distributors_before_insert();

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributors(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  payment_reference text,
  proof_path text, -- path in Supabase Storage (private bucket)
  payment_date date,
  status payment_status not null default 'pending',
  approved_by text, -- free-form for now
  approval_date timestamptz,
  -- lightweight delivery tracking fields for V1.1
  delivery_status text,
  delivery_date date,
  tracking_number text,
  created_at timestamptz not null default now()
);

-- Commissions
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributors(id) on delete cascade, -- earner
  referred_distributor_id uuid not null references public.distributors(id) on delete cascade,
  amount numeric(10,2) not null default 50,
  month date not null default date_trunc('month', now())::date,
  status commission_status not null default 'pending',
  payment_date date,
  created_at timestamptz not null default now(),
  unique (referred_distributor_id) -- 1 commission per referred distributor activation
);

-- Trigger: when a payment is approved, activate distributor and create commission for referrer (if any)
create or replace function public.on_payment_status_change()
returns trigger language plpgsql security definer as $$
declare
  earner uuid;
begin
  if (tg_op = 'UPDATE') and new.status = 'approved' and coalesce(old.status,'pending') <> 'approved' then
	-- set approval timestamp if not present
	if new.approval_date is null then
	  new.approval_date := now();
	end if;

	-- activate distributor
	update public.distributors d
	  set status = 'active'
	  where d.id = new.distributor_id and d.status <> 'active';

	-- create commission for referrer if exists
	select referrer_id into earner from public.distributors where id = new.distributor_id;
	if earner is not null then
	  insert into public.commissions (distributor_id, referred_distributor_id, amount, month, status)
	  values (earner, new.distributor_id, 50, date_trunc('month', now())::date, 'pending')
	  on conflict (referred_distributor_id) do nothing;
	end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_payments_status_change on public.payments;
create trigger trg_payments_status_change
after update on public.payments
for each row execute function public.on_payment_status_change();

-- RLS: enable and keep locked down by default (service_role only)
alter table public.distributors enable row level security;
alter table public.payments enable row level security;
alter table public.commissions enable row level security;

-- No permissive policies yet. This keeps data private unless using the service role.
-- Add fine-grained policies later when building authenticated apps.

-- Helpful indexes
create index if not exists idx_distributors_referrer on public.distributors(referrer_id);
create index if not exists idx_payments_distributor on public.payments(distributor_id);
create index if not exists idx_commissions_distributor on public.commissions(distributor_id);
create index if not exists idx_commissions_month on public.commissions(month);

-- Sanity defaults (can be adjusted later)
comment on table public.distributors is 'Master distributor register';
comment on table public.payments is 'EFT payments with approval + lightweight delivery tracking';
comment on table public.commissions is 'Referral commissions generated when referred distributor payment is approved';
