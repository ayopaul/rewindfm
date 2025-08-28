import Image from "next/image";
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const prisma = new PrismaClient();

// Normalize social handles from DB to full URLs
function normalizeSocial(value: string | null | undefined, kind: "twitter" | "instagram"): { url: string; label: string } | null {
  if (!value) return null;
  let v = value.trim();
  // If they pasted a full URL, keep it
  if (/^https?:\/\//i.test(v)) {
    // derive label from path
    try {
      const u = new URL(v);
      const parts = u.pathname.split("/").filter(Boolean);
      const handle = parts[0] ? `@${parts[0]}` : `@${kind}`;
      return { url: v, label: handle };
    } catch {
      return { url: v, label: `@${kind}` };
    }
  }
  // Strip leading @ if present
  v = v.replace(/^@+/, "");
  if (!v) return null;
  const base = kind === "twitter" ? "https://twitter.com/" : "https://instagram.com/";
  return { url: base + v, label: `@${v}` };
}

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
      twitter: true,
      instagram: true,
    },
  });

  if (!raw) return notFound();

  const oap: {
    id: string;
    name: string;
    role: string | null;
    imageUrl: string | null;
    bio: string | null;
    twitter: string | null;
    instagram: string | null;
  } = {
    id: String(raw.id),
    name: String(raw.name),
    role: raw.role ?? null,
    imageUrl: raw.imageUrl ?? null,
    bio: raw.bio ?? null,
    twitter: (raw as any).twitter ?? null,
    instagram: (raw as any).instagram ?? null,
  };

  if (!oap) return notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-10 bg-[#FFFEF1] bg-[url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')] bg-repeat text-black">
        {/* Breadcrumb/back */}
        <div className="mb-6">
          <a
            href="/oap"
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
                src={oap.imageUrl}
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
            <div className="mb-3 text-xs tracking-[0.12em] uppercase text-black">
              Rewind FM
            </div>
            <h1
              className="text-4xl md:text-5xl leading-tight text-black"
              style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
            >
              {oap.name}
            </h1>
            {oap.role && (
              <p className="mt-3 text-xl text-black">{oap.role}</p>
            )}

            {oap.bio && (
              <div className="prose prose-neutral max-w-none mt-8">
                {/* If bio is rich text/HTML from admin, render safely; otherwise plain */}
                <p className="whitespace-pre-line text-black">{oap.bio}</p>
              </div>
            )}

            {(() => {
              const tw = normalizeSocial(oap.twitter, "twitter");
              const ig = normalizeSocial(oap.instagram, "instagram");
              if (!tw && !ig) return null;
              return (
                <div className="mt-8 flex gap-4 items-center">
                  {tw && (
                    <a
                      className="underline text-black"
                      href={tw.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Twitter ${tw.label}`}
                    >
                      Twitter <span className="sr-only">{tw.label}</span>
                    </a>
                  )}
                  {ig && (
                    <a
                      className="underline text-black"
                      href={ig.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Instagram ${ig.label}`}
                    >
                      Instagram <span className="sr-only">{ig.label}</span>
                    </a>
                  )}
                </div>
              );
            })()}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}