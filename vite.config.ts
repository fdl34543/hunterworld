// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const rpcWebsocketsBrowser = fileURLToPath(
  new URL("./node_modules/rpc-websockets/dist/index.browser.mjs", import.meta.url),
);
const browserBuffer = fileURLToPath(
  new URL("./node_modules/buffer/index.js", import.meta.url),
);
const browserBufferShim = fileURLToPath(
  new URL("./src/lib/browser-buffer.ts", import.meta.url),
);
const solanaMobileWalletSsrStub = fileURLToPath(
  new URL("./src/integrations/solana/mobile-wallet-adapter-ssr-stub.ts", import.meta.url),
);
const solanaPolyfills = fileURLToPath(
  new URL("./src/lib/solana-polyfills.ts", import.meta.url),
);

const bnBufferSnippet = `  var Buffer;
  try {
    if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
      Buffer = window.Buffer;
    } else {
      Buffer = require('buffer').Buffer;
    }
  } catch (e) {
  }`;

const patchedBnBufferSnippet = `  var Buffer = require('buffer').Buffer;
  if (typeof window !== 'undefined' && (!window.Buffer || typeof window.Buffer.from !== 'function')) {
    window.Buffer = Buffer;
  }`;

// Scope client-only aliases (buffer polyfill, browser builds of solana libs)
// so they never apply to the SSR/Worker build. The `buffer` npm package is
// CJS and throws "require is not defined" when Vite's SSR module runner /
// the Cloudflare Worker bundler evaluates it, which caused every SSR
// request to return 500.
// For SSR (Worker / Node), redirect `buffer` to the Node built-in `node:buffer`
// so the CJS browser polyfill (which uses `require`) is never evaluated by
// the SSR module runner. The Cloudflare Worker runtime provides `node:buffer`
// via nodejs_compat. Client builds keep the npm `buffer` alias below.
// Force `buffer` to resolve to Node's built-in on the SSR/Worker build only.
// Client builds must keep the bare package import so Vite can pre-bundle the
// CJS `buffer` package into a browser-safe ESM wrapper.
const bufferEnvAliasPlugin = {
  name: "lovable-buffer-env-alias",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    if (id.includes("/node_modules/bn.js/lib/bn.js")) {
      return code.replace(bnBufferSnippet, patchedBnBufferSnippet);
    }
    if (id.includes("/node_modules/@solana/web3.js/lib/index.browser.esm.js")) {
      return code.replace("import { Buffer } from 'buffer';", `import { Buffer } from ${JSON.stringify(solanaPolyfills)};`);
    }
    return null;
  },
  resolveId(source: string, _importer: string | undefined, options: { ssr?: boolean }) {
    if (source !== "buffer") return null;
    if (options?.ssr) return { id: "node:buffer", external: true };
    return browserBufferShim;
  },
};

const bnJsOptimizeDepsBufferPlugin = {
  name: "lovable-bn-js-buffer-optimize-deps",
  setup(build: {
    onResolve: (options: { filter: RegExp }, callback: () => { path: string }) => void;
    onLoad: (options: { filter: RegExp }, callback: (args: { path: string }) => { contents: string; loader: "js" }) => void;
  }) {
    build.onResolve({ filter: /^buffer$/ }, () => ({ path: browserBuffer }));
    build.onLoad({ filter: /node_modules[/\\]bn\.js[/\\]lib[/\\]bn\.js$/ }, (args) => ({
      contents: readFileSync(args.path, "utf8").replace(bnBufferSnippet, patchedBnBufferSnippet),
      loader: "js",
    }));
  },
};

const solanaMobileWalletSsrStubPlugin = {
  name: "lovable-solana-mobile-wallet-ssr-stub",
  enforce: "pre" as const,
  resolveId(source: string, _importer: string | undefined, options: { ssr?: boolean }) {
    if (!options?.ssr || source !== "@solana-mobile/wallet-adapter-mobile") return null;
    return solanaMobileWalletSsrStub;
  },
};

const optimizedDepStaleHashPlugin = {
  name: "lovable-optimized-dep-stale-hash-guard",
  enforce: "pre" as const,
  apply: "serve" as const,
  configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) {
    const staleSolanaChunks: Record<string, string> = {
      "esm-RN7iZPc4.js": "esm-KqoKfuKQ.js",
      "index.browser.esm-BtXt1I4b.js": "index.browser.esm-YsvBU9Fa.js",
    };

    server.middlewares.use((req, _res, next) => {
      if (req.url?.startsWith("/node_modules/.vite/deps/") && req.url.includes("?v=")) {
        req.url = req.url.replace(/\?v=[^&]+/, "");
      }
      const staleChunk = req.url?.match(/^\/node_modules\/\.vite\/deps\/([^/?]+\.js)$/)?.[1];
      if (staleChunk && staleSolanaChunks[staleChunk]) {
        req.url = `/node_modules/.vite/deps/${staleSolanaChunks[staleChunk]}`;
      }
      next();
    });
  },
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: true,
  plugins: [optimizedDepStaleHashPlugin, bufferEnvAliasPlugin, solanaMobileWalletSsrStubPlugin],
  vite: {
    optimizeDeps: {
      esbuildOptions: {
        plugins: [bnJsOptimizeDepsBufferPlugin],
      },
      include: [
        "@solana/wallet-adapter-backpack",
        "@solana/wallet-adapter-base",
        "@solana/wallet-adapter-phantom",
        "@solana/wallet-adapter-react",
        "@solana/wallet-adapter-react-ui",
        "@solana/wallet-adapter-solflare",
        "@solana/web3.js",
        "bs58",
        "buffer",
      ],
    },
    resolve: {
      alias: {
        "@solana/kit/program-client-core": "@solana/program-client-core",
        "rpc-websockets": rpcWebsocketsBrowser,
      },
    },
  },
});
