

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
            <a href="/#weekday" className="hover:text-white">
              Weekday
            </a>
            <a href="/#weekend" className="hover:text-white">
              Weekend
            </a>
            <a href="/blog" className="hover:text-white">
              Blog
            </a>
            <a href="/#oaps" className="hover:text-white">
              OAPs
            </a>
            <a href="/about" className="hover:text-white">
              About
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}