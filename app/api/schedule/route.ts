import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Optional query: ?station=rewind-fm&day=1
 * day: 0..6 (Sun..Sat)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day");
  // Support either ?stationId=... or legacy ?station=... passing an id
  const stationIdParam = searchParams.get("stationId") ?? searchParams.get("station") ?? undefined;

  // Resolve station by id if provided; otherwise pick the first station (single-station setup)
  const station = stationIdParam
    ? await prisma.station.findUnique({ where: { id: stationIdParam } })
    : await prisma.station.findFirst();

  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  const where = { stationId: station.id, ...(day ? { dayOfWeek: Number(day) } : {}) };

  const slots = await prisma.scheduleSlot.findMany({
    where,
    include: { show: { include: { oaps: { include: { oap: true } } } } },
    orderBy: [{ dayOfWeek: "asc" }, { startMin: "asc" }],
  });

  return NextResponse.json(slots);
}