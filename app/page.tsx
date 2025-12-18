import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ShowsSection from "@/components/ShowsSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

export default async function Home() {
  // Blog posts not implemented with Supabase yet - return empty
  const latestPosts: { id: string; title: string; excerpt: string; image: string }[] = [];

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
