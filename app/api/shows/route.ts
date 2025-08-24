import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const shows = await prisma.show.findMany({
    include: { station: true, oaps: { include: { oap: true } } },
  });
  return NextResponse.json(shows);
}