"use client";

import Image from "next/image";
import React from "react";

type Oap = { id: string; name: string; avatarUrl?: string };
type Show = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string; // dynamic from /media/...
  startMin: number; // minutes from 00:00
  endMin: number; // minutes from 00:00
  oaps: Oap[];
};
type Day = {
  key: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  label: string;
  shows: Show[];
};
type Lineup = {
  weekday: { dayLabel: string; days: Day[] };
  weekend: { dayLabel: string; days: Day[] };
};

function currentDayKey(): Day["key"] {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()] as any;
}

function prettyDayLabel(label: string, key?: Day["key"]) {
  const map: Record<string, string> = {
    sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday",
    thu: "Thursday", fri: "Friday", sat: "Saturday",
  };
  if (key && map[key]) return map[key];
  const cleaned = label.replace(/_/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const railColors = {
  weekday: "#FF6600", // reference orange
  weekend: "#F8D11D", // reference yellow
};

export default function ShowsSection() {
  const [data, setData] = React.useState<Lineup | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch lineup (admin‑managed). Fallback to sample if API not ready.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/lineup", { next: { revalidate: 30 } });
        if (!res.ok) throw new Error("no lineup api");
        const json = await res.json();
        if (!cancelled) setData(json as Lineup);
      } catch {
        if (!cancelled) setData(sampleLineup);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) return null;

  return (
    <section className="bg-[#FFFEF1] text-black relative overflow-hidden">
      {/* WEEKDAY RAIL (Mon–Fri) */}
      <DayRail
        sideLabel="Weekday Lineup"
        sideColor={railColors.weekday}
        days={data.weekday.days}
        validKeys={["mon", "tue", "wed", "thu", "fri"]}
        isFirst={true}
      />

      {/* WEEKEND RAIL (Sat–Sun) */}
      <DayRail
        sideLabel="Weekend Lineup"
        sideColor={railColors.weekend}
        days={data.weekend.days}
        validKeys={["sat", "sun"]}
        isFirst={false}
      />
    </section>
  );
}

/* ---------- Subcomponents ---------- */

type DayRailProps = {
  sideLabel: string;
  sideColor: string;
  days: Day[];
  /** Restrict which days appear in this rail (order preserved) */
  validKeys: Day["key"][];
  /** Whether this is the first rail (for decorative circle positioning) */
  isFirst: boolean;
};

function DayRail({ sideLabel, sideColor, days, validKeys, isFirst }: DayRailProps) {
  // Filter and keep order based on validKeys
  const filteredDays = React.useMemo(
    () => validKeys.map(k => days.find(d => d.key === k)).filter(Boolean) as Day[],
    [days, validKeys]
  );

  // Initial selected day: current day if it exists in this rail, otherwise first
  const currentKey = currentDayKey();
  const initialIndex = Math.max(0, filteredDays.findIndex(d => d.key === currentKey));
  const [index, setIndex] = React.useState(initialIndex === -1 ? 0 : initialIndex);

  React.useEffect(() => {
    // If API changes the days set (hot reload), re-evaluate index
    const ix = filteredDays.findIndex(d => d.key === currentKey);
    setIndex(ix >= 0 ? ix : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredDays.length]);

  const selected = filteredDays[index];
  const canPrev = index > 0;
  const canNext = index < filteredDays.length - 1;

  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  function prevDay() {
    if (!canPrev) return;
    setIndex(i => Math.max(0, i - 1));
    // scroll back to start
    queueMicrotask(() => scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" }));
  }
  function nextDay() {
    if (!canNext) return;
    setIndex(i => Math.min(filteredDays.length - 1, i + 1));
    queueMicrotask(() => scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" }));
  }

  return (
    <div className="w-full relative">
      <div className="grid grid-cols-1 md:grid-cols-[140px,1fr] grid-rows-[auto,auto,1fr] md:grid-rows-[auto,1fr] items-stretch relative z-20">
        {/* Left rail block (horizontal banner on mobile, vertical stripe on desktop) */}
        <div
          className="row-start-1 md:row-start-2 col-span-1 md:col-start-1 h-14 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-black/10 z-0 flex items-center justify-center px-4"
          style={{ backgroundColor: sideColor }}
        >
          {/* Mobile: horizontal label */}
          <span
            className="md:hidden text-white font-black select-none"
            style={{ fontFamily: "'Neue Plak', sans-serif", fontSize: "20px", letterSpacing: "0.5px" }}
          >
            {sideLabel}
          </span>
          {/* Desktop: vertical label */}
          <span
            className="hidden md:inline-block text-white font-black leading-none select-none tracking-wide"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
              fontSize: "clamp(20px, 3.0vw, 36px)",
              letterSpacing: "0.5px",
            }}
          >
            {sideLabel}
          </span>
        </div>

        {/* Header (spans correctly on mobile and desktop) */}
        <div className="col-span-1 md:col-span-2 row-start-2 md:row-auto px-4 md:px-8 pt-4 md:pt-7 pb-1 bg-white border-b-[3px] border-black/10">
          <div className="relative flex items-center justify-center min-h-[50px]">
            {/* Left arrow */}
            <button
              onClick={prevDay}
              disabled={!canPrev}
              aria-label="Previous day"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[28%] sm:w-[36%] lg:w-[44%] h-[8px] flex items-center text-black/40 hover:text-black disabled:opacity-20 transition-colors"
            >
              <svg viewBox="0 0 100 8" fill="none" className="w-full h-[8px]">
                <line x1="100" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" />
                <polyline points="18,0 6,4 18,8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {/* Center day label */}
            <h2
              className="text-[42px] md:text-[52px] font-black text-black select-none tracking-tight"
              style={{ fontFamily: "'Neue Plak', sans-serif" }}
            >
              {prettyDayLabel(selected?.label ?? "", selected?.key)}
            </h2>

            {/* Right arrow */}
            <button
              onClick={nextDay}
              disabled={!canNext}
              aria-label="Next day"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[28%] sm:w-[36%] lg:w-[44%] h-[8px] flex items-center justify-end text-black/40 hover:text-black disabled:opacity-20 transition-colors"
            >
              <svg viewBox="0 0 100 8" fill="none" className="w-full h-[8px]">
                <line x1="0" y1="4" x2="88" y2="4" stroke="currentColor" strokeWidth="1.5" />
                <polyline points="82,0 94,4 82,8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Shows content (content row, right column) */}
        <div className="row-start-3 md:row-start-2 col-span-1 md:col-start-2 relative z-10 flex flex-col bg-white">
          <div className="px-8 py-6">
            <div
              ref={scrollerRef}
              className="grid grid-cols-2 gap-0 divide-x divide-black/20 md:grid-cols-none md:flex md:items-stretch md:gap-0 md:divide-x md:overflow-x-auto md:snap-x md:snap-mandatory scrollbar-none"
            >
              {selected?.shows?.map((show, idx) => (
                <div
                  key={show.id}
                  className={
                    (idx === 0
                      ? "md:pr-6 "
                      : idx === (selected.shows?.length || 0) - 1
                      ? "md:pl-6 "
                      : "md:px-6 ") +
                    "p-4 h-full flex md:snap-start md:shrink-0 md:basis-1/3 md:min-w-[33.333%]"
                  }
                >
                  <ShowCard show={show} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom border */}
          <div className="px-8 pb-0">
            <div className="h-[3px] w-full bg-black/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowCard({ show }: { show: Show }) {
  return (
    <article className="h-full min-h-[480px] flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-black/5 mb-4">
        {show.imageUrl ? (
          <Image
            src={show.imageUrl}
            alt={show.title}
            fill
            sizes="(max-width: 1024px) 45vw, 30vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col space-y-3">
        {/* Title */}
        <h3
          className="text-[24px] font-bold leading-tight text-black tracking-tight"
          style={{ fontFamily: "'Neue Plak', sans-serif" }}
        >
          {show.title}
        </h3>

        {/* Description */}
        {show.description ? (
          <p
            className="text-sm text-black/70 line-clamp-3 leading-relaxed"
            style={{ fontFamily: "'Neue Plak', sans-serif" }}
          >
            {show.description}
          </p>
        ) : null}

        {/* OAP badges */}
        {show.oaps?.length ? (
          <div className="mt-auto pt-4">
            <div className="flex flex-wrap gap-2">
              {show.oaps.map((oap) => (
                <div
                  key={oap.id}
                  className="flex items-center gap-2 bg-black/10 px-3 py-1.5 text-xs font-semibold text-black"
                  style={{ fontFamily: "'Neue Plak', sans-serif" }}
                >
                  {oap.avatarUrl ? (
                    <Image
                      src={oap.avatarUrl}
                      alt={oap.name}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="w-4 h-4 bg-black/30 rounded-sm" />
                  )}
                  <span>{oap.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ---------- Fallback sample (until your API is live) ---------- */

const sampleLineup: Lineup = {
  weekday: {
    dayLabel: "Weekday",
    days: [
      { key: "mon", label: "Monday", shows: sampleShows("m") },
      { key: "tue", label: "Tuesday", shows: sampleShows("t") },
      { key: "wed", label: "Wednesday", shows: sampleShows("w") },
      { key: "thu", label: "Thursday", shows: sampleShows("th") },
      { key: "fri", label: "Friday", shows: sampleShows("f") },
    ],
  },
  weekend: {
    dayLabel: "Weekend",
    days: [
      { key: "sat", label: "Saturday", shows: sampleShows("s") },
      { key: "sun", label: "Sunday", shows: sampleShows("su") },
    ],
  },
};

function sampleShows(prefix: string): Show[] {
  return [
    {
      id: `${prefix}1`,
      title: "Morning Drive",
      description:
        "The Morning Mic. A gentle, nostalgic wake‑up with soothing hits from the 70s to 90s.",
      imageUrl: "/images/sample/morning.jpg",
      startMin: 6 * 60,
      endMin: 10 * 60,
      oaps: [{ id: "o1", name: "OAP Name" }],
    },
    {
      id: `${prefix}2`,
      title: "Mid‑Morning",
      description: "The Golden Hour. Deep dives into artists, albums, and stories with commentary and storytelling.",
      imageUrl: "/images/sample/mid.jpg",
      startMin: 10 * 60,
      endMin: 14 * 60,
      oaps: [{ id: "o2", name: "OAP Name" }],
    },
    {
      id: `${prefix}3`,
      title: "Afternoon Drive",
      description: "The Soundtrack of Life. Upbeat throwbacks and timeless tunes to energize your afternoon reflections.",
      imageUrl: "/images/sample/afternoon.jpg",
      startMin: 14 * 60,
      endMin: 18 * 60,
      oaps: [{ id: "o3", name: "OAP Name" }],
    },
  ];
}