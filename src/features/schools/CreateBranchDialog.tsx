import React, { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { createSchoolBranch } from '../../services/schoolService';

type CreateBranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function CreateBranchDialog({ open, onOpenChange, onCreated }: CreateBranchDialogProps) {
  const [name, setName] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [circuitId, setCircuitId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setOrganizationId('');
    setCircuitId('');
    setError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedOrg = organizationId.trim();
    if (!trimmedName || !trimmedOrg) return;
    setSubmitting(true);
    setError(null);
    try {
      const id = await createSchoolBranch({
        organizationId: trimmedOrg,
        name: trimmedName,
        ...(circuitId.trim() ? { circuitId: circuitId.trim() } : {}),
      });
      if (id) {
        toast.success('Branch created.');
        reset();
        onOpenChange(false);
        onCreated?.();
      } else {
        const text = 'Could not create branch. Check permissions or try again.';
        setError(text);
        toast.error(text);
      }
    } catch (err) {
      const e = err as { message?: string };
      const text =
        (typeof e.message === 'string' && e.message) || 'Could not create branch. Try again.';
      setError(text);
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={open} onClose={() => handleClose(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" aria-hidden />
            Add new branch
          </DialogTitle>
          <p className="text-sm text-zinc-500">
            Creates a school/branch document under the given organization. The organization should
            already exist in Firestore.
          </p>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="branch-name" className="text-sm font-medium text-zinc-800 block mb-1.5">
                Branch name
              </label>
              <Input
                id="branch-name"
                type="text"
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                placeholder="e.g. North Campus"
                required
              />
            </div>
            <div>
              <label htmlFor="branch-org-id" className="text-sm font-medium text-zinc-800 block mb-1.5">
                Organization ID
              </label>
              <Input
                id="branch-org-id"
                type="text"
                autoComplete="off"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                disabled={submitting}
                placeholder="Firestore organization document id"
                required
              />
            </div>
            <div>
              <label htmlFor="branch-circuit-id" className="text-sm font-medium text-zinc-800 block mb-1.5">
                Circuit ID <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <Input
                id="branch-circuit-id"
                type="text"
                autoComplete="off"
                value={circuitId}
                onChange={(e) => setCircuitId(e.target.value)}
                disabled={submitting}
                placeholder="Circuit or grouping label"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim() || !organizationId.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create branch'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
