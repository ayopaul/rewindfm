// app/admin/shows/page.tsx
import { PrismaClient } from "@prisma/client";
import ShowsAdminClient from "../../../components/ShowsAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export const metadata = { title: "Shows · Admin · Rewind FM" };

export default async function AdminShowsPage() {
  let shows: { id: string; title: string; description: string | null }[] = [];
  try {
    shows = await prisma.show.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, description: true },
    });
  } catch (e) {
    console.error("Failed to preload shows for admin SSR:", e);
  }

  // Make the prop shape compatible with ShowsAdminClient (which expects imageUrl)
  const initialShows = shows.map((s) => ({ ...s, imageUrl: null }));

  return (
    <main className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8 text-black">
      <h1
        className="text-3xl md:text-4xl mb-6"
        style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
      >
        Shows
      </h1>
      <ShowsAdminClient initialShows={initialShows} />
    </main>
  );
}