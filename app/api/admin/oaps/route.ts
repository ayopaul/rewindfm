// app/api/admin/oaps/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// List OAPs
export async function GET() {
  try {
    const items = await prisma.oap.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        imageUrl: true,
        twitter: true,
        instagram: true,
        bio: true,
      },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/admin/oaps", err);
    return NextResponse.json({ error: "Failed to load OAPs" }, { status: 500 });
  }
}

// Create new OAP
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body?.name as string | undefined)?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const created = await prisma.oap.create({
      data: {
        name,
        role: body?.role ?? null,
        imageUrl: body?.imageUrl ?? null,
        twitter: body?.twitter ?? null,
        instagram: body?.instagram ?? null,
        bio: body?.bio ?? null,
      },
      select: { id: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("POST /api/admin/oaps", error);
    return NextResponse.json(
      { error: error.message || "Failed to create OAP" },
      { status: 500 }
    );
  }
}