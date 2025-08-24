

// app/oap/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";

export const metadata = { title: "OAPs · Rewind FM" };

const prisma = new PrismaClient();

async function getOaps() {
  // Keep selection minimal to avoid schema mismatch errors
  try {
    const oaps = await prisma.oap.findMany({
      orderBy: { name: "asc" as const },
      select: { id: true, name: true },
    });
    return oaps;
  } catch {
    // Fallback sample if DB not ready
    return [
      { id: "sam-ade", name: "Sam Ade" },
      { id: "nkechi-ola", name: "Nkechi Ola" },
      { id: "tunde-bello", name: "Tunde Bello" },
      { id: "lola-james", name: "Lola James" },
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
              className="group rounded-md border border-black/15 bg-white/90 p-4 sm:p-5 hover:bg-black/[0.03] transition-colors"
            >
              <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full border border-black/20 bg-black/5">
                <Image
                  src={`/media/oaps/${oap.id}.jpg`}
                  alt={oap.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <h2
                className="mt-4 text-center"
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