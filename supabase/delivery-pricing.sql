-- Run after supabase/fulfilment.sql in the Supabase SQL Editor.
-- Defaults make existing listings shippable until their supplier confirms exact parcel details.
alter table public.products add column if not exists shipping_weight_grams integer not null default 1000 check (shipping_weight_grams > 0);
alter table public.products add column if not exists shipping_length_cm numeric(8,2) not null default 30 check (shipping_length_cm > 0);
alter table public.products add column if not exists shipping_width_cm numeric(8,2) not null default 20 check (shipping_width_cm > 0);
alter table public.products add column if not exists shipping_height_cm numeric(8,2) not null default 10 check (shipping_height_cm > 0);
alter table public.products add column if not exists bulky_surcharge_cents integer not null default 0 check (bulky_surcharge_cents >= 0);
alter table public.products add column if not exists delivery_override_cents integer check (delivery_override_cents >= 0);

alter table public.orders add column if not exists delivery_zone text not null default 'national'
  check (delivery_zone in ('local', 'regional', 'national', 'remote'));
