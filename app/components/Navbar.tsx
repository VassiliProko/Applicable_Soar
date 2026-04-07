"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Settings, LogOut, UserRound } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/actions/auth";
import AuthModal from "@/app/components/auth/AuthModal";
import OrgSetupModal from "@/app/components/auth/OrgSetupModal";
import RoleSelectModal from "@/app/components/auth/RoleSelectModal";
import ApplicantProfileModal from "@/app/components/auth/ApplicantProfileModal";
import { getOrganization } from "@/app/actions/organizations";
import { getUserProfile } from "@/app/actions/profiles";
import type { UserRole } from "@/app/lib/types";

interface UserInfo {
  email?: string;
  name?: string;
}

function getInitial(name?: string, email?: string) {
  const source = name || email || "";
  return source.charAt(0).toUpperCase();
}

export default function Navbar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [orgSetupOpen, setOrgSetupOpen] = useState(false);
  const [applicantSetupOpen, setApplicantSetupOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = user.user_metadata ?? {};
        setUser({
          email: user.email,
          name: meta.full_name || meta.name || undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata ?? {};
        setUser({
          email: session.user.email,
          name: meta.full_name || meta.name || undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  const handleAuthenticated = async () => {
    setAuthOpen(false);
    // Check if user has a profile
    const { data: profile } = await getUserProfile();
    if (!profile) {
      // Check for existing org (pre-migration user)
      const { data: org } = await getOrganization();
      if (!org) {
        setRoleSelectOpen(true);
      }
      // If they have an org but no profile, they're a legacy poster — no extra setup needed
      return;
    }

    // Profile exists — check if poster needs org
    if (profile.role === "poster" || profile.role === "both") {
      const { data: org } = await getOrganization();
      if (!org) {
        setOrgSetupOpen(true);
      }
    }
  };

  const handleRoleSelected = (role: UserRole) => {
    setRoleSelectOpen(false);
    if (role === "poster") {
      setOrgSetupOpen(true);
    } else {
      setApplicantSetupOpen(true);
    }
  };

  const handleOrgComplete = () => {
    setOrgSetupOpen(false);
  };

  const handleApplicantComplete = () => {
    setApplicantSetupOpen(false);
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background border-b border-border-divider">
        <div className="container-page flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center opacity-50 hover:opacity-100 transition-opacity duration-[var(--duration-micro)]"
            aria-label="Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="SOAR" className="h-[25px] w-auto" />
          </Link>

          <div className="flex items-center gap-lg">
            <Link href="/discover" className="nav-link">
              Discover Projects
            </Link>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface-2 animate-pulse" />
            ) : user ? (
              /* Profile dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    hover:bg-surface-2 active:scale-95
                    transition-all duration-[var(--duration-micro)]
                    cursor-pointer select-none
                  "
                  aria-label="Profile menu"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold text-white"
                    style={{ background: "linear-gradient(180deg, var(--primary-hover) 0%, var(--primary-active) 100%)" }}
                  >
                    {getInitial(user.name, user.email)}
                  </span>
                </button>

                {profileOpen && (
                  <div
                    className="
                      absolute right-0 top-[calc(100%+8px)] z-50
                      min-w-[280px] rounded-[var(--radius-lg)]
                      bg-background border border-border
                      shadow-high overflow-hidden
                      animate-[menuIn_150ms_var(--ease-enter)_forwards]
                    "
                  >
                    {/* Header: avatar + name/email + plan chip */}
                    <div className="flex items-center gap-xs p-sm">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[16px] font-semibold text-white select-none"
                        style={{ background: "linear-gradient(180deg, var(--primary-hover) 0%, var(--primary-active) 100%)" }}
                      >
                        {getInitial(user.name, user.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-text-primary truncate leading-tight">
                          {user.name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-[12px] text-text-tertiary truncate leading-tight mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">
                        Free
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border-divider mx-xs" />

                    {/* Menu items */}
                    <div className="p-xs">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="
                          flex items-center gap-xs px-xs py-2
                          rounded-[var(--radius-md)]
                          text-[15px] text-text-secondary hover:text-text-primary hover:bg-surface-1
                          transition-colors duration-[var(--duration-micro)]
                        "
                      >
                        <UserRound size={16} />
                        View Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="
                          flex items-center gap-xs px-xs py-2
                          rounded-[var(--radius-md)]
                          text-[15px] text-text-secondary hover:text-text-primary hover:bg-surface-1
                          transition-colors duration-[var(--duration-micro)]
                        "
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="
                          w-full flex items-center gap-xs px-xs py-2
                          rounded-[var(--radius-md)]
                          text-[15px] text-text-secondary hover:text-text-primary hover:bg-surface-1
                          transition-colors duration-[var(--duration-micro)]
                          cursor-pointer
                        "
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In button — opens auth modal */
              <button
                onClick={() => setAuthOpen(true)}
                className="nav-link cursor-pointer bg-transparent border-none"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth modal triggered from navbar */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Role selection after sign-in */}
      <RoleSelectModal
        open={roleSelectOpen}
        onComplete={handleRoleSelected}
      />

      {/* Org setup modal for posters */}
      <OrgSetupModal open={orgSetupOpen} onComplete={handleOrgComplete} />

      {/* Applicant profile setup */}
      <ApplicantProfileModal
        open={applicantSetupOpen}
        onComplete={handleApplicantComplete}
      />
    </>
  );
}
