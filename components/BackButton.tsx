"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-6 inline-flex items-center gap-2 text-sm underline decoration-black/40 underline-offset-4 hover:decoration-black"
    >
      ← {label}
    </button>
  );
}