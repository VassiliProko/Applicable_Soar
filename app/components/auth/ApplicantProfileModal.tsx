"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, FileText } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { updateUserProfile } from "@/app/actions/profiles";
import { createClient } from "@/utils/supabase/client";

interface ApplicantProfileModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function ApplicantProfileModal({
  open,
  onComplete,
}: ApplicantProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
    if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("Your name is required");
      return;
    }

    setLoading(true);
    setError("");

    let resumeUrl: string | undefined;

    // Upload resume if provided
    if (resumeFile) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const ext = resumeFile.name.split(".").pop();
      const path = `${user.id}/resume.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, resumeFile, { upsert: true });

      if (uploadError) {
        setError("Failed to upload resume");
        setLoading(false);
        return;
      }

      // For private buckets, we store the path (not a public URL)
      resumeUrl = path;
    }

    const result = await updateUserProfile({
      fullName: fullName.trim(),
      skills,
      portfolioUrl: portfolioUrl.trim() || undefined,
      resumeUrl,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onComplete();
  };

  if (!open) return null;

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
          mx-md max-h-[90vh] overflow-y-auto
          animate-[modalIn_var(--duration-base)_var(--ease-enter)_forwards]
        "
      >
        {/* Header */}
        <div className="px-lg pt-lg pb-sm">
          <h2 className="type-title">Set up your profile</h2>
          <p className="type-body text-text-secondary mt-3xs">
            Tell us about yourself so project owners can learn more about you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-lg pb-lg">
          <div className="flex flex-col gap-sm">
            {/* Full Name */}
            <Input
              ref={nameRef}
              label="Full name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError("");
              }}
              maxLength={100}
            />

            {/* Skills */}
            <div className="flex flex-col gap-[var(--space-3xs)]">
              <label className="type-caption font-medium text-text-secondary">
                Skills
              </label>
              <div
                className="
                  min-h-[var(--input-height)] px-[var(--input-px)] py-2xs
                  rounded-[var(--radius-sm)]
                  border border-border bg-background
                  transition-all duration-[var(--duration-micro)]
                  hover:border-border-hover
                  focus-within:border-primary focus-within:ring-2 focus-within:ring-[var(--primary-focus-ring)]
                  flex flex-wrap items-center gap-2xs
                "
              >
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="
                      inline-flex items-center gap-1
                      px-2 py-0.5 rounded-full
                      bg-surface-2 text-text-primary
                      type-caption font-medium
                    "
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-error transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={skills.length === 0 ? "Type a skill and press Enter" : ""}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                  className="
                    flex-1 min-w-[120px] h-7
                    bg-transparent text-text-primary type-body
                    placeholder:text-text-tertiary
                    outline-none border-none
                  "
                />
              </div>
              <span className="type-caption text-text-tertiary">
                {skills.length}/15 &mdash; press Enter or comma to add
              </span>
            </div>

            {/* Portfolio URL */}
            <Input
              label="Portfolio / LinkedIn (optional)"
              placeholder="https://linkedin.com/in/yourname"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />

            {/* Resume Upload */}
            <div className="flex flex-col gap-[var(--space-3xs)]">
              <label className="type-caption font-medium text-text-secondary">
                Resume (optional)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setResumeFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="
                  h-[var(--input-height)] px-[var(--input-px)]
                  rounded-[var(--radius-sm)]
                  border border-dashed border-border bg-background
                  text-left type-body text-text-secondary
                  hover:border-border-hover hover:bg-surface-1
                  transition-all duration-[var(--duration-micro)]
                  flex items-center gap-2xs
                  cursor-pointer
                "
              >
                {resumeFile ? (
                  <>
                    <FileText size={16} className="text-primary shrink-0" />
                    <span className="truncate text-text-primary">
                      {resumeFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="ml-auto shrink-0 hover:text-error transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={16} className="shrink-0" />
                    Upload PDF, DOC, or DOCX
                  </>
                )}
              </button>
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
