import { useCallback, useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/lib/players.functions";
import { getLeaderboard } from "@/lib/players.functions";
import { levelFromXp } from "@/lib/xp";

type SortKey = "xp" | "gold";

export function LeaderboardModal({
  myWallet,
  onClose,
}: {
  myWallet: string;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("xp");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLeaderboard({ data: { offset: page * pageSize, limit: pageSize } });
      setEntries(res.entries);
      setTotal(res.total);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load leaderboard.");
      setEntries([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sorted = [...entries].sort((a, b) => b[sort] - a[sort]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const globalOffset = page * pageSize;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center mmo-overlay p-0 sm:items-center sm:p-4">
      <div className="flex h-[90vh] w-full max-w-lg flex-col overflow-hidden mmo-panel rounded-t-2xl p-4 shadow-2xl sm:h-auto sm:max-h-[85vh] sm:rounded-2xl sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl sm:text-2xl">🏆</div>
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Leaderboard</h2>
            <p className="text-[11px] text-slate-500 sm:text-xs">Top players ranked by XP or gold.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between border-b pb-2">
          <div className="flex gap-2">
            {(["xp", "gold"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  sort === k
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {k === "xp" ? "⭐ XP" : "💰 Gold"}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-600 hover:bg-sky-100 disabled:opacity-50"
            title="Refresh leaderboard"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto pr-1">
          {loading && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
              <p className="text-sm font-medium">Loading leaderboard…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 p-4 text-center">
              <p className="text-sm font-semibold text-rose-600">⚠️ {error}</p>
              <button
                onClick={() => fetchData()}
                className="mt-2 rounded-md bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              No players found.
            </div>
          )}

          {!error && entries.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-1 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <span className="w-8 text-center">#</span>
                <span className="flex-1">Player</span>
                <span className="w-12 text-right sm:w-16">Lvl</span>
                <span className="w-16 text-right sm:w-20">{sort === "xp" ? "XP" : "Gold"}</span>
              </div>
              {sorted.map((e, i) => {
                const isMe = e.wallet_address === myWallet;
                const lvl = levelFromXp(e.xp);
                const rank = globalOffset + i + 1;
                return (
                  <div
                    key={e.wallet_address}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                      isMe ? "bg-sky-50 ring-1 ring-sky-200" : i % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <span
                      className={`w-8 text-center text-xs font-bold ${
                        rank === 1 ? "text-amber-500" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-orange-400" : "text-slate-500"
                      }`}
                    >
                      {rank}
                    </span>
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base shadow-inner ring-1 ring-white/30"
                        style={{ background: e.color }}
                      >
                        {e.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">
                          {e.name} {isMe && <span className="text-[10px] font-normal text-sky-500">(You)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500">{e.job}</div>
                      </div>
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-slate-700 sm:w-16 sm:text-sm">Lv {lvl}</span>
                    <span className="w-16 text-right text-xs font-bold text-slate-800 sm:w-20 sm:text-sm">
                      {sort === "xp" ? e.xp.toLocaleString() : e.gold.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 sm:text-xs">
            <span>Page {page + 1} of {totalPages}</span>
            <span className="text-slate-300">|</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40"
            >
              ◀ Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40"
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

