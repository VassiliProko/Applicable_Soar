"use client";

import { useState } from "react";
import { BANNER_COLORS } from "@/app/lib/types";
import CreateProjectForm from "./CreateProjectForm";
import ProjectSidebar from "./ProjectSidebar";

export default function CreatePageContent() {
  const [bannerType, setBannerType] = useState<"color" | "image">("color");
  const [bannerValue, setBannerValue] = useState<string>(BANNER_COLORS[0]);

  return (
    <div className="flex gap-xl flex-col lg:flex-row max-w-[66vw] mx-auto">
      {/* Sidebar — left */}
      <div className="w-full lg:w-56 shrink-0 order-2 lg:order-1">
        <ProjectSidebar
          bannerType={bannerType}
          bannerValue={bannerValue}
          onBannerChange={(type, value) => {
            setBannerType(type);
            setBannerValue(value);
          }}
        />
      </div>

      {/* Main form — right */}
      <div className="flex-1 min-w-0 order-1 lg:order-2 w-full">
        <CreateProjectForm />
      </div>
    </div>
  );
}
