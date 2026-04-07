"use client";

import CreateProjectForm from "./CreateProjectForm";
import ProjectSidebar from "./ProjectSidebar";

export default function CreatePageContent() {
  return (
    <div className="flex gap-xl flex-col lg:flex-row w-full max-w-[90vw] lg:max-w-[66vw] mx-auto">
      {/* Sidebar — left */}
      <div className="w-full lg:w-72 shrink-0 order-2 lg:order-1">
        <ProjectSidebar />
      </div>

      {/* Main form — right */}
      <div className="flex-1 min-w-0 order-1 lg:order-2 w-full">
        <CreateProjectForm />
      </div>
    </div>
  );
}
