"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getOrganization,
  updateOrganization,
} from "@/app/actions/organizations";
import { getProjects } from "@/app/actions/projects";
import { getUserProfile } from "@/app/actions/profiles";
import { getMyApplications } from "@/app/actions/applications";
import AuthGate from "@/app/components/auth/AuthGate";
import OrgSetupModal from "@/app/components/auth/OrgSetupModal";
import ApplicantProfileModal from "@/app/components/auth/ApplicantProfileModal";
import { updateUserProfile } from "@/app/actions/profiles";
import ProfileHeader from "./ProfileHeader";
import OrganizationSection from "./OrganizationSection";
import PlanSection from "./PlanSection";
import MyProjectsSection from "./MyProjectsSection";
import AppliedProjectsSection from "./AppliedProjectsSection";
import ApplicantDetailsSection from "./ApplicantDetailsSection";
import type {
  OrganizationFormData,
  ProjectFormData,
  UserProfile,
  ApplicationWithProject,
} from "@/app/lib/types";

interface UserInfo {
  id: string;
  email?: string;
  name?: string;
}

interface OrgData {
  id: string;
  companyName: string;
  website: string | null;
  description: string;
  industry: string;
  type: string;
}

type ProjectItem = ProjectFormData & {
  id: string;
  userId: string;
  createdAt: string;
};

export default function ProfileContent() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<OrgData | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [applications, setApplications] = useState<ApplicationWithProject[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [orgSetupOpen, setOrgSetupOpen] = useState(false);
  const [applicantSetupOpen, setApplicantSetupOpen] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setLoading(false);
      return;
    }

    const meta = authUser.user_metadata ?? {};
    setUser({
      id: authUser.id,
      email: authUser.email,
      name: meta.full_name || meta.name || undefined,
    });

    // Fetch all data in parallel
    const [profileResult, orgResult, projectsResult, appsResult] =
      await Promise.all([
        getUserProfile(),
        getOrganization(),
        getProjects({ userId: authUser.id }),
        getMyApplications(),
      ]);

    if (profileResult.data) {
      setProfile(profileResult.data);
    }

    if (orgResult.data) {
      setOrganization(orgResult.data as OrgData);
    }

    if (projectsResult.data) {
      setProjects(projectsResult.data as ProjectItem[]);
    }

    if (appsResult.data) {
      setApplications(appsResult.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOrgUpdate = async (
    data: OrganizationFormData
  ): Promise<{ error?: string }> => {
    const result = await updateOrganization({
      companyName: data.companyName,
      website: data.website,
      description: data.description,
      industry: data.industry,
      type: data.type,
    });

    if (result.error) {
      return { error: result.error };
    }

    // Refresh org data
    const orgResult = await getOrganization();
    if (orgResult.data) {
      setOrganization(orgResult.data as OrgData);
    }

    return {};
  };

  const handleProfileUpdate = async () => {
    const result = await getUserProfile();
    if (result.data) {
      setProfile(result.data);
    }
  };

  const handleApplicationsUpdate = async () => {
    const result = await getMyApplications();
    if (result.data) {
      setApplications(result.data);
    }
  };

  const handleAddPosterRole = async () => {
    await updateUserProfile({ role: "both" });
    setOrgSetupOpen(true);
  };

  const handleOrgSetupComplete = async () => {
    setOrgSetupOpen(false);
    await loadData();
  };

  const handleAddApplicantRole = async () => {
    await updateUserProfile({ role: "both" });
    setApplicantSetupOpen(true);
  };

  const handleApplicantSetupComplete = async () => {
    setApplicantSetupOpen(false);
    await loadData();
  };

  const role = profile?.role ?? null;
  const isPoster = role === "poster" || role === "both";
  const isLearner = role === "learner" || role === "both";

  return (
    <AuthGate>
      {loading ? (
        <div className="max-w-[720px] mx-auto flex flex-col gap-lg">
          {/* Skeleton loader */}
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 rounded-full bg-surface-2 animate-pulse" />
            <div className="flex-1">
              <div className="h-6 w-40 bg-surface-2 rounded animate-pulse" />
              <div className="h-4 w-56 bg-surface-2 rounded animate-pulse mt-2" />
            </div>
          </div>
          <div className="h-32 bg-surface-2 rounded-[var(--radius-lg)] animate-pulse" />
          <div className="h-20 bg-surface-2 rounded-[var(--radius-lg)] animate-pulse" />
          <div className="h-40 bg-surface-2 rounded-[var(--radius-lg)] animate-pulse" />
        </div>
      ) : (
        <div className="max-w-[720px] mx-auto flex flex-col gap-2xl">
          <ProfileHeader user={user} role={role} />

          {/* Applicant sections first (applied projects + details) */}
          {isLearner && (
            <>
              <AppliedProjectsSection
                applications={applications}
                onUpdate={handleApplicationsUpdate}
              />
              <ApplicantDetailsSection
                profile={profile!}
                onUpdate={handleProfileUpdate}
              />
            </>
          )}

          {/* Poster sections (my projects + organization) */}
          {isPoster && (
            <>
              <MyProjectsSection projects={projects} />
              <OrganizationSection
                organization={organization}
                onUpdate={handleOrgUpdate}
              />
            </>
          )}

          {/* Show for users without a profile (legacy) */}
          {!profile && (
            <>
              <OrganizationSection
                organization={organization}
                onUpdate={handleOrgUpdate}
              />
              <MyProjectsSection projects={projects} />
            </>
          )}

          <PlanSection />

          {/* Role switching prompt */}
          {profile && role === "learner" && (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-md text-center">
              <p className="type-body text-text-secondary">
                Want to post your own projects?
              </p>
              <button
                onClick={handleAddPosterRole}
                className="type-body text-primary hover:underline mt-2xs cursor-pointer bg-transparent border-none"
              >
                Set up your organization
              </button>
            </div>
          )}

          {profile && role === "poster" && (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-md text-center">
              <p className="type-body text-text-secondary">
                Looking for opportunities?
              </p>
              <button
                onClick={handleAddApplicantRole}
                className="type-body text-primary hover:underline mt-2xs cursor-pointer bg-transparent border-none"
              >
                Set up your learner profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* Role switching modals */}
      <OrgSetupModal
        open={orgSetupOpen}
        onComplete={handleOrgSetupComplete}
      />
      <ApplicantProfileModal
        open={applicantSetupOpen}
        onComplete={handleApplicantSetupComplete}
      />
    </AuthGate>
  );
}
