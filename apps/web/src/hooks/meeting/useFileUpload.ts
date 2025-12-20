/**
 * useFileUpload Hook
 * Handle file uploads to Supabase Storage for chat
 * Story 2.4 - File Attachments
 */

'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UseFileUploadResult {
  uploadFile: (
    file: File,
    meetingId: string
  ) => Promise<{ fileId: string; url: string }>;
  isUploading: boolean;
  uploadProgress: number;
  error: Error | null;
}

export function useFileUpload(): UseFileUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(async (file: File, meetingId: string) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const err = new Error('File size exceeds 10MB limit');
      setError(err);
      throw err;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedName}`;
      const filePath = `${meetingId}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meeting-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Create signed URL (24 hour expiration)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('meeting-files')
        .createSignedUrl(filePath, 86400);

      if (urlError) throw urlError;

      setUploadProgress(75);

      // Create file record in database via API
      const response = await fetch(`/api/meetings/${meetingId}/files/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: filePath,
          url: urlData.signedUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create file record');
      }

      const { file: fileRecord } = await response.json();

      setUploadProgress(100);
      setIsUploading(false);

      return {
        fileId: fileRecord.id,
        url: urlData.signedUrl,
      };
    } catch (err) {
      setError(err as Error);
      setIsUploading(false);
      throw err;
    }
  }, []);

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    error,
  };
}
