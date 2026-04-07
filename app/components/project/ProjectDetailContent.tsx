"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";
import type { ProjectWithMeta } from "@/app/lib/types";
import { PROJECT_TYPE_OPTIONS } from "@/app/lib/types";

const LOCATION_LABELS: Record<string, string> = {
  remote: "Remote",
  "on-site": "In Person",
  hybrid: "Hybrid",
};

function formatTimeline(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return null;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  return `${fmt(startDate)} — ${fmt(endDate)}`;
}

export default function ProjectDetailContent({
  project,
}: {
  project: ProjectWithMeta;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const timeline = formatTimeline(project.startDate, project.endDate);
  const projectTypeLabel = project.projectType
    ? PROJECT_TYPE_OPTIONS.find((o) => o.value === project.projectType)?.label
    : null;

  const hasCompensation =
    project.compensationAmount && project.compensationAmount !== "$";

  // Build detail items for the overview list
  const details: { label: string; value: string }[] = [];
  if (timeline) details.push({ label: "Timeline", value: timeline });
  if (project.timeCommitment)
    details.push({ label: "Time Commitment", value: project.timeCommitment });
  details.push({
    label: "Compensation",
    value: hasCompensation ? project.compensationAmount : "None",
  });

  const locationLabel =
    project.locationDetail.length > 0
      ? project.locationDetail.join(" / ")
      : LOCATION_LABELS[project.locationType];
  details.push({ label: "Location", value: locationLabel });

  return (
    <div className="flex flex-col gap-lg">
      {/* Title */}
      <h1 className="type-display text-text-primary">{project.title}</h1>

      {/* Project type */}
      {projectTypeLabel && (
        <p className="type-body text-text-secondary -mt-sm">{projectTypeLabel}</p>
      )}

      <hr className="border-border" />

      {/* Description */}
      <section>
        <h2 className="type-body font-semibold text-text-primary mb-sm">Description</h2>
        <p className="type-body text-text-secondary whitespace-pre-wrap leading-relaxed">
          {project.description}
        </p>
      </section>

      <hr className="border-border" />

      {/* Details */}
      <section>
        <h2 className="type-body font-semibold text-text-primary mb-sm">Details</h2>
        <div className="flex flex-col gap-sm">
          {details.map((d) => (
            <div key={d.label} className="flex items-baseline gap-md">
              <span className="type-body font-medium text-text-tertiary w-44 shrink-0">
                {d.label}
              </span>
              <span className="type-body text-text-primary">{d.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="pb-2xl" />

      {/* Attachments */}
      {project.attachments.length > 0 && (
        <>
          <hr className="border-border" />
          <section>
            <h2 className="type-title text-text-primary mb-sm">Attachments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {project.attachments.map((att, i) =>
                att.fileType.startsWith("image/") ? (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => setPreviewIndex(i)}
                    className="rounded-[var(--radius-md)] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity duration-[var(--duration-micro)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.url}
                      alt={att.fileName}
                      className="w-full h-auto object-cover"
                    />
                  </button>
                ) : (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => setPreviewIndex(i)}
                    className="flex items-center gap-sm p-md rounded-[var(--radius-md)] bg-surface-1 hover:bg-surface-2 transition-colors duration-[var(--duration-micro)] cursor-pointer"
                  >
                    <FileText size={20} className="text-text-secondary shrink-0" />
                    <span className="type-body text-text-primary truncate">
                      {att.fileName}
                    </span>
                  </button>
                )
              )}
            </div>
          </section>
        </>
      )}

      {/* File preview overlay */}
      {previewIndex !== null &&
        project.attachments[previewIndex] &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center overflow-y-auto py-[10vh] cursor-pointer"
            onClick={() => setPreviewIndex(null)}
          >
            <div
              className="relative w-[90vw] sm:w-[80vw] lg:w-[52.8vw] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewIndex(null)}
                className="absolute -top-12 right-0 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
              >
                <X size={16} className="text-black" />
              </button>
              <div className="rounded-[var(--radius-lg)] border-4 border-white overflow-hidden bg-white shadow-2xl">
                {project.attachments[previewIndex].fileType.startsWith(
                  "image/"
                ) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.attachments[previewIndex].url}
                    alt={project.attachments[previewIndex].fileName}
                    className="w-full"
                  />
                ) : (
                  <iframe
                    src={project.attachments[previewIndex].url}
                    title={project.attachments[previewIndex].fileName}
                    className="w-full h-[85vh]"
                  />
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
