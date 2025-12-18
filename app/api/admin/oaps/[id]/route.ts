// app/api/admin/oaps/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/** Coerce empty strings to null, trim strings, leave other types alone */
function sanitize<T>(v: T) {
  if (typeof v === "string") {
    const t = v.trim();
    return (t.length ? t : null) as unknown as T;
  }
  return v;
}

function buildUpdateData(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  if ("name" in body) data.name = sanitize(body.name);
  if ("role" in body) data.role = sanitize(body.role);
  if ("imageUrl" in body) data.imageUrl = sanitize(body.imageUrl);
  if ("twitter" in body) data.twitter = sanitize(body.twitter);
  if ("instagram" in body) data.instagram = sanitize(body.instagram);
  if ("bio" in body) data.bio = sanitize(body.bio);
  return data;
}

// Update an OAP
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const data = buildUpdateData(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update." },
        { status: 400 }
      );
    }

    // If name provided, ensure it's not empty after trimming
    if ("name" in data && (data.name === null || data.name === "")) {
      return NextResponse.json(
        { error: "Name cannot be empty." },
        { status: 400 }
      );
    }

    data.updatedAt = new Date().toISOString();

    const { error, count } = await supabase
      .from("Oap")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("PUT /api/admin/oaps/[id]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update OAP" },
      { status: 500 }
    );
  }
}

// Delete an OAP
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { error } = await supabase
      .from("Oap")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("DELETE /api/admin/oaps/[id]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete OAP" },
      { status: 500 }
    );
  }
}
