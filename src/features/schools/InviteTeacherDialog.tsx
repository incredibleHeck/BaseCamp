import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { functions } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const inviteStaffMember = httpsCallable<
  { email: string; role: 'teacher'; targetSchoolId: string },
  { ok: boolean; uid: string; warning?: string }
>(functions, 'inviteStaffMember');

type InviteTeacherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Firestore + token tenant id for the invite. */
  targetSchoolId: string;
  onInvited?: () => void;
};

export function InviteTeacherDialog({ open, onOpenChange, targetSchoolId, onInvited }: InviteTeacherDialogProps) {
  const { refreshTokenClaims } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail('');
    setMessage(null);
    setError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!em || !targetSchoolId) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await inviteStaffMember({ email: em, role: 'teacher', targetSchoolId });
      if (data.warning) {
        setMessage(
          'Account created, but the invite email could not be sent. Share the password reset link manually or try again later.'
        );
        toast.warning(data.warning);
      } else {
        setMessage('Invitation sent. The teacher will receive an email to set their password.');
        toast.success('Invitation sent. The teacher can set their password from the email.');
      }
      setEmail('');
      await refreshTokenClaims();
      onInvited?.();
    } catch (err) {
      const e = err as { message?: string; code?: string };
      const text =
        (typeof e.message === 'string' && e.message) || 'Invitation failed. Try again or check permissions.';
      setError(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={open} onClose={() => handleClose(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-600" aria-hidden />
            Invite teacher
          </DialogTitle>
          <p className="text-sm text-zinc-500">
            We will create their account and email them a link to set a password. No school code is required.
          </p>
        </DialogHeader>
        {message ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{message}</p>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div className="space-y-4 py-2">
              <div>
                <label htmlFor="invite-email" className="text-sm font-medium text-zinc-800 block mb-1.5">
                  Work email
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  placeholder="colleague@yourschool.edu.gh"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !email.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send invite'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
