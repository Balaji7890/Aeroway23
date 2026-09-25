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