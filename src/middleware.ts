import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Cheap first gate: no session cookie -> Sign In. Role checks happen in the dashboard layout
// (client) and, authoritatively, on the Express API (JWT + DB role lookup).
export function middleware(req: NextRequest) {
  if (!getSessionCookie(req)) {
    const url = new URL("/signin", req.url);
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/profile", "/menu/:id", "/payment/:path*"] };
