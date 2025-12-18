// app/admin/schedule/page.tsx (server component)
import { supabase } from "@/lib/supabase";
import ScheduleAdminClient from "@/components/ScheduleAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Schedule · Admin · Rewind FM" };

export default async function AdminSchedulePage() {
  let shows: { id: string; title: string }[] = [];
  try {
    const { data, error } = await supabase
      .from("Show")
      .select("id, title")
      .order("title", { ascending: true });

    if (error) throw error;
    shows = data ?? [];
  } catch (e) {
    console.error("Failed to load shows for admin schedule:", e);
  }

  return (
    <main className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8 text-black">
      <h1
        className="text-3xl md:text-4xl mb-6"
        style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
      >
        Schedule Settings
      </h1>
      <ScheduleAdminClient shows={shows} />
    </main>
  );
}
