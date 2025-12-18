// app/api/admin/schedule/route.ts
import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: items, error } = await supabase
      .from("ScheduleSlot")
      .select(`
        id, stationId, showId, dayOfWeek, startMin, endMin, createdAt, updatedAt,
        Show:showId (id, title)
      `)
      .order("dayOfWeek", { ascending: true })
      .order("startMin", { ascending: true });

    if (error) throw error;

    // Transform to match expected format
    const transformed = items?.map((item) => ({
      ...item,
      show: item.Show,
      Show: undefined,
    })) ?? [];

    return NextResponse.json({ items: transformed });
  } catch {
    return NextResponse.json({ error: "Failed to load schedule" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dayOfWeek = Number(body?.dayOfWeek);
    const showId: string = body?.showId;
    const startMin = Number(body?.startMin);
    const endMin = Number(body?.endMin);

    if (
      !Number.isFinite(dayOfWeek) ||
      dayOfWeek < 0 ||
      dayOfWeek > 6 ||
      !showId ||
      !Number.isFinite(startMin) ||
      !Number.isFinite(endMin) ||
      startMin >= endMin
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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

    const { error } = await supabase.from("ScheduleSlot").insert({
      id,
      stationId: station.id,
      showId,
      dayOfWeek,
      startMin,
      endMin,
      createdAt: now,
      updatedAt: now,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Unable to create slot" }, { status: 500 });
  }
}
