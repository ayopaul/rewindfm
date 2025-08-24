import { NextResponse } from "next/server";

const COOKIE = process.env.ADMIN_COOKIE_NAME || "rewind_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}