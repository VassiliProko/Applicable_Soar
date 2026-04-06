"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Tag,
  ShieldCheck,
  Eye,
  X,
  AlignLeft,
  Search,
  Globe,
  Building2,
  ArrowLeftRight,
} from "lucide-react";
import { Popover } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { ProjectFormData, INITIAL_PROJECT } from "@/app/lib/types";

/* ── Shared field wrapper ────────────────────────────── */

function FieldGroup({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3xs">
      <label className="type-caption font-medium text-text-secondary flex items-center gap-2xs">
        <Icon size={14} className="text-text-tertiary" />
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Toggle switch ───────────────────────────────────── */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-[var(--duration-micro)] cursor-pointer
        ${checked ? "bg-primary" : "bg-surface-3"}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-mid
          transition-transform duration-[var(--duration-base)] [transition-timing-function:var(--ease-enter)]
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

/* ── Pill selector ───────────────────────────────────── */

function PillSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2xs">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            px-3 h-[var(--btn-height-sm)] rounded-full type-caption font-medium
            transition-all duration-[var(--duration-micro)] cursor-pointer
            ${
              value === opt.value
                ? "bg-surface-dark text-white"
                : "bg-surface-1 text-text-secondary hover:bg-surface-2"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Skills tag input ────────────────────────────────── */

function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col gap-2xs">
      <div className="flex flex-wrap gap-2xs">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-2.5 h-7 bg-surface-1 text-text-primary type-caption font-medium rounded-full"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              className="text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
          }
        }}
        placeholder="Type a skill and press Enter"
        className="h-[var(--input-height)] px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
      />
    </div>
  );
}

/* ── Section card ────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-1 rounded-[var(--radius-md)] p-2xs flex flex-col gap-sm">
      {title && (
        <h3 className="type-body font-semibold text-text-primary">{title}</h3>
      )}
      {children}
    </div>
  );
}

/* ── Location picker ────────────────────────────────── */

const LOCATION_PRESETS = [
  { label: "Remote", value: "remote" as const, icon: Globe },
  { label: "In Person", value: "on-site" as const, icon: Building2 },
  { label: "Hybrid", value: "hybrid" as const, icon: ArrowLeftRight },
] as const;

const TYPE_LABELS: Record<string, string> = {
  remote: "Remote",
  "on-site": "In Person",
  hybrid: "Hybrid",
};

interface AddressSuggestion {
  display_name: string;
  place_id: number;
}

function LocationPicker({
  locationType,
  locationDetail,
  onTypeChange,
  onDetailChange,
}: {
  locationType: "remote" | "on-site" | "hybrid";
  locationDetail: string;
  onTypeChange: (v: "remote" | "on-site" | "hybrid") => void;
  onDetailChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasLocation = touched || locationDetail || locationType !== "remote";

  // Fetch address suggestions from Nominatim (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = search.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(trimmed)}`,
          { headers: { "Accept-Language": "en" } }
        );
        const data: AddressSuggestion[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const selectPreset = (preset: (typeof LOCATION_PRESETS)[number]) => {
    setTouched(true);
    onTypeChange(preset.value);
    if (preset.value === "remote") {
      onDetailChange("");
      setOpen(false);
    }
  };

  const selectAddress = (address: string) => {
    onDetailChange(address);
    if (locationType === "remote") onTypeChange("on-site");
    setTouched(true);
    setSearch("");
    setSuggestions([]);
    setOpen(false);
  };

  const submitCustomLocation = () => {
    const trimmed = search.trim();
    if (trimmed) selectAddress(trimmed);
  };

  return (
    <Popover opened={open} onChange={setOpen} position="bottom-start" shadow="md" width="target">
      <Popover.Target>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-sm px-[var(--input-px)] py-3 rounded-[var(--radius-md)] border border-border bg-background hover:border-border-hover transition-all duration-[var(--duration-micro)] cursor-pointer text-left"
        >
          <MapPin size={18} className="text-text-tertiary shrink-0" />
          {hasLocation ? (
            <div className="flex items-center gap-2xs min-w-0 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2 type-caption font-medium text-text-primary shrink-0">
                {locationType === "remote" && <Globe size={12} />}
                {locationType === "on-site" && <Building2 size={12} />}
                {locationType === "hybrid" && <ArrowLeftRight size={12} />}
                {TYPE_LABELS[locationType]}
              </span>
              {locationDetail && (
                <span className="type-body text-text-secondary truncate">
                  {locationDetail}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col min-w-0">
              <span className="type-body font-medium text-text-primary">
                Add Project Location
              </span>
              <span className="type-caption text-text-tertiary">
                Remote, in person, or hybrid
              </span>
            </div>
          )}
        </button>
      </Popover.Target>

      <Popover.Dropdown className="!p-0 overflow-hidden">
        {/* Type presets */}
        <div className="p-1.5 flex flex-col">
          <span className="px-3 py-1 type-caption font-medium text-text-tertiary">Type</span>
          {LOCATION_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isActive = locationType === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`flex items-center gap-sm px-3 py-2 rounded-[var(--radius-sm)] type-body transition-colors duration-[var(--duration-micro)] cursor-pointer ${
                  isActive
                    ? "bg-surface-2 text-text-primary font-medium"
                    : "text-text-secondary hover:bg-surface-1"
                }`}
              >
                <Icon size={16} className="text-text-tertiary" />
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Address section — only for non-remote */}
        {locationType !== "remote" && (
          <div className="border-t border-border">
            <span className="px-4 pt-2 pb-1 block type-caption font-medium text-text-tertiary">
              Address <span className="font-normal">(optional)</span>
            </span>

            {/* Search input */}
            <div className="flex items-center gap-2xs px-3 mx-1.5 mb-1.5 rounded-[var(--radius-sm)] border border-border bg-background">
              <Search size={14} className="text-text-tertiary shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitCustomLocation();
                  }
                }}
                placeholder="Search for an address..."
                autoFocus
                className="h-9 flex-1 bg-transparent border-none outline-none text-text-primary type-body placeholder:text-text-tertiary"
              />
            </div>

            {/* Suggestions */}
            {(suggestions.length > 0 || loadingSuggestions) && (
              <div className="px-1.5 pb-1.5 flex flex-col max-h-48 overflow-y-auto">
                {loadingSuggestions && suggestions.length === 0 && (
                  <span className="px-3 py-2 type-caption text-text-tertiary">Searching...</span>
                )}
                {suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => selectAddress(s.display_name)}
                    className="flex items-start gap-sm px-3 py-2 rounded-[var(--radius-sm)] type-caption text-text-secondary hover:bg-surface-1 cursor-pointer text-left transition-colors duration-[var(--duration-micro)]"
                  >
                    <MapPin size={14} className="text-text-tertiary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{s.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Current address */}
            {locationDetail && (
              <div className="px-3 pb-2 border-t border-border pt-2 mx-1.5 mb-1">
                <div className="flex items-center gap-2xs type-caption text-text-secondary">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{locationDetail}</span>
                  <button
                    type="button"
                    onClick={() => onDetailChange("")}
                    className="ml-auto text-text-tertiary hover:text-text-primary cursor-pointer shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}

/* ── Main form ───────────────────────────────────────── */

export default function CreateProjectForm() {
  const [form, setForm] = useState<ProjectFormData>(INITIAL_PROJECT);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);

  const update = useCallback(
    <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <form
      className="flex flex-col gap-md"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Title */}
      <input
        type="text"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Project Name"
        className="type-headline bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary w-full"
      />

      {/* Timeline */}
      <div className="bg-surface-1 rounded-[var(--radius-md)] p-2xs flex items-center gap-sm">
        <h3 className="type-body font-semibold text-text-primary shrink-0">Project Timeline</h3>
        <div className="flex items-center gap-2xs flex-1 min-w-0">
          <input
            type="text"
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            placeholder="e.g. 2 weeks, March — April"
            className="h-10 flex-1 px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
          />
          <Popover
            opened={calendarOpen}
            onChange={setCalendarOpen}
            position="bottom-end"
            shadow="md"
          >
            <Popover.Target>
              <button
                type="button"
                onClick={() => setCalendarOpen((o) => !o)}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] border border-border bg-background text-text-tertiary hover:text-text-primary hover:border-border-hover transition-all duration-[var(--duration-micro)] cursor-pointer"
              >
                <Calendar size={16} />
              </button>
            </Popover.Target>
            <Popover.Dropdown>
              <DatePicker
                type="range"
                value={dateRange}
                onChange={(val) => {
                  setDateRange(val);
                  if (val[0] && val[1]) {
                    const fmt = (d: string) =>
                      new Date(d).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    update("duration", `${fmt(val[0])} — ${fmt(val[1])}`);
                    setCalendarOpen(false);
                  }
                }}
              />
            </Popover.Dropdown>
          </Popover>
        </div>
      </div>

      {/* Description */}
      <div className="relative">
        <textarea
          value={form.description}
          onChange={(e) => {
            if (e.target.value.length <= 2000) {
              update("description", e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
            }
          }}
          placeholder="Describe the project, what you're looking for, deliverables, and expectations..."
          rows={3}
          maxLength={2000}
          className="w-full px-[var(--input-px)] py-3 rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-colors duration-[var(--duration-micro)] overflow-y-auto"
          style={{ maxHeight: "300px" }}
        />
        <span className={`absolute bottom-2 right-3 type-caption ${form.description.length > 1800 ? "text-error" : "text-text-tertiary"}`}>
          {form.description.length}/2,000
        </span>
      </div>

      {/* Location */}
      <LocationPicker
        locationType={form.locationType}
        locationDetail={form.locationDetail}
        onTypeChange={(v) => update("locationType", v)}
        onDetailChange={(v) => update("locationDetail", v)}
      />

      {/* Compensation */}
      <Section title="Compensation">
        <FieldGroup icon={DollarSign} label="Type">
          <PillSelect
            options={[
              { label: "Paid", value: "paid" as const },
              { label: "Unpaid", value: "unpaid" as const },
              { label: "Equity", value: "equity" as const },
            ]}
            value={form.compensationType}
            onChange={(v) => update("compensationType", v)}
          />
        </FieldGroup>
        {form.compensationType !== "unpaid" && (
          <FieldGroup
            icon={DollarSign}
            label={
              form.compensationType === "equity"
                ? "Equity Details"
                : "Amount"
            }
          >
            <input
              type="text"
              value={form.compensationAmount}
              onChange={(e) => update("compensationAmount", e.target.value)}
              placeholder={
                form.compensationType === "equity"
                  ? "e.g. 2% equity"
                  : "e.g. $500 / project"
              }
              className="h-[var(--input-height)] w-full px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
            />
          </FieldGroup>
        )}
      </Section>


      {/* Skills */}
      <Section title="Required Skills">
        <FieldGroup icon={Tag} label="Skills">
          <SkillsInput
            skills={form.skills}
            onChange={(skills) => update("skills", skills)}
          />
        </FieldGroup>
      </Section>

      {/* Options */}
      <Section title="Options">
        <FieldGroup icon={Users} label="Capacity">
          <input
            type="text"
            value={form.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            placeholder="e.g. 3 people"
            className="h-[var(--input-height)] w-full px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
          />
        </FieldGroup>

        <div className="flex items-center justify-between">
          <label className="type-body text-text-primary flex items-center gap-2xs">
            <ShieldCheck size={16} className="text-text-tertiary" />
            Require Approval
          </label>
          <Toggle
            checked={form.requireApproval}
            onChange={(v) => update("requireApproval", v)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="type-body text-text-primary flex items-center gap-2xs">
            <Eye size={16} className="text-text-tertiary" />
            Public Visibility
          </label>
          <Toggle
            checked={form.visibility === "public"}
            onChange={(v) => update("visibility", v ? "public" : "private")}
          />
        </div>
      </Section>
    </form>
  );
}
