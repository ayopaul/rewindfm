import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

const COOKIE = process.env.ADMIN_COOKIE_NAME || "rewind_admin";

// Simple in-memory rate limiter for brute force protection
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION = 5 * 60 * 1000; // 5 minute window

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

function isRateLimited(ip: string): { limited: boolean; remainingTime?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    return { limited: false };
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > WINDOW_DURATION) {
    loginAttempts.delete(ip);
    return { limited: false };
  }

  // Check if locked out
  if (attempts.count >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = now - attempts.lastAttempt;
    if (timeSinceLastAttempt < LOCKOUT_DURATION) {
      const remainingTime = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60);
      return { limited: true, remainingTime };
    }
    // Lockout expired, reset
    loginAttempts.delete(ip);
    return { limited: false };
  }

  return { limited: false };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now - attempts.lastAttempt > WINDOW_DURATION) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: now });
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  // Check rate limiting
  const { limited, remainingTime } = isRateLimited(ip);
  if (limited) {
    return NextResponse.json(
      { ok: false, error: `Too many login attempts. Try again in ${remainingTime} minutes.` },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      recordFailedAttempt(ip);
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Look up admin user in database
    const { data: user, error } = await supabase
      .from("AdminUser")
      .select("id, passwordHash")
      .eq("username", username)
      .single();

    if (error || !user) {
      recordFailedAttempt(ip);
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      recordFailedAttempt(ip);
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Successful login - clear attempts
    clearAttempts(ip);

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