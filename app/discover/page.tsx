import { getPublicProjects } from "@/app/actions/projects";
import DiscoverContent from "@/app/components/discover/DiscoverContent";
import type { PublicProject } from "@/app/components/discover/ProjectCard";

export default async function DiscoverPage() {
  const { data: projects, error } = await getPublicProjects();

  return (
    <>
      <div className="container-page flex flex-col flex-1">
        <main className="flex-1 py-xl">
          {/* Header */}
          <div className="mb-lg">
            <h1 className="type-headline text-text-primary">Discover Projects</h1>
            <p className="type-body text-text-secondary mt-2xs">
              Browse public projects looking for collaborators on SOAR.
            </p>
          </div>

          {/* Filters + project list */}
          {error ? (
            <p className="type-body text-text-secondary">
              Something went wrong loading projects. Please try again later.
            </p>
          ) : (
            <DiscoverContent projects={(projects ?? []) as PublicProject[]} />
          )}
        </main>
      </div>
    </>
  );
}
