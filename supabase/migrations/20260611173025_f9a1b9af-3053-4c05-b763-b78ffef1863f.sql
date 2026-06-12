
ALTER TABLE public.player_items
  ADD COLUMN IF NOT EXISTS slot_kind text NOT NULL DEFAULT 'inventory',
  ADD COLUMN IF NOT EXISTS slot_index integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS effect text,
  ADD COLUMN IF NOT EXISTS amount integer NOT NULL DEFAULT 0;

-- Move currently-equipped items to wear slots (0=weapon, 1=armor)
UPDATE public.player_items pi
SET slot_kind = 'wear',
    slot_index = CASE WHEN pi.kind = 'weapon' THEN 0 ELSE 1 END
FROM public.players p
WHERE p.wallet_address = pi.wallet_address
  AND (p.equipped_weapon = pi.id OR p.equipped_armor = pi.id);

-- Assign sequential slot_index to remaining inventory items per player
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY wallet_address ORDER BY acquired_at) - 1 AS idx
  FROM public.player_items
  WHERE slot_kind = 'inventory'
)
UPDATE public.player_items pi
SET slot_index = r.idx
FROM ranked r
WHERE pi.id = r.id;

CREATE INDEX IF NOT EXISTS player_items_slots_idx
  ON public.player_items (wallet_address, slot_kind, slot_index);
