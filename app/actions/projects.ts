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
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  duration: z.string().nullable(),
  time_commitment: z.string().min(1, "Time commitment is required").nullable(),
  compensation_type: z.enum(["paid", "unpaid", "equity"]),
  compensation_amount: z.string().nullable(),
  location_type: z.enum(["remote", "on-site", "hybrid"]),
  location_detail: z.array(z.string()).nullable(),
  skills: z.array(z.string()),
  capacity: z.string().nullable(),
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
    time_commitment: data.timeCommitment || null,
    compensation_type: data.compensationType,
    compensation_amount: data.compensationAmount || null,
    location_type: data.locationType,
    location_detail: data.locationDetail.length > 0 ? data.locationDetail : null,
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
    timeCommitment: (row.time_commitment as string) ?? "",
    compensationType: row.compensation_type as ProjectFormData["compensationType"],
    compensationAmount: (row.compensation_amount as string) ?? "",
    locationType: row.location_type as ProjectFormData["locationType"],
    locationDetail: (row.location_detail as string[] | null) ?? [],
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
    // Map zod field paths to user-friendly messages
    const fieldLabels: Record<string, string> = {
      title: "project name",
      description: "description",
      time_commitment: "time commitment",
      location_type: "project location",
    };
    const issue = parsed.error.issues[0];
    const field = String(issue.path[0] ?? "");
    const label = fieldLabels[field];
    return { error: label ? `Please add a ${label}` : "Please fill in all required fields" };
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
  if (data.timeCommitment !== undefined) updates.time_commitment = data.timeCommitment || null;
  if (data.compensationType !== undefined) updates.compensation_type = data.compensationType;
  if (data.compensationAmount !== undefined) updates.compensation_amount = data.compensationAmount || null;
  if (data.locationType !== undefined) updates.location_type = data.locationType;
  if (data.locationDetail !== undefined) updates.location_detail = data.locationDetail.length > 0 ? data.locationDetail : null;
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

  // Clean up storage files before deleting the project
  const { data: attachments } = await supabase
    .from("project_attachments")
    .select("storage_path")
    .eq("project_id", id)
    .eq("user_id", user.id);

  if (attachments && attachments.length > 0) {
    await supabase.storage
      .from("project-attachments")
      .remove(attachments.map((a) => a.storage_path));
  }

  // Remove banner from storage
  const { data: project } = await supabase
    .from("projects")
    .select("banner_type, banner_value, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (project?.banner_type === "image" && project.banner_value) {
    const url = new URL(project.banner_value);
    const path = url.pathname.split("/object/public/project-banners/")[1];
    if (path) {
      await supabase.storage.from("project-banners").remove([path]);
    }
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

  // Fetch attachments for this project
  const { data: attachments } = await supabase
    .from("project_attachments")
    .select()
    .eq("project_id", id)
    .order("position");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return {
    data: {
      id: project.id,
      userId: project.user_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      ...fromDbRow(project),
      attachments: (attachments ?? []).map((a: Record<string, unknown>) => ({
        id: a.id as string,
        fileName: a.file_name as string,
        fileType: a.file_type as string,
        url: `${supabaseUrl}/storage/v1/object/public/project-attachments/${a.storage_path}`,
        position: a.position as number,
      })),
    },
  };
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

export async function saveAttachments(
  projectId: string,
  attachments: { fileName: string; fileType: string; storagePath: string; position: number }[]
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in" };
  }

  const rows = attachments.map((a) => ({
    project_id: projectId,
    user_id: user.id,
    file_name: a.fileName,
    file_type: a.fileType,
    storage_path: a.storagePath,
    position: a.position,
  }));

  const { data, error } = await supabase
    .from("project_attachments")
    .insert(rows)
    .select();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function deleteAttachment(attachmentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in" };
  }

  // Get the storage path before deleting the row
  const { data: attachment, error: fetchError } = await supabase
    .from("project_attachments")
    .select("storage_path")
    .eq("id", attachmentId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    return { error: fetchError.message };
  }

  // Delete from storage
  await supabase.storage
    .from("project-attachments")
    .remove([attachment.storage_path]);

  // Delete the DB row
  const { error } = await supabase
    .from("project_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { data: { id: attachmentId } };
}

export async function getPublicProjects() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: projects, error } = await supabase
    .from("projects")
    .select()
    .eq("visibility", "public")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  if (!projects || projects.length === 0) {
    return { data: [] };
  }

  // Batch-fetch organizations for all project owners
  const userIds = [...new Set(projects.map((p) => p.user_id as string))];
  const { data: orgs } = await supabase
    .from("organizations")
    .select("user_id, company_name, website, industry")
    .in("user_id", userIds);

  const orgMap = new Map(
    (orgs ?? []).map((o: Record<string, unknown>) => [
      o.user_id as string,
      {
        companyName: o.company_name as string,
        website: o.website as string | null,
        industry: o.industry as string,
      },
    ])
  );

  return {
    data: projects.map((p: Record<string, unknown>) => ({
      id: p.id,
      userId: p.user_id as string,
      createdAt: p.created_at as string,
      ...fromDbRow(p),
      organization: orgMap.get(p.user_id as string) ?? null,
    })),
  };
}
