-- Run after delivery.sql in the Supabase SQL Editor.
alter table public.supplier_deliveries add column if not exists procurement_url text;
alter table public.supplier_deliveries add column if not exists procurement_cost_cents integer check (procurement_cost_cents >= 0);
alter table public.supplier_deliveries add column if not exists handling_notes text;
alter table public.supplier_deliveries add column if not exists internal_reference text;
alter table public.orders add column if not exists delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0);
alter table public.orders add column if not exists order_number text unique;
alter table public.products add column if not exists supplier_cost_cents integer check (supplier_cost_cents >= 0);
alter table public.products add column if not exists lifecycle_status text not null default 'active'
  check (lifecycle_status in ('active', 'paused', 'out_of_stock', 'archived'));
alter table public.products add column if not exists updated_at timestamptz not null default now();

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
