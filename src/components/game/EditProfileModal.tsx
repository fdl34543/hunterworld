import { useRef, useState } from "react";
import { AVATARS, COLORS, JOBS } from "@/game/constants";
import type { Profile } from "@/game/types";
import { normalizeCharacterSprite } from "@/game/characters";

export function EditProfileModal({
  initial,
  customAvatarUrl,
  onClose,
  onSave,
}: {
  initial: Profile;
  customAvatarUrl?: string | null;
  onClose: () => void;
  onSave: (p: Profile, customAvatar?: string | null) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [job, setJob] = useState(initial.job);
  const [color, setColor] = useState(initial.color);
  const [avatar, setAvatar] = useState(initial.avatar);
  const characterSprite = normalizeCharacterSprite(initial.character_sprite);
  const [customAvatar, setCustomAvatar] = useState<string | null | undefined>(customAvatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Resize to 256x256 PNG for compact storage.
        const size = 256;
        const cv = document.createElement("canvas");
        cv.width = size;
        cv.height = size;
        const ctx = cv.getContext("2d")!;
        // Crop center square.
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
        setCustomAvatar(cv.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center mmo-overlay">
      <div className="w-full max-w-sm mmo-panel rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-xl font-extrabold text-slate-900">Edit Profile</h2>
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-2xl font-extrabold uppercase text-white shadow ring-2 ring-slate-200"
            style={{ background: color }}
          >
            {customAvatar ? (
              <img src={customAvatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl">{avatar}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="mb-1 text-xs text-slate-500">Preview avatar</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-md bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-600"
              >
                Upload image
              </button>
              {customAvatar && (
                <button
                  type="button"
                  onClick={() => setCustomAvatar(null)}
                  className="rounded-md bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
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
              aria-label={`Avatar ${a}`}
            >
              {a}
            </button>
          ))}
        </div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Name
        </label>
        <input
          value={name}
          maxLength={16}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Job
        </label>
        <select
          value={job}
          onChange={(e) => setJob(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        >
          {JOBS.map((j) => (
            <option key={j}>{j}</option>
          ))}
        </select>
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
              aria-label={`Choose ${c}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const trimmed = name.trim() || "Player";
              onSave(
                { name: trimmed, job, color, avatar, character_sprite: characterSprite },
                customAvatar ?? null,
              );
            }}
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-orange-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}