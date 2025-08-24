//app/api/admin/settings/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get current settings, auto-create if missing
export async function GET(_req: NextRequest) {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      const station = await prisma.station.findFirst();
      if (!station) {
        return NextResponse.json(
          { error: "No station configured" },
          { status: 400 }
        );
      }
      settings = await prisma.settings.create({
        data: {
          stationId: station.id,
          streamUrl: station.streamUrl ?? "",
          timezone: "Europe/London",
          uploadsNamespace: "rewindfm",
          theme: { blogHeaderBg: "#FBB63B" },
        },
      });
    }
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

// Update settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const station = await prisma.station.findFirst();
    if (!station) {
      return NextResponse.json(
        { error: "No station configured" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (typeof body.streamUrl === "string") data.streamUrl = body.streamUrl;
    if (typeof body.timezone === "string") data.timezone = body.timezone;
    if (typeof body.uploadsNamespace === "string")
      data.uploadsNamespace = body.uploadsNamespace;
    if (typeof body.aboutHtml !== "undefined")
      data.aboutHtml = body.aboutHtml ?? null;
    if (typeof body.socials !== "undefined") data.socials = body.socials ?? null;
    if (typeof body.theme !== "undefined") data.theme = body.theme ?? null;

    const existing = await prisma.settings.findFirst();
    const updated = existing
      ? await prisma.settings.update({ where: { id: existing.id }, data })
      : await prisma.settings.create({
          data: {
            stationId: station.id,
            streamUrl: "",
            timezone: "Europe/London",
            uploadsNamespace: "rewindfm",
            ...data,
          },
        });

    return NextResponse.json({ ok: true, settings: updated });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// Alias POST to PUT for convenience
export const POST = PUT;
