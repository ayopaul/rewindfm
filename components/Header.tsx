// components/Header.tsx
import Link from "next/link";
export default function Header() {
  return (
    <header className="border-b border-black/20">
      <div className="grid grid-cols-4 grid-rows-[auto,auto]">
        {/* Logo block spans 2 rows */}
        <div className="row-span-2 flex flex-col items-center justify-center bg-[#008C99] px-6 py-6">
          <img
            src="/media/rewind_fm_logo.svg"
            alt="Rewind FM Logo"
            className="h-16 w-auto"
          />
        </div>

        {/* Row 1: nav links */}
        <Link
          href="/blog"
          className="flex items-center justify-center bg-[#C6E9EE] hover:bg-[#FFFEF1] aria-[current=page]:bg-[#1092A4] transition-colors duration-200"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700, fontSize: "21px", color: "black" }}
        >
          Blogs
        </Link>
        <Link
          href="/oap"
          className="flex items-center justify-center bg-[#C6E9EE] hover:bg-[#FFFEF1] aria-[current=page]:bg-[#1092A4] transition-colors duration-200"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700, fontSize: "21px", color: "black" }}
        >
          OAPs
        </Link>
        <Link
          href="/about"
          className="flex items-center justify-center bg-[#C6E9EE] hover:bg-[#FFFEF1] aria-[current=page]:bg-[#1092A4] transition-colors duration-200"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700, fontSize: "21px", color: "black" }}
        >
          About
        </Link>

        {/* Row 2: search spans cols 2–4 */}
        <div className="col-span-3 flex items-center gap-2 border-t border-black/20 bg-[#FCFBEA] px-4 py-3">
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-black"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent text-base text-black placeholder:text-black/50 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
}