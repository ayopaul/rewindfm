// app/oap/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata = { title: "OAPs · Rewind FM" };

async function getOaps() {
  try {
    const { data: oaps, error } = await supabase
      .from("Oap")
      .select("id, name, imageUrl")
      .order("name", { ascending: true });

    if (error) throw error;
    return oaps ?? [];
  } catch {
    // Fallback sample if DB not ready
    return [
      { id: "sam-ade", name: "Sam Ade", imageUrl: null },
      { id: "nkechi-ola", name: "Nkechi Ola", imageUrl: null },
      { id: "tunde-bello", name: "Tunde Bello", imageUrl: null },
      { id: "lola-james", name: "Lola James", imageUrl: null },
    ];
  }
}

export default async function OapsPage() {
  const oaps = await getOaps();

  return (
    <>
      <Header />

      {/* Sticky heading bar (same style as Blog/About) */}
      <div className="sticky top-0 z-40 bg-[#FBB63B] border-y border-black/20">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-6 flex items-center justify-center">
          <h1
            className="font-extrabold text-2xl sm:text-3xl md:text-4xl text-black"
            style={{ fontFamily: "'Neue Power', sans-serif" }}
          >
            OAPs
          </h1>
        </div>
      </div>

      {/* Grid */}
      <section className="mx-auto max-w-screen-2xl px-4 md:px-6 py-10 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {oaps.map((oap) => (
            <article
              key={oap.id}
              className="group rounded-md border border-black/15 bg-white/90 p-4 sm:p-5 hover:bg-black/[0.03] transition-colors relative cursor-pointer"
            >
              <Link
                href={`/oap/${oap.id}`}
                aria-label={`View ${oap.name}`}
                className="absolute inset-0 z-10"
              />
              <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full border border-black/20 bg-black/5">
                {oap.imageUrl ? (
                  <Image
                    src={oap.imageUrl}
                    alt={oap.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-black/30 text-3xl">
                    ?
                  </div>
                )}
              </div>
              <h2
                className="mt-4 text-center text-black"
                style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800, fontSize: "clamp(1rem, 2.2vw, 1.25rem)" }}
              >
                {oap.name}
              </h2>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
