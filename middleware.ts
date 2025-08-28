// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "rewind_admin";
const COOKIE_VALUE = process.env.ADMIN_COOKIE_VALUE || "1";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow the login page itself
  if (pathname === "/admin/login" || pathname === "/admin/logout") {
    return NextResponse.next();
  }

  // Require the auth cookie for all other /admin/* routes
  const hasCookie = req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
  if (hasCookie) return NextResponse.next();

  // Redirect to login, preserving full return URL (path + query)
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  const nextUrl = pathname + (search || "");
  url.searchParams.set("next", nextUrl);
  return NextResponse.redirect(url);
}

// Only run on /admin/*
export const config = {
  matcher: ["/admin/:path*"],
};