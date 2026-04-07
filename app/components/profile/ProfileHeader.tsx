"use client";

import type { UserRole } from "@/app/lib/types";

interface ProfileHeaderProps {
  user: { name?: string; email?: string } | null;
  role?: UserRole | null;
}

function getInitial(name?: string, email?: string) {
  const source = name || email || "";
  return source.charAt(0).toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  poster: "Poster",
  applicant: "Applicant",
  both: "Poster & Applicant",
};

export default function ProfileHeader({ user, role }: ProfileHeaderProps) {
  if (!user) return null;

  const displayName = user.name || user.email?.split("@")[0] || "";

  return (
    <div className="flex items-center gap-md">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-[24px] font-semibold text-white shrink-0 select-none"
        style={{
          background:
            "linear-gradient(180deg, var(--primary-hover) 0%, var(--primary-active) 100%)",
        }}
      >
        {getInitial(user.name, user.email)}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2xs">
          <h1 className="type-title text-text-primary truncate">
            {displayName}
          </h1>
          {role && (
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">
              {ROLE_LABELS[role] ?? role}
            </span>
          )}
        </div>
        {user.email && (
          <p className="type-body text-text-secondary truncate mt-3xs">
            {user.email}
          </p>
        )}
      </div>
    </div>
  );
}
