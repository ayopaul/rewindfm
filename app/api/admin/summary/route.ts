// app/api/admin/summary/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [oaps, shows, schedule] = await Promise.all([
      prisma.oap.count(),
      prisma.show.count(),
      prisma.scheduleSlot.count(),
    ]);
    return NextResponse.json({ oaps, shows, schedule, posts: 0 });
  } catch (err: any) {
    console.error("GET /api/admin/summary", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load summary" },
      { status: 500 }
    );
  }
}