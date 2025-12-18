// app/admin/shows/page.tsx
import { supabase } from "@/lib/supabase";
import ShowsAdminClient from "../../../components/ShowsAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Shows · Admin · Rewind FM" };

export default async function AdminShowsPage() {
  let shows: { id: string; title: string; description: string | null }[] = [];
  try {
    const { data, error } = await supabase
      .from("Show")
      .select("id, title, description")
      .order("title", { ascending: true });

    if (error) throw error;
    shows = data ?? [];
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
