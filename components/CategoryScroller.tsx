"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  categories?: readonly string[];
  active?: string;
};

export default function CategoryScroller({ categories, active = "All" }: Props) {
  const [cats, setCats] = React.useState<string[] | null>(null);
  const pathname = usePathname(); // should be "/blog"
  const searchParams = useSearchParams();

  // If parent didn't pass categories, fetch them from the API
  React.useEffect(() => {
    if (categories && categories.length) return;
    (async () => {
      try {
        const res = await fetch("/api/blog/categories", { cache: "no-store" });
        const j = await res.json();
        const list: string[] = Array.isArray(j?.categories)
          ? (j.categories as string[])
          : Array.isArray(j) ? (j as string[]) : ["All"];
        // ensure “All” is first
        const uniq = Array.from(new Map(list.map(c => [c.toLowerCase(), c])).values());
        const withAll = uniq[0]?.toLowerCase() === "all" ? uniq : ["All", ...uniq.filter(c => c.toLowerCase() !== "all")];
        setCats(withAll);
      } catch {
        setCats(["All"]);
      }
    })();
  }, [categories]);

  const list = (categories && categories.length ? categories : cats) ?? ["All"];

  // Build href preserving other params but forcing page=1 and category=<cat>
  const hrefFor = (cat: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("category", cat);
    const base = pathname || "/blog";
    return `${base}?${sp.toString()}`;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {list.map((cat) => {
          const isActive = (active || "All").toLowerCase() === cat.toLowerCase();
          return (
            <Link
              key={cat}
              href={hrefFor(cat)}
              className={[
                "px-3 py-2 border border-black",
                isActive ? "bg-black text-white" : "bg-white text-black hover:bg-[#FFF9E8]"
              ].join(" ")}
            >
              {cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}