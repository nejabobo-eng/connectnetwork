-- Run this once in the Supabase SQL editor before deploying product view tracking.
alter table public.products add column if not exists view_count integer not null default 0 check (view_count >= 0);

create or replace function public.increment_product_views(product_uuid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set view_count = view_count + 1
  where id = product_uuid
    and active = true
    and lifecycle_status in ('active', 'out_of_stock');
$$;

grant execute on function public.increment_product_views(uuid) to service_role;
