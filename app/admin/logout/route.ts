// app/admin/logout/route.ts
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "rewind_admin";

export async function GET(req: NextRequest) {
  // Use the request URL to determine the base, not a hardcoded value
  const url = new URL("/", req.url);

  const response = NextResponse.redirect(url);

  // Clear auth cookie
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

// Also handle POST requests if needed
export async function POST(req: NextRequest) {
  return GET(req);
}