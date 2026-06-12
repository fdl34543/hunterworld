ALTER TABLE public.player_items DROP CONSTRAINT IF EXISTS player_items_kind_check;
ALTER TABLE public.player_items ADD CONSTRAINT player_items_kind_check
  CHECK (kind = ANY (ARRAY['weapon','armor','head','arm','accessory','consumable','spell']));