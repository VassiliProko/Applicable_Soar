import { createClient } from "./client";

function getExtension(file: File): string {
  const name = file.name;
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot) : "";
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadBannerImage(
  file: File,
  userId: string,
  projectId: string
): Promise<string> {
  const supabase = createClient();
  const ext = getExtension(file);
  const path = `${userId}/${projectId}${ext}`;

  const { error } = await supabase.storage
    .from("project-banners")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from("project-banners")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function uploadAttachmentFiles(
  files: File[],
  userId: string,
  projectId: string
): Promise<
  { storagePath: string; publicUrl: string; fileName: string; fileType: string }[]
> {
  const supabase = createClient();
  const results: {
    storagePath: string;
    publicUrl: string;
    fileName: string;
    fileType: string;
  }[] = [];

  for (const file of files) {
    const safeName = sanitizeFileName(file.name);
    const storagePath = `${userId}/${projectId}/${safeName}`;

    const { error } = await supabase.storage
      .from("project-attachments")
      .upload(storagePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from("project-attachments")
      .getPublicUrl(storagePath);

    results.push({
      storagePath,
      publicUrl: data.publicUrl,
      fileName: file.name,
      fileType: file.type,
    });
  }

  return results;
}

export async function deleteBannerImage(
  userId: string,
  projectId: string
): Promise<void> {
  const supabase = createClient();
  // List files to find the banner (we don't know the extension)
  const { data: files } = await supabase.storage
    .from("project-banners")
    .list(`${userId}`, { search: projectId });

  if (files && files.length > 0) {
    await supabase.storage
      .from("project-banners")
      .remove(files.map((f) => `${userId}/${f.name}`));
  }
}

export async function deleteAttachmentFile(
  storagePath: string
): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from("project-attachments").remove([storagePath]);
}
