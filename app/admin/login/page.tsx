"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.replace(next);
    else setError("Invalid password");
  }

  return (
    <main className="min-h-[100svh] grid place-items-center"
      style={{
        backgroundColor: "#FDFDF1",
        backgroundImage: "url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')",
        backgroundRepeat: "repeat",
      }}>
      <form onSubmit={onSubmit} className="w-[min(90vw,420px)] border bg-white/90 p-6 text-black">
        <h1 className="mb-4 text-2xl font-bold" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
          Admin Login
        </h1>
        <label className="block text-sm mb-2">Password</label>
        <input
          type="password"
          className="w-full border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button className="mt-6 w-full border px-3 py-2 font-bold hover:bg-black/5">Sign in</button>
      </form>
    </main>
  );
}