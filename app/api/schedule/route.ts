import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Optional query: ?station=rewind-fm&day=1
 * day: 0..6 (Sun..Sat)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day");
  const stationIdParam = searchParams.get("stationId") ?? searchParams.get("station") ?? undefined;

  // Resolve station by id if provided; otherwise pick the first station
  let station;
  if (stationIdParam) {
    const { data } = await supabase
      .from("Station")
      .select("*")
      .eq("id", stationIdParam)
      .single();
    station = data;
  } else {
    const { data } = await supabase
      .from("Station")
      .select("*")
      .limit(1)
      .single();
    station = data;
  }

  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  let query = supabase
    .from("ScheduleSlot")
    .select(`
      *,
      Show:showId (
        *,
        OapOnShow:id (
          oapId,
          role,
          Oap:oapId (*)
        )
      )
    `)
    .eq("stationId", station.id)
    .order("dayOfWeek", { ascending: true })
    .order("startMin", { ascending: true });

  if (day) {
    query = query.eq("dayOfWeek", Number(day));
  }

  const { data: slots, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to match expected format
  const transformed = slots?.map((slot) => ({
    ...slot,
    show: slot.Show ? {
      ...slot.Show,
      oaps: slot.Show.OapOnShow?.map((link: { oapId: string; role: string | null; Oap: unknown }) => ({
        oapId: link.oapId,
        role: link.role,
        oap: link.Oap,
      })),
      OapOnShow: undefined,
    } : null,
    Show: undefined,
  })) ?? [];

  return NextResponse.json(transformed);
}
