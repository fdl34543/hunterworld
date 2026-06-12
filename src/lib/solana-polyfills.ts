// Synchronously install Buffer / global / process on the browser global before
// any Solana web3.js module evaluates. The Solana browser bundle calls
// `Buffer.from(...)` at module init; if Buffer is undefined we get
// "Cannot read properties of undefined (reading 'from')". A previous async
// `import("buffer").then(...)` version raced module init and lost.
//
// SSR is safe: this file is gated on `typeof window`, and on the SSR build
// our vite plugin redirects "buffer" to `node:buffer` anyway. In the browser,
// Vite pre-bundles the CJS `buffer` package into an ESM wrapper, so keep this
// as a bare import and do not alias it to `/node_modules/buffer/index.js`.
import { Buffer as BrowserBuffer } from "buffer";


export const Buffer = BrowserBuffer;

type BrowserRuntime = Record<string, unknown> & {
  Buffer?: unknown;
  global?: typeof globalThis;
  process?: {
    env?: Record<string, string | undefined>;
    browser?: boolean;
  };
};

function hasUsableBuffer(value: unknown): value is { from: (...args: unknown[]) => unknown } {
  return typeof value === "function" && typeof (value as { from?: unknown }).from === "function";
}

if (typeof window !== "undefined") {
  (globalThis as any).Buffer = BrowserBuffer;
  (window as any).Buffer = BrowserBuffer;

  (globalThis as any).global = globalThis;
  (globalThis as any).process = {
    env: {},
    browser: true,
  };
}

console.log("POLYFILL BUFFER", typeof Buffer);
console.log("GLOBAL BUFFER", typeof globalThis.Buffer);
console.log("WINDOW BUFFER", typeof (window as any).Buffer);