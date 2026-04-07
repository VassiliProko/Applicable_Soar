import EditPageContent from "@/app/components/create/EditPageContent";

export const metadata = {
  title: "Edit Project — SOAR",
  description: "Edit your project listing.",
};

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container-page flex flex-col min-h-full">
      <main className="flex-1 py-xl pb-[400px]">
        <EditPageContent projectId={id} />
      </main>
    </div>
  );
}
