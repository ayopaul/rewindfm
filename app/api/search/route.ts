// app/api/search/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const take = Math.min(10, Math.max(1, Number(url.searchParams.get("take")) || 10));

    if (q.length < 2) {
      return NextResponse.json({ oaps: [], shows: [], posts: [] });
    }

    const [oapsResult, showsResult] = await Promise.all([
      supabase
        .from("Oap")
        .select("id, name, imageUrl")
        .ilike("name", `%${q}%`)
        .limit(take),
      supabase
        .from("Show")
        .select("id, title, imageUrl")
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(take),
    ]);

    const oaps = oapsResult.data ?? [];
    const shows = showsResult.data ?? [];

    // Posts are optional; return empty for now
    const posts: unknown[] = [];

    return NextResponse.json({ oaps, shows, posts });
  } catch (err: unknown) {
    console.error("/api/search", err);
    // Don't break the UI — return empty lists on failure.
    return NextResponse.json({ oaps: [], shows: [], posts: [] }, { status: 200 });
  }
}
