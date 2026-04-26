import React, { useMemo } from 'react';
import { AlertTriangle, Building, FileText, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
/** Rollups from {@link getNetworkMetrics} in organizationAnalyticsService. */
import type { NetworkOverviewMetrics, SchoolMetrics } from '../../services/analytics/organizationAnalyticsService';

export interface NetworkBranchKPIsProps {
  overview: NetworkOverviewMetrics;
  /** Per-campus rows from the same payload as `overview` (multi-branch comparison). */
  branches: SchoolMetrics[];
}

function formatAvgScore(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function NetworkBranchKPIs({ overview, branches }: NetworkBranchKPIsProps) {
  const sortedBranches = useMemo(
    () => [...branches].sort((a, b) => a.schoolName.localeCompare(b.schoolName, undefined, { sensitivity: 'base' })),
    [branches]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Branches in network
            </CardTitle>
            <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {overview.totalSchools}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Learners across branches
            </CardTitle>
            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {overview.totalStudents}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Assessments (network)
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {overview.totalAssessments}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              School network avg. score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {formatAvgScore(overview.networkAverageScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className={
                overview.activeSenFlags > 0
                  ? 'text-sm font-medium text-amber-700 dark:text-amber-400'
                  : 'text-sm font-medium text-slate-600 dark:text-slate-400'
              }
            >
              Active SEN flags
            </CardTitle>
            <AlertTriangle
              className={
                overview.activeSenFlags > 0
                  ? 'h-4 w-4 text-amber-600 dark:text-amber-500'
                  : 'h-4 w-4 text-slate-500 dark:text-slate-400'
              }
              aria-hidden
            />
          </CardHeader>
          <CardContent>
            <p
              className={
                overview.activeSenFlags > 0
                  ? 'text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400'
                  : 'text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50'
              }
            >
              {overview.activeSenFlags}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branch comparison</CardTitle>
          <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
            Compare branches and campuses across your organization.
          </p>
        </CardHeader>
        <CardContent>
          {sortedBranches.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No branch rows yet. When students are linked to campuses, comparison metrics appear here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campus / branch</TableHead>
                  <TableHead className="text-right tabular-nums">Students</TableHead>
                  <TableHead className="text-right tabular-nums">Avg score</TableHead>
                  <TableHead className="text-right tabular-nums">SEN flags</TableHead>
                  <TableHead>Top learning gap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBranches.map((row) => (
                  <TableRow key={row.schoolId}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{row.schoolName}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.studentCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatAvgScore(row.avgScore)}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.activeSenCount}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {row.topLearningGap ?? '—'}
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
