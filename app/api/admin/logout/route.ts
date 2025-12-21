import { NextResponse, type NextRequest } from "next/server";
const COOKIE = process.env.ADMIN_COOKIE_NAME || "rewind_admin";

export async function POST(req: NextRequest) {
  // Use the request URL to determine the base, not a hardcoded value
  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}