"use client";

import { useRef, useCallback } from "react";
import { ImagePlus, Check } from "lucide-react";
import { BANNER_COLORS } from "@/app/lib/types";

interface BannerPickerProps {
  bannerType: "color" | "image";
  bannerValue: string;
  onBannerChange: (type: "color" | "image", value: string) => void;
}

export default function BannerPicker({
  bannerType,
  bannerValue,
  onBannerChange,
}: BannerPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        onBannerChange("image", result);
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
        const result = ev.target?.result as string;
        onBannerChange("image", result);
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
    <div className="flex flex-col gap-xs">
      {/* Banner preview */}
      <div
        className="w-full aspect-[5/3] rounded-[var(--radius-md)] overflow-hidden relative cursor-pointer group"
        style={bannerStyle}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-[var(--duration-base)] flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-base)] flex flex-col items-center gap-2 text-white">
            <ImagePlus size={24} />
            <span className="text-sm font-medium">
              Click or drag to upload
            </span>
          </div>
        </div>
      </div>

      {/* Color presets */}
      <div className="flex items-center gap-2xs">
        {BANNER_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="w-8 h-8 rounded-full border-2 transition-all duration-[var(--duration-micro)] cursor-pointer flex items-center justify-center shrink-0"
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
