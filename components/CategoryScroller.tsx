

// components/CategoryScroller.tsx
"use client";

import Link from "next/link";
import * as React from "react";

type Props = {
  categories: readonly string[];
  active: string;
  page: number;
};

/**
 * Horizontal category scroller with arrows.
 * - Touch/trackpad horizontal scroll works (overflow-x-auto).
 * - Arrows scroll the container by 80% of its width.
 * - No rounded corners per design.
 * - Neue Power Ultra, 23px.
 */
export default function CategoryScroller({ categories, active, page }: Props) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.8) * (dir === "left" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const baseParams = (cat: string) => {
    const p = new URLSearchParams();
    if (cat !== "All") p.set("category", cat);
    p.set("page", "1"); // reset to first page when changing category
    return p.toString();
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-3 bg-[#FBB63B]">
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button
          type="button"
          onClick={() => scrollBy("left")}
          className="select-none px-4 py-3 border focus:outline-none focus:ring-0 hover:bg-black/5"
          aria-label="Scroll categories left"
        >
          ←
        </button>

        {/* Scrollable categories */}
        <div
          ref={scrollerRef}
          className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Hide webkit scrollbar */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
              height: 0;
              width: 0;
            }
          `}</style>
          {categories.map((c) => {
            const isActive = (active ?? "All").toLowerCase() === c.toLowerCase();
            return (
              <Link
                key={c}
                href={`/blog?${baseParams(c)}`}
                className={`px-3 py-1.5 border whitespace-nowrap snap-start transition-colors focus:outline-none focus:ring-0 ${
                  isActive
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black"
                }`}
                style={{
                  fontFamily: "'Neue Power', sans-serif",
                  fontWeight: 900,
                  fontSize: "23px",
                  borderRadius: 0, // no rounded corners
                }}
              >
                {c}
              </Link>
            );
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => scrollBy("right")}
          className="select-none px-4 py-3 border focus:outline-none focus:ring-0 hover:bg-black/5"
          aria-label="Scroll categories right"
        >
          →
        </button>
      </div>
    </div>
  );
}