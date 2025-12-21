//app/admin/login

"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const search = useSearchParams();

  // Sanitize "next" to avoid open redirects
  const rawNext = search.get("next") || "/admin";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        // Use full page navigation to ensure cookie is sent with the request
        window.location.href = next;
        return;
      } else {
        setError("Invalid password");
        setSubmitting(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-[100svh] flex flex-col text-black"
      style={{
        backgroundColor: "#FDFDF1",
        backgroundImage: "url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')",
        backgroundRepeat: "repeat",
      }}
    >
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-5xl h-14 px-4 flex items-center justify-between">
          <a href="/" className="font-semibold tracking-tight">Rewind Radio</a>
          <span className="text-xs text-black/60">Admin</span>
        </div>
      </header>

      {/* Wrap page content in Suspense to satisfy useSearchParams requirements */}
      <React.Suspense fallback={<div className="flex-1 grid place-items-center">Loading…</div>}>
        <main className="flex-1 grid place-items-center px-4">
          <form onSubmit={onSubmit} className="w-[min(90vw,420px)] border bg-white/90 p-6 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
              Admin Login
            </h1>

            <label htmlFor="admin-username" className="block text-sm mb-2">
              Username
            </label>
            <input
              id="admin-username"
              name="username"
              type="text"
              className="w-full border px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              required
            />

            <label htmlFor="admin-password" className="block text-sm mb-2 mt-4">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              className="w-full border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="mt-6 w-full border px-3 py-2 font-bold hover:bg-black/5 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </main>
      </React.Suspense>

      <footer className="border-t bg-white/80">
        <div className="mx-auto max-w-5xl h-12 px-4 flex items-center justify-between text-sm">
          <span>© {new Date().getFullYear()} Rewind Radio</span>
          <a href="/" className="text-black/60 hover:text-black">Back to site</a>
        </div>
      </footer>
    </div>
  );
}