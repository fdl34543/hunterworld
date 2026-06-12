## Goal

Hilangkan ketergantungan `SUPABASE_SERVICE_ROLE_KEY` di runtime, supaya project bisa di-deploy ke Vercel hanya dengan env vars publik (`VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`). Sign-in tetap pakai **Solana wallet** (sign message), tapi di belakang layar setiap wallet di-map ke satu Supabase Auth user — sehingga RLS bisa pakai `auth.uid()` dan semua DB write keluar dari client/server functions tanpa service role.

## High-level Architecture

```text
Connect Wallet (Phantom / browser wallet adapter)
        │
        ▼
Sign message  ─────────►  serverFn: signInWithSolana
                            verify ed25519 sig (existing logic, no DB)
                            return { email, password } untuk wallet ini
                                 (password = HMAC(wallet, SOLANA_AUTH_SECRET))
        ▼
Client: supabase.auth.signUp(email, password) (one-time, fallback ke signIn)
        supabase.auth.signInWithPassword(email, password)
        ▼
Client now has real Supabase session  →  auth.uid() = wallet's user
        ▼
All reads/writes via supabase client (browser) atau server fns
with requireSupabaseAuth — RLS scopes by auth.uid()
```

`SOLANA_AUTH_SECRET` tetap server-only (server fn yang mint password). Service role key tidak dipakai lagi di kode aplikasi.

## Database Migration

Satu migration (tanpa drop data):

1. Tambah `profiles` table:
   - `id uuid PK references auth.users on delete cascade`
   - `wallet_address text unique not null`
   - timestamps
   - RLS: user bisa read/update own; semua authenticated bisa read (untuk leaderboard / multiplayer nama)

2. `players`:
   - Tambah `user_id uuid references auth.users on delete cascade` (nullable awalnya untuk row lama)
   - Tambah unique index `(user_id)`
   - `wallet_address` tetap (nullable) — untuk re-claim row lama
   - GRANT select/insert/update ke `authenticated`
   - DROP policy lama (`USING false`)
   - Policies baru: `auth.uid() = user_id` untuk semua CRUD

3. `player_items`: sama pattern — tambah `user_id`, GRANT, RLS by `user_id`

4. Helper RPC `claim_player_by_wallet(p_wallet text)` (SECURITY DEFINER):
   - Cek row `players` dengan `wallet_address = p_wallet AND user_id IS NULL`
   - Set `user_id = auth.uid()`
   - Update `player_items.user_id` yang `wallet_address` cocok
   - Return claimed row atau null
   - GRANT EXECUTE TO authenticated

5. `leaderboard` SECURITY DEFINER function untuk public read top-N (read-only, hanya kolom non-sensitive).

## Code Changes

### Auth layer

- `src/lib/auth.server.ts`: keep `verifySolanaSignature` & `verifySignIn`. Tambah `walletCredentials(wallet)` → `{ email: \`${wallet.toLowerCase()}@wallet.realmstride.local\`, password: hmac(\`pwd:${wallet}\`) }`. Hapus `issueSessionToken` / `verifySessionToken` (HMAC token tidak dipakai lagi).
- `src/lib/auth.functions.ts`: `signInWithSolana` sekarang verify sig → return `{ email, password, walletAddress }`. No more session token.
- `src/hooks/useWalletSession.ts`: setelah dapat credentials dari server fn, panggil `supabase.auth.signUp` (ignore "user exists" error) lalu `signInWithPassword`. Setelah signed in, panggil RPC `claim_player_by_wallet` sekali. Logout = `supabase.auth.signOut()`.

### Server functions (`src/lib/players.functions.ts`)

- Hapus `authed()` helper berbasis token.
- Tiap fn: ganti `.inputValidator(AuthInput…)` jadi `.middleware([requireSupabaseAuth])` (drop `token` dari input).
- Ganti `supabaseAdmin` jadi `context.supabase` (RLS-scoped sebagai user yang sign-in).
- Ganti `wallet_address = walletAddress` jadi `user_id = context.userId`.
- Pertahankan semua business rules (cooldown checks, rate limit, reward tables).
- Hapus import dynamic `@/integrations/supabase/client.server`.

### Wire middleware

- `src/start.ts`: pastikan `attachSupabaseAuth` ada di `functionMiddleware` (sudah ada per template — verifikasi).

### Hooks & components

- `src/hooks/usePlayer.ts`: panggil server fns tanpa `token` arg.
- `src/components/MainMenu.tsx`, `GameWalletRuntime.tsx`: tetap pakai `useWalletSession`; tampilan tidak berubah.
- `GameCanvas.tsx` `SpectatorCanvas.tsx`: `player.wallet_address` masih ada sebagai presence key — tidak perlu diubah.
- Leaderboard: ganti ke RPC public (anon key) atau server fn tanpa auth requirement.

### Cleanup

- `src/integrations/supabase/client.server.ts`: keep file (auto-gen) tapi tidak diimport.
- Hapus pemakaian `SUPABASE_SERVICE_ROLE_KEY` di kode app (env tetap ada di Lovable Cloud, tapi tidak dipakai → boleh diabaikan untuk Vercel).

## Migration Strategy untuk Data Lama

Row `players` lama dengan `wallet_address` tapi `user_id IS NULL` akan otomatis di-claim oleh `claim_player_by_wallet()` saat user dengan wallet yang sama sign-in pertama kali. Items mereka ikut ke-link.

## Vercel Deployment

Env vars yang dibutuhkan di Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL` (sama dengan VITE_)
- `SUPABASE_PUBLISHABLE_KEY` (sama dengan VITE_)
- `SOLANA_AUTH_SECRET` (untuk verify sig + derive password)

**Tidak perlu** `SUPABASE_SERVICE_ROLE_KEY`.

## Steps

1. Run migration (profiles, user_id columns, RLS policies, claim RPC).
2. Rewrite `auth.server.ts` + `auth.functions.ts`.
3. Rewrite `useWalletSession` untuk Supabase Auth flow.
4. Rewrite `players.functions.ts` (largest file).
5. Update `usePlayer` & components yang panggil server fns.
6. Verify `src/start.ts` punya `attachSupabaseAuth`.
7. Test: connect wallet → claim existing data → play.

## Risk Notes

- `supabase.auth.signUp` perlu email confirmation **disabled** (otherwise user stuck). Saya akan set `auto_confirm_email: true` via `configure_auth`.
- Anonymous signups Supabase Auth harus tetap **off**; user buatan kita pakai signUp normal dengan email synthetic.
- Email synthetic `<wallet>@wallet.realmstride.local` tidak akan kirim email apapun karena domain tidak resolve — aman.
- Setelah migration, row lama hanya bisa diakses lewat RPC claim (tidak akan tampil di leaderboard sebelum di-claim, karena belum ada user_id). Acceptable per requirement "user re-claim nanti".
