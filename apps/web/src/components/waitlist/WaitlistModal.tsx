'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { joinWaitlist } from '@/app/actions/waitlist';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaitlistModalProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
}

export function WaitlistModal({
  children,
  defaultOpen = false,
}: WaitlistModalProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setMessage('');
      setError('');
      setSelectedRole('');
    }
  }, [open]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    setMessage('');

    const result = await joinWaitlist(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
      setMessage(result.message || 'You&apos;re on the list!');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto overscroll-contain rounded-xl">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.1,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"
              >
                <CheckCircle2 className="w-6 h-6" />
              </motion.div>
              <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                You&apos;re on the list!
              </DialogTitle>
              <DialogDescription className="text-slate-500 max-w-xs mx-auto mb-6">
                {message}
              </DialogDescription>
              <Button onClick={() => setOpen(false)} variant="outline">
                Close
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <DialogHeader className="text-left">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Join the Solis Waitlist
                </DialogTitle>
                <DialogDescription className="text-left">
                  Get early access to the memory layer for your client work.
                </DialogDescription>
              </DialogHeader>
              <form action={handleSubmit} className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name (Optional)</Label>
                  <Input id="name" name="name" placeholder="Jane Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">What best describes you?</Label>
                  <Select name="role" onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="agency">Agency Owner</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole === 'other' && (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="other_role">Please describe</Label>
                    <Input
                      id="other_role"
                      name="other_role"
                      placeholder="e.g. Student, Founder, etc."
                      required
                    />
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-4 bg-slate-900 hover:bg-slate-800 text-white w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Join Waitlist
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
