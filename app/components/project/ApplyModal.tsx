"use client";

import { useState } from "react";
import { X } from "lucide-react";
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

export default function ApplyModal({
  open,
  projectId,
  projectTitle,
  profile,
  onClose,
  onApplied,
}: ApplyModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await applyToProject({
      projectId,
      message: message.trim() || undefined,
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
          mx-md
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

          {/* Profile summary */}
          {profile && (
            <div className="rounded-[var(--radius-md)] bg-surface-1 p-sm mb-md">
              <p className="type-caption font-medium text-text-secondary mb-2xs">
                Your profile
              </p>
              {profile.fullName && (
                <p className="type-body text-text-primary">
                  {profile.fullName}
                </p>
              )}
              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2xs mt-2xs">
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
              {profile.portfolioUrl && (
                <p className="type-caption text-text-tertiary mt-2xs truncate">
                  {profile.portfolioUrl}
                </p>
              )}
            </div>
          )}

          {/* Message */}
          <div className="flex flex-col gap-[var(--space-3xs)]">
            <label className="type-caption font-medium text-text-secondary">
              Message (optional)
            </label>
            <textarea
              placeholder="Tell the project owner why you're interested..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={4}
              className="
                px-[var(--input-px)] py-2xs
                rounded-[var(--radius-sm)]
                border border-border bg-background text-text-primary type-body
                transition-all duration-[var(--duration-micro)]
                placeholder:text-text-tertiary
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)]
                hover:border-border-hover
                resize-none
              "
            />
            <span className="type-caption text-text-tertiary text-right">
              {message.length}/1000
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
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
