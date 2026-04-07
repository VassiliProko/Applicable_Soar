"use client";

import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function PlanSection() {
  return (
    <section>
      <h2 className="type-title text-text-primary mb-sm">Plan</h2>
      <div className="rounded-[var(--radius-lg)] border border-border p-md flex items-center justify-between gap-md">
        <div className="min-w-0">
          <div className="flex items-center gap-2xs">
            <span className="type-subhead text-text-primary">Free</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">
              Current
            </span>
          </div>
          <p className="type-body text-text-secondary mt-3xs">
            1 active project posting with basic features.
          </p>
        </div>
        <Link href="/pricing" className="shrink-0">
          <Button variant="primary" size="sm" className="!bg-primary !font-semibold">
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    </section>
  );
}
