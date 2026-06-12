import { useEffect, useState } from "react";
import { getCurrentSeason } from "@/game/seasons";

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SeasonBadge({ compact = false }: { compact?: boolean } = {}) {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const { season, remainingMs } = getCurrentSeason(tick);
  if (compact) {
    return (
      <div
        className={`pointer-events-none inline-flex items-center gap-1.5 self-start rounded-lg bg-gradient-to-r ${season.badgeClass} px-2 py-1 text-white shadow-lg ring-1 ring-white/20`}
      >
        <span className="text-sm drop-shadow">{season.emoji}</span>
        <span className="text-[11px] font-bold leading-tight">
          {season.name}
          <span className="ml-1 font-normal opacity-90">· {formatRemaining(remainingMs)}</span>
        </span>
      </div>
    );
  }
  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-2xl bg-gradient-to-r ${season.badgeClass} px-4 py-2 text-white shadow-xl backdrop-blur ring-1 ring-white/30`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl drop-shadow">{season.emoji}</span>
        <div className="leading-tight">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
            Season
          </div>
          <div className="text-base font-bold">
            {season.name} · {season.bossName}
          </div>
          <div className="text-[11px] opacity-90">
            {season.effect} · ends in {formatRemaining(remainingMs)}
          </div>
        </div>
      </div>
    </div>
  );
}