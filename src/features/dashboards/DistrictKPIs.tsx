import React from 'react';
import { AlertTriangle, Building, FileText, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import type { DistrictOverviewMetrics } from '../../services/analytics/districtAnalyticsService';

interface DistrictKPIsProps {
  overview: DistrictOverviewMetrics;
}

function formatAvgScore(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function DistrictKPIs({ overview }: DistrictKPIsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total schools
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
            Total students
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
            Total assessments
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
            District average score
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
            {formatAvgScore(overview.districtAverageScore)}
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
  );
}