import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "rewind_admin";

export async function GET(request: Request) {
  const home = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004/";

  // Clear the cookie
  const res = NextResponse.redirect(home);
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}