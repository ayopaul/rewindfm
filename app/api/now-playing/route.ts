// app/api/now-playing/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const now = new Date();
    const day = now.getDay(); // 0..6 (Sun=0)
    const minutes = now.getHours() * 60 + now.getMinutes();

    // Find the active slot for the current time
    const { data: slot } = await supabase
      .from("ScheduleSlot")
      .select("showId")
      .eq("dayOfWeek", day)
      .lte("startMin", minutes)
      .gt("endMin", minutes)
      .limit(1)
      .single();

    // Defaults
    let title = "Rewind Radio";
    let subtitle = "Live on Rewind.";
    const image = "/media/placeholder/vinyl-thumb.jpg";
    const streamUrl = process.env.NEXT_PUBLIC_STREAM_URL || "";

    // If a slot is found, fetch the show
    if (slot?.showId) {
      const { data: show } = await supabase
        .from("Show")
        .select("title, description")
        .eq("id", slot.showId)
        .single();

      if (show) {
        if (show.title) title = show.title;
        if (show.description) subtitle = show.description;
      }
    }

    return NextResponse.json({ title, subtitle, image, streamUrl });
  } catch {
    // Return safe defaults rather than throwing
    return NextResponse.json({
      title: "Rewind Radio",
      subtitle: "Live on Rewind.",
      image: "/media/placeholder/vinyl-thumb.jpg",
      streamUrl: process.env.NEXT_PUBLIC_STREAM_URL || "",
    });
  }
}
