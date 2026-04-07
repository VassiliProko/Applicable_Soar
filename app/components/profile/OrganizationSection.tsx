"use client";

import { useState } from "react";
import { Pencil, ChevronDown, ExternalLink } from "lucide-react";
import { Popover } from "@mantine/core";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import {
  INDUSTRY_OPTIONS,
  ORG_TYPE_OPTIONS,
  type OrganizationFormData,
} from "@/app/lib/types";

interface OrgData {
  id: string;
  companyName: string;
  website: string | null;
  description: string;
  industry: string;
  type: string;
}

interface OrganizationSectionProps {
  organization: OrgData | null;
  onUpdate: (data: OrganizationFormData) => Promise<{ error?: string }>;
}

export default function OrganizationSection({
  organization,
  onUpdate,
}: OrganizationSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<OrganizationFormData>({
    companyName: "",
    website: "",
    description: "",
    industry: "",
    type: "for-profit",
  });
  const [industryOpen, setIndustryOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const startEditing = () => {
    if (!organization) return;
    setForm({
      companyName: organization.companyName,
      website: organization.website || "",
      description: organization.description,
      industry: organization.industry,
      type: organization.type as OrganizationFormData["type"],
    });
    setError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError("");
  };

  const update = (field: keyof OrganizationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    if (!form.industry) {
      setError("Please select an industry");
      return;
    }

    setSaving(true);
    setError("");

    const result = await onUpdate({
      companyName: form.companyName.trim(),
      website: form.website.trim(),
      description: form.description.trim(),
      industry: form.industry,
      type: form.type,
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
  };

  const selectedType = ORG_TYPE_OPTIONS.find((o) => o.value === form.type);

  if (!organization) {
    return (
      <section>
        <h2 className="type-title text-text-primary mb-sm">Organization</h2>
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-xl text-center">
          <p className="type-body text-text-secondary">
            No organization set up yet.
          </p>
        </div>
      </section>
    );
  }

  const orgTypeLabel =
    ORG_TYPE_OPTIONS.find((o) => o.value === organization.type)?.label ||
    organization.type;

  return (
    <section>
      <div className="flex items-center justify-between mb-sm">
        <h2 className="type-title text-text-primary">Organization</h2>
        {!editing && (
          <button
            onClick={startEditing}
            className="
              w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center
              text-text-tertiary hover:text-text-primary hover:bg-surface-1
              transition-colors duration-[var(--duration-micro)]
              cursor-pointer
            "
            aria-label="Edit organization"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {editing ? (
        /* Edit mode */
        <div className="rounded-[var(--radius-lg)] border border-border p-md">
          <div className="flex flex-col gap-sm">
            <Input
              label="Company / Organization name"
              placeholder="Acme Inc."
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              maxLength={100}
            />

            <Input
              label="Website (optional)"
              placeholder="https://example.com"
              type="url"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
            />

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
                    <span
                      className={
                        form.industry
                          ? "text-text-primary"
                          : "text-text-tertiary"
                      }
                    >
                      {form.industry || "Select industry"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-text-tertiary transition-transform duration-[var(--duration-micro)] ${industryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </Popover.Target>
                <Popover.Dropdown className="!p-1 !border-border !bg-background !rounded-[var(--radius-md)] shadow-mid">
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
                          ${
                            form.industry === industry
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
                <Popover.Dropdown className="!p-1 !border-border !bg-background !rounded-[var(--radius-md)] shadow-mid">
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
                        ${
                          form.type === opt.value
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

          {error && <p className="type-caption text-error mt-sm">{error}</p>}

          <div className="flex items-center gap-xs mt-lg">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save changes"
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelEditing}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* View mode */
        <div className="rounded-[var(--radius-lg)] border border-border p-md">
          <p className="type-subhead text-text-primary">
            {organization.companyName}
          </p>

          <div className="flex items-center gap-2xs mt-xs flex-wrap">
            {organization.industry && (
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">
                {organization.industry}
              </span>
            )}
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">
              {orgTypeLabel}
            </span>
          </div>

          {organization.website && (
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-3xs mt-sm
                type-body text-text-secondary hover:text-text-primary
                transition-colors duration-[var(--duration-micro)]
              "
            >
              {organization.website}
              <ExternalLink size={14} />
            </a>
          )}

          {organization.description && (
            <p className="type-body text-text-secondary mt-sm">
              {organization.description}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
