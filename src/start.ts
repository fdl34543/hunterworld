import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // Don't swallow errors from server functions — let TanStack frame them
    // so the client receives the original Error message via mutateAsync
    // rejection instead of an HTML 500 page (which triggers the Lovable
    // "page didn't load" overlay).
    let isServerFn = false;
    try {
      isServerFn = new URL(request.url).pathname.startsWith("/_serverFn");
    } catch {
      // ignore — treat as page request
    }
    if (isServerFn) throw error;
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
