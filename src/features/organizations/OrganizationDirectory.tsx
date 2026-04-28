import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { getAllOrganizations, type OrganizationListItem } from '../../services/organizationService';

function formatCreatedAt(createdAt?: number): string {
  if (createdAt == null || !Number.isFinite(createdAt)) return '—';
  try {
    return new Date(createdAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

type OrganizationDirectoryProps = {
  onViewBranches: (args: { organizationId: string; name: string }) => void;
};

export function OrganizationDirectory({ onViewBranches }: OrganizationDirectoryProps) {
  const [orgs, setOrgs] = useState<OrganizationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrgs(await getAllOrganizations());
    } catch (e) {
      console.error(e);
      setError('Failed to load school networks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Network directory</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Registered school networks. Open a network to see its branches (campuses).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">School networks</CardTitle>
          <CardDescription>Organizations on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 font-medium">{error}</div>
          ) : orgs.length === 0 ? (
            <div className="py-12 text-center">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No school networks yet</p>
              <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
                When a school registers via <span className="font-medium">Register network</span>, their organization
                will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[1%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgs.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                          <Building2 className="h-4 w-4" />
                        </div>
                        {o.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600 tabular-nums">
                      {formatCreatedAt(o.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onViewBranches({ organizationId: o.id, name: o.name })}
                      >
                        View branches
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
