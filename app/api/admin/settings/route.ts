// app/api/admin/settings/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { supabase, generateId } from "@/lib/supabase";

// Get current settings, auto-create if missing
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from("Settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

    if (!settings) {
      // Get station to create settings
      const { data: station, error: stationError } = await supabase
        .from("Station")
        .select("id, streamUrl")
        .limit(1)
        .single();

      if (stationError || !station) {
        return NextResponse.json(
          { error: "No station configured" },
          { status: 400 }
        );
      }

      const id = generateId();
      const now = new Date().toISOString();

      const { data: newSettings, error: createError } = await supabase
        .from("Settings")
        .insert({
          id,
          stationId: station.id,
          streamUrl: station.streamUrl ?? "",
          timezone: "Europe/London",
          uploadsNamespace: "rewindfm",
          theme: { blogHeaderBg: "#FBB63B" },
          socials: null,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (createError) throw createError;

      return NextResponse.json({ settings: newSettings });
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

    const { data: station, error: stationError } = await supabase
      .from("Station")
      .select("id")
      .limit(1)
      .single();

    if (stationError || !station) {
      return NextResponse.json(
        { error: "No station configured" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("Settings")
      .select("id")
      .limit(1)
      .single();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing settings
      const updateData: Record<string, unknown> = { updatedAt: now };

      if (typeof body.streamUrl === "string") updateData.streamUrl = body.streamUrl;
      if (typeof body.timezone === "string") updateData.timezone = body.timezone;
      if (typeof body.uploadsNamespace === "string") updateData.uploadsNamespace = body.uploadsNamespace;
      if (typeof body.aboutHtml !== "undefined") updateData.aboutHtml = body.aboutHtml ?? null;
      if (typeof body.socials !== "undefined") updateData.socials = body.socials;
      if (typeof body.theme !== "undefined") updateData.theme = body.theme;

      const { data: updated, error } = await supabase
        .from("Settings")
        .update(updateData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ ok: true, settings: updated });
    } else {
      // Create new settings
      const id = generateId();

      const { data: created, error } = await supabase
        .from("Settings")
        .insert({
          id,
          stationId: station.id,
          streamUrl: typeof body.streamUrl === "string" ? body.streamUrl : "",
          timezone: typeof body.timezone === "string" ? body.timezone : "Europe/London",
          uploadsNamespace: typeof body.uploadsNamespace === "string" ? body.uploadsNamespace : "rewindfm",
          aboutHtml: body.aboutHtml ?? null,
          socials: body.socials ?? null,
          theme: body.theme ?? { blogHeaderBg: "#FBB63B" },
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (error) throw error;

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
