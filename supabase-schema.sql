-- ════════════════════════════════════════════
-- BachTrip V5 — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ════════════════════════════════════════════

-- 1. PROFILES (extends auth.users)
create table if not exists profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  name          text,
  home_city     text,
  airport_code  text,
  created_at    timestamptz default now()
);

-- Auto-create profile row when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. EVENTS
create table if not exists events (
  id          text primary key default gen_random_uuid()::text,
  day_key     text not null check (day_key in ('d0','d1','d2','d3','d4')),
  time        text not null,
  category    text not null,
  title       text not null,
  location    text,
  notes       text,
  cost        numeric default 0,
  duration    integer default 60,
  booking_url text,
  image_url   text,
  links       jsonb default '[]',
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 3. RSVPs
create table if not exists rsvps (
  id         uuid default gen_random_uuid() primary key,
  event_id   text references events(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  status     text default 'unset' check (status in ('yes','no','unset')),
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

-- ════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════

-- Profiles: users can read all profiles, update only their own
alter table profiles enable row level security;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Events: all authenticated users can read/write
alter table events enable row level security;
create policy "events_select" on events for select using (auth.role() = 'authenticated');
create policy "events_insert" on events for insert with check (auth.role() = 'authenticated');
create policy "events_update" on events for update using (auth.role() = 'authenticated');
create policy "events_delete" on events for delete using (auth.role() = 'authenticated');

-- RSVPs: read all, write own
alter table rsvps enable row level security;
create policy "rsvps_select" on rsvps for select using (auth.role() = 'authenticated');
create policy "rsvps_insert" on rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_update" on rsvps for update using (auth.uid() = user_id);
create policy "rsvps_delete" on rsvps for delete using (auth.uid() = user_id);

-- 4. VOTES (budget voting — $500 per user across all events)
create table if not exists votes (
  id         uuid default gen_random_uuid() primary key,
  event_id   text references events(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(event_id, user_id)  -- one vote per user per event
);

-- ════════════════════════════════════════════
-- ROW LEVEL SECURITY — VOTES
-- ════════════════════════════════════════════

-- Votes: all crew can see all votes, users manage only their own
alter table votes enable row level security;
create policy "votes_select" on votes for select using (auth.role() = 'authenticated');
create policy "votes_insert" on votes for insert with check (auth.uid() = user_id);
create policy "votes_delete" on votes for delete using (auth.uid() = user_id);

-- ════════════════════════════════════════════
-- REALTIME (enable for live sync)
-- ════════════════════════════════════════════
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table rsvps;
alter publication supabase_realtime add table votes;
