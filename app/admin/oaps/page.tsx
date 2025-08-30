// app/admin/oaps/page.tsx
import { PrismaClient } from "@prisma/client";
import OapsAdminClient from "@/components/OapsAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export const metadata = { title: "OAPs · Admin · Rewind FM" };

export default async function AdminOapsPage() {
  let oaps: { id: string; name: string; role: string | null; imageUrl: string | null; twitter: string | null; instagram: string | null; bio: string | null }[] = [];
  try {
    oaps = await prisma.oap.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        imageUrl: true,
        twitter: true,
        instagram: true,
        bio: true,
      },
    });
  } catch (e) {
    console.error("Failed to load OAPs during admin prerender:", e);
    oaps = [];
  }

  // Adapt Prisma result to OapItem type expected by OapsAdminClient
  const oapItems = oaps.map(o => ({
    ...o,
    showIds: [] as string[], // TODO: populate from relation if available
  }));

  return (
    <main className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8 text-black">
      <h1
        className="text-3xl md:text-4xl mb-6"
        style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
      >
        OAPs
      </h1>
      <OapsAdminClient initialOaps={oapItems} />
    </main>
  );
}