import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const stations = await prisma.station.findMany();
  return NextResponse.json(stations);
}