//app/api/oaps/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const oaps = await prisma.oap.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(oaps);
}