import { MAPS } from "@/game/maps";

export function PortalModal({
  currentMapId,
  level,
  onTravel,
  onClose,
}: {
  currentMapId: string;
  level: number;
  onTravel: (mapId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center mmo-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl mmo-panel rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">🌀 Portal Travel</h2>
            <p className="text-xs text-slate-500">
              Choose a destination. Locked realms open as you level up.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {MAPS.filter((m) => !m.hidden).map((m) => {
            // Home town is always reachable from anywhere so dungeon-bound
            // travellers can find their way back.
            const unlocked = level >= m.minLevel || m.id === "town";
            const isCurrent = m.id === currentMapId;
            return (
              <button
                key={m.id}
                disabled={!unlocked || isCurrent}
                onClick={() => onTravel(m.id)}
                className={`group relative overflow-hidden rounded-xl text-left ring-2 transition ${
                  isCurrent
                    ? "ring-emerald-500"
                    : unlocked
                      ? "ring-transparent hover:ring-orange-400"
                      : "ring-slate-200"
                } ${!unlocked ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <img
                  src={m.image}
                  alt={m.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className={`h-32 w-full object-cover transition ${
                    unlocked ? "group-hover:scale-105" : "grayscale"
                  }`}
                />
                {!unlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white">
                    <div className="text-2xl">🔒</div>
                    <div className="mt-1 text-xs font-bold">Requires Lv {m.minLevel}</div>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    You are here
                  </div>
                )}
                <div className="bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-slate-900">{m.name}</div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Lv {m.minLevel}+
                    </div>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{m.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}