import Link from "next/link";
import prisma from "@/lib/prisma";
// IMPORTANT: ensure CategoryScroller is imported
import CategoryScroller from "@/components/CategoryScroller";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


export const dynamic = "force-dynamic";

const PAGE_SIZE = 9; // keep whatever you use

type BlogPost = { id: string; title: string; excerpt?: string; image: string; category?: string; publishedAt?: string };

// DB-backed fetch that accepts category
async function fetchPosts(params: { page: number; category?: string | null }): Promise<{ posts: BlogPost[]; total: number }> {
  const page = Math.max(1, params.page || 1);
  const take = PAGE_SIZE;
  const skip = (page - 1) * take;

  // If “All” or empty, don’t filter
  const where: any =
    params.category && params.category !== "All"
      ? { category: params.category }
      : {};

  const model: any = (prisma as any).blogPost ?? (prisma as any).post;
  if (!model) return { posts: [], total: 0 };

  const total: number = await model.count({ where });

  const rows: any[] = await model.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take,
    skip,
  });

  const posts: BlogPost[] = rows.map((r: any) => ({
    id: String(r.slug ?? r.id),
    title: r.title ?? "Untitled",
    excerpt: r.excerpt ?? r.summary ?? "",
    image: r.imageUrl ?? r.heroImageUrl ?? r.image ?? "/media/blog/placeholder.jpg",
    category: r.category ?? undefined,
    publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : undefined,
  }));

  return { posts, total };
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const { page: pageParam, category } = await searchParams;
  const page = Math.max(1, Number(pageParam || 1));
  const activeCategory = (category || "All").trim();

  const { posts, total } = await fetchPosts({ page, category: activeCategory });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Build helpers that preserve category in pagination links
  const linkForPage = (p: number) =>
    `/blog?${new URLSearchParams({
      page: String(p),
      category: activeCategory || "All",
    }).toString()}`;

  return (
    <div
      className="min-h-screen text-black"
      style={{
        backgroundColor: "#FFFEF1",
        backgroundImage: "url(/media/5df82e05767bad4244dc8b5c_expanded-texture.gif)",
        backgroundSize: "600px",
        backgroundRepeat: "repeat",
      }}
    >
      <Header />
      
      <div className="sticky top-0 z-10 border-b border-black bg-[#FBB63B]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="py-3 flex items-center justify-center">
            <h1 className="font-neue-power font-extrabold text-[23px] md:text-3xl leading-none text-center">Blog</h1>
          </div>
          {/* Categories live in the same box as heading */}
          <div className="pb-3">
            {/* Pass active category; CategoryScroller builds links to /blog?category=... */}
            <CategoryScroller active={activeCategory} />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Your grid of posts (unchanged except now data is from DB) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p: BlogPost) => (
            <article key={p.id} className="border border-black bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.title} className="w-full h-44 object-cover border-b border-black" />
              <div className="p-4">
                <h3 className="font-bold mb-2" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
                  <Link href={`/blog/${p.id}`} className="underline">
                    {p.title}
                  </Link>
                </h3>
                {p.excerpt ? <p className="text-sm text-black/70">{p.excerpt}</p> : null}
              </div>
            </article>
          ))}
          {posts.length === 0 && (
            <p className="text-black/70">No posts in this category yet.</p>
          )}
        </div>

        {/* Pagination that preserves category */}
        {pageCount > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href={linkForPage(Math.max(1, page - 1))}
              className="px-3 py-1 border border-black bg-white disabled:opacity-50"
              aria-disabled={page <= 1}
            >
              Prev
            </Link>
            <span className="text-sm">
              Page {page} of {pageCount}
            </span>
            <Link
              href={linkForPage(Math.min(pageCount, page + 1))}
              className="px-3 py-1 border border-black bg-white disabled:opacity-50"
              aria-disabled={page >= pageCount}
            >
              Next
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
