// app/api/uploads/route.ts
// import path from "node:path";
// const BASE = process.env.MEDIA_ROOT || path.join(process.cwd(), "var", "uploads");
// const NAMESPACE = process.env.MEDIA_NAMESPACE || "rewind-fm";

// app/api/uploads/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const prisma = new PrismaClient();
const UPLOADS_BASE = process.env.UPLOADS_BASE || "/var/uploads";

function yyyymm(d = new Date()) {
  return { y: String(d.getFullYear()), m: String(d.getMonth() + 1).padStart(2, "0") };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

    // Decide namespace from settings
    const settings = await prisma.settings.findFirst();
    const namespace = settings?.uploadsNamespace || "rewindfm";

    // Build path
    const { y, m } = yyyymm();
    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    const ext = path.extname(file.name) || "";
    const base = path.basename(file.name, ext).replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
    const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8);
    const fname = `${base}-${hash}${ext}`;
    const dir = path.join(UPLOADS_BASE, namespace, y, m);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fname), buf, { flag: "wx" });

    // Public URL: /media/<namespace>/<y>/<m>/<fname>
    const url = `/media/${namespace}/${y}/${m}/${fname}`;
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}