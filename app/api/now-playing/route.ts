// app/api/now-playing/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    const day = now.getDay(); // 0..6 (Sun=0)
    const minutes = now.getHours() * 60 + now.getMinutes();

    // Find the active slot for the current time
    const slot = await prisma.scheduleSlot.findFirst({
      where: {
        dayOfWeek: day,
        startMin: { lte: minutes },
        endMin: { gt: minutes },
      },
      select: { showId: true }, // keep it minimal; we'll fetch the show next
    });

    // Defaults
    let title = "Rewind Radio";
    let subtitle = "Live on Rewind.";
    let image = "/media/placeholder/vinyl-thumb.jpg"; // adjust when you add artwork
    const streamUrl = process.env.NEXT_PUBLIC_STREAM_URL || "";

    // If a slot is found, fetch the show
    if (slot?.showId) {
      const show = await prisma.show.findUnique({
        where: { id: slot.showId },
        select: {
          title: true,
          description: true, // we'll use this as 'subtitle'
        },
      });

      if (show) {
        if (show.title) title = show.title;
        if (show.description) subtitle = show.description;
        // image: keep placeholder until your schema has artwork
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