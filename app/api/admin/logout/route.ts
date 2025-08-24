import { NextResponse } from "next/server";
const COOKIE = process.env.ADMIN_COOKIE_NAME || "rewind_admin";

export async function POST() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004"));
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}