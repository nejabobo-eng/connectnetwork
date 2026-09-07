-- ConnectNetwork delivery and customer-notification foundation.
-- Run after marketplace.sql in the Supabase SQL Editor.

alter table public.orders add column if not exists customer_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists delivery_address jsonb;
alter table public.orders add column if not exists delivery_phone text;
alter table public.orders add column if not exists delivery_status text not null default 'address_required'
  check (delivery_status in ('address_required','quote_required','awaiting_dispatch','dispatched','delivered','exception'));
alter table public.orders add column if not exists delivery_provider text;
alter table public.orders add column if not exists delivery_quote_cents integer check (delivery_quote_cents >= 0);

create table if not exists public.order_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  notification_type text not null,
  recipient_email text not null,
  state text not null default 'queued' check (state in ('queued','sent','failed')),
  provider_message_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create unique index if not exists order_notifications_once_idx
  on public.order_notifications(order_id, notification_type);

alter table public.order_notifications enable row level security;
grant select, insert, update, delete on public.order_notifications to service_role;
