import { useEffect, useRef, useState } from "react";
import {
  STUDY_COOLDOWN_MS,
  STUDY_DURATION_MS,
  STUDY_XP_REWARD,
  formatDuration,
  studyCooldownRemaining,
} from "@/lib/xp";

export function StudyModal({
  lastStudyAt,
  onComplete,
  onClose,
}: {
  lastStudyAt: number | null;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const cooldown = studyCooldownRemaining(lastStudyAt, now);
  const onCooldown = cooldown > 0;

  // Start a 60s timer for the study session itself.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  useEffect(() => {
    if (onCooldown) return;
    if (!startedAt) setStartedAt(Date.now());
  }, [onCooldown, startedAt]);

  const elapsed = startedAt ? now - startedAt : 0;
  const progress = Math.min(100, (elapsed / STUDY_DURATION_MS) * 100);
  const remainingStudy = Math.max(0, STUDY_DURATION_MS - elapsed);

  // Guard so onComplete fires exactly once even if the effect re-runs due to
  // changing dependencies (onComplete being a fresh arrow each parent render).
  const firedRef = useRef(false);
  useEffect(() => {
    if (onCooldown) return;
    if (firedRef.current) return;
    if (startedAt && elapsed >= STUDY_DURATION_MS) {
      firedRef.current = true;
      onComplete();
    }
  }, [elapsed, onCooldown, onComplete, startedAt]);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center mmo-overlay">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 shadow-2xl">
        <h2 className="mb-1 text-2xl font-extrabold text-slate-900">📚 Study Session</h2>
        <p className="mb-4 text-sm text-slate-600">
          Pore over ancient tomes. Stay focused for 60 seconds to earn{" "}
          <span className="font-bold text-emerald-600">+{STUDY_XP_REWARD} XP</span>.
        </p>

        <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50">
          {onCooldown ? (
            <div className="text-center">
              <div className="text-5xl">😴</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">
                Brain is tired
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-study-book text-5xl">📖</div>
              <div className="mt-1 flex justify-center gap-2 text-xs">
                <span className="animate-study-spark text-amber-500">✦</span>
                <span className="animate-study-spark text-amber-500" style={{ animationDelay: "0.3s" }}>✦</span>
                <span className="animate-study-spark text-amber-500" style={{ animationDelay: "0.6s" }}>✦</span>
              </div>
            </div>
          )}
        </div>

        {onCooldown ? (
          <>
            <p className="mb-3 text-center text-sm font-semibold text-rose-500">
              Cooldown: {formatDuration(cooldown)} remaining
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
              <span>Studying…</span>
              <span>{Math.ceil(remainingStudy / 1000)}s</span>
            </div>
            <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}