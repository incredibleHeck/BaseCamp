import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createCohort } from '../services/cohortService';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { selectTriggerClass } from '../utils/ui-helpers';

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

interface CreateCohortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  /** Called with new Firestore document id after successful create. */
  onCreated: (cohortId: string) => void;
}

export function CreateCohortDialog({ isOpen, onClose, schoolId, onCreated }: CreateCohortDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(1);
  const [saving, setSaving] = useState(false);

  const allowed = user.role === 'headteacher' || user.role === 'super_admin';

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setGradeLevel(1);
      setSaving(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowed) return;

    const trimmed = name.trim();
    if (!trimmed || !schoolId.trim()) {
      alert('Enter a class name.');
      return;
    }
    setSaving(true);
    const id = await createCohort({
      schoolId: schoolId.trim(),
      name: trimmed,
      gradeLevel,
    });
    setSaving(false);
    if (id) {
      onCreated(id);
    } else {
      alert('Could not create class. Check console / Firestore rules.');
    }
  };

  if (!allowed) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create class (cohort)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cohortName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Class name
            </label>
            <Input
              id="cohortName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Primary 6A"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="cohortGrade" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Grade level (1–12)
            </label>
            <select
              id="cohortGrade"
              className={selectTriggerClass}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !schoolId.trim()} className="min-w-[7rem]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
