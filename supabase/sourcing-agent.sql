-- Autonomous Supplier Sourcing Agent
-- Run after the existing Connect Network procurement schema.
-- Customer contact fields remain only in procurement_enquiries. RFQ records use a
-- frozen, contact-free requirements snapshot so suppliers never receive them.

alter table public.procurement_supplier_candidates
  add column if not exists supplier_id uuid references public.suppliers(id),
  add column if not exists source_type text not null default 'external' check (source_type in ('registered', 'external')),
  add column if not exists priority_tier smallint check (priority_tier between 1 and 5),
  add column if not exists match_score numeric(5,2),
  add column if not exists delivery_capable boolean not null default false,
  add column if not exists province text,
  add column if not exists municipality text,
  add column if not exists category text,
  add column if not exists selected_at timestamptz;

create table if not exists public.procurement_rfq_queue (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.procurement_enquiries(id) on delete restrict,
  candidate_id uuid not null references public.procurement_supplier_candidates(id) on delete restrict,
  procurement_reference text not null unique,
  recipient_email text not null,
  requirements_snapshot jsonb not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'responded', 'cancelled')),
  sent_at timestamptz,
  provider_message_id text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(enquiry_id, candidate_id)
);

create table if not exists public.procurement_supply_gaps (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null unique references public.procurement_enquiries(id) on delete restrict,
  category text,
  requested_item text not null,
  province text,
  municipality text,
  reason text not null check (reason in ('no_relevant_supplier', 'no_delivery_capable_supplier', 'insufficient_supplier_coverage', 'unresolved_after_rfq')),
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'under_review', 'not_viable', 'enterprise_investigation', 'resolved')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists procurement_rfq_queue_status_idx on public.procurement_rfq_queue(status, created_at desc);
create index if not exists procurement_supplier_candidates_rank_idx on public.procurement_supplier_candidates(enquiry_id, priority_tier, match_score desc);

-- These records are accessed only through the service-role control API.
alter table public.procurement_rfq_queue enable row level security;
alter table public.procurement_supply_gaps enable row level security;
grant select, insert, update, delete on public.procurement_rfq_queue, public.procurement_supply_gaps to service_role;
