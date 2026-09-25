alter table public.passengers add column if not exists arrived_at timestamptz;
alter table public.passengers add column if not exists baggage_skipped boolean not null default false;