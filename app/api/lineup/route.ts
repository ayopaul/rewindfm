// app/api/lineup/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type ShowPayload = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startMin: number;
  endMin: number;
  oaps: { id: string; name: string; avatarUrl: string | null }[];
};

type DayPayload = {
  key: string;
  label: string;
  shows: ShowPayload[];
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: station } = await supabase
      .from("Station")
      .select("id")
      .limit(1)
      .single();

    if (!station) {
      return NextResponse.json({ weekday: { days: [] }, weekend: { days: [] } });
    }

    const { data: slots, error } = await supabase
      .from("ScheduleSlot")
      .select(`
        id, dayOfWeek, startMin, endMin,
        Show:showId (
          id, title, description, imageUrl,
          OapOnShow (
            Oap:oapId (id, name, imageUrl)
          )
        )
      `)
      .eq("stationId", station.id);

    if (error) throw error;

    const dayMap: Record<number, { key: string; label: string }> = {
      0: { key: "sun", label: "Sunday" },
      1: { key: "mon", label: "Monday" },
      2: { key: "tue", label: "Tuesday" },
      3: { key: "wed", label: "Wednesday" },
      4: { key: "thu", label: "Thursday" },
      5: { key: "fri", label: "Friday" },
      6: { key: "sat", label: "Saturday" },
    };

    const days: Record<string, DayPayload> = {} as Record<string, DayPayload>;
    Object.values(dayMap).forEach((d) => {
      days[d.key] = { key: d.key, label: d.label, shows: [] as ShowPayload[] };
    });

    for (const slot of slots ?? []) {
      const { key } = dayMap[slot.dayOfWeek];
      const show = slot.Show as unknown as {
        id: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        OapOnShow: { Oap: { id: string; name: string; imageUrl: string | null } }[];
      } | null;

      if (show) {
        days[key].shows.push({
          id: show.id,
          title: show.title,
          description: show.description,
          imageUrl: show.imageUrl,
          startMin: slot.startMin,
          endMin: slot.endMin,
          oaps: (show.OapOnShow ?? []).map(({ Oap }) => ({
            id: Oap.id,
            name: Oap.name,
            avatarUrl: Oap.imageUrl ?? null,
          })),
        });
      }
    }

    for (const d of Object.values(days)) {
      d.shows.sort((a, b) => a.startMin - b.startMin);
    }

    const weekday = { days: ["mon", "tue", "wed", "thu", "fri"].map((k) => days[k]) };
    const weekend = { days: ["sat", "sun"].map((k) => days[k]) };

    return NextResponse.json({ weekday, weekend });
  } catch (err) {
    console.error("lineup GET error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
