"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import CreateProjectForm from "./CreateProjectForm";
import ProjectSidebar from "./ProjectSidebar";
import AuthGate from "@/app/components/auth/AuthGate";
import { ProjectFormData, INITIAL_PROJECT } from "@/app/lib/types";
import { createProject, saveAttachments } from "@/app/actions/projects";
import { uploadAttachmentFiles } from "@/utils/supabase/storage";
import { createClient } from "@/utils/supabase/client";

export default function CreatePageContent() {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormData>(INITIAL_PROJECT);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const update = useCallback(
    <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleFilesAdd = useCallback((files: File[]) => {
    setAttachmentFiles((prev) => [...prev, ...files]);
  }, []);

  const handleFileRemove = useCallback((index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(
    async (status: "draft" | "published") => {
      setSaving(true);
      setError(null);
      setFieldErrors(new Set());

      // Client-side required-field check
      const missing: { key: string; label: string }[] = [];
      if (!form.title.trim()) missing.push({ key: "title", label: "project name" });
      if (!form.timeCommitment.trim()) missing.push({ key: "timeCommitment", label: "time commitment" });
      if (!form.description.trim()) missing.push({ key: "description", label: "description" });
      if (missing.length > 0) {
        setFieldErrors(new Set(missing.map((m) => m.key)));
        const labels = missing.map((m) => m.label);
        setError(
          labels.length === 1
            ? `Please add a ${labels[0]}`
            : `Please fill in: ${labels.join(", ")}`
        );
        setSaving(false);
        return;
      }

      try {
        // Get current user
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("You must be signed in");
          setSaving(false);
          return;
        }

        // 1. Create the project
        const formData: ProjectFormData = { ...form, status };
        const result = await createProject(formData);

        if (result.error) {
          setError(result.error);
          setSaving(false);
          return;
        }

        const projectId = result.data!.id;

        // 2. Upload attachments
        if (attachmentFiles.length > 0) {
          const uploaded = await uploadAttachmentFiles(attachmentFiles, user.id, projectId);
          await saveAttachments(
            projectId,
            uploaded.map((u, i) => ({
              fileName: u.fileName,
              fileType: u.fileType,
              storagePath: u.storagePath,
              position: i,
            }))
          );
        }

        // 4. Redirect to dashboard
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setSaving(false);
      }
    },
    [form, attachmentFiles, router]
  );

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      if (next.size === 0) setError(null);
      return next;
    });
  }, []);

  return (
    <AuthGate>
      <div className="flex gap-xl flex-col lg:flex-row w-full max-w-[90vw] lg:max-w-[66vw] mx-auto">
        {/* Error banner */}
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-[var(--radius-md)] bg-error/10 border border-error text-error type-body">
            {error}
          </div>
        )}

        {/* Sidebar — left */}
        <div className="w-full lg:w-72 shrink-0 order-2 lg:order-1">
          <ProjectSidebar
            visibility={form.visibility}
            onVisibilityChange={(v) => update("visibility", v)}
            attachmentFiles={attachmentFiles}
            onFilesAdd={handleFilesAdd}
            onFileRemove={handleFileRemove}
            onPublish={() => handleSave("published")}
            onSave={() => handleSave("draft")}
            saving={saving}
          />
        </div>

        {/* Main form — right */}
        <div className="flex-1 min-w-0 order-1 lg:order-2 w-full">
          <CreateProjectForm
            form={form}
            onUpdate={update}
            fieldErrors={fieldErrors}
            onFieldInteraction={clearFieldError}
          />
        </div>
      </div>
    </AuthGate>
  );
}
