import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs/promises";
import nodePath from "node:path";

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
    return new NextResponse(data);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}