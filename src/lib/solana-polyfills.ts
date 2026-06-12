import { Buffer } from "buffer";

(globalThis as any).Buffer = Buffer;

if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}

console.log("BUFFER", Buffer);
console.log("BUFFER FROM", Buffer?.from);