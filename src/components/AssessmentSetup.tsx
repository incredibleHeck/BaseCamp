import React, { useState } from 'react';
import { FileUploadZone } from './FileUploadZone';
import { Camera, Edit3 } from 'lucide-react';

// 1. Define the shape of the data we will submit
export interface AssessmentData {
  studentId: string;
  assessmentType: string;
  inputMode: 'upload' | 'manual';
  dialect: string | null;
  manualRubric?: string[];
  observations?: string;
}

interface AssessmentSetupProps {
  onDiagnose: (data: AssessmentData) => void;
  isProcessing?: boolean;
}

export function AssessmentSetup({ onDiagnose, isProcessing = false }: AssessmentSetupProps) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'manual'>('upload');
  const [isLocalDialect, setIsLocalDialect] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState('');
  
  // Manual entry states
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [observations, setObservations] = useState('');

  const handleRubricToggle = (rubric: string) => {
    setSelectedRubrics(prev => 
      prev.includes(rubric) 
        ? prev.filter(r => r !== rubric) 
        : [...prev, rubric]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !assessmentType) {
      alert("Please select a student and assessment type.");
      return;
    }

    onDiagnose({
      studentId: selectedStudent,
      assessmentType,
      inputMode,
      dialect: isLocalDialect ? selectedDialect : null,
      manualRubric: inputMode === 'manual' ? selectedRubrics : undefined,
      observations: inputMode === 'manual' ? observations : undefined,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Assessment</h3>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
            Select Student
          </label>
          {/* Use standard required validation */}
          <select
            id="student"
            required
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Select a student...</option>
            <option value="kwame_m">Kwame Mensah (Primary 6)</option>
            <option value="ama_o">Ama Osei (Primary 6)</option>
            <option value="kojo_a">Kojo Appiah (Primary 5)</option>
          </select>

          <div className="mt-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={isLocalDialect}
                  onChange={(e) => setIsLocalDialect(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Student primarily speaks a local dialect at home
                </span>
                <p className="text-xs text-blue-500/80 italic mt-0.5">
                  Provides context to the AI to distinguish between cognitive literacy gaps and ESL translation errors.
                </p>
              </div>
            </label>
            
            {/* 2. Reveal dialect selector if checked */}
            {isLocalDialect && (
              <div className="mt-2 ml-7 animate-in fade-in slide-in-from-top-2">
                <select
                  value={selectedDialect}
                  onChange={(e) => setSelectedDialect(e.target.value)}
                  required={isLocalDialect}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Specify dialect...</option>
                  <option value="Twi">Twi</option>
                  <option value="Ga">Ga</option>
                  <option value="Ewe">Ewe</option>
                  <option value="Dagbani">Dagbani</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="assessmentType" className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Type
          </label>
          <select
            id="assessmentType"
            required
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Select assessment type...</option>
            <option value="numeracy">Numeracy (Fractions & Decimals)</option>
            <option value="literacy">Literacy (Reading Comprehension)</option>
          </select>
        </div>

        {/* Input Mode Toggle - Reduced repetition in classNames */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment Input Mode
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
            {(['upload', 'manual'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setInputMode(mode)}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                  inputMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode === 'upload' ? <Camera size={16} /> : <Edit3 size={16} />}
                {mode === 'upload' ? 'Photo Upload' : 'Manual Entry'}
              </button>
            ))}
          </div>
        </div>

        {inputMode === 'upload' ? (
          <FileUploadZone />
        ) : (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Rubric Selection</h4>
              <div className="space-y-2">
                {['Struggles with carrying over numbers', 'Confuses numerators and denominators', 'Difficulty sounding out multi-syllable words'].map((rubric) => (
                  <label key={rubric} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedRubrics.includes(rubric)}
                      onChange={() => handleRubricToggle(rubric)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded" 
                    />
                    <span className="text-sm text-gray-700">{rubric}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Observations (Optional)
              </label>
              <textarea
                id="observations"
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                placeholder="Add any specific notes about the student's performance..."
              />
            </div>

            <button 
              type="submit"
              disabled={isProcessing}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Analyzing...' : 'Diagnose Learning Gaps'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}