// app/admin/settings/page.tsx
import { supabase } from "@/lib/supabase";
import SettingsAdminClient from "@/components/SettingsAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Settings · Admin · Rewind FM" };

type SettingsData = {
  id: string;
  stationId: string;
  streamUrl: string;
  timezone: string;
  uploadsNamespace: string;
  aboutHtml: string | null;
  socials: Record<string, string> | null;
  theme: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
} | null;

export default async function AdminSettingsPage() {
  let settings: SettingsData = null;
  try {
    const { data, error } = await supabase
      .from("Settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    settings = data ?? null;
  } catch (e) {
    console.error("Failed to load admin settings during render:", e);
    settings = null;
  }

  return (
    <main className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8 text-black">
      <h1
        className="text-3xl md:text-4xl mb-6"
        style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
      >
        Settings
      </h1>
      <SettingsAdminClient initial={settings} />
    </main>
  );
}
