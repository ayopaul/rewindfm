// app/about/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us · Rewind FM",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main
        className="relative min-h-[100svh] bg-[#F8F6F2] text-black"
        style={{
          backgroundImage: "url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      >
        {/* ======= NAVBAR ======= */}
        
        <div className="sticky top-0 z-40 bg-[#FBB63B] border-y border-black/20">
          <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-6 flex items-center justify-center">
            <h1
              id="about-heading"
              className="font-neue-power font-extrabold text-2xl sm:text-3xl md:text-4xl text-black"
            >
              About
            </h1>
          </div>
        </div>

        {/* Content column (with left gutter when rail is visible) */}
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          {/* Top spacer to keep below header if you have a sticky header */}
          <div className="h-6 sm:h-8" />

          {/* Section – preheading rule + label */}
          <section className="py-10 sm:py-16">
            <div className="mb-6 sm:mb-8">
              <div className="font-neue-plak text-[12px] tracking-[0.2em] text-[#F04C23] uppercase">
                About Rewind FM
              </div>
              <div className="mt-2 h-[2px] w-28 bg-[#F04C23]" />
            </div>

            <h1
              className="
                font-neue-power font-black
                text-[36px] leading-tight
                sm:text-[44px]
              "
            >
              Premium Nostalgia. Timeless Music.
            </h1>

            <div
              className="
                mt-6 max-w-4xl
                font-neue-plak text-[20px] leading-[1.75]
                sm:text-[22px]
              "
            >
              <p className="mb-6">
                Rewind FM is where timeless music lives again. We curate premium nostalgia through the golden eras of R&B, Soul, Funk, Classic Afrobeat, Highlife, Smooth Jazz, and Pop classics. Our station celebrates the soundtrack of your best memories, blending iconic hits with rare gems that shaped generations.
              </p>
              <p>
                From weekday drives to weekend reflections, our shows are designed to bring heritage, storytelling, and music together in one elegant broadcast experience.
              </p>
            </div>

            {/* Decorative bottom rule */}
            <div className="mt-10 h-[2px] bg-[#F04C23]/70" />
          </section>

          {/* Example "cards" row – swap with your content */}
          <section className="pb-24">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { title: "Weekday Lineup", desc: "From Morning Classics to Evening Grooves, our shows bring rhythm to every part of your day." },
                { title: "Weekend Specials", desc: "Retro Revival, Afrobeat Hour, and Sunday Reflections — curated for leisure and connection." },
                { title: "Our Presenters", desc: "Warm voices, deep music knowledge, and authentic storytelling that feel like long-lost friends." },
                { title: "Music Policy", desc: "80% premium oldies, 20% rare gems — quality, emotion-rich tracks from the 70s, 80s, and 90s." }
              ].map((item) => (
                <li
                  key={item.title}
                  className="rounded-md border border-black/15 bg-white/70 p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
                >
                  <h3 className="font-neue-plak font-extrabold text-[20px] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[15px] leading-7 text-black/80 font-neue-plak">
                    {item.desc}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

      </main>
      <Footer />
    </>
  );
}