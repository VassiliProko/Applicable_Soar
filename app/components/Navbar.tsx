import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border-divider">
      <div className="flex items-center justify-between h-14">
        <Link href="/" className="flex items-center opacity-50 hover:opacity-100 transition-opacity duration-[var(--duration-micro)]" aria-label="Home">
          <Image
            src="/logo_plane_muted.svg"
            alt="Applicable"
            width={26}
            height={25}
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
