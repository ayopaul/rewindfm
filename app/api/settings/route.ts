// app/api/settings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Prefer Settings.streamUrl; fall back to first Station.streamUrl; finally env
    const settings = await prisma.settings.findFirst().catch(() => null);
    const station = await prisma.station.findFirst().catch(() => null);

    const streamUrl =
      settings?.streamUrl ||
      station?.streamUrl ||
      process.env.NEXT_PUBLIC_STREAM_URL ||
      "";

    return NextResponse.json({
      ok: true,
      streamUrl,
    });
  } catch {
    return NextResponse.json({ ok: false, streamUrl: "" }, { status: 500 });
  }
}