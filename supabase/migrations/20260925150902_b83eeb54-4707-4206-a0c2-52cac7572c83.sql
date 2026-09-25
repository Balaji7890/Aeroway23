create table if not exists public.profiles (
  id uuid primary key,
  display_name text,
  avatar_url text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url', new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  feedback smallint check (feedback in (-1, 1)),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
drop policy if exists "own posts all" on public.posts;
create policy "own posts all" on public.posts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  contact text not null,
  category text not null default 'General',
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
grant insert on public.help_requests to anon;
grant select, insert on public.help_requests to authenticated;
grant all on public.help_requests to service_role;
alter table public.help_requests enable row level security;
drop policy if exists "guest submit" on public.help_requests;
create policy "guest submit" on public.help_requests for insert to anon with check (user_id is null);
drop policy if exists "user submit" on public.help_requests;
create policy "user submit" on public.help_requests for insert to authenticated with check (user_id is null or user_id = auth.uid());
drop policy if exists "user read own" on public.help_requests;
create policy "user read own" on public.help_requests for select to authenticated using (user_id = auth.uid());

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  airline text not null,
  route text not null,
  price text,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
drop policy if exists "own bookings" on public.bookings;
create policy "own bookings" on public.bookings for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.passengers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  booking_id uuid,
  passenger_name text not null,
  flight_number text not null,
  airline text not null,
  origin text not null,
  destination text not null,
  departure_time timestamptz not null,
  terminal text,
  gate text,
  seat text,
  cabin text,
  journey_status text not null default 'active',
  checked_in_at timestamptz,
  baggage_dropped_at timestamptz,
  security_cleared_at timestamptz,
  boarding_started_at timestamptz,
  departed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists passengers_user_id_idx on public.passengers (user_id);
grant select, insert, update, delete on public.passengers to authenticated;
grant all on public.passengers to service_role;
alter table public.passengers enable row level security;
drop policy if exists "own passengers" on public.passengers;
create policy "own passengers" on public.passengers for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.journey_steps (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.passengers(id) on delete cascade,
  step_key text not null,
  step_order integer not null,
  title text not null,
  description text not null default '',
  status text not null default 'locked',
  estimated_time_minutes integer,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (passenger_id, step_key)
);
create index if not exists journey_steps_passenger_idx on public.journey_steps (passenger_id, step_order);
grant select, insert, update, delete on public.journey_steps to authenticated;
grant all on public.journey_steps to service_role;
alter table public.journey_steps enable row level security;
drop policy if exists "own journey steps" on public.journey_steps;
create policy "own journey steps" on public.journey_steps for all to authenticated
  using (exists (select 1 from public.passengers p where p.id = journey_steps.passenger_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.passengers p where p.id = journey_steps.passenger_id and p.user_id = auth.uid()));

create table if not exists public.journey_events (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.passengers(id) on delete cascade,
  event_type text not null,
  title text not null,
  message text not null default '',
  old_value text,
  new_value text,
  severity text not null default 'info',
  requires_action boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists journey_events_passenger_idx on public.journey_events (passenger_id, created_at desc);
grant select, insert, delete on public.journey_events to authenticated;
grant all on public.journey_events to service_role;
alter table public.journey_events enable row level security;
drop policy if exists "own journey events" on public.journey_events;
create policy "own journey events" on public.journey_events for all to authenticated
  using (exists (select 1 from public.passengers p where p.id = journey_events.passenger_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.passengers p where p.id = journey_events.passenger_id and p.user_id = auth.uid()));

create or replace function public.create_default_journey_steps() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  mins_to_departure integer := floor(extract(epoch from (new.departure_time - now())) / 60);
begin
  insert into public.journey_steps (passenger_id, step_key, step_order, title, description, status, estimated_time_minutes)
  values
    (new.id, 'booking_confirmed', 1, 'Booking confirmed', 'Your ticket is issued and your journey is being tracked.', 'completed', null),
    (new.id, 'check_in', 2, 'Check in', 'Check in online or at the airline counter to get your boarding pass.', case when mins_to_departure <= 2880 then 'current' else 'upcoming' end, 10),
    (new.id, 'travel_to_airport', 3, 'Travel to the airport', 'Leave with enough time for traffic and parking.', 'locked', 45),
    (new.id, 'airport_arrival', 4, 'Arrive at the airport', 'Enter the terminal and find your airline zone.', 'locked', 10),
    (new.id, 'baggage_check', 5, 'Baggage drop', 'Drop checked bags at the airline counter or self-service belt.', 'locked', 15),
    (new.id, 'security', 6, 'Security screening', 'Have boarding pass and ID ready; liquids and laptops out.', 'locked', 20),
    (new.id, 'find_gate', 7, 'Find your gate', 'Walk to the gate shown on your boarding pass and the screens.', 'locked', 15),
    (new.id, 'boarding', 8, 'Boarding', 'Board when your group is called.', 'locked', 30),
    (new.id, 'departed', 9, 'Takeoff', 'Doors closed and on the way to your destination.', 'locked', null)
  on conflict (passenger_id, step_key) do nothing;

  insert into public.journey_events (passenger_id, event_type, title, message, severity, requires_action)
  values (new.id, 'journey_created', 'Journey created',
    'Tracking started for ' || new.flight_number || ' ' || new.origin || ' to ' || new.destination || '.', 'info', false);
  return new;
end $$;

drop trigger if exists passengers_create_journey on public.passengers;
create trigger passengers_create_journey after insert on public.passengers
for each row execute function public.create_default_journey_steps();

create or replace function public.touch_passenger_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists passengers_touch_updated_at on public.passengers;
create trigger passengers_touch_updated_at before update on public.passengers
for each row execute function public.touch_passenger_updated_at();

alter table public.passengers add column if not exists arrived_at timestamptz;
alter table public.passengers add column if not exists baggage_skipped boolean not null default false;
alter table public.passengers
  add column if not exists flight_status text not null default 'scheduled',
  add column if not exists delay_minutes integer not null default 0,
  add column if not exists is_demo boolean not null default false;