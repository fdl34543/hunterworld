
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT 'Player',
  job text NOT NULL DEFAULT 'Warrior',
  color text NOT NULL DEFAULT '#22c55e',
  avatar text NOT NULL DEFAULT '🧑',
  custom_avatar_url text,
  gold integer NOT NULL DEFAULT 100,
  xp integer NOT NULL DEFAULT 0,
  hp integer NOT NULL DEFAULT 100,
  energy integer NOT NULL DEFAULT 5,
  base_damage integer NOT NULL DEFAULT 5,
  base_defense integer NOT NULL DEFAULT 2,
  last_energy_at timestamptz NOT NULL DEFAULT now(),
  last_study_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_public_read" ON public.players FOR SELECT USING (true);

CREATE INDEX players_wallet_idx ON public.players(wallet_address);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
