// app/search/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const qStr = (q || "").trim();

  if (qStr.length < 2) {
    return (
      <div
        className="min-h-screen text-black"
        style={{
          backgroundColor: "#FFFEF1",
          backgroundImage:
            "url(/media/5df82e05767bad4244dc8b5c_expanded-texture.gif)",
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="sticky top-0 z-10 border-b border-black bg-[#FBB63B] p-4">
          <h1 className="text-xl md:text-2xl font-bold">Search</h1>
        </div>
        <main className="mx-auto max-w-4xl px-4 py-6">
          <p className="text-black/70">Please enter at least 2 characters.</p>
        </main>
      </div>
    );
  }

  const [oapsResult, showsResult] = await Promise.all([
    supabase
      .from("Oap")
      .select("id, name, imageUrl")
      .ilike("name", `%${qStr}%`)
      .limit(20),
    supabase
      .from("Show")
      .select("id, title, imageUrl")
      .or(`title.ilike.%${qStr}%,description.ilike.%${qStr}%`)
      .limit(20),
  ]);

  const oaps = oapsResult.data ?? [];
  const shows = showsResult.data ?? [];
  const posts: unknown[] = []; // Blog posts not implemented yet

  return (
    <div
      className="min-h-screen text-black"
      style={{
        backgroundColor: "#FFFEF1",
        backgroundImage:
          "url(/media/5df82e05767bad4244dc8b5c_expanded-texture.gif)",
        backgroundSize: "600px",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="sticky top-0 z-10 border-b border-black bg-[#FBB63B] p-4">
        <h1 className="text-xl md:text-2xl font-bold">
          Search results for &quot;{qStr}&quot;
        </h1>
      </div>
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {oaps.length > 0 && (
          <section>
            <h2 className="font-bold mb-2">OAPs ({oaps.length})</h2>
            <ul className="space-y-1">
              {oaps.map((o: { id: string; name: string; imageUrl: string | null }) => (
                <li key={o.id}>
                  <Link href={`/oap/${o.id}`} className="underline">
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {shows.length > 0 && (
          <section>
            <h2 className="font-bold mb-2">Shows ({shows.length})</h2>
            <ul className="space-y-1">
              {shows.map((s: { id: string; title: string; imageUrl: string | null }) => (
                <li key={s.id}>
                  <Link href={`/show/${s.id}`} className="underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {posts && posts.length > 0 && (
          <section>
            <h2 className="font-bold mb-2">Posts ({posts.length})</h2>
            <ul className="space-y-1">
              {posts.map((p: unknown) => {
                const post = p as { id: string; title: string };
                return (
                  <li key={post.id}>
                    <Link href={`/blog/${post.id}`} className="underline">
                      {post.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {oaps.length === 0 &&
          shows.length === 0 &&
          (!posts || posts.length === 0) && (
            <p className="text-black/70">No results found.</p>
          )}
      </main>
    </div>
  );
}
