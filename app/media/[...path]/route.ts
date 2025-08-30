import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs/promises";
import nodePath from "node:path";

const MIMES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

const BASE = process.env.MEDIA_BASE || "/var/uploads";
const NAMESPACE = "rewindfm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const segments = Array.isArray(path) ? path : [];
  const [ns, ...rest] = segments;

  if (!ns || ns !== NAMESPACE || rest.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const target = nodePath.join(BASE, ns, ...rest);

  try {
    const data = await fs.readFile(target);
    // Convert Buffer to a typed array so it satisfies BodyInit
    const body = new Uint8Array(data);
    const ext = nodePath.extname(target).toLowerCase();
    const mime = MIMES[ext] ?? "application/octet-stream";
    return new NextResponse(body, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}