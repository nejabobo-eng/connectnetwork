create table if not exists public.supplier_source_checks (
  id uuid primary key default gen_random_uuid(),
  source_url text not null unique,
  supplier_id uuid references public.suppliers(id),
  product_id uuid references public.products(id),
  source_price_cents integer,
  source_currency char(3) not null default 'ZAR',
  source_image_urls jsonb not null default '[]'::jsonb,
  availability text,
  checked_at timestamptz not null default now(),
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists source_price_cents integer;
alter table public.products add column if not exists source_currency char(3);
alter table public.products add column if not exists source_checked_at timestamptz;
alter table public.products add column if not exists source_image_urls jsonb;
alter table public.products add column if not exists supplier_source_url text;

create index if not exists supplier_source_checks_checked_at_idx on public.supplier_source_checks (checked_at desc);
create unique index if not exists products_supplier_source_url_key on public.products (supplier_source_url) where supplier_source_url is not null;

grant select, insert, update, delete on public.supplier_source_checks to service_role;
