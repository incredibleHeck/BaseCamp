import React from 'react';
import type { CurriculumFramework } from '../../services/ai/curriculumRagService';
import { selectTriggerClass } from '../../utils/ui-helpers';

interface CurriculumSelectorProps {
  assessmentType: 'numeracy' | 'literacy' | '';
  onAssessmentTypeChange: (type: 'numeracy' | 'literacy' | '') => void;
  curriculumFramework: CurriculumFramework;
  onCurriculumFrameworkChange: (framework: CurriculumFramework) => void;
}

export function CurriculumSelector({
  assessmentType,
  onAssessmentTypeChange,
  curriculumFramework,
  onCurriculumFrameworkChange,
}: CurriculumSelectorProps) {
  return (
    <>
      <div>
        <label htmlFor="assessmentType" className="block text-sm font-medium text-gray-700 mb-1">
          Assessment Type
        </label>
        <select
          id="assessmentType"
          required
          value={assessmentType}
          onChange={(e) => onAssessmentTypeChange(e.target.value as 'numeracy' | 'literacy' | '')}
          className={selectTriggerClass}
        >
          <option value="" disabled>
            Select assessment type...
          </option>
          <option value="numeracy">Numeracy (Math)</option>
          <option value="literacy">Literacy (English)</option>
        </select>
      </div>

      <div>
        <label htmlFor="curriculumFramework" className="block text-sm font-medium text-gray-700 mb-1">
          Curriculum Standard
        </label>
        <select
          id="curriculumFramework"
          value={curriculumFramework}
          onChange={(e) => onCurriculumFrameworkChange(e.target.value as CurriculumFramework)}
          className={selectTriggerClass}
        >
          <option value="GES">Ghana (GES)</option>
          <option value="Cambridge">Cambridge International</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Cambridge mode uses pilot taxonomies: Primary Mathematics for numeracy and Primary English / Literacy for
          literacy (filtered by roster grade and keywords). If the wrong subject is selected, you may get a “no match”
          fallback instead of forced objectives.
        </p>
      </div>
    </>
  );
}