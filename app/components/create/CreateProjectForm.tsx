"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Calendar,
  CalendarRange,
  MapPin,
  DollarSign,
  Clock,
  ChevronDown,
  X,
  Search,
  Globe,
  Building2,
  ArrowLeftRight,
} from "lucide-react";
import { Popover } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import type { MantineTransition } from "@mantine/core";
import { ProjectFormData, INITIAL_PROJECT } from "@/app/lib/types";

/* ── Dropdown transition (drop down from top) ──────── */

const dropDown: MantineTransition = {
  in: { opacity: 1, transform: "scale(1)" },
  out: { opacity: 0, transform: "scale(0.9)" },
  common: { transformOrigin: "top center" },
  transitionProperty: "opacity, transform",
};

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
    <Popover opened={open} onChange={setOpen} position="bottom-start" shadow="md" width="target" transitionProps={{ transition: dropDown, duration: 150 }}>
      <Popover.Target>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-sm px-[var(--input-px)] py-3 rounded-[var(--radius-md)] border border-border bg-background hover:border-border-hover transition-all duration-[var(--duration-micro)] cursor-pointer text-left"
        >
          <MapPin size={18} className="text-text-tertiary shrink-0" />
          {hasLocation ? (
            <>
              <span className="type-body text-text-secondary truncate min-w-0">
                {locationDetail || "No address"}
              </span>
              <span className="flex-1" />
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-2 type-body font-medium text-text-primary shrink-0">
                {locationType === "remote" && <Globe size={14} />}
                {locationType === "on-site" && <Building2 size={14} />}
                {locationType === "hybrid" && <ArrowLeftRight size={14} />}
                {TYPE_LABELS[locationType]}
              </span>
            </>
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

      <Popover.Dropdown className="!p-0 overflow-hidden !bg-surface-3 !border-border">
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
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
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
            <div className="flex items-center gap-2xs px-3 mx-1.5 mb-1.5 rounded-[var(--radius-sm)] border border-border bg-surface-2">
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
                    className="flex items-start gap-sm px-3 py-2 rounded-[var(--radius-sm)] type-caption text-text-secondary hover:bg-surface-2 hover:text-text-primary cursor-pointer text-left transition-colors duration-[var(--duration-micro)]"
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
                  <span className="truncate text-text-primary">{locationDetail}</span>
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
  const [commitmentOpen, setCommitmentOpen] = useState(false);
  const [compEditing, setCompEditing] = useState(false);
  const compInputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex items-start gap-sm px-[var(--input-px)] py-3 rounded-[var(--radius-md)] border border-border bg-background overflow-hidden">
        <Calendar size={18} className="text-text-tertiary shrink-0 mt-0.5" />
        <span className="type-body text-text-primary shrink-0 mt-0.5">Timeline</span>
        <span className="flex-1" />

        {/* Right-aligned controls: row on lg, column on small */}
        <div className="flex lg:flex-row lg:items-center flex-col items-end gap-1.5">
          {/* Date range picker */}
          <Popover
            opened={calendarOpen}
            onChange={setCalendarOpen}
            position="bottom-end"
            shadow="md"
            transitionProps={{ transition: dropDown, duration: 150 }}
          >
            <Popover.Target>
              <button
                type="button"
                onClick={() => setCalendarOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] hover:bg-surface-1 text-text-secondary hover:text-text-primary transition-all duration-[var(--duration-micro)] cursor-pointer min-w-0"
              >
                <span className="type-body truncate">
                  {dateRange[0] && dateRange[1]
                    ? `${new Date(dateRange[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${new Date(dateRange[1]).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : "Select dates"}
                </span>
                <CalendarRange size={16} className="text-text-tertiary shrink-0" />
              </button>
            </Popover.Target>
            <Popover.Dropdown className="datepicker-dark !bg-surface-3 !border-border">
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
                    update("startDate", val[0]);
                    update("endDate", val[1]);
                    update("duration", `${fmt(val[0])} — ${fmt(val[1])}`);
                    setCalendarOpen(false);
                  }
                }}
              />
            </Popover.Dropdown>
          </Popover>

          {/* Divider: vertical on lg, horizontal on small */}
          <span className="hidden lg:block w-px h-5 bg-border shrink-0" />

          {/* Time commitment dropdown */}
          <Popover
            opened={commitmentOpen}
            onChange={setCommitmentOpen}
            position="bottom-end"
            shadow="md"
            transitionProps={{ transition: dropDown, duration: 150 }}
          >
            <Popover.Target>
              <button
                type="button"
                onClick={() => setCommitmentOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] hover:bg-surface-1 text-text-secondary hover:text-text-primary transition-all duration-[var(--duration-micro)] cursor-pointer min-w-0"
              >
                <Clock size={16} className="text-text-tertiary shrink-0" />
                <span className="type-body truncate">
                  {form.timeCommitment || "Hours"}
                </span>
                <ChevronDown size={16} className="text-text-tertiary shrink-0" />
              </button>
            </Popover.Target>
            <Popover.Dropdown className="!p-1.5 !bg-surface-3 !border-border !min-w-[150px]">
              {[
                { label: "< 10", value: "<10 hours" },
                { label: "10-20", value: "10 - 20 hours" },
                { label: "20+", value: "20+ hours" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    update("timeCommitment", opt.value);
                    setCommitmentOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] type-body transition-colors duration-[var(--duration-micro)] cursor-pointer ${
                    form.timeCommitment === opt.value
                      ? "bg-surface-2 text-text-primary font-medium"
                      : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-text-tertiary">hours</span>
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <input
                  type="text"
                  placeholder="Custom"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        update("timeCommitment", val);
                        setCommitmentOpen(false);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-surface-2 border-none outline-none type-body text-text-primary placeholder:text-text-tertiary"
                />
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      </div>

      {/* Location */}
      <LocationPicker
        locationType={form.locationType}
        locationDetail={form.locationDetail}
        onTypeChange={(v) => update("locationType", v)}
        onDetailChange={(v) => update("locationDetail", v)}
      />

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
          rows={5}
          maxLength={2000}
          className="w-full px-[var(--input-px)] py-3 rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-colors duration-[var(--duration-micro)] overflow-y-auto"
          style={{ maxHeight: "300px" }}
        />
        <span className={`absolute bottom-2 right-3 type-caption ${form.description.length > 1800 ? "text-error" : "text-text-tertiary"}`}>
          {form.description.length}/2,000
        </span>
      </div>

      {/* Compensation */}
      <div className="flex items-center gap-sm px-[var(--input-px)] h-[48px] rounded-[var(--radius-md)] border border-border bg-background">
        <DollarSign size={18} className="text-text-tertiary shrink-0" />
        <span className="type-body text-text-primary shrink-0">Compensation</span>
        <div className="flex-1 relative flex items-center justify-end">
          <input
            ref={compInputRef}
            type="text"
            value={form.compensationAmount}
            onChange={(e) => update("compensationAmount", e.target.value)}
            onBlur={() => {
              if (!form.compensationAmount) setCompEditing(false);
            }}
            placeholder="e.g. $500"
            className={`absolute inset-0 text-right bg-transparent border-none outline-none type-body text-text-secondary placeholder:text-text-tertiary transition-opacity duration-[var(--duration-base)] ${
              compEditing || form.compensationAmount ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
          <button
            type="button"
            onClick={() => {
              setCompEditing(true);
              requestAnimationFrame(() => compInputRef.current?.focus());
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] hover:bg-surface-1 text-text-secondary hover:text-text-primary transition-all duration-[var(--duration-base)] cursor-pointer ${
              compEditing || form.compensationAmount ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <span className="type-body">None</span>
          </button>
        </div>
      </div>
    </form>
  );
}
