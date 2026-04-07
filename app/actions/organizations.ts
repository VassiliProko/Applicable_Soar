"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function createOrganization(data: {
  companyName: string;
  website: string;
  description: string;
  industry: string;
  type: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("organizations").insert({
    user_id: user.id,
    company_name: data.companyName,
    website: data.website || null,
    description: data.description,
    industry: data.industry,
    type: data.type,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getOrganization() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null };
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return { data: null };
  }

  return {
    data: {
      id: data.id,
      companyName: data.company_name,
      website: data.website,
      description: data.description,
      industry: data.industry,
      type: data.type,
    },
  };
}

export async function updateOrganization(data: {
  companyName: string;
  website: string;
  description: string;
  industry: string;
  type: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      company_name: data.companyName,
      website: data.website || null,
      description: data.description,
      industry: data.industry,
      type: data.type,
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
