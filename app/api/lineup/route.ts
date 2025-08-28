// app/api/lineup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

    const days: Record<string, { key: string; label: string; shows: any[] }> = {};
    Object.values(dayMap).forEach((d) => {
      days[d.key] = { key: d.key, label: d.label, shows: [] };
    });

    for (const slot of slots) {
      const { key } = dayMap[slot.dayOfWeek];
      if (slot.show) {
        days[key].shows.push({
          id: slot.show.id,
          title: slot.show.title,
          description: slot.show.description,
          imageUrl: (slot.show as any).imageUrl ?? null, // ensure optional
          startMin: slot.startMin,
          endMin: slot.endMin,
          oaps: slot.show.oaps.map((os) => ({
            id: os.oap.id,
            name: os.oap.name,
            avatarUrl: (os.oap as any).imageUrl ?? null, // fix: no photoUrl
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