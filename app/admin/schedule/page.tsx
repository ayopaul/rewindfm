// app/admin/schedule/page.tsx (server component)
import { PrismaClient } from "@prisma/client";
import ScheduleAdminClient from "@/components/ScheduleAdminClient";

const prisma = new PrismaClient();

export const metadata = { title: "Schedule · Admin · Rewind FM" };

export default async function AdminSchedulePage() {
  const shows = await prisma.show.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

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