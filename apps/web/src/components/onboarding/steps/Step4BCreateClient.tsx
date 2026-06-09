/**
 * Story 7.4 — Path B Step 4 — Manual client creation (3 fields only).
 *
 * Standalone component; Story 7.3 will mount this inside the onboarding shell.
 * Per BRAINSTORM §5: name, coaching goal, company. Everything else AI fills in
 * from sessions.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UpgradeRequiredError, type UsageLimitType } from '@meetsolis/shared';
import { UpgradeModal } from '@/components/billing/UpgradeModal';

const Step4BCreateClientFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  goal: z
    .string()
    .min(2, 'Tell us what your client is working toward')
    .max(1000, 'Goal must be at most 1,000 characters')
    .trim(),
  company: z.string().max(200).trim().optional(),
});

type FormData = z.infer<typeof Step4BCreateClientFormSchema>;

export interface Step4BCreateClientProps {
  /** Called when coach clicks "I'll add one later" — proceeds to Step 5. */
  onSkip?: () => void;
}

export function Step4BCreateClient({ onSkip }: Step4BCreateClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [upgradeLimitType, setUpgradeLimitType] =
    useState<UsageLimitType | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(Step4BCreateClientFormSchema),
    mode: 'onChange',
    defaultValues: { name: '', goal: '', company: '' },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          goal: data.goal,
          ...(data.company ? { company: data.company } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        if (res.status === 403 && body.error?.code === 'LIMIT_EXCEEDED') {
          throw new UpgradeRequiredError(body.error.type as UsageLimitType);
        }
        throw new Error(body.error?.message || 'Failed to create client');
      }
      const created = (await res.json()) as { id: string };
      toast.success('Client added');
      router.push(`/clients/${created.id}`);
    } catch (e) {
      if (e instanceof UpgradeRequiredError) {
        setUpgradeLimitType(e.limitType);
        return;
      }
      const message =
        e instanceof Error ? e.message : 'Failed to create client';
      toast.error(message);
    } finally {
      setSubmitting(false);
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

      <div className="mx-auto w-full max-w-md space-y-6 px-6 py-10">
        <header className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Step 4 of 7
          </p>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-foreground">
            Add your first real client
          </h1>
          <p className="text-[14px] text-foreground/55">
            Three fields. MeetSolis fills in everything else from your sessions.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-[12px] font-medium text-foreground/70"
            >
              Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              autoFocus
              placeholder="e.g. Sarah Chen"
              className="h-10"
            />
            {errors.name && (
              <p className="text-[12px] text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="goal"
              className="text-[12px] font-medium text-foreground/70"
            >
              Coaching goal <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="goal"
              {...register('goal')}
              placeholder="What is this client working toward?"
              rows={3}
            />
            {errors.goal && (
              <p className="text-[12px] text-red-400">{errors.goal.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="company"
              className="text-[12px] font-medium text-foreground/70"
            >
              Company <span className="text-foreground/35">(optional)</span>
            </Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="e.g. Acme Logistics"
              className="h-10"
            />
            {errors.company && (
              <p className="text-[12px] text-red-400">
                {errors.company.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={!isValid || submitting}
              className="h-11 gap-2 text-[14px] font-semibold"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Add client
            </Button>
            {onSkip && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                disabled={submitting}
                className="h-10 text-[13px] text-foreground/55 hover:text-foreground"
              >
                I&apos;ll add a client later
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
