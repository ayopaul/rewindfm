import Image from "next/image";
import Link from "next/link";

export type OapCardProps = {
  id: string;
  name: string;
  role?: string | null;
  imageUrl?: string | null;
  org?: string | null; // e.g. "Rewind FM"
};

export default function OapCard({ id, name, role, imageUrl, org }: OapCardProps) {
  return (
    <Link
      href={`/oaps/${id}`}
      className="group block focus:outline-none"
      aria-label={`${name} – ${role ?? "OAP"}`}
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={800}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-neutral-400">No Photo</div>
        )}
      </div>

      <div className="bg-black text-white p-6">
        {org && (
          <div className="text-xs tracking-[0.12em] text-white/70 mb-2 uppercase">
            {org}
          </div>
        )}
        <div
          className="text-2xl leading-7"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
        >
          {name}
        </div>
        {role && (
          <div className="mt-3 text-lg leading-7 text-white/90">{role}</div>
        )}

        <div className="mt-6 inline-flex items-center gap-3 text-white/90 group-hover:text-white">
          <span className="text-base">More</span>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    </Link>
  );
}