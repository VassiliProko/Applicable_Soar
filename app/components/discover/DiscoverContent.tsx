"use client";

import { useMemo, useState } from "react";
import FilterBar, { type ActiveFilters, type FilterDef } from "./FilterBar";
import ProjectCard from "./ProjectCard";
import type { PublicProject } from "./ProjectCard";

const LOCATION_TYPE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "on-site", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
];

const COMPENSATION_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
];

const TIME_POSTED_OPTIONS = [
  { value: "day", label: "Past 24 hours" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "3months", label: "Past 3 months" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function collectUnique(projects: PublicProject[], key: "skills" | "locationDetail"): string[] {
  const set = new Set<string>();
  for (const p of projects) {
    for (const v of p[key] ?? []) {
      if (v) set.add(v);
    }
  }
  return [...set].sort();
}

function matchesTimeFilter(createdAt: string, range: string): boolean {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const diff = now - created;
  const DAY = 86_400_000;
  switch (range) {
    case "day":
      return diff <= DAY;
    case "week":
      return diff <= 7 * DAY;
    case "month":
      return diff <= 30 * DAY;
    case "3months":
      return diff <= 90 * DAY;
    default:
      return true;
  }
}

function textContains(text: string, term: string): boolean {
  return text.toLowerCase().includes(term.toLowerCase());
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DiscoverContent({ projects }: { projects: PublicProject[] }) {
  const [active, setActive] = useState<ActiveFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Build dynamic filter options from the data
  const filters: FilterDef[] = useMemo(() => {
    const locations = collectUnique(projects, "locationDetail").map((v) => ({
      value: v,
      label: v.split(",")[0], // show city part
    }));

    const skills = collectUnique(projects, "skills").map((v) => ({
      value: v,
      label: v,
    }));

    return [
      ...(locations.length > 0
        ? [{ key: "location", label: "Location", options: locations }]
        : []),
      ...(skills.length > 0
        ? [{ key: "skills", label: "Skills", options: skills }]
        : []),
      { key: "locationType", label: "Location Type", options: LOCATION_TYPE_OPTIONS },
      { key: "compensation", label: "Compensation", options: COMPENSATION_OPTIONS },
      { key: "posted", label: "Posted", options: TIME_POSTED_OPTIONS },
    ];
  }, [projects]);

  // Apply filters
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      // Location filter
      const loc = active.location ?? [];
      if (loc.length > 0 && !loc.some((v) => (p.locationDetail ?? []).includes(v))) {
        return false;
      }

      // Skills filter
      const sk = active.skills ?? [];
      if (sk.length > 0 && !sk.some((v) => (p.skills ?? []).includes(v))) {
        return false;
      }

      // Location type
      const lt = active.locationType ?? [];
      if (lt.length > 0 && !lt.includes(p.locationType)) {
        return false;
      }

      // Compensation
      const comp = active.compensation ?? [];
      if (comp.length > 0 && !comp.includes(p.compensationType)) {
        return false;
      }

      // Time posted
      const tp = active.posted ?? [];
      if (tp.length > 0 && !tp.some((range) => matchesTimeFilter(p.createdAt, range))) {
        return false;
      }

      // Search query (keyword match across title, description, org name, skills)
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const haystack = [
          p.title,
          p.description,
          p.organization?.companyName ?? "",
          p.organization?.industry ?? "",
          ...(p.skills ?? []),
          ...(p.locationDetail ?? []),
        ].join(" ");
        if (!textContains(haystack, q)) {
          return false;
        }
      }

      return true;
    });
  }, [projects, active, searchQuery]);

  const handleFilterChange = (key: string, values: string[]) => {
    setActive((prev) => ({ ...prev, [key]: values }));
  };

  return (
    <>
      {/* Filter bar */}
      <div className="mb-lg">
        <FilterBar
          filters={filters}
          active={active}
          onFilterChange={handleFilterChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Project list */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-sm">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4xl text-center">
          <p className="type-subhead text-text-secondary">
            {projects.length === 0 ? "No projects yet" : "No projects match your filters"}
          </p>
          <p className="type-body text-text-tertiary mt-2xs">
            {projects.length === 0
              ? "Be the first to publish a project on SOAR."
              : "Try adjusting your filters or search query."}
          </p>
        </div>
      )}
    </>
  );
}
