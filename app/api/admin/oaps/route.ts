// app/api/admin/oaps/route.ts
import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/supabase";

// List OAPs
export async function GET() {
  try {
    const { data: items, error } = await supabase
      .from("Oap")
      .select("id, name, role, imageUrl, twitter, instagram, bio")
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(items ?? []);
  } catch (err) {
    console.error("GET /api/admin/oaps", err);
    return NextResponse.json({ error: "Failed to load OAPs" }, { status: 500 });
  }
}

// Create new OAP
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body?.name as string | undefined)?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const id = generateId();
    const now = new Date().toISOString();

    const { error } = await supabase.from("Oap").insert({
      id,
      name,
      role: body?.role ?? null,
      imageUrl: body?.imageUrl ?? null,
      twitter: body?.twitter ?? null,
      instagram: body?.instagram ?? null,
      bio: body?.bio ?? null,
      createdAt: now,
      updatedAt: now,
    });

    if (error) throw error;

    return NextResponse.json({ id }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("POST /api/admin/oaps", error);
    return NextResponse.json(
      { error: error.message || "Failed to create OAP" },
      { status: 500 }
    );
  }
}
