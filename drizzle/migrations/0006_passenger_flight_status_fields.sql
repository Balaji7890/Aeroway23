ALTER TABLE public.passengers
  ADD COLUMN IF NOT EXISTS flight_status text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS delay_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;