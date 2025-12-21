// app/api/uploads/route.ts
import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import path from "node:path";
import { supabase } from "@/lib/supabase";

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "media";

function yyyymm(d = new Date()) {
  return { y: String(d.getFullYear()), m: String(d.getMonth() + 1).padStart(2, "0") };
}

/**
 * POST /api/uploads
 * Accepts multipart/form-data with a single field `file`.
 * Uploads to Supabase Storage bucket.
 * Returns:    { ok: true, url: "<public_url>" }
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

    // Namespace can come from env (MEDIA_NAMESPACE) and falls back to "rewindfm".
    const namespace = process.env.MEDIA_NAMESPACE?.trim() || "rewindfm";

    const { y, m } = yyyymm();
    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    const ext = path.extname(file.name) || "";
    const base = path
      .basename(file.name, ext)
      .replace(/[^a-z0-9-_]+/gi, "-")
      .toLowerCase();
    const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8);
    const fname = `${base}-${hash}${ext}`;

    // Build the path in Supabase storage
    const storagePath = `${namespace}/${y}/${m}/${fname}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: "upload failed", detail: uploadError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const url = publicUrlData.publicUrl;

    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    console.error("/api/uploads error:", e?.message || e);
    return NextResponse.json({ error: "upload failed", detail: String(e?.message || e) }, { status: 500 });
  }
}