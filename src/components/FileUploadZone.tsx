import React from 'react';
import { UploadCloud } from 'lucide-react';

export function FileUploadZone() {
  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Assessment
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group">
        <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
          <UploadCloud className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          Drag and drop worksheet photo, or click to browse
        </p>
        <p className="text-xs text-gray-500">
          Supports JPG, PNG, PDF
        </p>
        <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
      </div>

      <button 
        type="button"
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Diagnose Learning Gaps
      </button>
    </div>
  );
}
