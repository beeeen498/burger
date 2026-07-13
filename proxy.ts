// proxy.ts

// ----- Admin route protection -----
// Runs before every /admin page. Redirects to login if no session found.

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // -- Create a response we can modify --
  let response = NextResponse.next({ request });

  // -- Create Supabase client using request/response cookies --
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // -- Check if user has a valid session --
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // -- No user = redirect to login --
  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

// ----- Only run proxy on /admin routes, but NOT on /admin/login -----
export const config = {
  matcher: ["/admin", "/admin/:path((?!login).*)"],
};