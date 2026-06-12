import { useMemo } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import type { DbPlayer } from "@/lib/players.functions";

type Props = {
  onExit: () => void;
};

/**
 * Full-fidelity spectator view: the real `GameCanvas` rendered in spectator
 * mode with a synthetic player stub. WASD/click moves the camera around the
 * world. Monsters spawn, seasons tick, other players move live — but no
 * mutations, no auth, no interactive modals.
 */
export function SpectatorCanvas({ onExit }: Props) {
  const stub = useMemo<DbPlayer>(() => {
    const id = `spectator-${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date().toISOString();
    return {
      id,
      user_id: null,
      wallet_address: id, // used as presence + identity key; spectator-* prefix
      name: "Spectator",
      job: "Watcher",
      color: "#888",
      avatar: "👁️",
      custom_avatar_url: null,
      character_sprite: "warrior",
      gold: 0,
      xp: 0,
      hp: 100,
      energy: 0,
      base_damage: 1,
      base_defense: 0,
      last_energy_at: now,
      last_study_at: null,
      last_fountain_at: null,
      last_farm_at: null,
      last_beer_at: null,
      max_hp: 100,
      equipped_weapon: null,
      equipped_armor: null,
      last_boss_at: null,
      last_boss_at_by_map: null,
      created_at: now,
      updated_at: now,
    };
  }, []);

  return <GameCanvas player={stub} spectator onExitSpectator={onExit} />;
}
