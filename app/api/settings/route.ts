// app/api/settings/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Prefer Settings.streamUrl; fall back to first Station.streamUrl; finally env
    const { data: settings } = await supabase
      .from("Settings")
      .select("streamUrl")
      .limit(1)
      .single();

    const { data: station } = await supabase
      .from("Station")
      .select("streamUrl")
      .limit(1)
      .single();

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
