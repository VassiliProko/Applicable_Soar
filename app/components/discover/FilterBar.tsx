"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface ActiveFilters {
  [key: string]: string[];
}

interface FilterBarProps {
  filters: FilterDef[];
  active: ActiveFilters;
  onFilterChange: (key: string, values: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Dropdown                                                           */
/* ------------------------------------------------------------------ */

function FilterDropdown({
  filter,
  selected,
  onChange,
}: {
  filter: FilterDef;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const displayLabel =
    selected.length === 0
      ? filter.label
      : selected.length === 1
        ? filter.options.find((o) => o.value === selected[0])?.label ?? selected[0]
        : filter.options.find((o) => o.value === selected[0])?.label ?? selected[0];

  const extraCount = selected.length > 1 ? selected.length - 1 : 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-3 h-[var(--btn-height-sm)] rounded-[var(--radius-full)] type-body text-sm font-medium transition-colors duration-[var(--duration-micro)] cursor-pointer whitespace-nowrap ${
          selected.length > 0
            ? "bg-[rgba(123,232,180,0.15)] text-[var(--color-primary-active)]"
            : "bg-surface-1 text-text-secondary hover:bg-surface-2"
        }`}
      >
        <span>{displayLabel}</span>
        {extraCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-[var(--radius-full)] bg-[rgba(123,232,180,0.25)] text-[var(--color-primary-active)] text-xs font-semibold">
            +{extraCount}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform duration-[var(--duration-micro)] ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[200px] max-h-[280px] overflow-y-auto bg-background border border-border rounded-[var(--radius-md)] shadow-mid z-50"
          style={{ animation: "menuIn var(--duration-base) var(--ease-enter)" }}
        >
          <div className="p-1">
            {filter.options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] hover:bg-surface-1 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="w-4 h-4 rounded accent-[var(--color-primary-active)] cursor-pointer"
                />
                <span className="type-body text-sm text-text-primary">{opt.label}</span>
              </label>
            ))}
            {filter.options.length === 0 && (
              <p className="px-3 py-2 type-caption text-text-tertiary">No options</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Bar                                                         */
/* ------------------------------------------------------------------ */

export default function FilterBar({
  filters,
  active,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  const hasActive = Object.values(active).some((v) => v.length > 0) || searchQuery.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filter pills */}
      {filters.map((f) => (
        <FilterDropdown
          key={f.key}
          filter={f}
          selected={active[f.key] ?? []}
          onChange={(values) => onFilterChange(f.key, values)}
        />
      ))}

      {/* Clear all */}
      {hasActive && (
        <button
          onClick={() => {
            filters.forEach((f) => onFilterChange(f.key, []));
            onSearchChange("");
          }}
          className="inline-flex items-center gap-1 px-2 h-[var(--btn-height-sm)] text-text-tertiary hover:text-text-secondary type-caption cursor-pointer transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          placeholder="Search keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-[var(--btn-height-sm)] pl-9 pr-3 w-[200px] rounded-[var(--radius-full)] bg-surface-1 border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-[var(--border-focus)] transition-colors"
        />
      </div>
    </div>
  );
}
