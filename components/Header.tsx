// components/Header.tsx
"use client";
import Link from "next/link";
import * as React from "react";

function HeaderSearch() {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    oaps: { id: string; name: string; imageUrl?: string | null }[];
    shows: { id: string; title: string; imageUrl?: string | null }[];
    posts: { id: string; title: string; image?: string | null }[];
  }>({ oaps: [], shows: [], posts: [] });

  const boxRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Debounced search
  React.useEffect(() => {
    const handle = setTimeout(async () => {
      const query = q.trim();
      if (query.length < 2) {
        setResults({ oaps: [], shows: [], posts: [] });
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          setResults({ oaps: [], shows: [], posts: [] });
          return;
        }
        const j = await res.json();
        setResults({
          oaps: Array.isArray(j?.oaps) ? j.oaps : [],
          shows: Array.isArray(j?.shows) ? j.shows : [],
          posts: Array.isArray(j?.posts) ? j.posts : [],
        });
        setOpen(true);
      } catch {
        setResults({ oaps: [], shows: [], posts: [] });
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  const total =
    (results.oaps?.length || 0) +
    (results.shows?.length || 0) +
    (results.posts?.length || 0);

  return (
    <div className="relative w-full" ref={boxRef}>
      <div className="flex items-center gap-2 bg-[#FCFBEA] px-4 h-12 leading-none">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-3.5-3.5" />
        </svg>
        <input
          type="text"
          placeholder="Search OAPs, Shows, Posts"
          className="flex-1 h-12 bg-transparent text-base text-black placeholder:text-black/50 focus:outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => total > 0 && setOpen(true)}
        />
        {loading && <span className="text-xs text-black/60">Searching…</span>}
      </div>

      {open && total > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%_-_1px)] z-20 border border-black bg-white shadow-sm">
          {/* OAPs */}
          {results.oaps.length > 0 && (
            <div className="p-2 border-b border-black/10">
              <div className="text-xs uppercase tracking-wide text-black/60 mb-1">OAPs</div>
              <ul className="max-h-[200px] overflow-auto">
                {results.oaps.map((o) => (
                  <li key={`oap-${o.id}`}>
                    <Link
                      href={`/oap/${o.id}`}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#FFF9E8]"
                      onClick={() => setOpen(false)}
                    >
                      <div className="h-6 w-6 bg-[#FDFDF1] border border-black/20 overflow-hidden">
                        {o.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={o.imageUrl} alt={o.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <span>{o.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Shows */}
          {results.shows.length > 0 && (
            <div className="p-2 border-b border-black/10">
              <div className="text-xs uppercase tracking-wide text-black/60 mb-1">Shows</div>
              <ul className="max-h-[200px] overflow-auto">
                {results.shows.map((s) => (
                  <li key={`show-${s.id}`}>
                    <Link
                      href={`/show/${s.id}`}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#FFF9E8]"
                      onClick={() => setOpen(false)}
                    >
                      <div className="h-6 w-6 bg-[#FDFDF1] border border-black/20 overflow-hidden">
                        {s.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.imageUrl} alt={s.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <span>{s.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Posts */}
          {results.posts.length > 0 && (
            <div className="p-2">
              <div className="text-xs uppercase tracking-wide text-black/60 mb-1">Posts</div>
              <ul className="max-h-[200px] overflow-auto">
                {results.posts.map((p) => (
                  <li key={`post-${p.id}`}>
                    <Link
                      href={`/blog/${p.id}`}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#FFF9E8]"
                      onClick={() => setOpen(false)}
                    >
                      <div className="h-6 w-6 bg-[#FDFDF1] border border-black/20 overflow-hidden">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <span>{p.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <header className="">
      <div className="grid grid-cols-4 grid-rows-[auto,auto] gap-0">
        {/* Logo block spans 2 rows */}
        <div className="row-span-2 flex flex-col items-center justify-center bg-[#008C99] px-6 py-6">
          <Link href="/" className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/rewind_fm_logo.svg"
              alt="Rewind FM Logo"
              className="h-16 w-auto"
            />
          </Link>
        </div>

        {/* Row 1: nav links */}
        <Link
          href="/blog"
          className="flex items-center justify-center h-12 bg-[#C6E9EE] hover:bg-[#FFFEF1] aria-[current=page]:bg-[#1092A4] transition-colors duration-200"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700, fontSize: "21px", color: "black" }}
        >
          Blogs
        </Link>
        <Link
          href="/oap"
          className="flex items-center justify-center h-12 bg-[#C6E9EE] hover:bg-[#FFFEF1] aria-[current=page]:bg-[#1092A4] transition-colors duration-200"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700, fontSize: "21px", color: "black" }}
        >
          OAPs
        </Link>
        <Link
          href="/about"
          className="flex items-center justify-center h-12 bg-[#C6E9EE] hover:bg-[#FFFEF1] aria-[current=page]:bg-[#1092A4] transition-colors duration-200"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700, fontSize: "21px", color: "black" }}
        >
          About
        </Link>

        {/* Row 2: Search (spans cols 2–4) */}
        <div className="col-span-3">
          <HeaderSearch />
        </div>
      </div>
    </header>
  );
}