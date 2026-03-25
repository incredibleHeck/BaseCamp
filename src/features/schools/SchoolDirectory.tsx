import React, { useState, useEffect, useCallback } from 'react';
import { Building, Loader2, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { getSchoolsByDistrict } from '../../services/schoolService';
import { getHeadteachersByDistrict } from '../../services/userService';
import type { UserData } from '../../components/layout/Header';

interface SchoolDirectoryProps {
  user: UserData;
  onSchoolClick?: (schoolId: string) => void;
}

interface SchoolWithHeadteacher {
  id: string;
  name: string;
  circuitId?: string;
  headteacherName?: string;
}

export function SchoolDirectory({ user, onSchoolClick }: SchoolDirectoryProps) {
  const [schools, setSchools] = useState<SchoolWithHeadteacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [circuitFilter, setCircuitFilter] = useState<string>('All');

  const districtId = user.districtId;

  const loadData = useCallback(async () => {
    if (!districtId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const [fetchedSchools, fetchedHeadteachers] = await Promise.all([
        getSchoolsByDistrict(districtId),
        getHeadteachersByDistrict(districtId)
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
  }, [districtId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!districtId) {
    return (
      <div className="p-8 text-center text-zinc-500">
        You must be assigned to a district to view the School Directory.
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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            School Directory
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Overview of all schools and assigned headteachers in your district.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <CardTitle className="text-base">District Schools</CardTitle>
          <CardDescription>Directory of schools in your jurisdiction.</CardDescription>
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
                  <TableHead>School Name</TableHead>
                  <TableHead>Circuit</TableHead>
                  <TableHead>Headteacher</TableHead>
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
