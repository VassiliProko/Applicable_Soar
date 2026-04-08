"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  DollarSign,
  Calendar,
  Globe,
  Building2,
  ArrowLeftRight,
  Share2,
  Check,
} from "lucide-react";
import type { ProjectFormData } from "@/app/lib/types";

export interface PublicProject extends ProjectFormData {
  id: string;
  userId: string;
  createdAt: string;
  organization: {
    companyName: string;
    website: string | null;
    industry: string;
  } | null;
}

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getFaviconUrl(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return null;
  }
}

const LOCATION_ICONS = {
  remote: Globe,
  "on-site": Building2,
  hybrid: ArrowLeftRight,
} as const;

const LOCATION_LABELS: Record<string, string> = {
  remote: "Remote",
  "on-site": "In Person",
  hybrid: "Hybrid",
};

function formatTimeline(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return null;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(startDate)} — ${fmt(endDate)}`;
}

export default function ProjectCard({ project }: { project: PublicProject }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const favicon = getFaviconUrl(project.organization?.website);
  const LocationIcon = LOCATION_ICONS[project.locationType] ?? Globe;
  const timeline = formatTimeline(project.startDate, project.endDate);

  const handleCardClick = () => {
    router.push(`/project/${project.id}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-[var(--card-outer-radius)] border border-border bg-background shadow-low hover:shadow-mid transition-all duration-[var(--duration-micro)] [transition-timing-function:var(--ease-micro)] hover:-translate-y-px cursor-pointer"
    >
      {/* Share button */}
      <button
        onClick={handleShare}
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 h-8 rounded-[var(--radius-full)] text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-all duration-[var(--duration-micro)] cursor-pointer opacity-0 group-hover:opacity-100"
        aria-label="Copy link"
      >
        {copied ? (
          <span className="inline-flex items-center gap-1.5 animate-[fadeIn_var(--duration-medium)_var(--ease-enter)]">
            <Check size={16} className="text-text-primary" />
            <span className="type-body font-medium text-text-primary">Copied to clipboard</span>
          </span>
        ) : (
          <>
            <Share2 size={16} />
            <span className="type-body font-medium">Share</span>
          </>
        )}
      </button>

      <div className="p-md flex gap-md">
        {/* Logo */}
        <div className="shrink-0">
          {favicon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={favicon}
              alt={project.organization?.companyName ?? ""}
              width={48}
              height={48}
              className="w-12 h-12 rounded-[var(--radius-md)] bg-surface-1 object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-surface-dark flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {(project.organization?.companyName ?? project.title)?.[0]?.toUpperCase() ?? "S"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: time badge */}
          <div className="mb-2xs">
            <span className="inline-block px-2 py-0.5 rounded-[var(--radius-sm)] bg-[#E6F9ED] text-[#15803d] type-caption font-medium">
              {timeAgo(project.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="type-subhead text-text-primary truncate">{project.title}</h3>

          {/* Org name / industry */}
          <p className="type-body text-text-secondary mt-4xs">
            {project.organization?.companyName ?? "Individual"}
            {project.organization?.industry && (
              <span className="text-text-tertiary">
                {" / "}
                {project.organization.industry}
              </span>
            )}
          </p>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-lg gap-y-2xs mt-sm">
            {/* Location */}
            <div className="flex items-center gap-2xs text-text-secondary">
              <LocationIcon size={15} className="text-text-tertiary shrink-0" />
              <span className="type-body">
                {project.locationDetail.length > 0
                  ? project.locationDetail.length === 1
                    ? project.locationDetail[0].split(",")[0]
                    : `${project.locationDetail.length} locations`
                  : LOCATION_LABELS[project.locationType]}
              </span>
            </div>

            {/* Time commitment */}
            {project.timeCommitment && (
              <div className="flex items-center gap-2xs text-text-secondary">
                <Clock size={15} className="text-text-tertiary shrink-0" />
                <span className="type-body">{project.timeCommitment}</span>
              </div>
            )}

            {/* Compensation */}
            <div className="flex items-center gap-2xs text-text-secondary">
              <DollarSign size={15} className="text-text-tertiary shrink-0" />
              <span className="type-body">
                {project.compensationAmount && project.compensationAmount !== "$"
                  ? project.compensationAmount
                  : "Unpaid"}
              </span>
            </div>

            {/* Timeline */}
            {timeline && (
              <div className="flex items-center gap-2xs text-text-secondary">
                <Calendar size={15} className="text-text-tertiary shrink-0" />
                <span className="type-body">{timeline}</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
