/**
 * ClientForm Component
 * Story 2.3: Add/Edit Client Modal - Task 2 & 3
 * Story 2.5: Client Tags & Labels - Task 4
 *
 * Form for adding/editing clients with:
 * - react-hook-form for state management
 * - Zod validation integration
 * - Real-time validation
 * - Inline error messages
 * - Tag input with autocomplete
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Client, ClientCreateSchema } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagInput } from './TagInput';
import { getMaxTags } from '@/lib/utils/tierLimits';
import { toast } from 'sonner';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

// Form-specific schema (only validates user-entered fields)
const ClientFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  email: z
    .string()
    .email('Invalid email format')
    .trim()
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional(),
  website: z
    .string()
    .url('Invalid URL format')
    .trim()
    .optional()
    .or(z.literal('')),
  linkedin_url: z
    .string()
    .url('Invalid URL format')
    .trim()
    .optional()
    .or(z.literal('')),
  tags: z.array(z.string()).max(50).default([]),
});

type ClientFormData = z.infer<typeof ClientFormSchema>;

interface ClientFormProps {
  mode: 'create' | 'edit';
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
}

export function ClientForm({
  mode,
  client,
  onSuccess,
  onCancel,
  onDirtyChange,
  onSubmittingChange,
}: ClientFormProps) {
  const queryClient = useQueryClient();

  // Tags state (managed separately from react-hook-form)
  const [tags, setTags] = useState<string[]>(client?.tags || []);

  // Fetch all clients for tag autocomplete
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) return [];
      const data = await response.json();
      return data.clients || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user preferences for tier limit
  const { data: userPrefs } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      return { max_clients: 3, tier: 'free' }; // Default for now
    },
    staleTime: 10 * 60 * 1000,
  });

  const tier = (userPrefs?.tier || 'free') as 'free' | 'pro';
  const maxTags = getMaxTags(tier);

  // Initialize form with react-hook-form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(ClientFormSchema),
    mode: 'onChange', // Real-time validation
    defaultValues:
      mode === 'edit' && client
        ? {
            name: client.name,
            company: client.company || '',
            role: client.role || '',
            email: client.email || '',
            phone: client.phone || '',
            website: client.website || '',
            linkedin_url: client.linkedin_url || '',
            tags: client.tags || [],
          }
        : {
            name: '',
            company: '',
            role: '',
            email: '',
            phone: '',
            website: '',
            linkedin_url: '',
            tags: [],
          },
  });

  // Notify parent of dirty state changes
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Notify parent of submitting state changes
  useEffect(() => {
    onSubmittingChange(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  // Sanitize tags before submission
  const sanitizeTags = (tagsToSanitize: string[]): string[] => {
    return tagsToSanitize
      .map(tag =>
        sanitizeHtml(tag.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      )
      .filter(tag => tag.length > 0);
  };

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const sanitizedTags = sanitizeTags(tags);

      // Validate tier limit
      if (sanitizedTags.length > maxTags) {
        throw new Error(`Maximum ${maxTags} tags allowed for ${tier} tier`);
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags: sanitizedTags,
          status: 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create client');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client added successfully');
      reset();
      setTags([]);
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save client. Please try again.');
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const sanitizedTags = sanitizeTags(tags);

      // Validate tier limit
      if (sanitizedTags.length > maxTags) {
        throw new Error(`Maximum ${maxTags} tags allowed for ${tier} tier`);
      }

      const response = await fetch(`/api/clients/${client?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags: sanitizedTags,
          status: client?.status || 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update client');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated successfully');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save client. Please try again.');
    },
  });

  // Form submission handler
  const onSubmit = (data: ClientFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field (Required) */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-[#1A1A1A]">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Doe"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Company Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="company" className="text-sm font-medium text-[#1A1A1A]">
          Company
        </Label>
        <Input id="company" {...register('company')} placeholder="Acme Corp" />
        {errors.company && (
          <p className="text-sm text-red-500">{errors.company.message}</p>
        )}
      </div>

      {/* Role Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium text-[#1A1A1A]">
          Role
        </Label>
        <Input id="role" {...register('role')} placeholder="CEO" />
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>

      {/* Email Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john@example.com"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-[#1A1A1A]">
          Phone
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Website Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm font-medium text-[#1A1A1A]">
          Website
        </Label>
        <Input
          id="website"
          type="url"
          {...register('website')}
          placeholder="https://example.com"
          className={errors.website ? 'border-red-500' : ''}
        />
        {errors.website && (
          <p className="text-sm text-red-500">{errors.website.message}</p>
        )}
      </div>

      {/* LinkedIn URL Field (Optional) */}
      <div className="space-y-2">
        <Label
          htmlFor="linkedin_url"
          className="text-sm font-medium text-[#1A1A1A]"
        >
          LinkedIn URL
        </Label>
        <Input
          id="linkedin_url"
          type="url"
          {...register('linkedin_url')}
          placeholder="https://linkedin.com/in/johndoe"
          className={errors.linkedin_url ? 'border-red-500' : ''}
        />
        {errors.linkedin_url && (
          <p className="text-sm text-red-500">{errors.linkedin_url.message}</p>
        )}
      </div>

      {/* Tags Field (Optional) - Story 2.5 */}
      <div className="space-y-2">
        <TagInput
          tags={tags}
          onTagsChange={setTags}
          clients={clients || []}
          maxTags={maxTags}
          tier={tier}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="bg-[#001F3F] hover:bg-[#003366]"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
