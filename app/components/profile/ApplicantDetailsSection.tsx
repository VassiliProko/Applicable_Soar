"use client";

import { useState, useRef } from "react";
import { Pencil, X, ExternalLink, Upload, FileText } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { updateUserProfile } from "@/app/actions/profiles";
import { createClient } from "@/utils/supabase/client";
import type { UserProfile } from "@/app/lib/types";

interface ApplicantDetailsSectionProps {
  profile: UserProfile;
  onUpdate: () => void;
}

export default function ApplicantDetailsSection({
  profile,
  onUpdate,
}: ApplicantDetailsSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [portfolioUrl, setPortfolioUrl] = useState(
    profile.portfolioUrl ?? ""
  );
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setFullName(profile.fullName ?? "");
    setBio(profile.bio ?? "");
    setSkills([...profile.skills]);
    setPortfolioUrl(profile.portfolioUrl ?? "");
    setResumeFile(null);
    setError("");
    setEditing(true);
  };

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

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");

    let resumeUrl: string | undefined;

    if (resumeFile) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setSaving(false);
        return;
      }

      const ext = resumeFile.name.split(".").pop();
      const path = `${user.id}/resume.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, resumeFile, { upsert: true });

      if (uploadError) {
        setError("Failed to upload resume");
        setSaving(false);
        return;
      }

      resumeUrl = path;
    }

    const result = await updateUserProfile({
      fullName: fullName.trim(),
      bio: bio.trim() || undefined,
      skills,
      portfolioUrl: portfolioUrl.trim() || undefined,
      ...(resumeUrl !== undefined ? { resumeUrl } : {}),
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
    onUpdate();
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-sm">
        <h2 className="type-title text-text-primary">Learner Profile</h2>
        {!editing && (
          <button
            onClick={startEditing}
            className="
              w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center
              text-text-tertiary hover:text-text-primary hover:bg-surface-1
              transition-colors duration-[var(--duration-micro)]
              cursor-pointer
            "
            aria-label="Edit details"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="rounded-[var(--radius-lg)] border border-border p-md">
          <div className="flex flex-col gap-sm">
            <Input
              label="Full name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError("");
              }}
              maxLength={100}
            />

            {/* Bio */}
            <div className="flex flex-col gap-[var(--space-3xs)]">
              <label className="type-caption font-medium text-text-secondary">
                About you
              </label>
              <textarea
                placeholder="A short description about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
                rows={3}
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
                {bio.length}/300
              </span>
            </div>

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
                  placeholder={
                    skills.length === 0
                      ? "Type a skill and press Enter"
                      : ""
                  }
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
                ) : profile.resumeUrl ? (
                  <>
                    <FileText size={16} className="text-primary shrink-0" />
                    <span className="truncate text-text-primary">
                      Resume uploaded
                    </span>
                    <span className="ml-auto type-caption text-text-tertiary">
                      Click to replace
                    </span>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-border p-md">
          {profile.fullName && (
            <p className="type-subhead text-text-primary">
              {profile.fullName}
            </p>
          )}

          {profile.bio && (
            <p className="type-body text-text-secondary mt-xs whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2xs mt-xs">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {profile.portfolioUrl && (
            <a
              href={profile.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-3xs mt-sm
                type-body text-text-secondary hover:text-text-primary
                transition-colors duration-[var(--duration-micro)]
              "
            >
              {profile.portfolioUrl}
              <ExternalLink size={14} />
            </a>
          )}

          {profile.resumeUrl && (
            <p className="type-caption text-text-tertiary mt-sm inline-flex items-center gap-3xs">
              <FileText size={14} />
              Resume uploaded
            </p>
          )}

          {!profile.fullName &&
            !profile.bio &&
            profile.skills.length === 0 &&
            !profile.portfolioUrl && (
              <p className="type-body text-text-tertiary">
                No details added yet. Click the edit button to add your info.
              </p>
            )}
        </div>
      )}
    </section>
  );
}
