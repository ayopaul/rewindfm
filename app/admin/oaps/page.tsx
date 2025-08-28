// app/admin/oaps/page.tsx
import { PrismaClient } from "@prisma/client";
import OapsAdminClient from "@/components/OapsAdminClient";

const prisma = new PrismaClient();

export const metadata = { title: "OAPs · Admin · Rewind FM" };

export default async function AdminOapsPage() {
  const oaps = await prisma.oap.findMany({
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

  return (
    <main className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8 text-black">
      <h1
        className="text-3xl md:text-4xl mb-6"
        style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
      >
        OAPs
      </h1>
      <OapsAdminClient initialOaps={oaps} />
    </main>
  );
}