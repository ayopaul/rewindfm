import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ShowsSection from "@/components/ShowsSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";

export default async function Home() {
  // Fetch latest 3 blog posts from DB (supports either `blogPost` or `post` model)
  const model: any = (prisma as any).blogPost ?? (prisma as any).post;
  const latestPosts: { id: string; title: string; excerpt: string; image: string }[] = model
    ? (
        await model.findMany({
          orderBy: { publishedAt: "desc" },
          take: 3,
          // Select broadly; we’ll map to BlogSection’s props
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            summary: true,
            imageUrl: true,
            heroImageUrl: true,
            image: true,
          },
        })
      ).map((r: any) => ({
        id: String(r.slug ?? r.id),
        title: r.title ?? "Untitled",
        excerpt: r.excerpt ?? r.summary ?? "",
        image: r.imageUrl ?? r.heroImageUrl ?? r.image ?? "/media/blog/placeholder.jpg",
      }))
    : [];

  return (
    <main className="min-h-dvh bg-[#0D0D0D] text-[#0E0E0E]">
      {/* ======= NAVBAR ======= */}
      <Header />

      {/* ======= HERO ======= */}
      <Hero />

      {/* ======= MONDAY DIVIDER ======= */}
      <ShowsSection />

      {/* ======= BLOG ======= */}
      <BlogSection
        posts={latestPosts}
        title="Blog"
        headingClassName="font-bold" // Neue Power Bold override
      />


      {/* ======= FOOTER ======= */}
      <Footer />
    </main>
  );
}