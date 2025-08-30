// app/api/blog/categories/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// Minimal shape we need from a Prisma model for this endpoint
type PostModel = {
  findMany: (args: {
    select: { category: true };
    where: { category: { not: null } };
  }) => Promise<Array<{ category: string | null }>>;
};

// Narrow unknown to PostModel safely (no `any`)
function isPostModel(x: unknown): x is PostModel {
  if (typeof x !== "object" || x === null) return false;
  const maybe = x as { findMany?: unknown };
  return typeof maybe.findMany === "function";
}

export async function GET() {
  try {
    // Support either `blogPost` or `post` model names without `any`
    const candidate =
      (prisma as unknown as Record<string, unknown>).blogPost ??
      (prisma as unknown as Record<string, unknown>).post;

    if (!isPostModel(candidate)) {
      return NextResponse.json({ categories: [] });
    }

    const cats = await candidate.findMany({
      select: { category: true },
      where: { category: { not: null } },
    });

    const raw: string[] = cats
      .map((c) => c.category)
      .filter((v): v is string => Boolean(v));

    const unique = Array.from(
      new Map(raw.map((c) => [c.toLowerCase(), c])).values()
    );

    // Prepend "All" so UI always has a catch‑all option
    return NextResponse.json({ categories: ["All", ...unique] });
  } catch (err) {
    console.error("/blog/categories GET", err);
    return NextResponse.json({ categories: ["All"] });
  }
}