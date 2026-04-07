"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import Button from "@/app/components/ui/Button";
import type { ProjectFormData } from "@/app/lib/types";

type ProjectItem = ProjectFormData & {
  id: string;
  userId: string;
  createdAt: string;
};

interface MyProjectsSectionProps {
  projects: ProjectItem[];
}

type StatusFilter = "all" | "published" | "draft";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyProjectsSection({
  projects,
}: MyProjectsSectionProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered =
    filter === "all"
      ? projects
      : projects.filter((p) => p.status === filter);

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Drafts" },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-2xs">
          <h2 className="type-title text-text-primary">My Projects</h2>
          <span className="type-caption text-text-tertiary">
            ({projects.length})
          </span>
        </div>
      </div>

      {/* Status filter tabs */}
      {projects.length > 0 && (
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

      {projects.length === 0 ? (
        /* Empty state */
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-xl text-center">
          <p className="type-subhead text-text-secondary">No projects yet</p>
          <p className="type-body text-text-tertiary mt-2xs">
            Create your first project to get started.
          </p>
          <Link href="/create" className="inline-block mt-md">
            <Button variant="primary" size="sm">
              Create Project
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="type-body text-text-tertiary py-lg text-center">
          No {filter} projects.
        </p>
      ) : (
        /* Project list */
        <div className="flex flex-col gap-sm">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="rounded-[var(--radius-md)] border border-border overflow-hidden"
            >
              {/* Banner color strip */}
              <div
                className="h-1"
                style={{
                  backgroundColor:
                    project.bannerType === "color"
                      ? project.bannerValue
                      : "var(--border)",
                }}
              />

              <div className="p-sm flex items-center justify-between gap-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2xs flex-wrap">
                    <p className="type-body font-medium text-text-primary truncate">
                      {project.title || "Untitled"}
                    </p>
                    {/* Status badge */}
                    <span
                      className={`
                        text-[11px] font-medium px-2 py-0.5 rounded-full
                        ${
                          project.status === "published"
                            ? "bg-[#E6F9ED] text-[#15803d]"
                            : "bg-surface-2 text-text-tertiary"
                        }
                      `}
                    >
                      {project.status === "published" ? "Published" : "Draft"}
                    </span>
                    {/* Visibility badge */}
                    <span className="inline-flex items-center gap-[3px] text-[11px] text-text-tertiary">
                      {project.visibility === "public" ? (
                        <Globe size={12} />
                      ) : (
                        <Lock size={12} />
                      )}
                      {project.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="type-caption text-text-tertiary mt-3xs">
                    Created {formatDate(project.createdAt)}
                  </p>
                </div>

                <Link href={`/edit/${project.id}`} className="shrink-0">
                  <Button variant="ghost" size="sm" className="!text-text-secondary !bg-transparent hover:!bg-surface-2 active:!bg-surface-2/60">
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
