import Navbar from "@/app/components/Navbar";
import CreateProjectForm from "@/app/components/create/CreateProjectForm";
import ProjectSidebar from "@/app/components/create/ProjectSidebar";

export const metadata = {
  title: "Create Project — Applicable",
  description: "Set up a new project listing to find talent.",
};

export default function CreatePage() {
  return (
    <div className="container-page flex flex-col min-h-full">
      <Navbar />

      <main className="flex-1 py-xl">
        <div className="flex gap-xl flex-col lg:flex-row">
          {/* Main form — left */}
          <div className="flex-1 min-w-0">
            <CreateProjectForm />
          </div>

          {/* Sidebar — right */}
          <div className="w-full lg:w-72 shrink-0">
            <ProjectSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
