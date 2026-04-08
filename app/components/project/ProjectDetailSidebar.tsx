"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Share2,
  Check,
  Hand,
  CalendarDays,
  X,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import AuthModal from "@/app/components/auth/AuthModal";
import ApplicantProfileModal from "@/app/components/auth/ApplicantProfileModal";
import ApplyModal from "./ApplyModal";
import { getApplicationStatus } from "@/app/actions/applications";
import { getUserProfile, createUserProfile, updateUserProfile } from "@/app/actions/profiles";
import { createClient } from "@/utils/supabase/client";
import type { ProjectWithMeta, UserProfile } from "@/app/lib/types";

interface OrgInfo {
  companyName: string;
  website: string | null;
  industry: string;
}

function formatPostedDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getFaviconUrl(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    const url = new URL(
      website.startsWith("http") ? website : `https://${website}`
    );
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return null;
  }
}

interface ProjectDetailSidebarProps {
  project: ProjectWithMeta;
  organization: OrgInfo | null;
}

export default function ProjectDetailSidebar({
  project,
  organization,
}: ProjectDetailSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const [isOwner, setIsOwner] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [learnerSetupOpen, setLearnerSetupOpen] = useState(false);
  const [posterNeedsLearnerOpen, setPosterNeedsLearnerOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkStatus = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCheckingAuth(false);
      return;
    }

    // Check if this user owns the project
    if (user.id === project.userId) {
      setIsOwner(true);
      setCheckingAuth(false);
      return;
    }

    // Check application status and profile in parallel
    const [appResult, profileResult] = await Promise.all([
      getApplicationStatus(project.id),
      getUserProfile(),
    ]);

    if (appResult.data) {
      setApplicationStatus(appResult.data.status);
    }

    if (profileResult.data) {
      setProfile(profileResult.data);
    }

    setCheckingAuth(false);
  }, [project.id, project.userId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const favicon = getFaviconUrl(organization?.website);
  const handleShare = () => {
    const url = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInterested = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated — open auth modal
      setAuthOpen(true);
      return;
    }

    // Check if they have a profile
    const { data: existingProfile } = await getUserProfile();

    if (!existingProfile) {
      // No profile — auto-create as learner, then open setup
      await createUserProfile({ role: "learner" });
      setLearnerSetupOpen(true);
      return;
    }

    // Has profile — check if they're poster-only (no learner profile set up)
    if (existingProfile.role === "poster") {
      // Show the "you need a learner profile" popup
      setPosterNeedsLearnerOpen(true);
      return;
    }

    // They have a learner or both role — open apply modal
    setProfile(existingProfile);
    setApplyOpen(true);
  };

  const handleAuthenticated = async () => {
    setAuthOpen(false);

    // After auth, check for existing profile
    const { data: existingProfile } = await getUserProfile();

    if (!existingProfile) {
      // New user — auto-create learner profile, then open setup
      await createUserProfile({ role: "learner" });
      setLearnerSetupOpen(true);
      return;
    }

    // Existing user who signed in
    if (existingProfile.role === "poster") {
      setPosterNeedsLearnerOpen(true);
      return;
    }

    setProfile(existingProfile);
    setApplyOpen(true);
  };

  const handlePosterCreateLearner = async () => {
    // Upgrade poster to "both" role
    setPosterNeedsLearnerOpen(false);
    await updateUserProfile({ role: "both" });
    setLearnerSetupOpen(true);
  };

  const handleLearnerSetupComplete = async () => {
    setLearnerSetupOpen(false);
    // Refresh profile and open apply modal
    const { data: refreshed } = await getUserProfile();
    if (refreshed) setProfile(refreshed);
    setApplyOpen(true);
  };

  const handleApplied = () => {
    setApplyOpen(false);
    setApplicationStatus("applied");
  };

  const hasApplied =
    applicationStatus === "applied" || applicationStatus === "accepted";

  return (
    <>
      <div className="flex flex-col gap-md sticky top-20">
        {/* Organization */}
        <div className="flex items-center gap-sm">
          {favicon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={favicon}
              alt={organization?.companyName ?? ""}
              width={40}
              height={40}
              className="w-10 h-10 rounded-[var(--radius-md)] bg-surface-1 object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-surface-dark flex items-center justify-center">
              <span className="text-white font-semibold text-base">
                {(organization?.companyName ?? project.title)?.[0]?.toUpperCase() ??
                  "S"}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="type-body font-medium text-text-primary truncate">
              {organization?.companyName ?? "Individual"}
            </p>
            {organization?.industry && (
              <p className="type-body text-text-tertiary truncate">
                {organization.industry}
              </p>
            )}
          </div>
        </div>

        {/* Posted date */}
        <div className="flex items-center gap-2xs text-text-secondary">
          <CalendarDays size={16} className="text-text-tertiary shrink-0" />
          <span className="type-body">
            Posted {formatPostedDate(project.createdAt)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-sm">
          {!isOwner && !checkingAuth && (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleInterested}
              disabled={hasApplied}
            >
              {hasApplied ? (
                <>
                  <Check size={16} />
                  Applied
                </>
              ) : (
                <>
                  <Hand size={16} />
                  I&apos;m Interested
                </>
              )}
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            className="w-full !text-text-secondary hover:!text-text-primary !border-border hover:!border-border-hover hover:!bg-surface-1 active:!bg-surface-2"
            onClick={handleShare}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied to clipboard
              </>
            ) : (
              <>
                <Share2 size={16} />
                Share
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Auth modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Poster needs learner profile popup */}
      {posterNeedsLearnerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setPosterNeedsLearnerOpen(false)}
          />
          <div
            className="
              relative z-10 w-full max-w-[440px]
              bg-background rounded-[var(--radius-lg)]
              shadow-high border border-border
              mx-md
              animate-[modalIn_var(--duration-base)_var(--ease-enter)_forwards]
            "
          >
            <div className="flex items-center justify-between px-lg pt-lg pb-sm">
              <h2 className="type-title">Create a learner profile</h2>
              <button
                onClick={() => setPosterNeedsLearnerOpen(false)}
                className="p-1 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors duration-[var(--duration-micro)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-lg pb-lg">
              <p className="type-body text-text-secondary mb-md">
                To apply to projects, you need to set up a learner profile. This
                lets project owners learn about you and your interests.
              </p>
              <div className="flex gap-sm">
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={handlePosterCreateLearner}
                >
                  Set up profile
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setPosterNeedsLearnerOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learner profile setup */}
      <ApplicantProfileModal
        open={learnerSetupOpen}
        onComplete={handleLearnerSetupComplete}
      />

      {/* Apply modal */}
      <ApplyModal
        open={applyOpen}
        projectId={project.id}
        projectTitle={project.title}
        profile={profile}
        onClose={() => setApplyOpen(false)}
        onApplied={handleApplied}
      />
    </>
  );
}
