// app/api/admin/shows/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { supabase, generateId } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: rows, error } = await supabase
      .from("Show")
      .select("id, title, description, imageUrl")
      .order("title", { ascending: true });

    if (error) throw error;

    const items = rows?.map((r) => ({ ...r, imageUrl: r.imageUrl ?? null })) ?? [];
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load shows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body?.title || "").trim();
    const description = body?.description ?? null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get first station
    const { data: station, error: stationError } = await supabase
      .from("Station")
      .select("id")
      .limit(1)
      .single();

    if (stationError || !station) {
      return NextResponse.json({ error: "No station configured" }, { status: 400 });
    }

    const id = generateId();
    const now = new Date().toISOString();

    const { error } = await supabase.from("Show").insert({
      id,
      title,
      description,
      stationId: station.id,
      createdAt: now,
      updatedAt: now,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Unable to create show" }, { status: 500 });
  }
}
