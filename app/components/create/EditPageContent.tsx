"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import CreateProjectForm from "./CreateProjectForm";
import ProjectSidebar from "./ProjectSidebar";
import AuthGate from "@/app/components/auth/AuthGate";
import Button from "@/app/components/ui/Button";
import { ProjectFormData, INITIAL_PROJECT } from "@/app/lib/types";
import {
  getProject,
  updateProject,
  saveAttachments,
} from "@/app/actions/projects";
import { uploadAttachmentFiles } from "@/utils/supabase/storage";
import { createClient } from "@/utils/supabase/client";
import type { ProjectAttachment } from "@/app/lib/types";

interface EditPageContentProps {
  projectId: string;
}

export default function EditPageContent({ projectId }: EditPageContentProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormData>(INITIAL_PROJECT);
  const originalForm = useRef<ProjectFormData>(INITIAL_PROJECT);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<
    ProjectAttachment[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm.current) || attachmentFiles.length > 0;

  const handleBack = useCallback(() => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      router.push("/profile");
    }
  }, [hasChanges, router]);

  const confirmDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    router.push("/profile");
  }, [router]);

  // Load existing project data
  useEffect(() => {
    async function load() {
      const result = await getProject(projectId);
      if (result.error || !result.data) {
        setError("Project not found");
        setLoading(false);
        return;
      }

      const p = result.data;
      const loaded: ProjectFormData = {
        title: p.title,
        description: p.description,
        bannerType: p.bannerType,
        bannerValue: p.bannerValue,
        startDate: p.startDate,
        endDate: p.endDate,
        duration: p.duration,
        timeCommitment: p.timeCommitment,
        compensationType: p.compensationType,
        compensationAmount: p.compensationAmount,
        locationType: p.locationType,
        locationDetail: p.locationDetail,
        skills: p.skills,
        capacity: p.capacity,
        requireApproval: p.requireApproval,
        visibility: p.visibility,
        status: p.status,
      };
      setForm(loaded);
      originalForm.current = loaded;
      setExistingAttachments(p.attachments || []);
      setLoading(false);
    }
    load();
  }, [projectId]);

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
    async () => {
      setSaving(true);
      setError(null);
      setFieldErrors(new Set());

      // Client-side required-field check
      const missing: { key: string; label: string }[] = [];
      if (!form.title.trim())
        missing.push({ key: "title", label: "project name" });
      if (!form.timeCommitment.trim())
        missing.push({ key: "timeCommitment", label: "time commitment" });
      if (!form.description.trim())
        missing.push({ key: "description", label: "description" });
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
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("You must be signed in");
          setSaving(false);
          return;
        }

        // Update the project with current form status
        const result = await updateProject(projectId, form);

        if (result.error) {
          setError(result.error);
          setSaving(false);
          return;
        }

        // Upload new attachments if any
        if (attachmentFiles.length > 0) {
          const uploaded = await uploadAttachmentFiles(
            attachmentFiles,
            user.id,
            projectId
          );
          await saveAttachments(
            projectId,
            uploaded.map((u, i) => ({
              fileName: u.fileName,
              fileType: u.fileType,
              storagePath: u.storagePath,
              position: existingAttachments.length + i,
            }))
          );
        }

        router.push("/profile");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setSaving(false);
      }
    },
    [form, attachmentFiles, existingAttachments.length, projectId, router]
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
      {loading ? (
        <div className="flex gap-xl flex-col lg:flex-row w-full max-w-[90vw] lg:max-w-[66vw] mx-auto">
          <div className="w-full lg:w-72 shrink-0 order-2 lg:order-1">
            <div className="h-64 bg-surface-2 rounded-[var(--radius-md)] animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="h-10 w-64 bg-surface-2 rounded animate-pulse mb-md" />
            <div className="h-48 bg-surface-2 rounded-[var(--radius-md)] animate-pulse mb-md" />
            <div className="h-32 bg-surface-2 rounded-[var(--radius-md)] animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Error banner */}
          {error && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-[var(--radius-md)] bg-error/10 border border-error text-error type-body">
              {error}
            </div>
          )}

          {/* Top bar */}
          <div className="w-full max-w-[90vw] lg:max-w-[66vw] mx-auto mb-md flex items-center justify-between gap-sm">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2xs text-text-secondary hover:text-text-primary transition-colors duration-[var(--duration-micro)] cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span className="type-body font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2xs">
              <Button variant="ghost" size="sm" className="!text-text-secondary hover:!bg-surface-2 active:!bg-surface-2/60" onClick={handleBack} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>

          <div className="flex gap-xl flex-col lg:flex-row w-full max-w-[90vw] lg:max-w-[66vw] mx-auto">
            {/* Sidebar — left */}
            <div className="w-full lg:w-72 shrink-0 order-2 lg:order-1">
              {/* Existing attachments */}
              {existingAttachments.length > 0 && (
                <div className="mb-md">
                  <span className="type-caption font-medium text-text-secondary mb-2xs block">
                    Saved attachments
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {existingAttachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2xs px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-surface-1 transition-colors duration-[var(--duration-micro)] type-caption text-text-primary truncate"
                      >
                        {att.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <ProjectSidebar
                visibility={form.visibility}
                onVisibilityChange={(v) => update("visibility", v)}
                attachmentFiles={attachmentFiles}
                onFilesAdd={handleFilesAdd}
                onFileRemove={handleFileRemove}
                onPublish={handleSave}
                onSave={handleSave}
                saving={saving}
                isEdit
                status={form.status}
                onStatusChange={(s) => update("status", s)}
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

          {/* Discard changes dialog */}
          {showDiscardDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-xl p-lg max-w-sm w-full mx-4">
                <h3 className="type-subhead font-semibold text-text-primary mb-2xs">
                  Discard changes?
                </h3>
                <p className="type-body text-text-secondary mb-md">
                  You have unsaved changes. If you leave now, your changes won&apos;t be saved.
                </p>
                <div className="flex items-center justify-end gap-2xs">
                  <Button variant="ghost" size="sm" className="!text-text-secondary hover:!bg-surface-2" onClick={() => setShowDiscardDialog(false)}>
                    Keep Editing
                  </Button>
                  <Button variant="primary" size="sm" className="!bg-error hover:!opacity-80" onClick={confirmDiscard}>
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AuthGate>
  );
}
