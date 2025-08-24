//app/admin/page.tsx
"use client";

import React from "react";

// Admin Dashboard – matches site look & feel (yellow sticky heading, texture bg, cream cards)
export default function AdminHome() {
  const [stats, setStats] = React.useState({
    oaps: 0,
    shows: 0,
    schedule: 0,
    posts: 0,
  });
  const [nowPlaying, setNowPlaying] = React.useState<{
    title: string;
    subtitle?: string;
    image?: string;
  } | null>(null);

  React.useEffect(() => {
    // Best‑effort fetches; page still renders nicely without the APIs
    const fetchAll = async () => {
      try {
        const [statsRes, npRes] = await Promise.all([
          fetch("/api/admin/summary").catch(() => null),
          fetch("/api/now-playing").catch(() => null),
        ]);
        if (statsRes?.ok) {
          const data = await statsRes.json();
          setStats({
            oaps: data.oaps ?? 0,
            shows: data.shows ?? 0,
            schedule: data.slots ?? data.schedule ?? 0,
            posts: data.posts ?? 0,
          });
        }
        if (npRes?.ok) {
          const data = await npRes.json();
          setNowPlaying({
            title: data?.title ?? "No stream configured",
            subtitle: data?.subtitle ?? "",
            image: data?.image ?? "/media/record player.jpg",
          });
        }
      } catch (_) {
        // no-op
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDF1] text-black">
      {/* Sticky heading bar – same as Blog/About */}
      <div
        className="sticky top-0 z-20 w-full border-b border-black/10"
        style={{
          backgroundColor: "#FBB63B",
          backgroundImage:
            "url(/media/5df82e05767bad4244dc8b5c_expanded-texture.gif)",
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-4">
          <h1
            className="text-center text-3xl md:text-4xl leading-none"
            style={{ fontFamily: "'Neue Power', 'Neue Plak', sans-serif", fontWeight: 800 }}
          >
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8">
        {/* Now Playing */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 rounded-none border border-black/10 bg-white shadow-sm">
            <div className="p-5 md:p-6">
              <h2
                className="text-2xl md:text-3xl mb-2"
                style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
              >
                Now Playing
              </h2>
              <div className="flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="h-20 w-20 shrink-0 overflow-hidden border border-black/10 bg-[#F5DCB7]">
                  {nowPlaying?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={nowPlaying.image}
                      alt={nowPlaying.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate text-xl md:text-2xl"
                    style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
                  >
                    {nowPlaying?.title || "—"}
                  </p>
                  {nowPlaying?.subtitle ? (
                    <p className="text-sm md:text-base text-black/70">
                      {nowPlaying.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="border-t border-black/10 bg-[#FFF9E8] px-5 py-3 flex flex-wrap gap-3">
              <a
                href="/admin/schedule"
                className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base border border-black bg-[#FDFDF1] hover:translate-y-[1px] active:translate-y-[2px] transition"
                style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
              >
                Manage Schedule
              </a>
              <a
                href="/admin/settings"
                className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base border border-black bg-[#FDFDF1] hover:translate-y-[1px] active:translate-y-[2px] transition"
                style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
              >
                Stream Settings
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-none border border-black/10 bg-white shadow-sm">
            <div className="p-5 md:p-6">
              <h2
                className="text-2xl md:text-3xl mb-4"
                style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
              >
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "OAPs", value: stats.oaps, href: "/admin/oaps" },
                  { label: "Shows", value: stats.shows, href: "/admin/shows" },
                  { label: "Schedule", value: stats.schedule, href: "/admin/schedule" },
                  { label: "Blog Posts", value: stats.posts, href: "/admin/posts" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="group rounded-none border border-black/10 bg-[#FDFDF1] p-4 hover:bg-white transition"
                  >
                    <div
                      className="text-3xl leading-none mb-1 group-hover:translate-y-[-1px] transition"
                      style={{ fontFamily: "'Neue Power', 'Neue Plak', sans-serif", fontWeight: 800 }}
                    >
                      {s.value}
                    </div>
                    <div className="text-sm" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
                      {s.label}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity & Shortcuts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-none border border-black/10 bg-white shadow-sm">
            <div className="p-5 md:p-6">
              <h2
                className="text-2xl md:text-3xl mb-4"
                style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
              >
                Recent Activity
              </h2>
              <ul className="space-y-3">
                {[
                  "Scheduled ‘Morning Drive’ for Monday 7:00–10:00",
                  "Updated OAP profile: Kemi Ade",
                  "Published blog post: Welcome to Rewind",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="border border-black/10 bg-[#FDFDF1] px-4 py-3 text-sm"
                    style={{ fontFamily: "'Neue Plak', sans-serif" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-none border border-black/10 bg-white shadow-sm">
            <div className="p-5 md:p-6">
              <h2
                className="text-2xl md:text-3xl mb-4"
                style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
              >
                Quick Actions
              </h2>
              <div className="grid gap-3">
                {[
                  { label: "Add OAP", href: "/admin/oaps/new" },
                  { label: "Add Show", href: "/admin/shows/new" },
                  { label: "Add Blog Post", href: "/admin/posts/new" },
                ].map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    className="inline-flex items-center justify-center px-4 py-3 border border-black bg-[#FFF9E8] hover:translate-y-[1px] active:translate-y-[2px] transition text-sm"
                    style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
                  >
                    {a.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Logout */}
        <div className="mt-8">
          <a
            href="/admin/logout"
            className="inline-block border border-black bg-[#FFF9E8] px-4 py-2"
            style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
          >
            Logout
          </a>
        </div>
      </main>
    </div>
  );
}