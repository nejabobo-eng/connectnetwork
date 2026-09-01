-- ConnectNetwork V2 control plane. Run after schema.sql.
create extension if not exists pgcrypto;
create extension if not exists vector;

do $$ begin
  create type public.supplier_channel as enum ('connected', 'ai_discovered');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.supplier_status as enum ('pending_review', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.job_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  channel public.supplier_channel not null,
  status public.supplier_status not null default 'pending_review',
  business_name text not null, contact_name text, email text, phone text,
  website_url text, catalogue_url text, notes text, source_url text,
  created_at timestamptz not null default now(), reviewed_at timestamptz
);
create table if not exists public.supplier_opportunities (
  id uuid primary key default gen_random_uuid(), status text not null default 'researching'
    check (status in ('researching','ready_for_review','approved','rejected','contacted')),
  title text not null, source_url text, demand_summary text,
  proposed_product jsonb,
  estimated_margin numeric(5,2), confidence numeric(4,3) check (confidence between 0 and 1),
  proposed_supplier_id uuid references public.suppliers(id), created_at timestamptz not null default now(), reviewed_at timestamptz
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), supplier_id uuid not null references public.suppliers(id),
  name text not null, description text, retail_price_cents integer check (retail_price_cents >= 0),
  stock_quantity integer check (stock_quantity >= 0), active boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.promotion_plans (
  id uuid primary key default gen_random_uuid(), name text not null unique, amount_cents integer not null check (amount_cents > 0),
  currency char(3) not null default 'ZAR', interval_months integer not null default 1, active boolean not null default true, created_at timestamptz not null default now()
);
insert into public.promotion_plans (name, amount_cents) values ('ConnectNetwork Promotion', 10000) on conflict (name) do update set amount_cents = excluded.amount_cents;
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null unique, created_at timestamptz not null default now()
);
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id), plan_id uuid not null references public.promotion_plans(id),
  status text not null default 'pending_payment' check (status in ('pending_payment','active','paused','cancelled')), starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), status text not null default 'draft' check (status in ('draft','pending_payment','paid','processing','fulfilled','cancelled','refunded')),
  currency char(3) not null default 'ZAR', total_cents integer not null check (total_cents >= 0), customer_email text, created_at timestamptz not null default now()
);
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id), provider text not null default 'yoco',
  provider_payment_id text unique, state text not null default 'pending' check (state in ('pending','succeeded','failed','cancelled','refunded')),
  amount_cents integer not null check (amount_cents > 0), currency char(3) not null default 'ZAR', created_at timestamptz not null default now()
);
alter table public.payment_transactions add column if not exists promotion_id uuid references public.promotions(id);
create table if not exists public.ai_tasks (
  id uuid primary key default gen_random_uuid(), task_type text not null, status public.job_status not null default 'queued', payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0, available_at timestamptz not null default now(), locked_at timestamptz, locked_by text, completed_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists ai_tasks_available_idx on public.ai_tasks (status, available_at) where status = 'queued';
create table if not exists public.ai_events (
  id uuid primary key default gen_random_uuid(), task_id uuid references public.ai_tasks(id), event_type text not null, actor text not null default 'system',
  payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create or replace function public.prevent_ai_event_mutation() returns trigger language plpgsql as $$ begin raise exception 'ai_events is append-only'; end; $$;
drop trigger if exists ai_events_immutable on public.ai_events;
create trigger ai_events_immutable before update or delete on public.ai_events for each row execute function public.prevent_ai_event_mutation();
create or replace function public.enforce_ai_constitution() returns trigger language plpgsql as $$
begin
  if current_setting('app.actor', true) = 'ai_operator' then
    if tg_table_name = 'suppliers' and new.status <> 'pending_review' then raise exception 'AI may only create suppliers pending review'; end if;
    if tg_table_name = 'supplier_opportunities' and new.status not in ('researching','ready_for_review') then raise exception 'AI may only prepare opportunities for review'; end if;
  end if; return new;
end; $$;
drop trigger if exists suppliers_ai_constitution on public.suppliers;
create trigger suppliers_ai_constitution before insert or update on public.suppliers for each row execute function public.enforce_ai_constitution();
drop trigger if exists opportunities_ai_constitution on public.supplier_opportunities;
create trigger opportunities_ai_constitution before insert or update on public.supplier_opportunities for each row execute function public.enforce_ai_constitution();
alter table public.suppliers enable row level security;
alter table public.supplier_opportunities enable row level security;
alter table public.products enable row level security;
alter table public.promotion_plans enable row level security;
alter table public.businesses enable row level security;
alter table public.promotions enable row level security;
alter table public.orders enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.ai_tasks enable row level security;
alter table public.ai_events enable row level security;

-- Supplier-operated fulfilment is tracked independently of ConnectNetwork.
create table if not exists public.supplier_deliveries (
  id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id),
  supplier_id uuid not null references public.suppliers(id), order_id uuid references public.orders(id),
  supplier_reference text, tracking_number text, carrier text,
  status text not null default 'awaiting_dispatch' check (status in ('awaiting_dispatch','dispatched','delivered','failed','returned')),
  dispatched_at timestamptz, delivered_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.delivery_feedback (
  id uuid primary key default gen_random_uuid(), delivery_id uuid not null unique references public.supplier_deliveries(id),
  rating smallint not null check (rating between 1 and 5),
  delivered_as_expected boolean not null, comment text, created_at timestamptz not null default now()
);
create or replace view public.supplier_reliability as
select s.id as supplier_id, s.business_name,
  count(d.id) filter (where d.status = 'delivered') as delivered_orders,
  count(d.id) filter (where d.status = 'failed') as failed_orders,
  round(avg(f.rating)::numeric, 2) as average_feedback_rating,
  round((count(d.id) filter (where d.status = 'delivered'))::numeric / nullif(count(d.id) filter (where d.status in ('delivered','failed')), 0), 3) as delivery_success_rate
from public.suppliers s
left join public.supplier_deliveries d on d.supplier_id = s.id
left join public.delivery_feedback f on f.delivery_id = d.id
group by s.id, s.business_name;
alter table public.supplier_deliveries enable row level security;
alter table public.delivery_feedback enable row level security;
