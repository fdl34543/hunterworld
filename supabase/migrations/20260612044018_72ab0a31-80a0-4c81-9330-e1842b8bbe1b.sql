-- 1. profiles table linked to auth.users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. players: add user_id
ALTER TABLE public.players
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX players_user_id_uidx ON public.players(user_id) WHERE user_id IS NOT NULL;

-- Allow wallet_address to be nullable (we'll still set it for new rows but it's no longer the identity)
ALTER TABLE public.players ALTER COLUMN wallet_address DROP NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;

DROP POLICY IF EXISTS "No direct client read of players" ON public.players;

CREATE POLICY "Users read own player"
  ON public.players FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own player"
  ON public.players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own player"
  ON public.players FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own player"
  ON public.players FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. player_items: add user_id
ALTER TABLE public.player_items
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX player_items_user_id_idx ON public.player_items(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.player_items ALTER COLUMN wallet_address DROP NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_items TO authenticated;
GRANT ALL ON public.player_items TO service_role;

DROP POLICY IF EXISTS "No direct client read of player_items" ON public.player_items;

CREATE POLICY "Users read own items"
  ON public.player_items FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own items"
  ON public.player_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own items"
  ON public.player_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own items"
  ON public.player_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. claim_player_by_wallet: link old wallet-keyed rows to current auth user
CREATE OR REPLACE FUNCTION public.claim_player_by_wallet(p_wallet text)
RETURNS public.players
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  claimed public.players;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Upsert profile
  INSERT INTO public.profiles (id, wallet_address)
  VALUES (uid, p_wallet)
  ON CONFLICT (id) DO UPDATE SET wallet_address = EXCLUDED.wallet_address, updated_at = now();

  -- Try to claim an unclaimed player row for this wallet
  UPDATE public.players
    SET user_id = uid
    WHERE wallet_address = p_wallet AND user_id IS NULL
    RETURNING * INTO claimed;

  IF claimed.id IS NOT NULL THEN
    UPDATE public.player_items
      SET user_id = uid
      WHERE wallet_address = p_wallet AND user_id IS NULL;
  END IF;

  RETURN claimed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_player_by_wallet(text) TO authenticated;

-- 5. public leaderboard function (anon-readable, only safe columns)
CREATE OR REPLACE FUNCTION public.leaderboard_top(p_offset int DEFAULT 0, p_limit int DEFAULT 20)
RETURNS TABLE (
  wallet_address text,
  name text,
  job text,
  avatar text,
  color text,
  xp int,
  gold int
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    COALESCE(p.wallet_address, p.user_id::text) AS wallet_address,
    p.name, p.job, p.avatar, p.color, p.xp, p.gold
  FROM public.players p
  WHERE p.user_id IS NOT NULL
  ORDER BY p.xp DESC
  LIMIT GREATEST(1, LEAST(p_limit, 50))
  OFFSET GREATEST(0, p_offset);
$$;

CREATE OR REPLACE FUNCTION public.leaderboard_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT count(*) FROM public.players WHERE user_id IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.leaderboard_top(int, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_count() TO anon, authenticated;