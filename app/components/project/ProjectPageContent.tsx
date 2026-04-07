"use client";

import ProjectDetailSidebar from "./ProjectDetailSidebar";
import ProjectDetailContent from "./ProjectDetailContent";
import type { ProjectWithMeta } from "@/app/lib/types";

interface OrgInfo {
  companyName: string;
  website: string | null;
  industry: string;
}

interface ProjectPageContentProps {
  project: ProjectWithMeta;
  organization: OrgInfo | null;
}

export default function ProjectPageContent({
  project,
  organization,
}: ProjectPageContentProps) {
  return (
    <div className="flex gap-xl flex-col lg:flex-row w-full max-w-[1440px] mx-auto">
      {/* Sidebar — left */}
      <div className="w-full lg:w-80 shrink-0 order-2 lg:order-1">
        <ProjectDetailSidebar
          project={project}
          organization={organization}
        />
      </div>

      {/* Main content — right */}
      <div className="flex-1 min-w-0 order-1 lg:order-2 w-full">
        <ProjectDetailContent project={project} />
      </div>
    </div>
  );
}
