// app/api/lineup/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

type JoinedOap = {
  id: string;
  name: string;
  imageUrl: string | null;
};

type JoinedShow = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  oaps: { oap: JoinedOap }[];
};

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

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const station = await prisma.station.findFirst();
    if (!station) {
      return NextResponse.json({ weekday: { days: [] }, weekend: { days: [] } });
    }

    const slots = await prisma.scheduleSlot.findMany({
      where: { stationId: station.id },
      include: {
        show: {
          include: {
            oaps: {
              include: {
                oap: true, // <-- this has `name`, `id`, maybe `imageUrl`
              },
            },
          },
        },
      },
    });

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

    for (const slot of slots) {
      const { key } = dayMap[slot.dayOfWeek];
      const show = slot.show as unknown as JoinedShow | null;
      if (show) {
        days[key].shows.push({
          id: show.id,
          title: show.title,
          description: show.description,
          imageUrl: show.imageUrl,
          startMin: slot.startMin,
          endMin: slot.endMin,
          oaps: show.oaps.map(({ oap }) => ({
            id: oap.id,
            name: oap.name,
            avatarUrl: oap.imageUrl ?? null,
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