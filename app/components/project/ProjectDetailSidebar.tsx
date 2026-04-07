"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Share2,
  Check,
  Hand,
  CalendarDays,
  Globe,
  Building2,
  ArrowLeftRight,
  Clock,
  DollarSign,
  Crown,
  MapPin,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import AuthModal from "@/app/components/auth/AuthModal";
import RoleSelectModal from "@/app/components/auth/RoleSelectModal";
import ApplicantProfileModal from "@/app/components/auth/ApplicantProfileModal";
import ApplyModal from "./ApplyModal";
import { getApplicationStatus } from "@/app/actions/applications";
import { getUserProfile } from "@/app/actions/profiles";
import { getOrganization } from "@/app/actions/organizations";
import { createClient } from "@/utils/supabase/client";
import type { ProjectWithMeta, UserProfile, UserRole } from "@/app/lib/types";
import { PROJECT_TYPE_OPTIONS } from "@/app/lib/types";

interface OrgInfo {
  companyName: string;
  website: string | null;
  industry: string;
}

const LOCATION_ICONS = {
  remote: Globe,
  "on-site": Building2,
  hybrid: ArrowLeftRight,
} as const;

const LOCATION_LABELS: Record<string, string> = {
  remote: "Remote",
  "on-site": "In Person",
  hybrid: "Hybrid",
};

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
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [applicantSetupOpen, setApplicantSetupOpen] = useState(false);
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
  const LocationIcon = LOCATION_ICONS[project.locationType] ?? Globe;
  const projectTypeLabel = project.projectType
    ? PROJECT_TYPE_OPTIONS.find((o) => o.value === project.projectType)?.label
    : null;

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
      // No profile — need role selection first
      setRoleSelectOpen(true);
      return;
    }

    setProfile(existingProfile);
    setApplyOpen(true);
  };

  const handleAuthenticated = async () => {
    setAuthOpen(false);
    // After auth, check profile
    const { data: existingProfile } = await getUserProfile();
    if (!existingProfile) {
      // Check for existing org (legacy poster)
      const { data: org } = await getOrganization();
      if (!org) {
        setRoleSelectOpen(true);
      } else {
        // Legacy poster — open apply modal directly
        setApplyOpen(true);
      }
      return;
    }

    setProfile(existingProfile);
    setApplyOpen(true);
  };

  const handleRoleSelected = (role: UserRole) => {
    setRoleSelectOpen(false);
    if (role === "applicant") {
      setApplicantSetupOpen(true);
    } else {
      // They chose poster, but we can still let them apply
      // Open apply modal after org setup would be done elsewhere
      setApplyOpen(true);
    }
  };

  const handleApplicantSetupComplete = async () => {
    setApplicantSetupOpen(false);
    // Refresh profile
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

        {/* Quick details */}
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-2xs text-text-secondary">
            <CalendarDays size={16} className="text-text-tertiary shrink-0" />
            <span className="type-body">
              Posted {formatPostedDate(project.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2xs text-text-secondary">
            <LocationIcon size={16} className="text-text-tertiary shrink-0" />
            <span className="type-body">
              {project.locationDetail.length > 0
                ? project.locationDetail.length === 1
                  ? project.locationDetail[0].split(",")[0]
                  : `${project.locationDetail.length} locations`
                : LOCATION_LABELS[project.locationType]}
            </span>
          </div>

          {project.timeCommitment && (
            <div className="flex items-center gap-2xs text-text-secondary">
              <Clock size={16} className="text-text-tertiary shrink-0" />
              <span className="type-body">{project.timeCommitment}</span>
            </div>
          )}

          <div className="flex items-center gap-2xs text-text-secondary">
            <DollarSign size={16} className="text-text-tertiary shrink-0" />
            <span className="type-body">
              {project.compensationAmount &&
              project.compensationAmount !== "$"
                ? project.compensationAmount
                : "Unpaid"}
            </span>
          </div>

          {projectTypeLabel && (
            <div className="flex items-center gap-2xs text-text-secondary">
              <Crown size={16} className="text-text-tertiary shrink-0" />
              <span className="type-body">{projectTypeLabel}</span>
            </div>
          )}

          {project.locationDetail.length > 0 && (
            <div className="flex items-start gap-2xs text-text-secondary">
              <MapPin size={16} className="text-text-tertiary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-4xs min-w-0">
                {project.locationDetail.map((addr, i) => (
                  <span key={i} className="type-body text-text-secondary truncate">
                    {addr}
                  </span>
                ))}
              </div>
            </div>
          )}
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

      {/* Role selection */}
      <RoleSelectModal
        open={roleSelectOpen}
        onComplete={handleRoleSelected}
      />

      {/* Applicant profile setup */}
      <ApplicantProfileModal
        open={applicantSetupOpen}
        onComplete={handleApplicantSetupComplete}
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
