"use client";

import { useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Tag,
  ShieldCheck,
  Eye,
  X,
  AlignLeft,
} from "lucide-react";
import { ProjectFormData, INITIAL_PROJECT } from "@/app/lib/types";
import BannerPicker from "./BannerPicker";

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
    <div className="bg-surface-1 rounded-[var(--radius-md)] p-md flex flex-col gap-sm">
      {title && (
        <h3 className="type-body font-semibold text-text-primary">{title}</h3>
      )}
      {children}
    </div>
  );
}

/* ── Main form ───────────────────────────────────────── */

export default function CreateProjectForm() {
  const [form, setForm] = useState<ProjectFormData>(INITIAL_PROJECT);

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
      {/* Banner */}
      <BannerPicker
        bannerType={form.bannerType}
        bannerValue={form.bannerValue}
        onBannerChange={(type, value) => {
          update("bannerType", type);
          update("bannerValue", value);
        }}
      />

      {/* Title */}
      <input
        type="text"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Project Name"
        className="type-headline bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary w-full"
      />

      {/* Date & Duration */}
      <Section title="Schedule">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
          <FieldGroup icon={Calendar} label="Start Date">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="h-[var(--input-height)] px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
            />
          </FieldGroup>
          <FieldGroup icon={Calendar} label="End Date">
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="h-[var(--input-height)] px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
            />
          </FieldGroup>
          <FieldGroup icon={Clock} label="Duration">
            <input
              type="text"
              value={form.duration}
              onChange={(e) => update("duration", e.target.value)}
              placeholder="e.g. 2 weeks"
              className="h-[var(--input-height)] px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
            />
          </FieldGroup>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location">
        <FieldGroup icon={MapPin} label="Type">
          <PillSelect
            options={[
              { label: "Remote", value: "remote" as const },
              { label: "On-site", value: "on-site" as const },
              { label: "Hybrid", value: "hybrid" as const },
            ]}
            value={form.locationType}
            onChange={(v) => update("locationType", v)}
          />
        </FieldGroup>
        {form.locationType !== "remote" && (
          <FieldGroup icon={MapPin} label="Location">
            <input
              type="text"
              value={form.locationDetail}
              onChange={(e) => update("locationDetail", e.target.value)}
              placeholder="City, State, Country"
              className="h-[var(--input-height)] px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
            />
          </FieldGroup>
        )}
      </Section>

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
              className="h-[var(--input-height)] px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
            />
          </FieldGroup>
        )}
      </Section>

      {/* Description */}
      <Section title="Description">
        <FieldGroup icon={AlignLeft} label="Project Description">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the project, what you're looking for, deliverables, and expectations..."
            rows={6}
            className="px-[var(--input-px)] py-3 rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)] resize-y"
          />
        </FieldGroup>
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
            className="h-[var(--input-height)] px-[var(--input-px)] rounded-[var(--radius-sm)] border border-border bg-background text-text-primary type-body placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)] transition-all duration-[var(--duration-micro)]"
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
