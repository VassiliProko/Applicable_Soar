import { notFound } from "next/navigation";
import { getProject } from "@/app/actions/projects";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ProjectPageContent from "@/app/components/project/ProjectPageContent";
import type { ProjectWithMeta } from "@/app/lib/types";

interface OrgInfo {
  companyName: string;
  website: string | null;
  industry: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: project } = await getProject(id);
  return {
    title: project ? `${project.title} — SOAR` : "Project — SOAR",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: project, error } = await getProject(id);

  if (error || !project) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: org } = await supabase
    .from("organizations")
    .select("company_name, website, industry")
    .eq("user_id", project.userId)
    .single();

  const organization: OrgInfo | null = org
    ? {
        companyName: org.company_name as string,
        website: org.website as string | null,
        industry: org.industry as string,
      }
    : null;

  return (
    <div className="flex flex-col min-h-full w-full">
      <main className="flex-1 py-xl px-[var(--grid-margin)]">
        <ProjectPageContent
          project={project as ProjectWithMeta}
          organization={organization}
        />
      </main>
    </div>
  );
}
