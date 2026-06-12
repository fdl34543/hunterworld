import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SignInInput = z.object({
  address: z.string().min(32).max(64),
  message: z.string().min(10).max(1000),
  signature: z.string().min(40).max(200),
});

/**
 * Verify a signed message from the user's Solana wallet and return the
 * synthetic Supabase Auth credentials for that wallet. The client then uses
 * these credentials to sign in / sign up with Supabase Auth — after which
 * RLS scopes by auth.uid() and no service-role key is needed anywhere.
 *
 * The password is derived from SOLANA_AUTH_SECRET inside `walletCredentials`,
 * so a caller without the signature cannot guess it.
 */
export const signInWithSolana = createServerFn({ method: "POST" })
  .inputValidator((input) => SignInInput.parse(input))
  .handler(
    async ({
      data,
    }): Promise<{ email: string; password: string; walletAddress: string }> => {
      const { verifySignIn, walletCredentials } = await import(
        "@/lib/auth.server"
      );
      const result = verifySignIn(data);
      if (!result.ok) throw new Error(`Sign-in failed: ${result.reason}`);
      const { email, password } = walletCredentials(data.address);
      return { email, password, walletAddress: data.address };
    },
  );