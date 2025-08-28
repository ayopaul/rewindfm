// app/api/admin/oaps/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

/** Coerce empty strings to null, trim strings, leave other types alone */
function sanitize<T>(v: T) {
  if (typeof v === "string") {
    const t = v.trim();
    return (t.length ? t : null) as unknown as T;
  }
  return v;
}

function buildUpdateData(body: any) {
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
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
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

    await prisma.oap.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      // Record not found
      return NextResponse.json({ error: "OAP not found." }, { status: 404 });
    }
    console.error("PUT /api/admin/oaps/[id]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update OAP" },
      { status: 500 }
    );
  }
}

// Delete an OAP
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.oap.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ error: "OAP not found." }, { status: 404 });
    }
    console.error("DELETE /api/admin/oaps/[id]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete OAP" },
      { status: 500 }
    );
  }
}