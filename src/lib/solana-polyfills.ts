import { Buffer as BrowserBuffer } from "buffer";

export const Buffer = BrowserBuffer;

(globalThis as any).Buffer = BrowserBuffer;

if (typeof window !== "undefined") {
  (window as any).Buffer = BrowserBuffer;
}

console.log("BUFFER", BrowserBuffer);
console.log("BUFFER FROM", BrowserBuffer?.from);