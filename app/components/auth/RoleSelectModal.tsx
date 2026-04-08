"use client";

import { useState } from "react";
import { Briefcase, Search } from "lucide-react";
import { createUserProfile } from "@/app/actions/profiles";
import type { UserRole } from "@/app/lib/types";

interface RoleSelectModalProps {
  open: boolean;
  onComplete: (role: UserRole) => void;
}

export default function RoleSelectModal({
  open,
  onComplete,
}: RoleSelectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = async (role: UserRole) => {
    setLoading(true);
    setError("");

    const result = await createUserProfile({ role });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onComplete(role);
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
          mx-md
          animate-[modalIn_var(--duration-base)_var(--ease-enter)_forwards]
        "
      >
        {/* Header */}
        <div className="px-lg pt-lg pb-sm">
          <h2 className="type-title">Welcome to SOAR</h2>
          <p className="type-body text-text-secondary mt-3xs">
            How will you be using SOAR?
          </p>
        </div>

        <div className="px-lg pb-lg flex flex-col gap-sm">
          {/* Post Projects */}
          <button
            onClick={() => handleSelect("poster")}
            disabled={loading}
            className="
              w-full p-md rounded-[var(--radius-md)]
              border border-border bg-background
              hover:border-border-hover hover:bg-surface-1
              active:scale-[0.99]
              transition-all duration-[var(--duration-micro)]
              text-left flex items-center gap-md
              disabled:opacity-40 disabled:pointer-events-none
              cursor-pointer
            "
          >
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-surface-dark flex items-center justify-center shrink-0">
              <Briefcase size={22} className="text-white" />
            </div>
            <div>
              <p className="type-body font-medium text-text-primary">
                I want to post projects
              </p>
              <p className="type-caption text-text-secondary mt-3xs">
                Share opportunities and find people to work with
              </p>
            </div>
          </button>

          {/* Find Opportunities */}
          <button
            onClick={() => handleSelect("learner")}
            disabled={loading}
            className="
              w-full p-md rounded-[var(--radius-md)]
              border border-border bg-background
              hover:border-border-hover hover:bg-surface-1
              active:scale-[0.99]
              transition-all duration-[var(--duration-micro)]
              text-left flex items-center gap-md
              disabled:opacity-40 disabled:pointer-events-none
              cursor-pointer
            "
          >
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-surface-dark flex items-center justify-center shrink-0">
              <Search size={22} className="text-white" />
            </div>
            <div>
              <p className="type-body font-medium text-text-primary">
                I want to learn and grow
              </p>
              <p className="type-caption text-text-secondary mt-3xs">
                Find projects, build skills, and grow your track record
              </p>
            </div>
          </button>

          {error && (
            <p className="type-caption text-error text-center">{error}</p>
          )}

          {loading && (
            <div className="flex justify-center">
              <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
