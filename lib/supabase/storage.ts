import { createClient } from '@/lib/supabase/client';

export type StorageBucket = 'beats' | 'covers';

interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  folder?: string
): Promise<UploadResult> {
  const supabase = createClient();
  
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `${timestamp}-${randomId}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

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
 * Upload beat files (cover, preview, full)
 */
export async function uploadBeatFiles(files: {
  cover?: File | null;
  preview?: File | null;
  full?: File | null;
}): Promise<{
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
    const { url, path } = await uploadFile(files.cover, 'covers');
    result.coverUrl = url;
    result.coverPath = path;
  }

  if (files.preview) {
    const { url, path } = await uploadFile(files.preview, 'beats', 'previews');
    result.previewUrl = url;
    result.previewPath = path;
  }

  if (files.full) {
    const { url, path } = await uploadFile(files.full, 'beats', 'full');
    result.fullUrl = url;
    result.fullPath = path;
  }

  return result;
}
