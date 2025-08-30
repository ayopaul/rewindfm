// app/api/admin/schedule/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const items = await prisma.scheduleSlot.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startMin: "asc" }],
      include: { show: { select: { id: true, title: true } } },
    });
    return NextResponse.json({ items });
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

    // If you have multi-station, add stationId from Settings or env
    const station = await prisma.station.findFirst();
    if (!station) {
      return NextResponse.json({ error: "No station configured" }, { status: 400 });
    }

    const created = await prisma.scheduleSlot.create({
      data: {
        stationId: station.id,
        showId,
        dayOfWeek,
        startMin,
        endMin,
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err: unknown) {
    const error = err as Error;
    // Unique/overlap checks can be added later; keep MVP simple
    return NextResponse.json({ error: error.message || "Unable to create slot" }, { status: 500 });
  }
}