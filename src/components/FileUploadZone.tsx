import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Loader2, AlertTriangle, CheckCircle, X, ArrowRight, Camera, Zap } from 'lucide-react';
// Assuming this exists in your project
import { compressImage, CompressedImageResult } from '../utils/imageCompression';

type ScanStatus = 'idle' | 'dragging' | 'scanning' | 'warning' | 'error' | 'passed';

interface FileUploadZoneProps {
  onFileProcessed?: (file: File, compressionData?: CompressedImageResult) => void;
}

export function FileUploadZone({ onFileProcessed }: FileUploadZoneProps) {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressedImageResult | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setScanStatus('scanning');
    
    try {
      // Simulate real compression/scanning time
      const result = await compressImage(file);
      setCompressionResult(result);
      setProcessedFile(file); // In reality, this would be the newly compressed file
      
      // Artificial delay to let the user see the scanning animation (good UX)
      setTimeout(() => {
        // Mock logic: if file is large, throw warning, else pass
        if (file.size > 2000000) {
          setScanStatus('warning');
        } else {
          setScanStatus('passed');
          if (onFileProcessed) onFileProcessed(file, result);
        }
      }, 1500);
    } catch (error) {
      console.error("Image processing failed", error);
      setScanStatus('error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // --- Expert Upgrade: Real Drag & Drop Handlers ---
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scanStatus === 'idle') setScanStatus('dragging');
  }, [scanStatus]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scanStatus === 'dragging') setScanStatus('idle');
  }, [scanStatus]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleRetake = () => {
    setScanStatus('idle');
    setFileName(null);
    setCompressionResult(null);
    setProcessedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProceed = () => {
    setScanStatus('passed');
    if (onFileProcessed && processedFile) {
      onFileProcessed(processedFile, compressionResult || undefined);
    }
  };

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Assessment</label>
      
      <div 
        onClick={() => (scanStatus === 'idle' || scanStatus === 'error') ? fileInputRef.current?.click() : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all duration-200 relative overflow-hidden min-h-[200px] ${
          scanStatus === 'idle' || scanStatus === 'error' ? 'border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-blue-400' : 
          scanStatus === 'dragging' ? 'border-dashed border-blue-500 bg-blue-50 scale-[1.02]' : 
          'border-solid border-gray-200 bg-gray-50'
        }`}
      >
        {(scanStatus === 'idle' || scanStatus === 'dragging') && (
          <div className="group pointer-events-none">
            <div className={`p-3 rounded-full mb-3 inline-block transition-colors ${scanStatus === 'dragging' ? 'bg-blue-200' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
              <UploadCloud className={`w-6 h-6 ${scanStatus === 'dragging' ? 'text-blue-700' : 'text-blue-600'}`} />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {scanStatus === 'dragging' ? 'Drop assessment here...' : 'Drag and drop worksheet photo, or click'}
            </p>
            <p className="text-xs text-gray-500">Supports JPG, PNG (Max 5MB)</p>
          </div>
        )}

        {scanStatus === 'scanning' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3 mx-auto" />
            <p className="text-sm font-medium text-blue-700">Optimizing for AI analysis...</p>
          </div>
        )}

        {scanStatus === 'warning' && (
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Low Image Quality Detected</h4>
                  <p className="text-sm text-yellow-700 mb-3 leading-relaxed">
                    Image appears dark or blurry. For the most accurate AI diagnosis, please retake near a natural light source.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button onClick={(e) => { e.stopPropagation(); handleRetake(); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-yellow-300 text-yellow-700 text-xs font-medium rounded hover:bg-yellow-50 transition-colors">
                      <Camera size={14} /> Retake Photo
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleProceed(); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded hover:bg-yellow-700 transition-colors shadow-sm">
                      Proceed Anyway <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {scanStatus === 'passed' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-50 p-3 rounded-full mb-3 inline-block">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{fileName}</p>
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">Ready for AI Analysis</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleRetake(); }} className="mt-4 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mx-auto transition-colors z-10 relative">
              <X size={12} /> Remove file
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={handleFileSelect} />
      </div>
    </div>
  );
}