import React, { useState } from 'react';
import { Mail, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { InviteTeacherDialog } from './InviteTeacherDialog';

export interface TeacherEntry {
  id: string;
  name: string;
  class: string;
  contact: string;
  lastActive: string;
}

interface TeacherDirectoryProps {
  schoolName?: string;
  teachers?: TeacherEntry[];
}

const defaultTeachers: TeacherEntry[] = [
  { id: 't1', name: 'Teacher Mensah', class: 'Primary 6A', contact: 'mensah@school.edu.gh', lastActive: 'Today' },
  { id: 't2', name: 'Teacher Osei', class: 'Primary 6B', contact: 'osei@school.edu.gh', lastActive: '2 days ago' },
  { id: 't3', name: 'Teacher Appiah', class: 'Primary 6C', contact: 'appiah@school.edu.gh', lastActive: '1 day ago' },
];

export function TeacherDirectory({
  schoolName = 'Campus',
  teachers = defaultTeachers,
}: TeacherDirectoryProps) {
  const { user, tokenClaims } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const targetSchool = tokenClaims.schoolId ?? user.schoolId ?? '';
  const showInvite =
    Boolean(targetSchool) &&
    (user.role === 'headteacher' || user.role === 'org_admin' || user.role === 'super_admin');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Teacher Directory — {schoolName}</h2>
          <p className="text-gray-600 mt-1 text-sm">Contact and class assignment for school staff.</p>
        </div>
        {showInvite && (
          <Button type="button" variant="outline" className="shrink-0" onClick={() => setInviteOpen(true)}>
            <Mail className="mr-2 h-4 w-4" aria-hidden />
            Invite teacher
          </Button>
        )}
      </div>

      <InviteTeacherDialog open={inviteOpen} onOpenChange={setInviteOpen} targetSchoolId={targetSchool} />

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Users size={14} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{teacher.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{teacher.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{teacher.contact}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
