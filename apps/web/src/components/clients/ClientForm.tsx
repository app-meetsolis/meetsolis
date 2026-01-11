/**
 * ClientForm Component
 * Story 2.3: Add/Edit Client Modal - Task 2 & 3
 *
 * Form for adding/editing clients with:
 * - react-hook-form for state management
 * - Zod validation integration
 * - Real-time validation
 * - Inline error messages
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Client, ClientCreate, ClientCreateSchema } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

  // Initialize form with react-hook-form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    reset,
  } = useForm<ClientCreate>({
    resolver: zodResolver(ClientCreateSchema),
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
          }
        : {
            name: '',
            company: '',
            role: '',
            email: '',
            phone: '',
            website: '',
            linkedin_url: '',
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

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: async (data: ClientCreate) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save client. Please try again.');
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ClientCreate) => {
      const response = await fetch(`/api/clients/${client?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
  const onSubmit = (data: ClientCreate) => {
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
