import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "./ui/Button";

export default function Hero() {
  return (
    <section className="pt-2xl pb-2xl">
      <div className="flex items-center gap-1 mb-2xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_group.svg"
          alt=""
          className="h-[30px] w-auto"
        />
      </div>

      <h1 className="type-display mb-sm">
        Launch projects, find{" "}
        <span className="bg-gradient-to-r from-[#DCB063] via-[#56D6A6] to-[#6EC3BE] bg-clip-text text-transparent">talent</span>
      </h1>

      <p className="type-body text-text-secondary mb-xl">
        Set up a project page to share, track, and discover talent.
      </p>

      <Link href="/create">
        <Button variant="primary" size="md" className="group">
          Create Project
          <ArrowRight
            size={16}
            className="
              -ml-1 w-0 opacity-0
              group-hover:w-4 group-hover:opacity-100 group-hover:ml-0
              transition-all duration-[var(--duration-base)]
              [transition-timing-function:var(--ease-enter)]
            "
          />
        </Button>
      </Link>
    </section>
  );
}
