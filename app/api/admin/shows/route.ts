// app/api/admin/shows/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rows = await prisma.show.findMany({
      orderBy: { title: "asc" },
      // `imageUrl` not in schema, so do not select it
      select: { id: true, title: true, description: true },
    });
    // Keep client response shape stable by adding imageUrl: null
    const items = rows.map((r) => ({ ...r, imageUrl: null as string | null }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load shows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body?.title || "").trim();
    const description = body?.description ?? null;
    // const imageUrl = body?.imageUrl ?? null; // ignored: field not in schema

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const station = await prisma.station.findFirst();
    if (!station) {
      return NextResponse.json({ error: "No station configured" }, { status: 400 });
    }

    const created = await prisma.show.create({
      data: { title, description, stationId: station.id },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch {
    return NextResponse.json({ error: "Unable to create show" }, { status: 500 });
  }
}