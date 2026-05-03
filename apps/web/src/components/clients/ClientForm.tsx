/**
 * ClientForm Component
 * v3: Executive coach fields — goal, start_date replace email/phone/linkedin/tags
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Client,
  ClientCreateSchema,
  UpgradeRequiredError,
  type UsageLimitType,
} from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { z } from 'zod';
import { UpgradeModal } from '@/components/billing/UpgradeModal';

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
  const [upgradeLimitType, setUpgradeLimitType] =
    useState<UsageLimitType | null>(null);

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
        const body = await response.json();
        if (response.status === 403 && body.error?.code === 'LIMIT_EXCEEDED') {
          throw new UpgradeRequiredError(body.error.type as UsageLimitType);
        }
        throw new Error(body.error?.message || 'Failed to create client');
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
      if (error instanceof UpgradeRequiredError) {
        setUpgradeLimitType(error.limitType);
        return;
      }
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
    <>
      {upgradeLimitType && (
        <UpgradeModal
          isOpen={!!upgradeLimitType}
          onClose={() => setUpgradeLimitType(null)}
          limitType={upgradeLimitType}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name (Required) */}
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-[12px] font-medium text-muted-foreground"
          >
            Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Sarah Johnson"
            className={errors.name ? 'border-red-500/60' : ''}
          />
          {errors.name && (
            <p className="text-[11px] text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Coaching Goal */}
        <div className="space-y-1.5">
          <Label
            htmlFor="goal"
            className="text-[12px] font-medium text-muted-foreground"
          >
            Coaching Goal
          </Label>
          <Textarea
            id="goal"
            {...register('goal')}
            placeholder="e.g. Transition to CTO role, improve executive presence"
            rows={2}
            className="resize-none"
          />
          {errors.goal && (
            <p className="text-[11px] text-red-400">{errors.goal.message}</p>
          )}
        </div>

        {/* Row: Start Date + Company */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="start_date"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Coaching Start Date
            </Label>
            <Input
              id="start_date"
              type="date"
              {...register('start_date')}
              className="[color-scheme:dark]"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="company"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Company
            </Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Acme Corp"
            />
          </div>
        </div>

        {/* Row: Role + Website */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="role"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Role
            </Label>
            <Input id="role" {...register('role')} placeholder="CEO" />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="website"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Website
            </Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              placeholder="https://example.com"
              className={errors.website ? 'border-red-500/60' : ''}
            />
            {errors.website && (
              <p className="text-[11px] text-red-400">
                {errors.website.message}
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label
            htmlFor="notes"
            className="text-[12px] font-medium text-muted-foreground"
          >
            Notes
          </Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional context about this client..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </>
  );
}
