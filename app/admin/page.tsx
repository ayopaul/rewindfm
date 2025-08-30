// app/admin/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";

type Summary = { oaps: number; shows: number; schedule: number; posts: number };

export default function AdminDashboard() {
  const [summary, setSummary] = React.useState<Summary>({
    oaps: 0,
    shows: 0,
    schedule: 0,
    posts: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/summary", { cache: "no-store" });
        let data: Partial<Summary> | null = null;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error(
            "/api/admin/summary non-JSON response",
            res.status,
            text.slice(0, 200)
          );
        }
        if (!alive) return;
        if (res.ok && data && typeof data === "object") {
          setSummary({
            oaps: Number(data.oaps ?? 0),
            shows: Number(data.shows ?? 0),
            schedule: Number(data.schedule ?? 0),
            posts: Number(data.posts ?? 0),
          });
        } else {
          setSummary({ oaps: 0, shows: 0, schedule: 0, posts: 0 });
        }
      } catch (e) {
        console.error("/api/admin/summary fetch error", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div
      className="min-h-screen text-black"
      style={{
        backgroundColor: "#FFFEF1",
        backgroundImage:
          "url(/media/5df82e05767bad4244dc8b5c_expanded-texture.gif)",
        backgroundSize: "600px",
        backgroundRepeat: "repeat",
      }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-black bg-[#FBB63B]">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1
            className="text-xl md:text-2xl font-bold"
            style={{ fontFamily: "'Neue Plak', sans-serif" }}
          >
            Admin · Dashboard
          </h1>
          <div className="flex gap-2">
            <Link
              href="/admin/schedule"
              className="border border-black px-3 py-1.5 bg-[#FDFDF1] font-bold"
              style={{ fontFamily: "'Neue Plak', sans-serif" }}
            >
              Manage Schedule
            </Link>
            <Link
              href="/admin/settings"
              className="border border-black px-3 py-1.5 bg-[#FDFDF1] font-bold"
              style={{ fontFamily: "'Neue Plak', sans-serif" }}
            >
              Stream Settings
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-2">
        {/* Quick Stats */}
        <section className="border border-black bg-white/95 p-5">
          <h2
            className="text-lg mb-3 font-bold"
            style={{ fontFamily: "'Neue Plak', sans-serif" }}
          >
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "OAPs", value: summary.oaps, href: "/admin/oaps" },
              { label: "Shows", value: summary.shows, href: "/admin/shows" },
              {
                label: "Schedule",
                value: summary.schedule,
                href: "/admin/schedule",
              },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="group border border-black/10 bg-[#FDFDF1] p-4"
              >
                <div
                  className="text-3xl mb-1 group-hover:translate-y-[-1px] transition"
                  style={{
                    fontFamily: "'Neue Power', 'Neue Plak', sans-serif",
                    fontWeight: 800,
                  }}
                >
                  {loading ? "…" : s.value}
                </div>
                <div
                  className="text-sm"
                  style={{ fontFamily: "'Neue Plak', sans-serif" }}
                >
                  {s.label}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="border border-black bg-white/95 p-5">
          <h2
            className="text-lg mb-3 font-bold"
            style={{ fontFamily: "'Neue Plak', sans-serif" }}
          >
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={{ pathname: "/admin/oaps", query: { new: "1" } }}
              className="border border-black px-4 py-2 bg-[#FFF9E8] font-bold"
              style={{ fontFamily: "'Neue Plak', sans-serif" }}
            >
              Add OAP
            </Link>
            <Link
              href={{ pathname: "/admin/shows", query: { new: "1" } }}
              className="border border-black px-4 py-2 bg-[#FFF9E8] font-bold"
              style={{ fontFamily: "'Neue Plak', sans-serif" }}
            >
              Add Show
            </Link>
          </div>
        </section>

        {/* Recent Activity placeholder */}
        <section className="md:col-span-2 border border-black bg-white/95 p-5">
          <h2
            className="text-lg mb-3 font-bold"
            style={{ fontFamily: "'Neue Plak', sans-serif" }}
          >
            Recent Activity
          </h2>
          <p className="text-black/70">
            (Coming soon) Edits to OAPs, Shows and Schedule will appear here.
          </p>
        </section>

        {/* Logout */}
        <section className="md:col-span-2 border border-black bg-white/95 p-5 flex justify-end">
          <button
            className="border border-black px-4 py-2 bg-white font-bold"
            style={{ fontFamily: "'Neue Plak', sans-serif" }}
            onClick={() => {
              window.location.href = "http://localhost:3004/";
            }}
          >
            Logout
          </button>
        </section>
      </main>
    </div>
  );
}