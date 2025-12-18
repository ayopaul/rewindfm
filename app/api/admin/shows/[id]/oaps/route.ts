// app/api/admin/shows/[id]/oaps/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// List OAPs assigned to a show
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { data: links, error } = await supabase
      .from("OapOnShow")
      .select(`
        oapId,
        role,
        Oap:oapId (id, name, imageUrl)
      `)
      .eq("showId", id);

    if (error) throw error;

    // Transform to match expected format
    const items = links?.map((link) => ({
      oapId: link.oapId,
      role: link.role,
      oap: link.Oap,
    })) ?? [];

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
  }
}

// Assign (or upsert) an OAP to a show
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { oapId, role } = await req.json();
    if (!oapId) return NextResponse.json({ error: "oapId required" }, { status: 400 });

    // Check if link exists
    const { data: existing } = await supabase
      .from("OapOnShow")
      .select("oapId")
      .eq("oapId", oapId)
      .eq("showId", id)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("OapOnShow")
        .update({ role: role ?? null })
        .eq("oapId", oapId)
        .eq("showId", id);
      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from("OapOnShow")
        .insert({ oapId, showId: id, role: role ?? null });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to assign" }, { status: 500 });
  }
}

// Unassign by oapId (send ?oapId=...)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const oapId = searchParams.get("oapId");
  if (!oapId) return NextResponse.json({ error: "oapId required" }, { status: 400 });

  try {
    const { error } = await supabase
      .from("OapOnShow")
      .delete()
      .eq("oapId", oapId)
      .eq("showId", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to unassign" }, { status: 500 });
  }
}
