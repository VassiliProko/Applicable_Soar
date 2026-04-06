"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod/v4";
import type { ProjectFormData } from "@/app/lib/types";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  banner_type: z.enum(["color", "image"]),
  banner_value: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  duration: z.string().optional(),
  compensation_type: z.enum(["paid", "unpaid", "equity"]),
  compensation_amount: z.string().optional(),
  location_type: z.enum(["remote", "on-site", "hybrid"]),
  location_detail: z.string().optional(),
  skills: z.array(z.string()),
  capacity: z.string().optional(),
  require_approval: z.boolean(),
  visibility: z.enum(["public", "private"]),
  status: z.enum(["draft", "published"]),
});

function toDbRow(data: ProjectFormData) {
  return {
    title: data.title,
    description: data.description,
    banner_type: data.bannerType,
    banner_value: data.bannerValue,
    start_date: data.startDate || null,
    end_date: data.endDate || null,
    duration: data.duration || null,
    compensation_type: data.compensationType,
    compensation_amount: data.compensationAmount || null,
    location_type: data.locationType,
    location_detail: data.locationDetail || null,
    skills: data.skills,
    capacity: data.capacity || null,
    require_approval: data.requireApproval,
    visibility: data.visibility,
    status: data.status,
  };
}

function fromDbRow(row: Record<string, unknown>): ProjectFormData {
  return {
    title: row.title as string,
    description: row.description as string,
    bannerType: row.banner_type as ProjectFormData["bannerType"],
    bannerValue: row.banner_value as string,
    startDate: (row.start_date as string) ?? "",
    endDate: (row.end_date as string) ?? "",
    duration: (row.duration as string) ?? "",
    compensationType: row.compensation_type as ProjectFormData["compensationType"],
    compensationAmount: (row.compensation_amount as string) ?? "",
    locationType: row.location_type as ProjectFormData["locationType"],
    locationDetail: (row.location_detail as string) ?? "",
    skills: (row.skills as string[]) ?? [],
    capacity: (row.capacity as string) ?? "",
    requireApproval: row.require_approval as boolean,
    visibility: row.visibility as ProjectFormData["visibility"],
    status: row.status as ProjectFormData["status"],
  };
}

export async function createProject(data: ProjectFormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a project" };
  }

  const row = toDbRow(data);
  const parsed = projectSchema.safeParse(row);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ ...row, user_id: user.id })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: project.id, ...fromDbRow(project) } };
}

export async function updateProject(id: string, data: Partial<ProjectFormData>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update a project" };
  }

  const updates: Record<string, unknown> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.bannerType !== undefined) updates.banner_type = data.bannerType;
  if (data.bannerValue !== undefined) updates.banner_value = data.bannerValue;
  if (data.startDate !== undefined) updates.start_date = data.startDate || null;
  if (data.endDate !== undefined) updates.end_date = data.endDate || null;
  if (data.duration !== undefined) updates.duration = data.duration || null;
  if (data.compensationType !== undefined) updates.compensation_type = data.compensationType;
  if (data.compensationAmount !== undefined) updates.compensation_amount = data.compensationAmount || null;
  if (data.locationType !== undefined) updates.location_type = data.locationType;
  if (data.locationDetail !== undefined) updates.location_detail = data.locationDetail || null;
  if (data.skills !== undefined) updates.skills = data.skills;
  if (data.capacity !== undefined) updates.capacity = data.capacity || null;
  if (data.requireApproval !== undefined) updates.require_approval = data.requireApproval;
  if (data.visibility !== undefined) updates.visibility = data.visibility;
  if (data.status !== undefined) updates.status = data.status;

  const { data: project, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: project.id, ...fromDbRow(project) } };
}

export async function deleteProject(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to delete a project" };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { id } };
}

export async function getProject(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: project, error } = await supabase
    .from("projects")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: { id: project.id, ...fromDbRow(project) } };
}

export async function getProjects(options?: { userId?: string; status?: string }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase.from("projects").select();

  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  query = query.order("created_at", { ascending: false });

  const { data: projects, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return {
    data: projects.map((p: Record<string, unknown>) => ({
      id: p.id,
      userId: p.user_id,
      createdAt: p.created_at,
      ...fromDbRow(p),
    })),
  };
}
