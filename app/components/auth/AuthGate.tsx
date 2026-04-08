"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getOrganization } from "@/app/actions/organizations";
import { getUserProfile } from "@/app/actions/profiles";
import AuthModal from "./AuthModal";
import OrgSetupModal from "./OrgSetupModal";
import RoleSelectModal from "./RoleSelectModal";
import ApplicantProfileModal from "./ApplicantProfileModal";
import type { UserRole } from "@/app/lib/types";

type GatePhase =
  | "loading"
  | "auth"
  | "role-select"
  | "org-setup"
  | "learner-setup"
  | "ready";

// Note: DB stores "learner" for the learner role

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [phase, setPhase] = useState<GatePhase>("loading");

  const checkAuth = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPhase("auth");
      return;
    }

    // User is authenticated — check if they have a profile
    const { data: profile } = await getUserProfile();

    if (!profile) {
      // No profile yet — check if they have an existing org (pre-migration user)
      const { data: org } = await getOrganization();
      if (org) {
        // Existing poster user without a profile row — they're ready
        // (migration in schema.sql should have created their profile,
        //  but handle gracefully if it didn't)
        setPhase("ready");
      } else {
        setPhase("role-select");
      }
      return;
    }

    // Profile exists — check if poster needs org setup
    if (profile.role === "poster" || profile.role === "both") {
      const { data: org } = await getOrganization();
      if (!org) {
        setPhase("org-setup");
        return;
      }
    }

    setPhase("ready");
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleAuthenticated = async () => {
    // After OTP/OAuth verification, check for profile
    const { data: profile } = await getUserProfile();

    if (!profile) {
      const { data: org } = await getOrganization();
      if (org) {
        setPhase("ready");
      } else {
        setPhase("role-select");
      }
      return;
    }

    if (profile.role === "poster" || profile.role === "both") {
      const { data: org } = await getOrganization();
      if (!org) {
        setPhase("org-setup");
        return;
      }
    }

    setPhase("ready");
  };

  const handleRoleSelected = (role: UserRole) => {
    if (role === "poster") {
      setPhase("org-setup");
    } else {
      // learner or both
      setPhase("learner-setup");
    }
  };

  const handleOrgComplete = () => {
    setPhase("ready");
  };

  const handleApplicantComplete = () => {
    setPhase("ready");
  };

  if (phase === "loading") {
    return (
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
    );
  }

  if (phase === "auth") {
    return (
      <>
        <div className="opacity-30 pointer-events-none select-none blur-[2px]">
          {children}
        </div>
        <AuthModal
          open
          onClose={() => {
            window.location.href = "/";
          }}
          onAuthenticated={handleAuthenticated}
        />
      </>
    );
  }

  if (phase === "role-select") {
    return (
      <>
        <div className="opacity-30 pointer-events-none select-none blur-[2px]">
          {children}
        </div>
        <RoleSelectModal open onComplete={handleRoleSelected} />
      </>
    );
  }

  if (phase === "org-setup") {
    return (
      <>
        <div className="opacity-30 pointer-events-none select-none blur-[2px]">
          {children}
        </div>
        <OrgSetupModal open onComplete={handleOrgComplete} />
      </>
    );
  }

  if (phase === "learner-setup") {
    return (
      <>
        <div className="opacity-30 pointer-events-none select-none blur-[2px]">
          {children}
        </div>
        <ApplicantProfileModal open onComplete={handleApplicantComplete} />
      </>
    );
  }

  // phase === "ready"
  return <>{children}</>;
}
