import "@/lib/solana-polyfills";
import { useEffect, useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AVATARS, COLORS, JOBS } from "@/game/constants";
import { useSolanaWallet } from "@/integrations/solana/WalletProvider";
import { useWalletSession } from "@/hooks/useWalletSession";
import {
  CHARACTER_SPRITES,
  DEFAULT_CHARACTER_SPRITE,
  type CharacterSpriteId,
} from "@/game/characters";
import { MAPS } from "@/game/maps";
import { SEASONS, getCurrentSeason } from "@/game/seasons";
import bgImage from "@/assets/landing.png";
import logoImg from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";

function shortAddr(a: string | null) {
  if (!a) return "";
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

/** Landing screen — shown when user isn't connected yet. */
export function ConnectScreen({ onSpectate }: { onSpectate?: () => void } = {}) {
  const visibleMaps = useMemo(() => MAPS.filter((m) => !m.hidden), []);
  const [mapIdx, setMapIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(() =>
    Math.floor(Math.random() * CHARACTER_SPRITES.length),
  );
  const { season } = getCurrentSeason();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const t = window.setInterval(
      () => setMapIdx((i) => (i + 1) % visibleMaps.length),
      5000,
    );
    return () => window.clearInterval(t);
  }, [visibleMaps.length]);

  const map = visibleMaps[mapIdx];
  const character = CHARACTER_SPRITES[charIdx];

  const prevMap = () =>
    setMapIdx((i) => (i - 1 + visibleMaps.length) % visibleMaps.length);
  const nextMap = () => setMapIdx((i) => (i + 1) % visibleMaps.length);
  const prevChar = () =>
    setCharIdx((i) => (i - 1 + CHARACTER_SPRITES.length) % CHARACTER_SPRITES.length);
  const nextChar = () =>
    setCharIdx((i) => (i + 1) % CHARACTER_SPRITES.length);

  return (
    <div className="relative min-h-screen w-full overflow-hidden mmo-overlay">
      {/* Single static background */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 lg:w-[80vw] lg:max-w-[1600px] lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logoImg}
            alt="Voxel Town logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain drop-shadow-lg"
          />
          <span className="hidden text-base font-black tracking-tight text-amber-200 drop-shadow sm:inline">
            HUNTER WORLD
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-amber-500/30 bg-black/50 px-2 py-1 backdrop-blur md:flex">
          <Link to="/how-to-play" className="rounded-full px-4 py-1.5 text-sm font-semibold text-amber-100/90 transition hover:bg-amber-500/20 hover:text-amber-100">
            How to Play
          </Link>
          <Link to="/docs" className="rounded-full px-4 py-1.5 text-sm font-semibold text-amber-100/90 transition hover:bg-amber-500/20 hover:text-amber-100">
            Docs
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://x.com/HunterWorldRPG"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-white hover:text-black"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://t.me/HunterWorldRPG"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-white hover:text-black"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden
            >
              <path d="M21.944 4.517a1 1 0 0 0-1.09-.163L2.57 11.79a1 1 0 0 0 .09 1.87l4.74 1.58 1.81 5.43a1 1 0 0 0 1.78.25l2.65-3.63 4.9 3.57a1 1 0 0 0 1.57-.63l3-14.7a1 1 0 0 0-.266-.91ZM9.22 14.73l8.79-7.84-6.81 9.3-.74 1.01-.73 1z" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white md:hidden"
          >
            <span className="text-lg leading-none">{navOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>

      {navOpen && (
        <div className="relative z-20 mx-4 mb-2 flex flex-col gap-1 rounded-xl border border-amber-500/30 bg-black/80 p-2 backdrop-blur md:hidden">
          <Link to="/how-to-play" onClick={() => setNavOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-500/20">
            How to Play
          </Link>
          <Link to="/docs" onClick={() => setNavOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-500/20">
            Docs
          </Link>
        </div>
      )}

      <div className="relative z-10 mt-[50px] lg:mt-[100px] w-full lg:w-[80vw] lg:max-w-[1600px] mx-auto grid grid-cols-1 gap-4 lg:gap-6 p-4 lg:p-8 lg:pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* LEFT — map carousel, season, bosses */}
        <div className="order-3 flex flex-col gap-4 lg:order-1">
          <div className="mmo-panel rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Realm
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                {mapIdx + 1} / {visibleMaps.length}
              </span>
            </div>
            <div className="relative overflow-hidden rounded-xl ring-2 ring-slate-200">
              <img
                src={map.image}
                alt={map.name}
                className="h-40 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-base font-extrabold tracking-tight text-white drop-shadow">
                  {map.name}
                </div>
                <div className="text-[11px] text-white/80">
                  Lv {map.minLevel}+ · {map.description}
                </div>
              </div>
              <button
                type="button"
                onClick={prevMap}
                aria-label="Previous map"
                className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-2 py-1 text-sm font-bold text-white hover:bg-black/80"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextMap}
                aria-label="Next map"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-2 py-1 text-sm font-bold text-white hover:bg-black/80"
              >
                ›
              </button>
            </div>
            <div className="mt-2 flex justify-center gap-1">
              {visibleMaps.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setMapIdx(i)}
                  aria-label={`Go to ${m.name}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === mapIdx ? "w-6 bg-orange-500" : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mmo-panel rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Current Season
              </span>
              <span className="text-lg">{season.emoji}</span>
            </div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              {season.name}
            </div>
            <div className="mb-2 text-[11px] text-slate-600">{season.effect}</div>
            <div className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs">
              <span className="font-bold text-orange-600">World Boss:</span>{" "}
              <span className="font-semibold text-slate-800">{season.bossName}</span>
            </div>
          </div>

          <div className="mmo-panel rounded-2xl p-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Seasonal Bosses
            </div>
            <ul className="space-y-1.5">
              {SEASONS.map((s) => (
                <li
                  key={s.id}
                  className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs ${
                    s.id === season.id
                      ? "bg-orange-100 ring-1 ring-orange-300"
                      : "bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{s.emoji}</span>
                    <span className="font-semibold text-slate-800">{s.name}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {s.bossName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CENTER — character preview */}
        <div className="order-2 flex flex-col items-center justify-center lg:order-2">
          <div className="text-center">
            <span className="inline-block rounded-full bg-orange-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow">
              Choose your hero
            </span>
          </div>
          <div className="relative my-3 flex w-full max-w-md items-center justify-center">
            <button
              type="button"
              onClick={prevChar}
              aria-label="Previous character"
              className="absolute left-0 z-10 rounded-full bg-black/60 px-3 py-2 text-lg font-bold text-white hover:bg-black/80"
            >
              ‹
            </button>
            <div className="relative flex h-[420px] w-full items-end justify-center">
              <div className="absolute bottom-6 h-6 w-40 rounded-full bg-orange-500/30 blur-2xl" />
              <img
                key={character.id}
                src={character.src}
                alt={character.name}
                className="relative max-h-[400px] w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] animate-voxel-idle"
              />
            </div>
            <button
              type="button"
              onClick={nextChar}
              aria-label="Next character"
              className="absolute right-0 z-10 rounded-full bg-black/60 px-3 py-2 text-lg font-bold text-white hover:bg-black/80"
            >
              ›
            </button>
          </div>
          <div className="mmo-panel rounded-xl px-4 py-2 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Class Preview
            </div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              {character.name}
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            {CHARACTER_SPRITES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCharIdx(i)}
                aria-label={c.name}
                className={`h-1.5 rounded-full transition-all ${
                  i === charIdx ? "w-5 bg-orange-500" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — title + actions */}
        <div className="order-1 flex flex-col justify-center gap-4 lg:order-3">
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-orange-400 drop-shadow">
              ⚔ MMORPG ⚔
            </div>
            <h1 className="bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-lg lg:text-5xl">
              HUNTER WORLD
            </h1>
            <p className="mt-1 text-sm text-white/80 drop-shadow">
              Enter the realm. Forge your legend.
            </p>
            <p className="mt-1 text-sm text-white/80 drop-shadow">
              71p7Riw6WyBJmbS1HgSwLbjpNZfBptsDpcc9h9s4pump
            </p>
          </div>

          <div className="mmo-panel rounded-2xl p-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Connect Wallet
            </div>
            <div className="flex justify-center [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!justify-center [&_.wallet-adapter-button]:!rounded-lg">
              <WalletMultiButton />
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500">
              Phantom · Solflare · Backpack
            </p>

            {onSpectate && (
              <>
                <div className="my-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  or
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <button
                  type="button"
                  onClick={onSpectate}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-bold shadow transition hover:bg-emerald-600"
                >
                  👁️ Watch the World
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  Spectate live — no wallet needed.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shown after wallet connect but before the user has signed the auth message. */
export function SignInScreen({
  onSignIn,
  pending,
  error,
  onCancel,
}: {
  onSignIn: () => void;
  pending?: boolean;
  error?: string | null;
  onCancel: () => void;
}) {
  const address = useSolanaWallet();
  return (
    <div className="flex min-h-screen items-center justify-center mmo-overlay p-4">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 text-center">
        <div className="mb-3 text-5xl">✍️</div>
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">Verify wallet</h1>
        <p className="mb-4 text-sm text-slate-600">
          Sign a quick message to prove you own this wallet. No gas required.
        </p>
        <p className="mb-4 text-xs font-mono text-slate-500">{shortAddr(address)}</p>
        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
        <button
          onClick={onSignIn}
          disabled={pending}
          className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-bold shadow transition disabled:opacity-50"
        >
          {pending ? "Waiting for signature…" : "Sign in"}
        </button>
        <button
          onClick={onCancel}
          className="mt-2 w-full rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          Disconnect wallet
        </button>
      </div>
    </div>
  );
}

/** Create-player form, shown after connect when no row exists yet. */
export function CreatePlayerForm({
  onCreate,
  pending,
  error,
}: {
  onCreate: (p: {
    name: string;
    job: string;
    color: string;
    avatar: string;
    character_sprite: CharacterSpriteId;
  }) => void;
  pending?: boolean;
  error?: string | null;
}) {
  const { logout } = useWalletSession();
  const address = useSolanaWallet();
  const [name, setName] = useState("");
  const [job, setJob] = useState(JOBS[0]);
  const [color, setColor] = useState(COLORS[3]);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [characterSprite, setCharacterSprite] = useState<CharacterSpriteId>(
    DEFAULT_CHARACTER_SPRITE,
  );
  return (
    <div className="flex min-h-screen items-center justify-center mmo-overlay p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = name.trim();
          if (!n) return;
          onCreate({ name: n, job, color, avatar, character_sprite: characterSprite });
        }}
        className="w-full max-w-sm mmo-panel rounded-2xl p-6"
      >
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            New Player
          </h1>
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Disconnect
          </button>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          Wallet: <span className="font-mono">{shortAddr(address)}</span>
        </p>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Character
        </label>
        <div className="mb-4 grid grid-cols-5 gap-2">
          {CHARACTER_SPRITES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCharacterSprite(c.id)}
              title={c.name}
              className={`flex aspect-square items-end justify-center overflow-hidden rounded-lg bg-slate-100 p-1 ring-2 transition ${
                characterSprite === c.id
                  ? "ring-emerald-500 bg-emerald-50"
                  : "ring-transparent hover:bg-slate-200"
              }`}
              aria-label={`Character ${c.name}`}
            >
              <img
                src={c.src}
                alt={c.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-inner ring-2 ring-slate-200"
          style={{ background: color }}
        >
          {avatar}
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Player name
        </label>
        <input
          autoFocus
          value={name}
          maxLength={16}
          onChange={(e) => setName(e.target.value)}
          placeholder="Choose a name"
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Class
        </label>
        <select
          value={job}
          onChange={(e) => setJob(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
        >
          {JOBS.map((j) => (
            <option key={j}>{j}</option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Avatar
        </label>
        <div className="mb-3 grid grid-cols-6 gap-1">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={`flex h-10 items-center justify-center rounded-md text-xl ring-2 transition ${
                avatar === a ? "bg-slate-100 ring-emerald-500" : "ring-transparent hover:bg-slate-100"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Color
        </label>
        <div className="mb-5 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full ring-2 transition ${
                color === c ? "ring-slate-900 scale-110" : "ring-transparent"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!name.trim() || pending}
          className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-bold shadow transition disabled:opacity-50"
        >
          {pending ? "Creating…" : "Start Adventure"}
        </button>
        {error && (
          <p className="mt-3 text-center text-xs text-red-600 break-words">{error}</p>
        )}
      </form>
    </div>
  );
}

export function LoadingScreen({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center mmo-overlay">
      <div className="mmo-panel rounded-2xl px-8 py-6 text-lg font-semibold text-slate-900">{message}</div>
    </div>
  );
}