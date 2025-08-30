//app/api/admin/settings/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Get current settings, auto-create if missing
export async function GET() {
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
          station: { connect: { id: station.id } },
          streamUrl: station.streamUrl ?? "",
          timezone: "Europe/London",
          uploadsNamespace: "rewindfm",
          // Cast JSON field to Prisma.InputJsonValue
          theme: ({ blogHeaderBg: "#FBB63B" } as Prisma.InputJsonValue),
          // Initialize socials to DbNull so it’s an explicit JSON null
          socials: Prisma.DbNull,
        },
      });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings GET error:", error);
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

    const existing = await prisma.settings.findFirst();
    
    if (existing) {
      // Update existing settings
      const updateData: Prisma.SettingsUpdateInput = {};
      if (typeof body.streamUrl === "string") updateData.streamUrl = body.streamUrl;
      if (typeof body.timezone === "string") updateData.timezone = body.timezone;
      if (typeof body.uploadsNamespace === "string")
        updateData.uploadsNamespace = body.uploadsNamespace;
      if (typeof body.aboutHtml !== "undefined")
        updateData.aboutHtml = body.aboutHtml ?? null;
      if (typeof body.socials !== "undefined") {
        updateData.socials = body.socials === null
          ? Prisma.DbNull
          : (body.socials as Prisma.InputJsonValue);
      }
      if (typeof body.theme !== "undefined") {
        updateData.theme = body.theme === null
          ? Prisma.DbNull
          : (body.theme as Prisma.InputJsonValue);
      }

      const updated = await prisma.settings.update({ 
        where: { id: existing.id }, 
        data: updateData 
      });
      
      return NextResponse.json({ ok: true, settings: updated });
    } else {
      // Create new settings
      const createData: Prisma.SettingsCreateInput = {
        station: { connect: { id: station.id } },
        streamUrl: (typeof body.streamUrl === "string") ? body.streamUrl : "",
        timezone: (typeof body.timezone === "string") ? body.timezone : "Europe/London",
        uploadsNamespace: (typeof body.uploadsNamespace === "string") ? body.uploadsNamespace : "rewindfm",
        aboutHtml: (typeof body.aboutHtml !== "undefined") ? (body.aboutHtml ?? null) : null,
        socials: (typeof body.socials === "undefined")
          ? undefined
          : (body.socials === null ? Prisma.DbNull : (body.socials as Prisma.InputJsonValue)),
        theme: (typeof body.theme === "undefined")
          ? ({ blogHeaderBg: "#FBB63B" } as Prisma.InputJsonValue)
          : (body.theme === null ? Prisma.DbNull : (body.theme as Prisma.InputJsonValue)),
      };

      const created = await prisma.settings.create({ data: createData });
      
      return NextResponse.json({ ok: true, settings: created });
    }
  } catch (e) {
    console.error("Settings PUT error:", e);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// Alias POST to PUT for convenience
export const POST = PUT;