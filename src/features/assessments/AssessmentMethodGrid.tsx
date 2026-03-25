import React from 'react';
import { Camera, Edit3, Mic } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../utils/ui-helpers';

interface AssessmentMethodGridProps {
  inputMode: 'upload' | 'manual' | 'voice';
  onInputModeChange: (mode: 'upload' | 'manual' | 'voice') => void;
}

export function AssessmentMethodGrid({ inputMode, onInputModeChange }: AssessmentMethodGridProps) {
  const modeButtons: { mode: 'upload' | 'manual' | 'voice'; label: string; icon: React.ReactNode }[] = [
    { mode: 'upload', label: 'Photo Upload', icon: <Camera size={16} /> },
    { mode: 'manual', label: 'Manual Entry', icon: <Edit3 size={16} /> },
    { mode: 'voice', label: 'Voice', icon: <Mic size={16} /> },
  ];

  return (
    <div className="pt-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Input Mode</label>
      <div className="grid grid-cols-1 gap-2 rounded-lg bg-gray-100 p-1 sm:grid-cols-3">
        {modeButtons.map(({ mode, label, icon }) => (
          <Button
            key={mode}
            type="button"
            variant={inputMode === mode ? 'outline' : 'ghost'}
            className={cn(
              'h-10 min-h-10 w-full justify-center gap-2 text-sm font-medium',
              inputMode === mode &&
                'border-slate-200 bg-white text-indigo-600 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-slate-900'
            )}
            onClick={() => onInputModeChange(mode)}
          >
            {icon}
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}