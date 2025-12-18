// app/api/blog/categories/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Blog posts not implemented with Supabase yet - return default
  return NextResponse.json({ categories: ["All"] });
}
