// app/admin/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "rewind_admin";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  // Ensure URL ends without trailing slash for consistency
  const redirectUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const response = NextResponse.redirect(new URL('/', redirectUrl));
  
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
export async function POST() {
  return GET();
}