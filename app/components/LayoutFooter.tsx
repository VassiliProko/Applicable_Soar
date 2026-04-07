"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDE_FOOTER_ROUTES = ["/create"];

export default function LayoutFooter() {
  const pathname = usePathname();
  if (HIDE_FOOTER_ROUTES.includes(pathname)) return null;

  return (
    <div className="px-[var(--grid-margin)] pb-[var(--grid-margin)]">
      <Footer />
    </div>
  );
}
