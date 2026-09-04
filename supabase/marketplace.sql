-- ConnectNetwork marketplace additions. Run after v2_connectnetwork.sql.
alter table public.products add column if not exists slug text unique;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists sponsored boolean not null default false;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  supplier_id uuid not null references public.suppliers(id),
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);
alter table public.order_items enable row level security;

-- The private ConnectNetwork backend uses the Supabase service role. Browser users
-- remain restricted by Row Level Security; this grant is never exposed to clients.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.suppliers, public.supplier_opportunities, public.products, public.promotion_plans, public.businesses, public.promotions, public.orders, public.order_items, public.payment_transactions, public.ai_tasks, public.ai_events, public.supplier_deliveries, public.delivery_feedback to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Clearly marked development catalogue. Remove before real supplier products are published.
insert into public.suppliers (id, channel, status, business_name, notes, reviewed_at)
values ('11111111-1111-1111-1111-111111111111', 'connected', 'approved', 'ConnectNetwork Demo Supplier', 'Development catalogue only — not a live supplier.', now())
on conflict (id) do update set status = 'approved';

insert into public.products (id, supplier_id, name, slug, description, category, image_url, retail_price_cents, stock_quantity, active, sponsored)
values
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Solar emergency light', 'solar-emergency-light', 'Rechargeable emergency light for home use.', 'Home & living', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80', 24900, 25, true, true),
  ('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Wireless earbuds', 'wireless-earbuds', 'Compact everyday wireless earbuds.', 'Electronics', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80', 39900, 25, true, true),
  ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Everyday backpack', 'everyday-backpack', 'Practical backpack for work and travel.', 'Fashion', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', 45900, 25, true, false),
  ('10000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Kitchen storage set', 'kitchen-storage-set', 'Reusable storage containers for the kitchen.', 'Home & living', 'https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=80', 29900, 25, true, false),
  ('10000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Smart desk lamp', 'smart-desk-lamp', 'Adjustable desk lamp for home and office.', 'Electronics', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80', 51900, 25, true, false),
  ('10000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Reusable water bottle', 'reusable-water-bottle', 'Durable everyday water bottle.', 'Beauty & care', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80', 17900, 25, true, false)
on conflict (id) do update set name = excluded.name, retail_price_cents = excluded.retail_price_cents, stock_quantity = excluded.stock_quantity, active = excluded.active;
