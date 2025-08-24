// components/MediaPicker.tsx
"use client";
import * as React from "react";

type Props = {
  label?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
};

export default function MediaPicker({ label = "Image", value, onChange, className }: Props) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "upload failed");
      }
      const j = await res.json();
      onChange(j.url);
    } catch (err: any) {
      setError(err?.message || "upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      {label && <div className="mb-1 text-sm" style={{ fontFamily: "'Neue Plak', sans-serif" }}>{label}</div>}
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 border border-black px-3 py-2 cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
          {busy ? "Uploading…" : "Choose file"}
        </label>
        {value && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="h-12 w-12 object-cover border border-black/10" />
            <button type="button" className="border border-black px-2 py-1" onClick={() => onChange(null)}>
              Clear
            </button>
          </>
        )}
      </div>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      {value && <div className="text-xs text-black/60 mt-1">{value}</div>}
    </div>
  );
}