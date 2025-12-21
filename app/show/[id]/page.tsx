import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const { data: show } = await supabase
    .from("Show")
    .select("title, description")
    .eq("id", id)
    .single();

  if (!show) return { title: "Show · Rewind FM" };
  return { title: `${show.title} · Rewind FM`, description: show.description ?? undefined };
}

export default async function ShowDetailPage({ params }: Params) {
  const { id } = await params;

  const { data: raw, error } = await supabase
    .from("Show")
    .select(`
      id, title, description, imageUrl,
      OapOnShow (
        Oap (id, name, imageUrl)
      ),
      ScheduleSlot (dayOfWeek, startMin, endMin)
    `)
    .eq("id", id)
    .single();

  if (error || !raw) return notFound();

  const show = {
    id: String(raw.id),
    title: String(raw.title),
    description: raw.description ?? null,
    imageUrl: raw.imageUrl ?? null,
    oaps: ((raw.OapOnShow as any[]) ?? []).map((os: any) => ({
      id: String(os.Oap.id),
      name: String(os.Oap.name),
      imageUrl: os.Oap.imageUrl ?? null,
    })),
    schedule: ((raw.ScheduleSlot as any[]) ?? []).map((s: any) => ({
      dayOfWeek: s.dayOfWeek as number,
      startMin: s.startMin as number,
      endMin: s.endMin as number,
    })),
  };

  // Sort schedule by day then start time
  show.schedule.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startMin - b.startMin);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-10 bg-[#FFFEF1] bg-[url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')] bg-repeat text-black">
        {/* Breadcrumb/back */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-black hover:opacity-80">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            Back to Home
          </Link>
        </div>

        <article className="grid gap-10 lg:grid-cols-12">
          {/* Image */}
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
              {show.imageUrl ? (
                <Image
                  src={show.imageUrl}
                  alt={show.title || "Show image"}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full grid place-items-center bg-gradient-to-br from-orange-400 to-red-500 text-white/60 text-lg">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-7">
            <div className="mb-3 text-xs tracking-[0.12em] uppercase text-black">
              Rewind FM Show
            </div>
            <h1
              className="text-4xl md:text-5xl leading-tight text-black"
              style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
            >
              {show.title}
            </h1>

            {show.description && (
              <div className="prose prose-neutral max-w-none mt-6">
                <p className="whitespace-pre-line text-black text-lg">{show.description}</p>
              </div>
            )}

            {/* Schedule */}
            {show.schedule.length > 0 && (
              <div className="mt-8">
                <h2
                  className="text-xl mb-4 text-black"
                  style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
                >
                  Schedule
                </h2>
                <div className="space-y-2">
                  {show.schedule.map((slot, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white/50 border border-black/10 px-4 py-2"
                    >
                      <span className="font-semibold min-w-[100px]">{dayNames[slot.dayOfWeek]}</span>
                      <span className="text-black/70">
                        {formatTime(slot.startMin)} – {formatTime(slot.endMin)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OAPs/Hosts */}
            {show.oaps.length > 0 && (
              <div className="mt-8">
                <h2
                  className="text-xl mb-4 text-black"
                  style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
                >
                  Hosted By
                </h2>
                <div className="flex flex-wrap gap-4">
                  {show.oaps.map((oap) => (
                    <Link
                      key={oap.id}
                      href={`/oap/${oap.id}`}
                      className="flex items-center gap-3 bg-white/50 border border-black/10 px-4 py-3 hover:bg-white/80 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-black/5 border border-black/20">
                        {oap.imageUrl ? (
                          <Image
                            src={oap.imageUrl}
                            alt={oap.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-black/30 text-sm">
                            ?
                          </div>
                        )}
                      </div>
                      <span
                        className="font-semibold text-black"
                        style={{ fontFamily: "'Neue Plak', sans-serif" }}
                      >
                        {oap.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
