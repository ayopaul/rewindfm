import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ShowsSection from "@/components/ShowsSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

export default function Home() {
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
        posts={[
          {
            id: "airwaves",
            title: "Airwaves",
            excerpt: "Discover why the classic hits from the '50s to the '80s never go out of style.",
            image: "/media/blog/airwaves.jpg",
          },
          {
            id: "welcome",
            title: "Welcome to Rewind",
            excerpt: "Discover the latest vibes and features from Rewind Radio...",
            image: "/media/blog/welcome.jpg",
          },
          {
            id: "magic",
            title: "Magic",
            excerpt: "Explore how old-school radio brings vintage vibes to your modern playlists.",
            image: "/media/blog/magic.jpg",
          },
        ]}
        title="Blog"
        headingClassName="font-bold" // Neue Power Bold override
      />


      {/* ======= FOOTER ======= */}
      <Footer />
    </main>
  );
}