"use client";

import { useRef, useCallback } from "react";
import { ImagePlus, Check, Save, Send } from "lucide-react";
import Button from "@/app/components/ui/Button";

const BANNER_COLORS = ["#1B2838", "#2D4A3E", "#3B2D4A"] as const;

interface ProjectSidebarProps {
  bannerType: "color" | "image";
  bannerValue: string;
  onBannerChange: (type: "color" | "image", value: string) => void;
}

export default function ProjectSidebar({
  bannerType,
  bannerValue,
  onBannerChange,
}: ProjectSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        onBannerChange("image", ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onBannerChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        onBannerChange("image", ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onBannerChange]
  );

  const bannerStyle =
    bannerType === "image"
      ? {
          backgroundImage: `url(${bannerValue})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: bannerValue };

  return (
    <div className="flex flex-col gap-md sticky top-20">
      {/* Image upload — square */}
      <div
        className="w-full aspect-square rounded-[var(--radius-md)] overflow-hidden relative cursor-pointer group"
        style={bannerStyle}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-[var(--duration-base)] flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-base)] flex flex-col items-center gap-2 text-white">
            <ImagePlus size={20} />
            <span className="type-caption font-medium">Upload Image</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Color presets */}
      <div className="flex items-center gap-2xs">
        {BANNER_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="flex-1 aspect-[2/1] rounded-[var(--radius-sm)] border-2 transition-all duration-[var(--duration-micro)] cursor-pointer flex items-center justify-center"
            style={{
              backgroundColor: color,
              borderColor:
                bannerType === "color" && bannerValue === color
                  ? "var(--primary)"
                  : "transparent",
            }}
            onClick={() => onBannerChange("color", color)}
          >
            {bannerType === "color" && bannerValue === color && (
              <Check size={14} className="text-white" />
            )}
          </button>
        ))}
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
    </div>
  );
}
