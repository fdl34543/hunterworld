import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logoImg from "@/assets/logo.png";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
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
          <Link
            to="/how-to-play"
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-amber-100/90 transition hover:bg-amber-500/20 hover:text-amber-100"
            activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-semibold bg-amber-500/20 text-amber-100" }}
          >
            How to Play
          </Link>
          <Link
            to="/docs"
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-amber-100/90 transition hover:bg-amber-500/20 hover:text-amber-100"
            activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-semibold bg-amber-500/20 text-amber-100" }}
          >
            Docs
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-white hover:text-black"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white md:hidden"
          >
            <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>
      {open && (
        <div className="relative z-20 mx-4 mb-2 flex flex-col gap-1 rounded-xl border border-amber-500/30 bg-black/80 p-2 backdrop-blur md:hidden">
          <Link to="/how-to-play" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-500/20">
            How to Play
          </Link>
          <Link to="/docs" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-500/20">
            Docs
          </Link>
        </div>
      )}
    </>
  );
}