import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Loader2, Trash2, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  getTeachersBySchool,
  addTeacher,
  type CreateTeacherResult,
  type SchoolTeacherSummary,
} from '../../services/userService';
import type { UserData } from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import { InviteTeacherDialog } from './InviteTeacherDialog';
import { TeacherHandoverDialog } from './TeacherHandoverDialog';

interface StaffDirectoryProps {
  user: UserData;
  /** When set (e.g. org admin picked a branch from the directory), scope staff to this school. */
  scopeSchoolId?: string;
}

export function StaffDirectory({ user, scopeSchoolId }: StaffDirectoryProps) {
  const { tokenClaims } = useAuth();
  const [teachers, setTeachers] = useState<SchoolTeacherSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTeacher, setCreatedTeacher] = useState<CreateTeacherResult | null>(null);

  // Remove flow: handover dialog (teachers only — list is role-filtered)
  const [handoverTeacher, setHandoverTeacher] = useState<SchoolTeacherSummary | null>(null);

  const activeSchoolId = scopeSchoolId?.trim() || user.schoolId;
  const effectiveSchoolId = tokenClaims.schoolId ?? activeSchoolId ?? '';
  const canInviteByEmail =
    Boolean(effectiveSchoolId) &&
    (user.role === 'headteacher' || user.role === 'org_admin' || user.role === 'super_admin');

  const loadTeachers = useCallback(async () => {
    if (!activeSchoolId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getTeachersBySchool(activeSchoolId);
      setTeachers(data);
    } catch (err) {
      setError('Failed to load teachers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeSchoolId]);

  useEffect(() => {
    void loadTeachers();
  }, [loadTeachers]);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchoolId || !newTeacherName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await addTeacher(newTeacherName, activeSchoolId, user.id);
      setCreatedTeacher(result);
      await loadTeachers(); // Refresh the list
    } catch (err) {
      setError('Failed to create teacher account.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setNewTeacherName('');
      setCreatedTeacher(null);
      setError(null);
    }, 200);
  };

  const openHandover = (t: SchoolTeacherSummary) => {
    setHandoverTeacher(t);
  };

  if (!activeSchoolId) {
    if (user.role === 'org_admin') {
      return (
        <div className="mx-auto w-full max-w-lg rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-center text-zinc-700">
          <p className="text-sm text-zinc-800">
            Please select a branch from the Branch Directory first to manage its staff.
          </p>
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-zinc-500">
        You must be assigned to a school to view the Staff Directory.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Staff Directory
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage teacher accounts for your school.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {canInviteByEmail && (
            <Button type="button" variant="outline" onClick={() => setInviteOpen(true)}>
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              Invite by email
            </Button>
          )}
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Add Teacher
          </Button>
        </div>

        <InviteTeacherDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          targetSchoolId={effectiveSchoolId}
          onInvited={() => void loadTeachers()}
        />

        <Dialog isOpen={isDialogOpen} onClose={resetDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <p className="text-sm text-zinc-500">
                Create a new teacher account. A username will be generated automatically.
              </p>
            </DialogHeader>
            
            {createdTeacher ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-zinc-900">Account Created!</h4>
                  <p className="text-sm text-zinc-500 mt-1">
                    Share school ID, username, and this one-time password. The teacher logs in with School ID + username + PIN on the login screen.
                  </p>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 w-full mt-4 space-y-3 text-left">
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Username</span>
                    <code className="text-sm font-mono font-bold text-indigo-600 block bg-white p-2 rounded border border-zinc-100 mt-1">
                      {createdTeacher.username}
                    </code>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Managed email (internal)</span>
                    <code className="text-xs font-mono text-zinc-700 block bg-white p-2 rounded border border-zinc-100 mt-1 break-all">
                      {createdTeacher.email}
                    </code>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Temporary password</span>
                    <code className="text-sm font-mono font-bold text-amber-800 block bg-amber-50 p-2 rounded border border-amber-200 mt-1 break-all">
                      {createdTeacher.temporaryPassword}
                    </code>
                  </div>
                </div>
                <Button onClick={resetDialog} className="w-full mt-4">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAddTeacher}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-zinc-900">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      placeholder="e.g. Jane Doe"
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      disabled={isSubmitting}
                      required
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetDialog} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newTeacherName.trim() || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teachers</CardTitle>
          <CardDescription>All registered teachers at your school.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="bg-zinc-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-900">No teachers found</p>
              <p className="text-sm text-zinc-500 mt-1">Click "Add Teacher" to create the first account.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-xs border border-indigo-100">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        {teacher.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {teacher.username ? (
                        <code className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-700 font-mono">
                          {teacher.username}
                        </code>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openHandover(teacher)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TeacherHandoverDialog
        isOpen={handoverTeacher !== null}
        onClose={() => setHandoverTeacher(null)}
        teacher={handoverTeacher}
        schoolId={activeSchoolId}
        otherTeachers={teachers.filter((t) => handoverTeacher && t.id !== handoverTeacher.id)}
        onRemoved={() => void loadTeachers()}
      />
    </div>
  );
}
