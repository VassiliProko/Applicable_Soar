import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border-divider">
      <div className="flex items-center justify-between h-14">
        <Link href="/" className="flex items-center opacity-50 hover:opacity-100 transition-opacity duration-[var(--duration-micro)]" aria-label="Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="SOAR"
            className="h-[25px] w-auto"
          />
        </Link>

        <div className="flex items-center gap-lg">
          <Link href="/discover" className="nav-link">
            Discover Projects
          </Link>
          <Link href="/login" className="nav-link">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
