"use client";
import Image from "next/image";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string; // public/media or /media/... url
  href?: string;
};

export default function BlogSection({
  posts = [],
  title = "Blog",
  headingClassName = "",
}: {
  posts?: BlogPost[];
  title?: string;
  headingClassName?: string;
}) {
  // If fewer than 3, we’ll render available and keep layout solid
  const items = posts.slice(0, 3);

  return (
    <section aria-labelledby="blog-heading" className="bg-white">
      {/* Header bar */}
      <div className="bg-[#F6A7C1] border-y border-black/20">
        <div className="mx-auto max-w-screen-2xl">
          <h2
            id="blog-heading"
            className={`text-center tracking-tight py-3 ${headingClassName}`}
            style={{
              fontFamily: "'Neue Power', sans-serif",
              fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)",
            }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, idx) => (
            <article
              key={p.id}
              className={[
                "flex flex-col",
                "border-black/20",
                // top border all, left border all, then vertical dividers
                "border-t",
                idx % 3 === 0 ? "lg:border-l" : "",
                idx % 2 === 0 ? "sm:border-l" : "",
              ].join(" ")}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={idx === 0}
                />
              </div>

              {/* Copy */}
              <div className="flex-1 px-6 py-6">
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "'Neue Plak', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.125rem, 1.8vw, 1.5rem)",
                  }}
                >
                  {p.title}
                </h3>
                <p className="text-sm text-black/70 leading-snug">
                  {p.excerpt}
                </p>
              </div>

              {/* Bottom border to complete card frame */}
              <div className="border-b border-black/20" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}