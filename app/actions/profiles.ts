"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { UserRole } from "@/app/lib/types";

export async function createUserProfile(data: {
  role: UserRole;
  fullName?: string;
  bio?: string;
  skills?: string[];
  portfolioUrl?: string;
  resumeUrl?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("user_profiles").insert({
    user_id: user.id,
    role: data.role,
    full_name: data.fullName || null,
    bio: data.bio || null,
    skills: data.skills ?? [],
    portfolio_url: data.portfolioUrl || null,
    resume_url: data.resumeUrl || null,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getUserProfile() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return { data: null };
  }

  return {
    data: {
      id: data.id,
      userId: data.user_id,
      role: data.role as UserRole,
      fullName: data.full_name,
      bio: data.bio ?? null,
      skills: data.skills ?? [],
      portfolioUrl: data.portfolio_url,
      resumeUrl: data.resume_url,
    },
  };
}

export async function updateUserProfile(data: {
  role?: UserRole;
  fullName?: string;
  bio?: string;
  skills?: string[];
  portfolioUrl?: string;
  resumeUrl?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Build update payload — only include provided fields
  const update: Record<string, unknown> = {};
  if (data.role !== undefined) update.role = data.role;
  if (data.fullName !== undefined) update.full_name = data.fullName || null;
  if (data.bio !== undefined) update.bio = data.bio || null;
  if (data.skills !== undefined) update.skills = data.skills;
  if (data.portfolioUrl !== undefined)
    update.portfolio_url = data.portfolioUrl || null;
  if (data.resumeUrl !== undefined)
    update.resume_url = data.resumeUrl || null;

  const { error } = await supabase
    .from("user_profiles")
    .update(update)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
