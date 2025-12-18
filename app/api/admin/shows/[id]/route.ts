// app/api/admin/shows/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (typeof body?.title === "string") {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      data.title = title;
    }
    if (typeof body?.description !== "undefined") data.description = body.description ?? null;
    if (typeof body?.imageUrl !== "undefined") data.imageUrl = body.imageUrl ?? null;

    const { error } = await supabase
      .from("Show")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update show" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { error } = await supabase
      .from("Show")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete show" }, { status: 500 });
  }
}
