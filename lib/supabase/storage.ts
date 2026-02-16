import { createClient } from '@/lib/supabase/client';

export type StorageBucket = 'beats' | 'covers';

interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload a file to Supabase Storage with optional progress tracking
 */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const supabase = createClient();

  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}-${randomId}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Simulate progress for now (Supabase JS client doesn't expose upload progress)
  // In a real implementation, you might use XMLHttpRequest or fetch with progress events
  if (onProgress) {
    onProgress(0);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (onProgress) {
    onProgress(100);
  }

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  path: string,
  bucket: StorageBucket
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get a signed URL for private files (for full audio downloads)
 */
export async function getSignedUrl(
  path: string,
  bucket: StorageBucket,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Upload beat files (cover, preview, full) with progress tracking
 */
export async function uploadBeatFiles(
  files: {
    cover?: File | null;
    preview?: File | null;
    full?: File | null;
  },
  onProgress?: (stage: string, progress: number) => void
): Promise<{
  coverUrl?: string;
  coverPath?: string;
  previewUrl?: string;
  previewPath?: string;
  fullUrl?: string;
  fullPath?: string;
}> {
  const result: {
    coverUrl?: string;
    coverPath?: string;
    previewUrl?: string;
    previewPath?: string;
    fullUrl?: string;
    fullPath?: string;
  } = {};

  if (files.cover) {
    const { url, path } = await uploadFile(
      files.cover,
      'covers',
      undefined,
      (progress) => onProgress?.('cover', progress)
    );
    result.coverUrl = url;
    result.coverPath = path;
  }

  if (files.preview) {
    const { url, path } = await uploadFile(
      files.preview,
      'beats',
      'previews',
      (progress) => onProgress?.('preview', progress)
    );
    result.previewUrl = url;
    result.previewPath = path;
  }

  if (files.full) {
    const { url, path } = await uploadFile(
      files.full,
      'beats',
      'full',
      (progress) => onProgress?.('full', progress)
    );
    result.fullUrl = url;
    result.fullPath = path;
  }

  return result;
}
