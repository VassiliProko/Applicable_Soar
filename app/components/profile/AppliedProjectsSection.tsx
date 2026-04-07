"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { withdrawApplication } from "@/app/actions/applications";
import type { ApplicationWithProject, ApplicationStatus } from "@/app/lib/types";

interface AppliedProjectsSectionProps {
  applications: ApplicationWithProject[];
  onUpdate: () => void;
}

type StatusFilter = "all" | ApplicationStatus;

const STATUS_BADGES: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  applied: {
    label: "Applied",
    className: "bg-[#E8F0FE] text-[#1a56db]",
  },
  accepted: {
    label: "Accepted",
    className: "bg-[#E6F9ED] text-[#15803d]",
  },
  rejected: {
    label: "Not Selected",
    className: "bg-[#FEE8E8] text-[#b91c1c]",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-surface-2 text-text-tertiary",
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AppliedProjectsSection({
  applications,
  onUpdate,
}: AppliedProjectsSectionProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "applied", label: "Applied" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Not Selected" },
  ];

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    await withdrawApplication(applicationId);
    setWithdrawingId(null);
    onUpdate();
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-2xs">
          <h2 className="type-title text-text-primary">Applied Projects</h2>
          <span className="type-caption text-text-tertiary">
            ({applications.length})
          </span>
        </div>
      </div>

      {/* Status filter tabs */}
      {applications.length > 0 && (
        <div className="flex items-center gap-3xs mb-md">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`
                px-sm py-2xs rounded-[var(--radius-full)]
                type-caption font-medium
                transition-colors duration-[var(--duration-micro)]
                cursor-pointer
                ${
                  filter === tab.value
                    ? "bg-text-primary text-white"
                    : "bg-surface-1 text-text-secondary hover:bg-surface-2"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-xl text-center">
          <Inbox size={32} className="text-text-tertiary mx-auto mb-sm" />
          <p className="type-body text-text-secondary">
            No applications yet.
          </p>
          <p className="type-caption text-text-tertiary mt-2xs">
            Browse projects on Discover and click &ldquo;I&apos;m Interested&rdquo; to
            apply.
          </p>
          <Link href="/discover" className="inline-block mt-md">
            <Button variant="primary" size="sm">
              Discover Projects
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="type-body text-text-tertiary py-lg text-center">
          No {filter} applications.
        </p>
      ) : (
        <div className="flex flex-col gap-sm">
          {filtered.map((app) => {
            const badge = STATUS_BADGES[app.status];
            return (
              <div
                key={app.id}
                className="rounded-[var(--radius-md)] border border-border overflow-hidden"
              >
                {/* Banner color strip */}
                <div
                  className="h-1"
                  style={{
                    backgroundColor:
                      app.project.bannerType === "color"
                        ? app.project.bannerValue
                        : "var(--border)",
                  }}
                />

                <div className="p-sm flex items-center justify-between gap-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2xs flex-wrap">
                      <Link
                        href={`/project/${app.project.id}`}
                        className="type-body font-medium text-text-primary truncate hover:underline"
                      >
                        {app.project.title}
                      </Link>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2xs mt-3xs">
                      {app.project.organization && (
                        <span className="type-caption text-text-secondary">
                          {app.project.organization.companyName}
                        </span>
                      )}
                      <span className="type-caption text-text-tertiary">
                        Applied {formatDate(app.createdAt)}
                      </span>
                    </div>
                  </div>

                  {app.status === "applied" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWithdraw(app.id)}
                      disabled={withdrawingId === app.id}
                      className="shrink-0 !text-text-tertiary hover:!text-error"
                    >
                      {withdrawingId === app.id ? "..." : "Withdraw"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
