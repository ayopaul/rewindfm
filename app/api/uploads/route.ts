// app/api/uploads/route.ts
import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Local/dev friendly default. Can be overridden in .env(.local)
// MEDIA_ROOT=/var/uploads  (prod)
const MEDIA_ROOT = process.env.MEDIA_ROOT || path.join(process.cwd(), "uploads");

function yyyymm(d = new Date()) {
  return { y: String(d.getFullYear()), m: String(d.getMonth() + 1).padStart(2, "0") };
}

/**
 * POST /api/uploads
 * Accepts multipart/form-data with a single field `file`.
 * Writes to:  <MEDIA_ROOT>/<namespace>/<yyyy>/<mm>/<filename-hash>.<ext>
 * Returns:    { ok: true, url: "/media/<namespace>/<yyyy>/<mm>/<fname>" }
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

    const dir = path.join(MEDIA_ROOT, namespace, y, m);
    await fs.mkdir(dir, { recursive: true });

    const full = path.join(dir, fname);
    // Write the file; if a file with same name somehow exists, overwrite is fine in dev
    await fs.writeFile(full, buf);

    // Public URL served by /app/media/[...path]/route.ts
    const url = `/media/${namespace}/${y}/${m}/${fname}`;
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    console.error("/api/uploads error:", e?.message || e);
    return NextResponse.json({ error: "upload failed", detail: String(e?.message || e) }, { status: 500 });
  }
}