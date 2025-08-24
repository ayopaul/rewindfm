import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.scheduleSlot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

    await prisma.scheduleSlot.update({
      where: { id },
      data: { dayOfWeek, showId, startMin, endMin },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update slot" }, { status: 500 });
  }
}