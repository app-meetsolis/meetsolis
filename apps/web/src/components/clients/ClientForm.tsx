/**
 * ClientForm Component
 * v3: Executive coach fields — goal, start_date replace email/phone/linkedin/tags
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Client, ClientCreateSchema } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { z } from 'zod';

// Form schema — v3 coaching fields only
const ClientFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  goal: z.string().trim().optional(),
  start_date: z.string().optional(),
  website: z
    .string()
    .url('Invalid URL format')
    .trim()
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().optional(),
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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(ClientFormSchema),
    mode: 'onChange',
    defaultValues:
      mode === 'edit' && client
        ? {
            name: client.name,
            company: client.company || '',
            role: client.role || '',
            goal: client.goal || '',
            start_date: client.start_date || '',
            website: client.website || '',
            notes: client.notes || '',
          }
        : {
            name: '',
            company: '',
            role: '',
            goal: '',
            start_date: '',
            website: '',
            notes: '',
          },
  });

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    onSubmittingChange(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
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

  const updateMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
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

  const onSubmit = (data: ClientFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name (Required) */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-[#1A1A1A]">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Sarah Johnson"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Coaching Goal */}
      <div className="space-y-2">
        <Label htmlFor="goal" className="text-sm font-medium text-[#1A1A1A]">
          Coaching Goal
        </Label>
        <Textarea
          id="goal"
          {...register('goal')}
          placeholder="e.g. Transition to CTO role, improve executive presence"
          rows={2}
        />
        {errors.goal && (
          <p className="text-sm text-red-500">{errors.goal.message}</p>
        )}
      </div>

      {/* Coaching Start Date */}
      <div className="space-y-2">
        <Label
          htmlFor="start_date"
          className="text-sm font-medium text-[#1A1A1A]"
        >
          Coaching Start Date
        </Label>
        <Input id="start_date" type="date" {...register('start_date')} />
        {errors.start_date && (
          <p className="text-sm text-red-500">{errors.start_date.message}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company" className="text-sm font-medium text-[#1A1A1A]">
          Company
        </Label>
        <Input id="company" {...register('company')} placeholder="Acme Corp" />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium text-[#1A1A1A]">
          Role
        </Label>
        <Input id="role" {...register('role')} placeholder="CEO" />
      </div>

      {/* Website */}
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

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-[#1A1A1A]">
          Notes
        </Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Any additional context about this client..."
          rows={3}
        />
      </div>

      {/* Actions */}
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
