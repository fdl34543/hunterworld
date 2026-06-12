
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS max_hp integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS equipped_weapon uuid,
  ADD COLUMN IF NOT EXISTS equipped_armor uuid,
  ADD COLUMN IF NOT EXISTS last_boss_at timestamptz;

CREATE TABLE public.player_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  def_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('weapon','armor')),
  rarity text NOT NULL,
  attack integer NOT NULL DEFAULT 0,
  defense integer NOT NULL DEFAULT 0,
  acquired_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX player_items_wallet_idx ON public.player_items (wallet_address);

GRANT SELECT ON public.player_items TO authenticated;
GRANT ALL ON public.player_items TO service_role;

ALTER TABLE public.player_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client read of player_items"
  ON public.player_items FOR SELECT
  USING (false);
