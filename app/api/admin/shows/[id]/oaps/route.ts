// app/api/admin/shows/[id]/oaps/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// List OAPs assigned to a show
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const links = await prisma.oapOnShow.findMany({
      where: { showId: id },
      select: { oapId: true, role: true, oap: { select: { id: true, name: true, photoUrl: true } } },
      orderBy: { oap: { name: "asc" } },
    });
    return NextResponse.json({ items: links });
  } catch {
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
  }
}

// Assign (or upsert) an OAP to a show
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { oapId, role } = await req.json();
    if (!oapId) return NextResponse.json({ error: "oapId required" }, { status: 400 });

    await prisma.oapOnShow.upsert({
      where: { oapId_showId: { oapId, showId: id } }, // requires @@unique([oapId, showId]) in schema
      create: { oapId, showId: id, role: role ?? null },
      update: { role: role ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to assign" }, { status: 500 });
  }
}

// Unassign by oapId (send ?oapId=...)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const oapId = searchParams.get("oapId");
  if (!oapId) return NextResponse.json({ error: "oapId required" }, { status: 400 });

  try {
    await prisma.oapOnShow.delete({
      where: { oapId_showId: { oapId, showId: id } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to unassign" }, { status: 500 });
  }
}