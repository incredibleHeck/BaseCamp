import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import type { SchoolMetrics } from '../../services/analytics/organizationAnalyticsService';

const BAR_FILL = '#0f172a';

interface SchoolComparisonChartsProps {
  schools: SchoolMetrics[];
  onSchoolClick?: (schoolId: string) => void;
}

export function SchoolComparisonCharts({ schools, onSchoolClick }: SchoolComparisonChartsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Average score by branch</CardTitle>
      </CardHeader>
      <CardContent>
        {schools.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No branch data yet. Students grouped by campus will appear here.
          </p>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schools.map((s) => ({
                  schoolId: s.schoolId,
                  schoolName: s.schoolName,
                  avgScore: s.avgScore,
                }))}
                margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    const schoolId = state.activePayload[0].payload.schoolId;
                    if (schoolId && onSchoolClick) {
                      onSchoolClick(schoolId);
                    }
                  }
                }}
                className={onSchoolClick ? "cursor-pointer" : ""}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="schoolName"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ className: 'stroke-slate-300 dark:stroke-slate-600' }}
                />
                <YAxis
                  domain={[0, 100]}
                  width={36}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ className: 'stroke-slate-300 dark:stroke-slate-600' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: '1px solid rgb(226 232 240)',
                    fontSize: '0.875rem',
                  }}
                  formatter={(value: number | string) => [value, 'Avg score']}
                  labelFormatter={(label) => String(label)}
                />
                <Bar dataKey="avgScore" fill={BAR_FILL} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}