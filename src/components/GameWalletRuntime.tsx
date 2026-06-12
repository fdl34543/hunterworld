import "@/lib/solana-polyfills";
import { Component, useState, type ReactNode } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { SpectatorCanvas } from "@/components/SpectatorCanvas";
import { ConnectScreen, CreatePlayerForm, LoadingScreen, SignInScreen } from "@/components/MainMenu";
import { SolanaWalletAppProvider } from "@/integrations/solana/WalletProvider";
import { usePlayer } from "@/hooks/usePlayer";
import { useWalletSession } from "@/hooks/useWalletSession";

function WalletRetryScreen({ attempt }: { attempt: number }) {
  return (
    <div className="flex min-h-screen items-center justify-center mmo-overlay p-4">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 text-center shadow-2xl">
        <div className="mb-3 text-5xl">🔄</div>
        <h1 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900">
          Reconnecting wallet
        </h1>
        <p className="text-sm text-slate-600">Retrying wallet provider… attempt {attempt}</p>
      </div>
    </div>
  );
}

class WalletProviderRetryBoundary extends Component<
  { children: ReactNode },
  { attempt: number; error: Error | null }
> {
  private retryTimer: number | undefined;

  state = { attempt: 0, error: null as Error | null };

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
    this.scheduleRetry(error);
  }

  componentWillUnmount() {
    if (this.retryTimer) window.clearTimeout(this.retryTimer);
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  private isWalletInitError(error: unknown) {
    const message = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? "");
    return /wallet|solana|phantom|solflare|backpack|adapter|provider|buffer|from|chunk|import|lazy|module/i.test(
      message,
    );
  }

  private scheduleRetry(error: Error) {
    this.setState({ error });
    if (this.state.attempt >= 4) return;
    const nextAttempt = this.state.attempt + 1;
    if (this.retryTimer) window.clearTimeout(this.retryTimer);
    // Exponential backoff: 600ms, 1200ms, 2400ms, 4800ms
    const backoff = Math.min(600 * Math.pow(2, nextAttempt - 1), 5_000);
    this.retryTimer = window.setTimeout(() => {
      this.setState({ attempt: nextAttempt, error: null });
    }, backoff);
  }

  private handleWindowError = (event: ErrorEvent) => {
    const error = event.error instanceof Error ? event.error : new Error(event.message);
    if (!this.isWalletInitError(error)) return;
    event.preventDefault();
    this.scheduleRetry(error);
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (!this.isWalletInitError(event.reason)) return;
    event.preventDefault();
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    this.scheduleRetry(error);
  };

  render() {
    if (this.state.error) {
      if (this.state.attempt >= 4) {
        return (
          <div className="flex min-h-screen items-center justify-center mmo-overlay p-4">
            <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 text-center shadow-2xl">
              <div className="mb-3 text-5xl">⚠️</div>
              <h1 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900">
                Wallet failed to start
              </h1>
              <p className="mb-5 break-words text-sm text-slate-600">
                {this.state.error.message || "Wallet initialization failed."}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => this.setState({ attempt: 0, error: null })}
                  className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-bold text-white shadow transition hover:bg-orange-600"
                >
                  Try wallet again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full rounded-lg bg-slate-200 px-4 py-2.5 font-semibold text-slate-700 shadow transition hover:bg-slate-300"
                >
                  Reload page
                </button>
              </div>
            </div>
          </div>
        );
      }
      return <WalletRetryScreen attempt={this.state.attempt + 1} />;
    }

    return <div key={this.state.attempt}>{this.props.children}</div>;
  }
}

function GameAppContent() {
  const wallet = useWalletSession();
  const player = usePlayer();
  const [spectating, setSpectating] = useState(false);

  // Spectator mode — no wallet required. Lets curious users watch the world
  // before deciding to sign in.
  if (spectating && !wallet.connected) {
    return <SpectatorCanvas onExit={() => setSpectating(false)} />;
  }

  if (!wallet.connected) return <ConnectScreen onSpectate={() => setSpectating(true)} />;
  if (!wallet.token) {
    return (
      <SignInScreen
        pending={wallet.signingIn}
        error={wallet.error}
        onSignIn={() => void wallet.signIn()}
        onCancel={() => void wallet.logout()}
      />
    );
  }
  if (player.isLoading || !player.isFetched) return <LoadingScreen message="Loading player…" />;
  if (player.isError) {
    const msg = (player.error as Error)?.message ?? "Failed to load player";
    return (
      <div className="flex min-h-screen items-center justify-center mmo-overlay p-4">
        <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 text-center shadow-2xl">
          <div className="mb-3 text-5xl">⚠️</div>
          <h1 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900">
            Couldn't load player
          </h1>
          <p className="mb-5 text-sm text-slate-600">{msg}</p>
          <button
            onClick={async () => {
              await wallet.logout();
              window.location.reload();
            }}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-bold text-white shadow transition hover:bg-orange-600"
          >
            Log out & sign in again
          </button>
        </div>
      </div>
    );
  }
  if (!player.data) {
    return (
      <CreatePlayerForm
        pending={player.create.isPending}
        error={(player.create.error as Error | null)?.message ?? null}
        onCreate={(p) => player.create.mutate(p)}
      />
    );
  }
  return <GameCanvas player={player.data} />;
}

export function GameWalletRuntime() {
  return (
    <WalletProviderRetryBoundary>
      <SolanaWalletAppProvider>
        <GameAppContent />
      </SolanaWalletAppProvider>
    </WalletProviderRetryBoundary>
  );
}