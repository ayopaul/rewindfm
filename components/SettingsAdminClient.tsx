// componenets/SettingsAdminClient.tsx

"use client";
import * as React from "react";

// Admin settings client — Neue Plak vibe, square edges
// Props: server passes initial settings object (or null)
export default function SettingsAdminClient({ initial }: { initial: any }) {
  const [form, setForm] = React.useState(() => ({
    streamUrl: initial?.streamUrl || "",
    socials: initial?.socials || { instagram: "", twitter: "", youtube: "" },
    theme: initial?.theme || { blogHeaderBg: "#FBB63B" },
  }));

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Save failed");
      }
      setOk(true);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  function sectionTitle(text: string) {
    return (
      <h2
        className="text-xl mb-3"
        style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
      >
        {text}
      </h2>
    );
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block text-sm">
      <span className="mb-1 inline-block" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
        {label}
      </span>
      {children}
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      {error && <p className="text-red-600">{error}</p>}
      {ok && <p className="text-green-700">Saved.</p>}

      {/* Streaming */}
      <section className="border border-black bg-white p-5">
        {sectionTitle("Streaming")}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Stream URL">
            <input
              className="w-full border border-black px-3 py-2"
              value={form.streamUrl}
              onChange={(e) => setForm((f) => ({ ...f, streamUrl: e.target.value }))}
              placeholder="https://example.com/stream.mp3"
            />
          </Field>
        </div>
      </section>

      {/* Socials */}
      <section className="border border-black bg-white p-5">
        {sectionTitle("Socials")}
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Instagram">
            <input
              className="w-full border border-black px-3 py-2"
              value={form.socials?.instagram || ""}
              onChange={(e) => setForm((f) => ({ ...f, socials: { ...f.socials, instagram: e.target.value } }))}
              placeholder="https://instagram.com/rewindfm"
            />
          </Field>
          <Field label="Twitter / X">
            <input
              className="w-full border border-black px-3 py-2"
              value={form.socials?.twitter || ""}
              onChange={(e) => setForm((f) => ({ ...f, socials: { ...f.socials, twitter: e.target.value } }))}
              placeholder="https://x.com/rewindfm"
            />
          </Field>
          <Field label="YouTube">
            <input
              className="w-full border border-black px-3 py-2"
              value={form.socials?.youtube || ""}
              onChange={(e) => setForm((f) => ({ ...f, socials: { ...f.socials, youtube: e.target.value } }))}
              placeholder="https://youtube.com/@rewindfm"
            />
          </Field>
        </div>
      </section>

      {/* Theme */}
      <section className="border border-black bg-white p-5">
        {sectionTitle("Theme")}
        <div className="grid gap-4 md:grid-cols-2 items-center">
          <Field label="Blog Header Background">
            <input
              type="color"
              className="h-10 w-20 border border-black"
              value={form.theme?.blogHeaderBg || "#FBB63B"}
              onChange={(e) => setForm((f) => ({ ...f, theme: { ...f.theme, blogHeaderBg: e.target.value } }))}
            />
          </Field>
          <div className="text-sm text-black/60">
            Used on blog title bar; background texture remains global.
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={saving}
          className="border border-black bg-[#FFF9E8] px-4 py-2 hover:translate-y-[1px] active:translate-y-[2px]"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
} 