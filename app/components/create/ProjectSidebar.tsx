"use client";

import { Palette, Save, Send } from "lucide-react";
import Button from "@/app/components/ui/Button";

const THEME_COLORS = [
  { label: "Midnight", value: "#1B2838" },
  { label: "Forest", value: "#2D4A3E" },
  { label: "Plum", value: "#3B2D4A" },
  { label: "Ember", value: "#4A2D2D" },
  { label: "Ocean", value: "#2D3B4A" },
  { label: "Sand", value: "#4A3B2D" },
];

export default function ProjectSidebar() {
  return (
    <div className="flex flex-col gap-md sticky top-20">
      {/* Theme options */}
      <div className="bg-surface-1 rounded-[var(--radius-md)] p-md flex flex-col gap-sm">
        <h3 className="type-caption font-semibold text-text-secondary flex items-center gap-2xs uppercase tracking-wider">
          <Palette size={14} />
          Page Theme
        </h3>
        <div className="grid grid-cols-3 gap-2xs">
          {THEME_COLORS.map((theme) => (
            <button
              key={theme.value}
              type="button"
              className="flex flex-col items-center gap-1 p-2 rounded-[var(--radius-sm)] hover:bg-surface-2 transition-colors duration-[var(--duration-micro)] cursor-pointer"
            >
              <div
                className="w-full aspect-[5/3] rounded-[var(--radius-xs)]"
                style={{ backgroundColor: theme.value }}
              />
              <span className="type-caption text-text-tertiary">
                {theme.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2xs">
        <Button variant="primary" size="lg" className="w-full">
          <Send size={16} />
          Publish Project
        </Button>
        <Button variant="secondary" size="md" className="w-full">
          <Save size={16} />
          Save as Draft
        </Button>
      </div>

      {/* Status hint */}
      <p className="type-caption text-text-tertiary text-center">
        Your project will be reviewed before going live.
      </p>
    </div>
  );
}
