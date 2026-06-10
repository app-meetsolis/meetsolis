/**
 * Story 7.7 — Avatar upload (raw image, no crop UI per Q1 locked).
 *
 * Click-to-upload over the monogram. Validates client-side, POSTs multipart
 * to /api/clients/[id]/avatar, server uploads to Supabase Storage and updates
 * clients.avatar_url. Then invalidates the client query so the new image shows.
 */

'use client';

import { useRef, useState, ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getInitials } from '@/lib/client/get-initials';
import { getMonogramColor } from '@/lib/client/get-monogram-color';

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

interface Props {
  clientId: string;
  clientName: string;
  avatarUrl: string | null | undefined;
}

export function AvatarUpload({ clientId, clientName, avatarUrl }: Props) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const r = await fetch(`/api/clients/${clientId}/avatar`, {
        method: 'POST',
        body: form,
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Upload failed');
      }
      return (await r.json()) as { avatar_url: string };
    },
    onSuccess: () => {
      toast.success('Avatar updated.');
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error('Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }
    upload.mutate(file);
    e.target.value = ''; // reset so re-selecting same file refires
  };

  const initials = getInitials(clientName);
  const bg = getMonogramColor(clientName);

  return (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Upload avatar"
      className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
      disabled={upload.isPending}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={clientName}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-white text-[28px] font-bold tracking-tight"
          style={{ backgroundColor: bg }}
        >
          {initials}
        </div>
      )}
      {(hovered || upload.isPending) && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
          {upload.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </span>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        onChange={handleChange}
        className="hidden"
      />
    </button>
  );
}
