// app/api/admin/oaps/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(_req: NextRequest) {
  try {
    const items = await prisma.oap.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load OAPs" }, { status: 500 });
  }
}