import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { addStudent, Student } from '../services/studentService';

interface AddStudentFormProps {
  onStudentAdded: (newStudent: Student) => void;
  onCancel: () => void;
}

export function AddStudentForm({ onStudentAdded, onCancel }: AddStudentFormProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !grade) {
      alert('Please fill out all fields.');
      return;
    }

    setIsSaving(true);
    const newStudent: Omit<Student, 'id'> = { name, grade };
    const newId = await addStudent(newStudent);
    
    setIsSaving(false);
    if (newId) {
      onStudentAdded({ id: newId, ...newStudent });
    } else {
      alert('Failed to add student. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="studentName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., Adjoa Mensah"
              required
            />
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              Grade / Class
            </label>
            <input
              id="grade"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., Primary 6"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-400"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
