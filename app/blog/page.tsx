// app/blog/page.tsx
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import CategoryScroller from "@/components/CategoryScroller";

export const metadata = { title: "Blog · Rewind FM" };

// ---- CONFIG ----
const PAGE_SIZE = 9; // 3x3 grid per page
const CATEGORIES = ["All", "News", "Features", "Interviews", "Guides"] as const;
export type Category = typeof CATEGORIES[number];

// ---- TYPES ----
export type BlogPost = {
  id: string; // slug
  title: string;
  excerpt: string;
  image: string;
  category?: Category | string;
  publishedAt?: string;
};

// ---- DATA (replace with Prisma later) ----
function seed(): BlogPost[] {
  // Placeholder seed so the page renders before wiring to DB
  const base: BlogPost[] = [
    { id: "airwaves", title: "Airwaves", excerpt: "Discover why the classic hits from the '50s to the '80s never go out of style.", image: "/media/blog/airwaves.jpg", category: "Features", publishedAt: "2024-01-05" },
    { id: "welcome", title: "Welcome to Rewind", excerpt: "Discover the latest vibes and features from Rewind Radio...", image: "/media/blog/welcome.jpg", category: "News", publishedAt: "2024-01-01" },
    { id: "magic", title: "Magic", excerpt: "Explore how old‑school radio brings vintage vibes to your modern playlists.", image: "/media/blog/magic.jpg", category: "Guides", publishedAt: "2024-02-10" },
  ];
  // Duplicate a few to simulate growth
  return Array.from({ length: 18 }, (_, i) => ({
    ...base[i % base.length],
    id: `${base[i % base.length].id}-${i + 1}`,
    publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

async function fetchPosts(params: { page: number; category?: string | null }): Promise<{ posts: BlogPost[]; total: number }> {
  // TODO (DB):
  // const where = params.category && params.category !== 'All' ? { category: params.category } : {};
  // const total = await prisma.blogPost.count({ where });
  // const posts = await prisma.blogPost.findMany({
  //   where,
  //   orderBy: { publishedAt: 'desc' },
  //   take: PAGE_SIZE,
  //   skip: (params.page - 1) * PAGE_SIZE,
  //   select: { slug: true as any as 'id', title: true, excerpt: true, heroImageUrl: true as any as 'image', category: true, publishedAt: true },
  // });
  // return { posts, total };

  // Mocked local data path (keeps UI/logic identical)
  const all = seed();
  const filtered = params.category && params.category !== "All"
    ? all.filter(p => (p.category || "").toLowerCase() === params.category!.toLowerCase())
    : all;
  const total = filtered.length;
  const start = (params.page - 1) * PAGE_SIZE;
  const posts = filtered.slice(start, start + PAGE_SIZE);
  return { posts, total };
}

function pageFromSearch(searchParams: Record<string, string | string[] | undefined>): number {
  const raw = searchParams.page;
  const str = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(str || 1);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function catFromSearch(searchParams: Record<string, string | string[] | undefined>): string | null {
  const raw = searchParams.category;
  const str = Array.isArray(raw) ? raw[0] : raw;
  return str || null;
}

export default async function BlogListPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const page = pageFromSearch(searchParams);
  const category = catFromSearch(searchParams);
  const { posts, total } = await fetchPosts({ page, category });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section
      aria-labelledby="blog-heading"
      className=""
      style={{
        backgroundImage: "url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
          <Header />
      {/* Pink header bar */}
      <div className="sticky top-0 z-40 bg-[#FBB63B] border-y border-black/20">
        <div className="mx-auto max-w-screen-2xl">
          <h1
            id="blog-heading"
            className="text-center py-3 font-bold"
            style={{ fontFamily: "'Neue Power', sans-serif", fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)" }}
          >
            Blog
          </h1>
        </div>

        <CategoryScroller categories={CATEGORIES as unknown as string[]} active={category ?? "All"} page={page} />
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, idx) => (
            <article
              key={p.id}
              className={[
                "flex flex-col transition-colors",
                "border-black/20 border-t",
                idx % 3 === 0 ? "lg:border-l" : "",
                idx % 2 === 0 ? "sm:border-l" : "",
                "hover:bg-black/5",
              ].join(" ")}
            >
              <Link href={`/blog/${p.id}`} className="group focus:outline-none focus:ring-2 focus:ring-black/30">
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority={idx === 0}
                  />
                </div>

                {/* Copy */}
                <div className="flex-1 px-6 py-6">
                  <h2
                    className="mb-2"
                    style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800, fontSize: "clamp(1.125rem, 1.8vw, 1.5rem)" }}
                  >
                    {p.title}
                  </h2>
                  <p className="text-sm text-black/70 leading-snug" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
                    {p.excerpt}
                  </p>
                </div>

                {/* Bottom border to complete card frame */}
                <div className="border-b border-black/20" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8">
        <div className="flex items-center justify-between">
          {/* Prev */}
          <Link
            aria-disabled={page <= 1}
            href={`/blog?${new URLSearchParams({ ...(category && category !== "All" ? { category } : {}), page: String(Math.max(1, page - 1)) }).toString()}`}
            className={`px-4 py-2 rounded border ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-black/5"}`}
          >
            ← Previous
          </Link>

          <div className="text-sm text-black/70">Page {page} of {totalPages}</div>

          {/* Next */}
          <Link
            aria-disabled={page >= totalPages}
            href={`/blog?${new URLSearchParams({ ...(category && category !== "All" ? { category } : {}), page: String(Math.min(totalPages, page + 1)) }).toString()}`}
            className={`px-4 py-2 rounded border ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-black/5"}`}
          >
            Next →
          </Link>
        </div>
      </div>
    </section>
  );
}