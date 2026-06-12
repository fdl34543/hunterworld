import type { ChatMessage } from "@/game/types";

export function ChatPanel({
  chat,
  chatInput,
  setChatInput,
  minimized,
  setMinimized,
  onFocus,
  onBlur,
  onSend,
  readOnly = false,
}: {
  chat: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  minimized: boolean;
  setMinimized: (v: boolean) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSend: () => void;
  readOnly?: boolean;
}) {
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="pointer-events-auto absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur hover:bg-black/80"
      >
        💬 Chat{" "}
        {chat.length > 0 && (
          <span className="ml-1 rounded-full bg-emerald-500 px-1.5 text-[10px]">{chat.length}</span>
        )}
      </button>
    );
  }
  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 flex w-72 flex-col rounded-xl bg-black/60 text-white shadow-lg backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
        <span>Chat</span>
        <button
          onClick={() => setMinimized(true)}
          className="rounded px-1.5 text-base leading-none hover:bg-white/10"
          aria-label="Minimize chat"
          title="Minimize"
        >
          −
        </button>
      </div>
      <div className="h-40 overflow-y-auto px-3 py-2 text-sm">
        {chat.length === 0 && <div className="text-xs text-white/40">Say hi to the town…</div>}
        {chat.map((m, i) => (
          <div key={i} className="mb-1 leading-snug">
            <span className="font-bold" style={{ color: m.color }}>
              {m.name}:
            </span>{" "}
            <span className="text-white/90">{m.text}</span>
          </div>
        ))}
      </div>
      {readOnly ? (
        <div className="border-t border-white/10 p-2 text-center text-[11px] text-white/50">
          🔒 Sign in to chat with players
        </div>
      ) : (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex gap-1 border-t border-white/10 p-2"
      >
        <input
          id="chat-input"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Press Enter to chat…"
          maxLength={140}
          className="flex-1 rounded-md bg-white/10 px-2 py-1 text-sm outline-none placeholder:text-white/40 focus:bg-white/20"
        />
        <button
          type="submit"
          className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-bold uppercase hover:bg-emerald-600"
        >
          Send
        </button>
      </form>
      )}
    </div>
  );
}