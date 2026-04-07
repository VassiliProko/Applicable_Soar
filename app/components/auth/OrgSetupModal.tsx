"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Popover } from "@mantine/core";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { createOrganization } from "@/app/actions/organizations";
import {
  INDUSTRY_OPTIONS,
  ORG_TYPE_OPTIONS,
  type OrganizationFormData,
} from "@/app/lib/types";

interface OrgSetupModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function OrgSetupModal({ open, onComplete }: OrgSetupModalProps) {
  const [form, setForm] = useState<OrganizationFormData>({
    companyName: "",
    website: "",
    description: "",
    industry: "",
    type: "for-profit",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [industryOpen, setIndustryOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    if (!form.industry) {
      setError("Please select an industry");
      return;
    }

    setLoading(true);
    setError("");

    const result = await createOrganization({
      companyName: form.companyName.trim(),
      website: form.website.trim(),
      description: form.description.trim(),
      industry: form.industry,
      type: form.type,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onComplete();
  };

  const update = (field: keyof OrganizationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  if (!open) return null;

  const selectedType = ORG_TYPE_OPTIONS.find((o) => o.value === form.type);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Modal */}
      <div
        className="
          relative z-10 w-full max-w-[520px]
          bg-background rounded-[var(--radius-lg)]
          shadow-high border border-border
          mx-md
          animate-[modalIn_var(--duration-base)_var(--ease-enter)_forwards]
        "
      >
        {/* Header */}
        <div className="px-lg pt-lg pb-sm">
          <h2 className="type-title">Set up your organization</h2>
          <p className="type-body text-text-secondary mt-3xs">
            Tell us about who you&apos;re creating projects for.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-lg pb-lg">
          <div className="flex flex-col gap-sm">
            {/* Company Name */}
            <Input
              ref={nameRef}
              label="Company / Organization name"
              placeholder="Acme Inc."
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              maxLength={100}
            />

            {/* Website (optional) */}
            <Input
              label="Website (optional)"
              placeholder="https://example.com"
              type="url"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
            />

            {/* Description */}
            <div className="flex flex-col gap-[var(--space-3xs)]">
              <label className="type-caption font-medium text-text-secondary">
                Description
              </label>
              <textarea
                placeholder="Briefly describe what your organization does..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                maxLength={500}
                rows={3}
                className="
                  px-[var(--input-px)] py-2xs
                  rounded-[var(--radius-sm)]
                  border border-border bg-background text-text-primary type-body
                  transition-all duration-[var(--duration-micro)]
                  [transition-timing-function:var(--ease-micro)]
                  placeholder:text-text-tertiary
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)]
                  hover:border-border-hover
                  resize-none
                "
              />
              <span className="type-caption text-text-tertiary text-right">
                {form.description.length}/500
              </span>
            </div>

            {/* Industry Dropdown */}
            <div className="flex flex-col gap-[var(--space-3xs)]">
              <label className="type-caption font-medium text-text-secondary">
                Industry
              </label>
              <Popover
                opened={industryOpen}
                onChange={setIndustryOpen}
                position="bottom-start"
                width="target"
                transitionProps={{
                  transition: {
                    in: { opacity: 1, transform: "scaleY(1)" },
                    out: { opacity: 0, transform: "scaleY(0.95)" },
                    common: { transformOrigin: "top center" },
                    transitionProperty: "opacity, transform",
                  },
                  duration: 200,
                }}
              >
                <Popover.Target>
                  <button
                    type="button"
                    onClick={() => setIndustryOpen((o) => !o)}
                    className="
                      h-[var(--input-height)] px-[var(--input-px)]
                      rounded-[var(--radius-sm)]
                      border border-border bg-background
                      text-left type-body
                      transition-all duration-[var(--duration-micro)]
                      hover:border-border-hover
                      flex items-center justify-between
                      cursor-pointer
                    "
                  >
                    <span className={form.industry ? "text-text-primary" : "text-text-tertiary"}>
                      {form.industry || "Select industry"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-text-tertiary transition-transform duration-[var(--duration-micro)] ${industryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </Popover.Target>
                <Popover.Dropdown
                  className="!p-1 !border-border !bg-background !rounded-[var(--radius-md)] shadow-mid"
                >
                  <div className="max-h-48 overflow-y-auto">
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => {
                          update("industry", industry);
                          setIndustryOpen(false);
                        }}
                        className={`
                          w-full text-left px-xs py-2xs rounded-[var(--radius-sm)]
                          type-body transition-colors duration-[var(--duration-micro)]
                          cursor-pointer
                          ${form.industry === industry
                            ? "bg-primary-tint text-primary font-medium"
                            : "text-text-primary hover:bg-surface-1"
                          }
                        `}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </Popover.Dropdown>
              </Popover>
            </div>

            {/* Organization Type Dropdown */}
            <div className="flex flex-col gap-[var(--space-3xs)]">
              <label className="type-caption font-medium text-text-secondary">
                Organization type
              </label>
              <Popover
                opened={typeOpen}
                onChange={setTypeOpen}
                position="bottom-start"
                width="target"
                transitionProps={{
                  transition: {
                    in: { opacity: 1, transform: "scaleY(1)" },
                    out: { opacity: 0, transform: "scaleY(0.95)" },
                    common: { transformOrigin: "top center" },
                    transitionProperty: "opacity, transform",
                  },
                  duration: 200,
                }}
              >
                <Popover.Target>
                  <button
                    type="button"
                    onClick={() => setTypeOpen((o) => !o)}
                    className="
                      h-[var(--input-height)] px-[var(--input-px)]
                      rounded-[var(--radius-sm)]
                      border border-border bg-background
                      text-left type-body
                      transition-all duration-[var(--duration-micro)]
                      hover:border-border-hover
                      flex items-center justify-between
                      cursor-pointer
                    "
                  >
                    <span className="text-text-primary">
                      {selectedType?.label ?? "Select type"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-text-tertiary transition-transform duration-[var(--duration-micro)] ${typeOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </Popover.Target>
                <Popover.Dropdown
                  className="!p-1 !border-border !bg-background !rounded-[var(--radius-md)] shadow-mid"
                >
                  {ORG_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        update("type", opt.value);
                        setTypeOpen(false);
                      }}
                      className={`
                        w-full text-left px-xs py-2xs rounded-[var(--radius-sm)]
                        type-body transition-colors duration-[var(--duration-micro)]
                        cursor-pointer
                        ${form.type === opt.value
                          ? "bg-primary-tint text-primary font-medium"
                          : "text-text-primary hover:bg-surface-1"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </Popover.Dropdown>
              </Popover>
            </div>
          </div>

          {error && (
            <p className="type-caption text-error mt-sm">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
