import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Building, Loader2, Mail, MapPin, Plus, User, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { InviteTeacherDialog } from './InviteTeacherDialog';
import { CreateBranchDialog } from './CreateBranchDialog';
import { getSchoolsInOrganization } from '../../services/schoolService';
import { getHeadteachersInOrganization } from '../../services/userService';
import { getOrganizationById } from '../../services/organizationService';
import type { UserData } from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';

export type SuperAdminNetworkScope = { organizationId: string; name: string };

interface SchoolDirectoryProps {
  user: UserData;
  onSchoolClick?: (schoolId: string) => void;
  /** When set, super admin sees only that network’s branches (not a global list). */
  superAdminNetwork?: SuperAdminNetworkScope | null;
  onBackToNetworks?: () => void;
}

interface SchoolWithHeadteacher {
  id: string;
  name: string;
  circuitId?: string;
  headteacherName?: string;
}

type InviteTarget = { schoolId: string; role: 'teacher' | 'headteacher' };

export function SchoolDirectory({ user, onSchoolClick, superAdminNetwork, onBackToNetworks }: SchoolDirectoryProps) {
  const [schools, setSchools] = useState<SchoolWithHeadteacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [circuitFilter, setCircuitFilter] = useState<string>('All');
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const [orgBrandingName, setOrgBrandingName] = useState<string | null>(null);

  const { tokenClaims } = useAuth();

  /** B2B: org_admin uses profile `organizationId` only; other roles may fall back to token claims. */
  const organizationId =
    user.role === 'org_admin'
      ? user.organizationId
      : user.organizationId || tokenClaims.organizationId;
  const isSuperAdmin = user.role === 'super_admin';
  const canInviteToSchools = user.role === 'org_admin' || user.role === 'super_admin';

  const loadData = useCallback(async () => {
    if (isSuperAdmin && !superAdminNetwork) {
      setSchools([]);
      setLoading(false);
      return;
    }
    if (!isSuperAdmin && !organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const orgIdForQuery =
        isSuperAdmin && superAdminNetwork
          ? superAdminNetwork.organizationId
          : organizationId!;
      const [fetchedSchools, fetchedHeadteachers] = await Promise.all([
        getSchoolsInOrganization(orgIdForQuery),
        getHeadteachersInOrganization(orgIdForQuery),
      ]);

      // Map headteachers to schools
      const headteacherMap = new Map<string, string>();
      fetchedHeadteachers.forEach(ht => {
        if (ht.schoolId) {
          headteacherMap.set(ht.schoolId, ht.name);
        }
      });

      const combinedData: SchoolWithHeadteacher[] = fetchedSchools.map(school => ({
        id: school.id,
        name: school.name,
        circuitId: school.circuitId,
        headteacherName: headteacherMap.get(school.id)
      }));

      setSchools(combinedData);
    } catch (err) {
      setError('Failed to load school directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, organizationId, superAdminNetwork]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const isOrgAdmin = user.role === 'org_admin';

  useEffect(() => {
    if (!isOrgAdmin || !organizationId) {
      setOrgBrandingName(null);
      return;
    }
    let cancelled = false;
    void getOrganizationById(organizationId).then((org) => {
      if (!cancelled) setOrgBrandingName(org?.name ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [isOrgAdmin, organizationId]);

  if (!isSuperAdmin && !organizationId) {
    return (
      <div className="p-8 text-center text-zinc-500">
        You must be assigned an organization (organizationId on your profile) to view the branch
        directory.
      </div>
    );
  }

  if (isSuperAdmin && !superAdminNetwork) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 py-12 text-center">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
          <Building className="h-7 w-7 text-zinc-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Select a school network</h2>
        <p className="text-sm text-zinc-500">
          Open <span className="font-medium">Network directory</span> in the sidebar, then choose
          <span className="font-medium"> View branches</span> on a network to see its campuses.
        </p>
        {onBackToNetworks && (
          <Button type="button" onClick={onBackToNetworks} className="mt-2">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Network directory
          </Button>
        )}
      </div>
    );
  }

  const uniqueCircuits = Array.from(new Set(schools.map(s => s.circuitId).filter(Boolean))) as string[];
  uniqueCircuits.sort();

  const filteredSchools = schools.filter(school => {
    if (circuitFilter === 'All') return true;
    if (circuitFilter === 'Unassigned') return !school.circuitId;
    return school.circuitId === circuitFilter;
  });

  const canAddBranch = user.role === 'org_admin' || (isSuperAdmin && Boolean(superAdminNetwork));

  const pageTitle =
    isOrgAdmin && orgBrandingName
      ? `${orgBrandingName} - Branch Directory`
      : 'Branch directory';

  const pageSubtitle =
    isSuperAdmin && superAdminNetwork
      ? `Branches in ${superAdminNetwork.name}, with lead contacts.`
      : isOrgAdmin && orgBrandingName
        ? `Branches and campuses in ${orgBrandingName}, with lead contacts.`
        : 'Branches and campuses in your school network, with lead contacts.';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {isSuperAdmin && superAdminNetwork && onBackToNetworks && (
        <div>
          <Button type="button" variant="ghost" size="sm" className="mb-1 -ml-1 text-zinc-600" onClick={onBackToNetworks}>
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
            Back to networks
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {pageTitle}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{pageSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canAddBranch && (
            <Button type="button" size="sm" onClick={() => setCreateBranchOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Add new branch
            </Button>
          )}
          <select
            value={circuitFilter}
            onChange={(e) => setCircuitFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          >
            <option value="All">All Circuits</option>
            {uniqueCircuits.map(circuit => (
              <option key={circuit} value={circuit}>{circuit}</option>
            ))}
            <option value="Unassigned">Unassigned</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Network branches</CardTitle>
          <CardDescription>
            {isSuperAdmin && superAdminNetwork
              ? `Campuses in ${superAdminNetwork.name}.`
              : isOrgAdmin && orgBrandingName
                ? `Campuses in ${orgBrandingName}.`
                : 'Branches in your organization.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 font-medium">
              {error}
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="py-12 text-center">
              <div className="bg-zinc-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-900">No schools found</p>
              <p className="text-sm text-zinc-500 mt-1">There are no schools matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch / campus</TableHead>
                  <TableHead>Circuit</TableHead>
                  <TableHead>Headteacher</TableHead>
                  {canInviteToSchools && (
                    <>
                      <TableHead className="w-[1%] whitespace-nowrap text-right">Invite teacher</TableHead>
                      <TableHead className="w-[1%] whitespace-nowrap text-right">Invite Headteacher</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow 
                    key={school.id} 
                    onClick={() => onSchoolClick && onSchoolClick(school.id)}
                    className={onSchoolClick ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors" : ""}
                  >
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-xs border border-indigo-100">
                          <Building className="h-4 w-4" />
                        </div>
                        {school.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {school.circuitId ? (
                        <div className="flex items-center gap-1.5 text-zinc-600">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="text-sm">{school.circuitId}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {school.headteacherName ? (
                        <div className="flex items-center gap-2 text-zinc-700">
                          <User className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm font-medium">{school.headteacherName}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          No Headteacher Assigned
                        </span>
                      )}
                    </TableCell>
                    {canInviteToSchools && (
                      <>
                        <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInviteTarget({ schoolId: school.id, role: 'teacher' });
                            }}
                          >
                            <Mail className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                            Invite
                          </Button>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInviteTarget({ schoolId: school.id, role: 'headteacher' });
                            }}
                          >
                            <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                            Invite Headteacher
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteTeacherDialog
        open={inviteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setInviteTarget(null);
        }}
        targetSchoolId={inviteTarget?.schoolId ?? ''}
        inviteRole={inviteTarget?.role ?? 'teacher'}
        roleLocked={inviteTarget?.role === 'headteacher'}
        onInvited={() => void loadData()}
      />

      <CreateBranchDialog
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        onCreated={() => void loadData()}
        orgId={
          isSuperAdmin && superAdminNetwork
            ? superAdminNetwork.organizationId
            : !isSuperAdmin
              ? (organizationId ?? undefined)
              : undefined
        }
      />
    </div>
  );
}
