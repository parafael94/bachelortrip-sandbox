-- ════════════════════════════════════════════
-- BachTrip V5 — Supabase Schema (idempotent)
-- Safe to run multiple times
-- ════════════════════════════════════════════

-- 1. TABLES

CREATE TABLE IF NOT EXISTS profiles (
  id           uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name         text,
  home_city    text,
  airport_code text,
  trip_rsvp    text DEFAULT 'unset' CHECK (trip_rsvp IN ('yes','no','unset')),
  created_at   timestamptz DEFAULT now()
);

-- Idempotent column add for existing installs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trip_rsvp text DEFAULT 'unset' CHECK (trip_rsvp IN ('yes','no','unset'));

CREATE TABLE IF NOT EXISTS events (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  day_key     text NOT NULL CHECK (day_key IN ('d0','d1','d2','d3','d4')),
  time        text NOT NULL,
  category    text NOT NULL,
  title       text NOT NULL,
  location    text,
  notes       text,
  cost        numeric DEFAULT 0,
  duration    integer DEFAULT 60,
  booking_url text,
  image_url   text,
  links       jsonb DEFAULT '[]',
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rsvps (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   text REFERENCES events(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status     text DEFAULT 'unset' CHECK (status IN ('yes','no','unset')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS votes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   text REFERENCES events(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Airbnb options (admin-managed, not user-created)
CREATE TABLE IF NOT EXISTS airbnbs (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title           text NOT NULL,
  description     text,
  price_per_night numeric DEFAULT 0,
  total_price     numeric DEFAULT 0,
  sleeps          integer DEFAULT 6,
  location        text,
  url             text,
  image_url       text,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- Airbnb votes (separate from activity budget votes)
CREATE TABLE IF NOT EXISTS airbnb_votes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  airbnb_id   uuid REFERENCES airbnbs(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(airbnb_id, user_id)
);

-- 2. HANDLE NEW USER TRIGGER

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 3. ROW LEVEL SECURITY

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps        ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbnbs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbnb_votes ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Events
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;
DROP POLICY IF EXISTS "events_update" ON events;
DROP POLICY IF EXISTS "events_delete" ON events;
CREATE POLICY "events_select" ON events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "events_update" ON events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "events_delete" ON events FOR DELETE USING (auth.role() = 'authenticated');

-- RSVPs
DROP POLICY IF EXISTS "rsvps_select" ON rsvps;
DROP POLICY IF EXISTS "rsvps_insert" ON rsvps;
DROP POLICY IF EXISTS "rsvps_update" ON rsvps;
DROP POLICY IF EXISTS "rsvps_delete" ON rsvps;
CREATE POLICY "rsvps_select" ON rsvps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "rsvps_insert" ON rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rsvps_update" ON rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "rsvps_delete" ON rsvps FOR DELETE USING (auth.uid() = user_id);

-- Activity votes
DROP POLICY IF EXISTS "votes_select" ON votes;
DROP POLICY IF EXISTS "votes_insert" ON votes;
DROP POLICY IF EXISTS "votes_delete" ON votes;
CREATE POLICY "votes_select" ON votes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Airbnbs (read-only for users; managed via Supabase dashboard)
DROP POLICY IF EXISTS "airbnbs_select" ON airbnbs;
CREATE POLICY "airbnbs_select" ON airbnbs FOR SELECT USING (auth.role() = 'authenticated');

-- Airbnb votes
DROP POLICY IF EXISTS "airbnb_votes_select" ON airbnb_votes;
DROP POLICY IF EXISTS "airbnb_votes_insert" ON airbnb_votes;
DROP POLICY IF EXISTS "airbnb_votes_delete" ON airbnb_votes;
CREATE POLICY "airbnb_votes_select" ON airbnb_votes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "airbnb_votes_insert" ON airbnb_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "airbnb_votes_delete" ON airbnb_votes FOR DELETE USING (auth.uid() = user_id);

-- 4. REPLICA IDENTITY (required for Realtime)

ALTER TABLE events       REPLICA IDENTITY FULL;
ALTER TABLE rsvps        REPLICA IDENTITY FULL;
ALTER TABLE votes        REPLICA IDENTITY FULL;
ALTER TABLE airbnb_votes REPLICA IDENTITY FULL;

-- 5. REALTIME (idempotent — skip if already a member)

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'events')
  THEN ALTER PUBLICATION supabase_realtime ADD TABLE events; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'rsvps')
  THEN ALTER PUBLICATION supabase_realtime ADD TABLE rsvps; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'votes')
  THEN ALTER PUBLICATION supabase_realtime ADD TABLE votes; END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'airbnb_votes')
  THEN ALTER PUBLICATION supabase_realtime ADD TABLE airbnb_votes; END IF;
END $$;

-- 6. SEED AIRBNBS
-- Add Airbnb options manually via the Supabase dashboard (Table Editor → airbnbs)
-- or paste an INSERT here when you have the real links.
