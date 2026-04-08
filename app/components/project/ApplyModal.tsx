"use client";

import { useState } from "react";
import { X, Pencil, ExternalLink } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import { applyToProject } from "@/app/actions/applications";
import type { UserProfile } from "@/app/lib/types";

interface ApplyModalProps {
  open: boolean;
  projectId: string;
  projectTitle: string;
  profile: UserProfile | null;
  onClose: () => void;
  onApplied: () => void;
}

function getInitial(name?: string | null) {
  return (name || "?").charAt(0).toUpperCase();
}

export default function ApplyModal({
  open,
  projectId,
  projectTitle,
  profile,
  onClose,
  onApplied,
}: ApplyModalProps) {
  const [why, setWhy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profileComplete = !!(profile?.fullName?.trim() && profile?.bio?.trim());
  const canSubmit = profileComplete && why.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const result = await applyToProject({
      projectId,
      message: why.trim(),
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onApplied();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative z-10 w-full max-w-[520px]
          bg-background rounded-[var(--radius-lg)]
          shadow-high border border-border
          mx-md max-h-[90vh] overflow-y-auto
          animate-[modalIn_var(--duration-base)_var(--ease-enter)_forwards]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-lg pt-lg pb-sm">
          <h2 className="type-title">Apply to project</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors duration-[var(--duration-micro)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-lg pb-lg">
          {/* Project name */}
          <p className="type-body text-text-secondary mb-md">
            You&apos;re applying to{" "}
            <span className="font-medium text-text-primary">
              {projectTitle}
            </span>
          </p>

          {/* Profile preview card */}
          <div className="rounded-[var(--radius-md)] border border-border p-md mb-md">
            <div className="flex items-center justify-between mb-sm">
              <p className="type-caption font-medium text-text-tertiary">
                Your profile will be shared with the project owner
              </p>
              <Link
                href="/profile"
                className="
                  inline-flex items-center gap-3xs
                  px-2 py-1 rounded-[var(--radius-sm)]
                  type-caption font-medium text-text-secondary
                  hover:text-text-primary hover:bg-surface-1
                  transition-colors duration-[var(--duration-micro)]
                "
              >
                <Pencil size={12} />
                Edit
              </Link>
            </div>

            {/* Avatar + Name + Bio */}
            <div className="flex items-start gap-sm">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-semibold text-white shrink-0 select-none"
                style={{
                  background:
                    "linear-gradient(180deg, var(--primary-hover) 0%, var(--primary-active) 100%)",
                }}
              >
                {getInitial(profile?.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                {profile?.fullName ? (
                  <p className="type-body font-medium text-text-primary">
                    {profile.fullName}
                  </p>
                ) : (
                  <p className="type-body text-text-tertiary italic">
                    No name added
                  </p>
                )}
                {profile?.bio ? (
                  <p className="type-caption text-text-secondary mt-3xs line-clamp-2">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="type-caption text-text-tertiary italic mt-3xs">
                    No description added
                  </p>
                )}
              </div>
            </div>

            {/* Skills */}
            {profile && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2xs mt-sm">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-full bg-surface-2 type-caption text-text-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            {profile?.portfolioUrl && (
              <div className="mt-sm">
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-3xs
                    type-caption text-text-tertiary hover:text-text-primary
                    transition-colors duration-[var(--duration-micro)]
                  "
                >
                  {profile.portfolioUrl}
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Incomplete profile warning */}
            {!profileComplete && (
              <div className="mt-sm pt-sm border-t border-border">
                <p className="type-caption text-text-tertiary">
                  Complete your name and description to apply.{" "}
                  <Link
                    href="/profile"
                    className="text-primary hover:underline"
                  >
                    Edit profile
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Why are you interested */}
          <div className="flex flex-col gap-[var(--space-3xs)]">
            <label className="type-caption font-medium text-text-secondary">
              Why are you interested?
            </label>
            <textarea
              placeholder="Tell the project owner why this project interests you..."
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              maxLength={200}
              rows={3}
              disabled={!profileComplete}
              className="
                px-[var(--input-px)] py-2xs
                rounded-[var(--radius-sm)]
                border border-border bg-background text-text-primary type-body
                transition-all duration-[var(--duration-micro)]
                placeholder:text-text-tertiary
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)]
                hover:border-border-hover
                resize-none
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
            <span className="type-caption text-text-tertiary text-right">
              {why.length}/200
            </span>
          </div>

          {error && (
            <p className="type-caption text-error mt-sm">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-md"
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : !profileComplete ? (
              "Complete your profile to apply"
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
