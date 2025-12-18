import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: shows, error } = await supabase
    .from("Show")
    .select(`
      *,
      Station:stationId (*),
      OapOnShow:id (
        oapId,
        role,
        Oap:oapId (*)
      )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to match expected format
  const transformed = shows?.map((show) => ({
    ...show,
    station: show.Station,
    oaps: show.OapOnShow?.map((link: { oapId: string; role: string | null; Oap: unknown }) => ({
      oapId: link.oapId,
      role: link.role,
      oap: link.Oap,
    })),
    Station: undefined,
    OapOnShow: undefined,
  })) ?? [];

  return NextResponse.json(transformed);
}
