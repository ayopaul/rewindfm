// app/api/admin/shows/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    if (typeof body?.title === "string") data.title = body.title.trim();
    if (typeof body?.description !== "undefined") data.description = body.description ?? null;
    if (typeof body?.imageUrl !== "undefined") data.imageUrl = body.imageUrl ?? null;

    if (data.title !== undefined && !data.title) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    await prisma.show.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update show" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.show.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete show" }, { status: 500 });
  }
}