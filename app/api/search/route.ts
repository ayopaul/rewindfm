// app/api/search/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const take = Math.min(10, Math.max(1, Number(url.searchParams.get("take")) || 10));

    if (q.length < 2) {
      return NextResponse.json({ oaps: [], shows: [], posts: [] });
    }

    const [oaps, shows] = await Promise.all([
      prisma.oap.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true, imageUrl: true },
        take,
      }),
      prisma.show.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: { id: true, title: true, imageUrl: true },
        take,
      }),
    ]);

    // Posts are optional; return empty if model not present
    let posts: any[] = [];
    try {
      // @ts-ignore - Post may not exist in schema
      posts = await prisma.post.findMany?.({
        where: {
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        select: { id: true, title: true, image: true },
        take,
      });
      if (!Array.isArray(posts)) posts = [];
    } catch {
      posts = [];
    }

    return NextResponse.json({ oaps, shows, posts });
  } catch (err: any) {
    console.error("/api/search", err);
    // Don’t break the UI — return empty lists on failure.
    return NextResponse.json({ oaps: [], shows: [], posts: [] }, { status: 200 });
  }
}