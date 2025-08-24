// app/admin/settings/page.tsx
import { PrismaClient } from "@prisma/client";
import SettingsAdminClient from "@/components/SettingsAdminClient";

const prisma = new PrismaClient();

export const metadata = { title: "Settings · Admin · Rewind FM" };

export default async function AdminSettingsPage() {
  // Use a temporary cast in case Prisma Client hasn't been regenerated yet.
  const settings = await (prisma as any).settings?.findFirst?.();

  return (
    <main className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8 text-black">
      <h1
        className="text-3xl md:text-4xl mb-6"
        style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
      >
        Settings
      </h1>
      <SettingsAdminClient initial={settings ?? null} />
    </main>
  );
}