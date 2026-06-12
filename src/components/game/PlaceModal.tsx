import type { Place } from "@/game/types";
import { useEffect, useState } from "react";

export type Cooldown = {
  label: string;
  remainingMs: number;
  totalMs: number;
  /** If false, the cooldown is informational only and does not disable the action button. Defaults to true. */
  blocking?: boolean;
};

export function PlaceModal({
  place,
  onAction,
  onClose,
  cooldown,
}: {
  place: Place;
  onAction: () => void;
  onClose: () => void;
  cooldown?: Cooldown | null;
}) {
  // Tick once per second so the timer updates while the modal is open.
  const [, force] = useState(0);
  useEffect(() => {
    if (!cooldown || cooldown.remainingMs <= 0) return;
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const remaining = Math.max(0, (cooldown?.remainingMs ?? 0) - 0);
  const total = cooldown?.totalMs ?? 0;
  const elapsedPct = total > 0 ? Math.max(0, Math.min(1, 1 - remaining / total)) : 1;
  const ready = !cooldown || remaining <= 0;
  const blocking = cooldown?.blocking !== false;
  const canAct = ready || !blocking;

  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center mmo-overlay">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 shadow-2xl">
        <div className="mb-1 text-3xl">{place.emoji}</div>
        <h2 className="text-2xl font-extrabold text-slate-900">{place.name}</h2>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">{place.job}</p>
        <p className="mb-5 text-sm text-slate-600">{place.description}</p>
        {cooldown && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">{cooldown.label}</span>
              <span className={ready ? "text-emerald-600" : "text-rose-600"}>
                {ready ? "Ready!" : fmt(remaining)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-[width] duration-500 ${ready ? "bg-emerald-500" : "bg-rose-500"}`}
                style={{ width: `${elapsedPct * 100}%` }}
              />
            </div>
          </div>
        )}
        <button
          onClick={onAction}
          disabled={!canAct}
          className={`mb-2 w-full rounded-lg px-4 py-2.5 font-bold shadow transition-colors ${canAct ? "bg-orange-500 text-white hover:bg-orange-600" : "cursor-not-allowed bg-slate-300 text-slate-500"}`}
        >
          {place.action}
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
        >
          Leave
        </button>
      </div>
    </div>
  );
}