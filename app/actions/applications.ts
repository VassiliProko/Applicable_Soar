"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { ApplicationStatus, ApplicationWithProject } from "@/app/lib/types";

export async function applyToProject(data: {
  projectId: string;
  message?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check for existing application
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("project_id", data.projectId)
    .single();

  if (existing) {
    return { error: "You have already applied to this project" };
  }

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    project_id: data.projectId,
    message: data.message || null,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getMyApplications(): Promise<{
  data: ApplicationWithProject[] | null;
  error?: string;
}> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null };
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      project:projects (
        id,
        title,
        banner_type,
        banner_value,
        compensation_type,
        compensation_amount,
        location_type,
        user_id
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  // Fetch org data for each unique project owner
  const ownerIds = [
    ...new Set(
      (data ?? [])
        .map((a: Record<string, unknown>) => {
          const project = a.project as Record<string, unknown> | null;
          return project?.user_id as string | undefined;
        })
        .filter(Boolean)
    ),
  ];

  let orgMap: Record<string, { company_name: string; website: string | null; industry: string }> = {};
  if (ownerIds.length > 0) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("user_id, company_name, website, industry")
      .in("user_id", ownerIds);

    if (orgs) {
      orgMap = Object.fromEntries(
        orgs.map((o: Record<string, unknown>) => [
          o.user_id,
          { company_name: o.company_name, website: o.website, industry: o.industry },
        ])
      );
    }
  }

  const applications: ApplicationWithProject[] = (data ?? []).map(
    (row: Record<string, unknown>) => {
      const project = row.project as Record<string, unknown>;
      const org = orgMap[project.user_id as string] ?? null;

      return {
        id: row.id as string,
        userId: row.user_id as string,
        projectId: row.project_id as string,
        status: row.status as ApplicationWithProject["status"],
        message: row.message as string | null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        project: {
          id: project.id as string,
          title: project.title as string,
          bannerType: project.banner_type as string,
          bannerValue: project.banner_value as string,
          compensationType: project.compensation_type as string,
          compensationAmount: project.compensation_amount as string | null,
          locationType: project.location_type as string,
          organization: org
            ? {
                companyName: org.company_name,
                website: org.website,
                industry: org.industry,
              }
            : null,
        },
      };
    }
  );

  return { data: applications };
}

export async function getApplicationsForProject(projectId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      profile:user_profiles (
        full_name,
        bio,
        skills,
        portfolio_url,
        resume_url
      )
    `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: (data ?? []).map((row: Record<string, unknown>) => {
      const profile = row.profile as Record<string, unknown> | null;
      return {
        id: row.id as string,
        userId: row.user_id as string,
        projectId: row.project_id as string,
        status: row.status as ApplicationStatus,
        message: row.message as string | null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        applicant: profile
          ? {
              fullName: profile.full_name as string | null,
              bio: (profile.bio as string | null) ?? null,
              skills: (profile.skills as string[]) ?? [],
              portfolioUrl: profile.portfolio_url as string | null,
              resumeUrl: profile.resume_url as string | null,
            }
          : null,
      };
    }),
  };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function withdrawApplication(applicationId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "withdrawn" })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getApplicationStatus(projectId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null };
  }

  const { data } = await supabase
    .from("applications")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .single();

  if (!data) {
    return { data: null };
  }

  return {
    data: {
      id: data.id as string,
      status: data.status as ApplicationStatus,
    },
  };
}
