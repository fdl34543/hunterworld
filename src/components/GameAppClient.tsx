import { useEffect, useRef, useState, type ComponentType } from "react";

type WalletRuntimeModule = typeof import("@/components/GameWalletRuntime");
type RuntimeState =
  | { status: "loading"; attempt: number; Component: null; error: null }
  | { status: "ready"; attempt: number; Component: ComponentType; error: null }
  | { status: "failed"; attempt: number; Component: null; error: Error };

const MAX_ATTEMPTS = 5;
const IMPORT_TIMEOUT_MS = 8_000;
const AUTO_RELOAD_DELAY_MS = 30_000;
const BASE_BACKOFF_MS = 500;

const loadWalletRuntime = async (attempt: number) => {
  await import("@/lib/solana-polyfills");
  switch (attempt) {
    case 1:
      return import("@/components/GameWalletRuntime?wallet-retry=1") as Promise<WalletRuntimeModule>;
    case 2:
      return import("@/components/GameWalletRuntime?wallet-retry=2") as Promise<WalletRuntimeModule>;
    case 3:
      return import("@/components/GameWalletRuntime?wallet-retry=3") as Promise<WalletRuntimeModule>;
    case 4:
      return import("@/components/GameWalletRuntime?wallet-retry=4") as Promise<WalletRuntimeModule>;
    default:
      return import("@/components/GameWalletRuntime?wallet-retry=5") as Promise<WalletRuntimeModule>;
  }
};

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number, attempt: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(
        () => reject(new Error(`Wallet runtime import timed out on attempt ${attempt}`)),
        ms,
      );
    }),
  ]);
}

function getBackoffMs(attempt: number) {
  // Exponential backoff: 500, 1000, 2000, 4000, capped at 8000
  return Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt - 1), 8_000);
}

async function importWalletRuntimeWithRetry(onAttempt: (attempt: number) => void) {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    onAttempt(attempt);
    try {
      const mod = await withTimeout<WalletRuntimeModule>(
        loadWalletRuntime(attempt),
        IMPORT_TIMEOUT_MS,
        attempt,
      );
      return mod.GameWalletRuntime;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Wallet runtime initialization failed; retrying (${attempt}/${MAX_ATTEMPTS})`, lastError);
      if (attempt < MAX_ATTEMPTS) await delay(getBackoffMs(attempt));
    }
  }
  throw lastError ?? new Error("Wallet runtime failed to initialize");
}

function WalletLoadingScreen({ attempt }: { attempt: number }) {
  return (
    <div className="flex min-h-screen items-center justify-center mmo-overlay p-4">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 text-center shadow-2xl">
        <div className="mb-3 text-5xl animate-voxel-idle">🏰</div>
        <h1 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900">Loading wallet</h1>
        <p className="text-sm text-slate-600">Preparing wallet connection… attempt {attempt}</p>
      </div>
    </div>
  );
}

function WalletFailedScreen({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const [countdown, setCountdown] = useState(Math.ceil(AUTO_RELOAD_DELAY_MS / 1000));
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;
    if (countdown <= 0) {
      window.location.reload();
      return;
    }
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, cancelled]);

  return (
    <div className="flex min-h-screen items-center justify-center mmo-overlay p-4">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 text-center shadow-2xl">
        <div className="mb-3 text-5xl">⚠️</div>
        <h1 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900">Wallet didn't load</h1>
        <p className="mb-3 break-words text-sm text-slate-600">{error.message}</p>
        <p className="mb-4 text-xs text-slate-500">
          {cancelled
            ? "Auto-reload cancelled."
            : `Reloading page in ${countdown}s to recover…`}
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-bold text-white shadow transition hover:bg-orange-600"
          >
            Retry wallet
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-slate-200 px-4 py-2.5 font-semibold text-slate-700 shadow transition hover:bg-slate-300"
          >
            Reload page now
          </button>
          {!cancelled && (
            <button
              onClick={() => setCancelled(true)}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              Cancel auto-reload
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function GameAppClient() {
  const runIdRef = useRef(0);
  const [state, setState] = useState<RuntimeState>({
    status: "loading",
    attempt: 1,
    Component: null,
    error: null,
  });

  const load = () => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setState({ status: "loading", attempt: 1, Component: null, error: null });
    void importWalletRuntimeWithRetry((attempt) => {
      if (runIdRef.current === runId) {
        setState({ status: "loading", attempt, Component: null, error: null });
      }
    })
      .then((Component) => {
        if (runIdRef.current === runId) {
          setState({ status: "ready", attempt: MAX_ATTEMPTS, Component, error: null });
        }
      })
      .catch((error) => {
        if (runIdRef.current === runId) {
          setState({
            status: "failed",
            attempt: MAX_ATTEMPTS,
            Component: null,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
  };

  useEffect(() => {
    load();
  }, []);

  if (state.status === "ready") {
    const Runtime = state.Component;
    return <Runtime />;
  }
  if (state.status === "failed") {
    return <WalletFailedScreen error={state.error} onRetry={load} />;
  }
  return <WalletLoadingScreen attempt={state.attempt} />;
}