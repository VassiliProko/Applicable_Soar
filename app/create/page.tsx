import CreatePageContent from "@/app/components/create/CreatePageContent";

export const metadata = {
  title: "Create Project — SOAR",
  description: "Set up a new project listing to find talent.",
};

export default function CreatePage() {
  return (
    <div className="container-page flex flex-col min-h-full">
      <main className="flex-1 py-xl pb-[400px]">
        <CreatePageContent />
      </main>
    </div>
  );
}
