import Link from "next/link";

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto bg-surface-dark text-white rounded-[var(--radius-lg)]">
      <div className="px-lg py-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-lg">
            <Link href="/" className="flex items-center gap-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo_group.svg"
                alt="SOAR"
                className="h-[28px] w-auto brightness-[2]"
              />
            </Link>

            <nav className="flex items-center gap-md">
              <Link
                href="/discover"
                className="text-white/80 hover:text-white transition-colors duration-[var(--duration-micro)]"
              >
                Discover
              </Link>
              <Link
                href="/pricing"
                className="text-white/80 hover:text-white transition-colors duration-[var(--duration-micro)]"
              >
                Pricing
              </Link>
              <Link
                href="/help"
                className="text-white/80 hover:text-white transition-colors duration-[var(--duration-micro)]"
              >
                Help
              </Link>
            </nav>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors duration-[var(--duration-micro)]"
            aria-label="Instagram"
          >
            <InstagramIcon size={20} />
          </a>
        </div>

        <div className="mt-xs">
          <Link
            href="/terms"
            className="type-caption text-white/40 hover:text-white/60 transition-colors duration-[var(--duration-micro)]"
          >
            Terms & Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
