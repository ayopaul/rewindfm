//app/admin/layout.tsx

import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function logout() {
    "use server";
    const cookieStore = await cookies();
    const cookieName = process.env.ADMIN_COOKIE_NAME || "rewind_admin";
    cookieStore.delete(cookieName);
    redirect("/admin/login");
  }

  return (
    <section
      className="min-h-dvh text-black"
      style={{
        backgroundColor: "#FFFEF1",
        backgroundImage:
          "url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      {/* Sticky header — matches Blog heading bar */}
      <header
        className="sticky top-0 z-40 border-b border-black/20"
        style={{
          backgroundColor: "#FBB63B",
          backgroundImage:
            "url('/5df82e05767bad4244dc8b5c_expanded-texture.gif')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      >
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-3">
          {/* Title */}
          <div
            className="text-center mb-2 text-[28px] leading-none"
            style={{ fontFamily: "'Neue Power', sans-serif", fontWeight: 800 }}
          >
            Admin
          </div>

          {/* Nav (category style) */}
          <div className="relative">
            <nav
              className="flex gap-3 overflow-x-auto whitespace-nowrap scrollbar-none pb-1"
              aria-label="Admin sections"
            >
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-white border border-black text-black text-[23px]"
                style={{ fontFamily: "'Neue Power', sans-serif", fontWeight: 800 }}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/settings"
                className="inline-flex items-center px-4 py-2 bg-white border border-black text-black text-[23px]"
                style={{ fontFamily: "'Neue Power', sans-serif", fontWeight: 800 }}
              >
                Settings
              </Link>
              <Link
                href="/admin/oaps"
                className="inline-flex items-center px-4 py-2 bg-white border border-black text-black text-[23px]"
                style={{ fontFamily: "'Neue Power', sans-serif", fontWeight: 800 }}
              >
                OAPs
              </Link>
              <Link
                href="/admin/shows"
                className="inline-flex items-center px-4 py-2 bg-white border border-black text-black text-[23px]"
                style={{ fontFamily: "'Neue Power', sans-serif", fontWeight: 800 }}
              >
                Shows
              </Link>
              <Link
                href="/admin/schedule"
                className="inline-flex items-center px-4 py-2 bg-white border border-black text-black text-[23px]"
                style={{ fontFamily: "'Neue Power', sans-serif", fontWeight: 800 }}
              >
                Schedule
              </Link>
              <form action={logout} className="inline">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-white border border-black text-black text-[23px]"
                  style={{ fontFamily: "'Neue Power', sans-serif", fontWeight: 800 }}
                >
                  Logout
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      {/* Page content */}
      <Suspense fallback={null}>
        <main className="mx-auto max-w-screen-2xl px-4 md:px-6 py-6 text-white">
          {children}
        </main>
      </Suspense>
    </section>
  );
}