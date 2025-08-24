import Image from "next/image";
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params) {
  const oap = await prisma.oap.findUnique({
    where: { id: params.id },
    select: { name: true, role: true },
  });
  if (!oap) return { title: "OAP · Rewind FM" };
  return { title: `${oap.name} · Rewind FM`, description: oap.role ?? undefined };
}

export default async function OapDetailPage({ params }: Params) {
  // Align fields with your schema (name, role, bio, imageUrl, socials, etc.)
  const raw = await prisma.oap.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      role: true,
      imageUrl: true,
      bio: true,
      // comment these in only if they exist in your schema
      // twitter: true,
      // instagram: true,
    },
  });

  if (!raw) return notFound();

  const oap = {
    id: String((raw as any).id),
    name: String((raw as any).name),
    role: (raw as any).role ?? null,
    imageUrl: (raw as any).imageUrl ?? null,
    bio: (raw as any).bio ?? null,
    twitter: (raw as any).twitter ?? null,
    instagram: (raw as any).instagram ?? null,
  } as {
    id: string;
    name: string;
    role: string | null;
    imageUrl: string | null;
    bio: string | null;
    twitter: string | null;
    instagram: string | null;
  };

  if (!oap) return notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      {/* Breadcrumb/back */}
      <div className="mb-6">
        <a
          href="/oaps"
          className="inline-flex items-center gap-2 text-black hover:opacity-80"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          Back to OAPs
        </a>
      </div>

      <article className="grid gap-10 lg:grid-cols-12">
        {/* Portrait */}
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] w-full bg-neutral-100 overflow-hidden">
            {oap.imageUrl ? (
              <Image
              src={oap.imageUrl || "/media/oaps/placeholder.jpg"}
              alt={oap.name || "OAP portrait"}
              width={1000}
              height={1250}
              className="h-full w-full object-cover"
              priority
            />
            ) : (
              <div className="h-full w-full grid place-items-center text-neutral-400">No Photo</div>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="lg:col-span-7">
          <div className="mb-3 text-xs tracking-[0.12em] uppercase text-neutral-500">
            Rewind FM
          </div>
          <h1
            className="text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
          >
            {oap.name}
          </h1>
          {oap.role && (
            <p className="mt-3 text-xl text-neutral-800">{oap.role}</p>
          )}

          {oap.bio && (
            <div className="prose prose-neutral max-w-none mt-8">
              {/* If bio is rich text/HTML from admin, render safely; otherwise plain */}
              <p className="whitespace-pre-line">{oap.bio}</p>
            </div>
          )}

          {/* Optional socials */}
          {(oap as any).twitter || (oap as any).instagram ? (
            <div className="mt-8 flex gap-4">
              {(oap as any).twitter && (
                <a
                  className="underline"
                  href={(oap as any).twitter}
                  target="_blank"
                  rel="noreferrer"
                >
                  Twitter
                </a>
              )}
              {(oap as any).instagram && (
                <a
                  className="underline"
                  href={(oap as any).instagram}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              )}
            </div>
          ) : null}
        </div>
      </article>
    </main>
  );
}