// app/show/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata = { title: "Shows · Rewind FM" };

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

async function getShows() {
  try {
    const { data: raw, error } = await supabase
      .from("Show")
      .select(`
        id, title, description, imageUrl,
        ScheduleSlot (dayOfWeek, startMin, endMin)
      `)
      .order("title", { ascending: true });

    if (error) throw error;

    return (raw ?? []).map((show) => {
      const schedule = ((show.ScheduleSlot as unknown as { dayOfWeek: number; startMin: number; endMin: number }[]) ?? [])
        .slice()
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startMin - b.startMin);
      return {
        id: String(show.id),
        title: String(show.title),
        description: show.description ?? null,
        imageUrl: show.imageUrl ?? null,
        schedule,
      };
    });
  } catch {
    // Fallback sample if DB not ready
    return [
      { id: "breakfast-show", title: "Breakfast Show", description: null, imageUrl: null, schedule: [] },
      { id: "drive-time", title: "Drive Time", description: null, imageUrl: null, schedule: [] },
    ];
  }
}

export default async function ShowsPage() {
  const shows = await getShows();

  return (
    <>
      <Header />

      {/* Sticky heading bar (same style as Blog/OAPs/About) */}
      <div className="sticky top-0 z-40 bg-[#FBB63B] border-y border-black/20">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-6 flex items-center justify-center">
          <h1
            className="font-extrabold text-2xl sm:text-3xl md:text-4xl text-black"
            style={{ fontFamily: "'Neue Power', sans-serif" }}
          >
            Shows
          </h1>
        </div>
      </div>

      {/* Grid */}
      <section className="mx-auto max-w-screen-2xl px-4 md:px-6 py-10 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {shows.map((show) => {
            const nextSlot = show.schedule[0];
            return (
              <article
                key={show.id}
                className="group rounded-md border border-black/15 bg-white/90 overflow-hidden hover:bg-black/[0.03] transition-colors relative cursor-pointer"
              >
                <Link
                  href={`/show/${show.id}`}
                  aria-label={`View ${show.title}`}
                  className="absolute inset-0 z-10"
                />
                <div className="relative aspect-[4/3] w-full bg-black/5">
                  {show.imageUrl ? (
                    <Image
                      src={show.imageUrl}
                      alt={show.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-black/30 text-3xl">
                      ?
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <h2
                    className="text-black"
                    style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800, fontSize: "clamp(1rem, 2.2vw, 1.25rem)" }}
                  >
                    {show.title}
                  </h2>
                  {nextSlot && (
                    <p className="mt-2 text-sm text-black/60">
                      {dayNames[nextSlot.dayOfWeek]} {formatTime(nextSlot.startMin)} – {formatTime(nextSlot.endMin)}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </>
  );
}
