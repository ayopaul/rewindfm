import Link from "next/link";

export default function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-white/10 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="text-sm text-white/70">
            © {new Date().getFullYear()} Rewind FM
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-4 text-sm text-white/70"
          >
            <Link href="/#weekday" className="hover:text-white">
              Weekday
            </Link>
            <Link href="/#weekend" className="hover:text-white">
              Weekend
            </Link>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <Link href="/#oaps" className="hover:text-white">
              OAPs
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}