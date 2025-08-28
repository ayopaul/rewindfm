// app/api/blog/categories/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Support either `blogPost` or `post` model names
    const model: any = (prisma as any).blogPost ?? (prisma as any).post;
    if (!model) {
      return NextResponse.json({ categories: [] });
    }

    const cats = (await model.findMany({
      select: { category: true },
      where: { category: { not: null } },
    })) as { category: string | null }[];

    const raw: string[] = cats
      .map((c: { category: string | null }) => c.category)
      .filter((v: string | null): v is string => Boolean(v));

    const unique = Array.from(new Map(raw.map((c) => [c.toLowerCase(), c])).values());

    // Prepend "All" so UI always has a catch‑all option
    return NextResponse.json({ categories: ["All", ...unique] });
  } catch (err) {
    console.error("/blog/categories GET", err);
    return NextResponse.json({ categories: ["All"] });
  }
}