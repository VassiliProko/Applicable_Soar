"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Paperclip, X, Save, Send, Globe, Lock, ChevronDown, Check, FileText } from "lucide-react";
import Button from "@/app/components/ui/Button";

type Visibility = "public" | "private";

const VISIBILITY_OPTIONS: {
  value: Visibility;
  label: string;
  description: string;
  icon: typeof Globe;
}[] = [
  {
    value: "public",
    label: "Public",
    description: "Shown on your profile and Discover page. Indexed by search engines.",
    icon: Globe,
  },
  {
    value: "private",
    label: "Private",
    description: "Only people with the link can see this project. Hidden from Discover and search engines.",
    icon: Lock,
  },
];

const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".tiff", ".tif", ".ico", ".heic", ".heif", ".avif", ".pdf"];
const ACCEPTED_TYPES = ACCEPTED_EXTENSIONS.map((ext) => {
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".svg") return "image/svg+xml";
  return `image/${ext.slice(1)}`;
}).join(",");

interface Attachment {
  name: string;
  url: string;
  type: string;
}

function isValidFile(file: File) {
  if (file.type && (file.type.startsWith("image/") || file.type === "application/pdf")) return true;
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export default function ProjectSidebar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .filter(isValidFile)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachments((prev) => [
            ...prev,
            { name: file.name, url: ev.target?.result as string, type: file.type },
          ]);
        };
        reader.readAsDataURL(file);
      });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-md sticky top-20">
      {/* Attachments title */}
      <div className="flex items-center gap-2xs">
        <Paperclip size={16} className="text-text-secondary" />
        <span className="type-body font-medium text-text-primary">Attachments</span>
      </div>

      {/* Drop zone — always square */}
      <div
        className={`w-full aspect-[4/3] rounded-[var(--radius-md)] border-2 border-dashed overflow-hidden transition-colors duration-[var(--duration-base)] flex flex-col items-center justify-center gap-3 -mt-xs ${
          dragging
            ? "border-primary bg-primary-tint"
            : "border-border hover:border-border-hover bg-surface-1"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-1.5 rounded-[var(--radius-sm)] bg-white border border-border text-text-primary type-body font-medium hover:border-border-hover transition-colors duration-[var(--duration-micro)] cursor-pointer"
        >
          Choose Files
        </button>
        <span className="type-caption text-text-tertiary">or drag files here</span>
      </div>

      {/* File list */}
      {attachments.length > 0 && (
        <div className="flex flex-col gap-1.5 -mt-xs">
          {attachments.map((att, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPreviewIndex(i)}
              className="w-full flex items-center gap-2xs px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-surface-1 transition-colors duration-[var(--duration-micro)] cursor-pointer group/row text-left"
            >
              {/* Thumbnail */}
              {att.type.startsWith("image/") ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-8 h-8 rounded-[var(--radius-xs)] object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-[var(--radius-xs)] bg-surface-2 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-text-secondary" />
                </div>
              )}
              {/* Name */}
              <span className="type-caption text-text-primary truncate flex-1 min-w-0">
                {att.name}
              </span>
              {/* Remove */}
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAttachment(i);
                }}
                className="opacity-0 group-hover/row:opacity-100 transition-opacity text-text-tertiary hover:text-text-primary shrink-0 cursor-pointer"
              >
                <X size={14} />
              </span>
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Actions */}
      <div className="flex flex-col gap-sm">
        <Button variant="primary" size="md" className="w-full">
          <Send size={16} />
          Publish Project
        </Button>
        <Button variant="secondary" size="md" className="w-full">
          <Save size={16} />
          Save as Draft
        </Button>
      </div>

      {/* Visibility dropdown */}
      <div className="relative">
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2xs px-sm py-xs rounded-[var(--radius-md)] border border-border-divider bg-surface hover:bg-surface-dark/5 transition-colors duration-[var(--duration-micro)] cursor-pointer"
          onClick={() => setVisibilityOpen(!visibilityOpen)}
        >
          <span className="flex items-center gap-2xs">
            {visibility === "public" ? <Globe size={16} /> : <Lock size={16} />}
            <span className="type-body font-medium">
              {visibility === "public" ? "Public" : "Private"}
            </span>
          </span>
          <ChevronDown
            size={14}
            className={`text-text-secondary transition-transform duration-[var(--duration-micro)] ${visibilityOpen ? "rotate-180" : ""}`}
          />
        </button>

        {visibilityOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setVisibilityOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2xs z-20 rounded-[var(--radius-md)] border border-border-divider bg-surface shadow-lg overflow-hidden">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = visibility === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full text-left px-sm py-xs flex items-start gap-2xs cursor-pointer hover:bg-surface-dark/5 transition-colors duration-[var(--duration-micro)] ${selected ? "bg-surface-dark/5" : ""}`}
                    onClick={() => {
                      setVisibility(option.value);
                      setVisibilityOpen(false);
                    }}
                  >
                    <Icon size={16} className="mt-[3px] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="type-body font-medium">{option.label}</div>
                      <div className="type-caption text-text-secondary">
                        {option.description}
                      </div>
                    </div>
                    {selected && <Check size={16} className="mt-[3px] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* File preview overlay — portaled to body to escape stacking contexts */}
      {previewIndex !== null && attachments[previewIndex] && createPortal(
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
            {attachments[previewIndex].type.startsWith("image/") ? (
              <img
                src={attachments[previewIndex].url}
                alt={attachments[previewIndex].name}
                className="w-full"
              />
            ) : (
              <iframe
                src={attachments[previewIndex].url}
                title={attachments[previewIndex].name}
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
