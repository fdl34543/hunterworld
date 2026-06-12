DROP POLICY IF EXISTS players_public_read ON public.players;
REVOKE SELECT ON public.players FROM anon, authenticated;
CREATE POLICY "No direct client read of players"
  ON public.players FOR SELECT
  USING (false);