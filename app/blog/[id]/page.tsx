// app/blog/[id]/page.tsx



import Image from "next/image";
import { notFound } from "next/navigation";

import BackButton from "@/components/BackButton";

// Shared background for this page
const BG_STYLE: React.CSSProperties = {
  backgroundColor: "#FDFDF1",
  backgroundImage: "url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')",
  backgroundRepeat: "repeat",
  backgroundSize: "auto",
};

// TODO: replace with Prisma/CMS fetch
function getPostById(id: string) {
  const posts = [
    {
      id: "airwaves",
      title: "Airwaves",
      excerpt:
        "Discover why the classic hits from the '50s to the '80s never go out of style.",
      image: "/media/blog/airwaves.jpg",
      content: `<p>Airwaves dives into eras that defined radio — from Motown and Soul to Disco and Pop.</p>
                <p>We highlight stories behind the songs and the artists who shaped the sound.</p>`,
    },
    {
      id: "welcome",
      title: "Welcome to Rewind",
      excerpt:
        "Discover the latest vibes and features from Rewind Radio...",
      image: "/media/blog/welcome.jpg",
      content: `<p>Rewind FM brings premium nostalgia to your day, with curated shows and warm presenters.</p>`,
    },
    {
      id: "magic",
      title: "Magic",
      excerpt:
        "Explore how old‑school radio brings vintage vibes to your modern playlists.",
      image: "/media/blog/magic.jpg",
      content: `<p>From crate-digging classics to forgotten gems, Magic showcases the emotion of timeless music.</p>`,
    },
  ];
  return posts.find((p) => p.id === id) || null;
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  if (!post) return { title: "Post · Rewind FM" };
  return { title: `${post.title} · Rewind FM`, description: post.excerpt };
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  if (!post) notFound();



  return (
    <section
      aria-label="Blog detail"
      className="relative"
      style={BG_STYLE}
    >
      {/* Pink header bar (consistent with list) */}
      <div className="bg-[#F6A7C1] border-y border-black/20">
        <div className="mx-auto max-w-screen-2xl">
          <h1
            className="text-center py-3 font-bold"
            style={{ fontFamily: "'Neue Power', sans-serif", fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)" }}
          >
            Blog
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8 md:py-12">
      <BackButton label="Back to Blog" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
          {/* Left: Image */}
          <div className="relative w-full overflow-hidden border border-black/20 bg-black/5 aspect-[4/3] md:aspect-[4/3]">
            <Image
              src={post!.image}
              alt={post!.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right: Content */}
          <article className="min-h-full bg-white/80 border border-black/15 p-6 md:p-8">
            <h2
              className="mb-3"
              style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}
            >
              {post!.title}
            </h2>
            <p className="text-sm text-black/70 mb-4" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
              {post!.excerpt}
            </p>
            <div
              className="prose max-w-none prose-p:leading-7 prose-p:mb-4 prose-headings:font-bold"
              style={{ fontFamily: "'Neue Plak', sans-serif" }}
              dangerouslySetInnerHTML={{ __html: post!.content || "" }}
            />
          </article>
        </div>
      </div>
    </section>
  );
}