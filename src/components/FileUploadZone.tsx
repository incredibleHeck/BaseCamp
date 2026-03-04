import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, AlertTriangle, CheckCircle, X, ArrowRight, Camera } from 'lucide-react';

type ScanStatus = 'idle' | 'scanning' | 'warning' | 'passed';

export function FileUploadZone() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      startScan();
    }
  };

  const startScan = () => {
    setScanStatus('scanning');
    // Simulate 1-second scan
    setTimeout(() => {
      setScanStatus('warning');
    }, 1000);
  };

  const handleRetake = () => {
    setScanStatus('idle');
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProceed = () => {
    setScanStatus('passed');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Assessment
      </label>
      
      <div 
        onClick={scanStatus === 'idle' ? triggerFileInput : undefined}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all duration-200 relative overflow-hidden min-h-[200px] ${
          scanStatus === 'idle' 
            ? 'border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-blue-400' 
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        {/* Idle State */}
        {scanStatus === 'idle' && (
          <div className="group">
            <div className="bg-blue-50 p-3 rounded-full mb-3 inline-block group-hover:bg-blue-100 transition-colors">
              <UploadCloud className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Drag and drop worksheet photo, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, PDF
            </p>
          </div>
        )}

        {/* Scanning State */}
        {scanStatus === 'scanning' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3 mx-auto" />
            <p className="text-sm font-medium text-blue-700">Scanning image quality...</p>
            <p className="text-xs text-blue-500 mt-1">Analyzing lighting and focus</p>
          </div>
        )}

        {/* Warning State */}
        {scanStatus === 'warning' && (
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Image Quality Warning</h4>
                  <p className="text-sm text-yellow-700 mb-3 leading-relaxed">
                    Image appears dark or blurry. For the most accurate AI diagnosis, please retake near a natural light source.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRetake(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-yellow-300 text-yellow-700 text-xs font-medium rounded hover:bg-yellow-50 transition-colors"
                    >
                      <Camera size={14} />
                      Retake Photo
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleProceed(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded hover:bg-yellow-700 transition-colors shadow-sm"
                    >
                      Proceed Anyway
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Passed State */}
        {scanStatus === 'passed' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-50 p-3 rounded-full mb-3 inline-block">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {fileName || 'Assessment Uploaded'}
            </p>
            <p className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
              Image Quality: Good
            </p>
            <button 
              onClick={handleRetake}
              className="mt-4 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mx-auto transition-colors"
            >
              <X size={12} />
              Remove file
            </button>
          </div>
        )}

        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept=".jpg,.jpeg,.png,.pdf" 
          onChange={handleFileSelect}
        />
      </div>

      <button 
        type="button"
        disabled={scanStatus !== 'passed'}
        className={`mt-6 w-full font-medium py-2.5 px-4 rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          scanStatus === 'passed'
            ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {scanStatus === 'passed' ? 'Diagnose Learning Gaps' : 'Upload Image to Diagnose'}
      </button>
    </div>
  );
}
