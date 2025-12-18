// app/api/admin/summary/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const [oapsResult, showsResult, scheduleResult] = await Promise.all([
      supabase.from("Oap").select("id", { count: "exact", head: true }),
      supabase.from("Show").select("id", { count: "exact", head: true }),
      supabase.from("ScheduleSlot").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      oaps: oapsResult.count ?? 0,
      shows: showsResult.count ?? 0,
      schedule: scheduleResult.count ?? 0,
      posts: 0,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("GET /api/admin/summary", err.message);
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    }
    console.error("GET /api/admin/summary", err);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 }
    );
  }
}
