import { useState, useMemo } from 'react';
import type { StudentListItem } from './ClassRoster';

export function useRosterFilters(students: StudentListItem[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCohort =
        selectedCohortId === 'all' ||
        (selectedCohortId !== '' && student.cohortId === selectedCohortId);
      return matchesSearch && matchesCohort;
    });
  }, [students, searchTerm, selectedCohortId]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCohortId,
    setSelectedCohortId,
    filteredStudents,
  };
}