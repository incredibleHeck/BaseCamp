import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, AlertTriangle, CheckCircle, X, Camera, Image } from 'lucide-react';
import { compressImage } from '../utils/imageCompression';

const DEFAULT_MAX_FILES = 10;
const ABSOLUTE_MAX_FILES = 50;

interface FileUploadZoneProps {
  onFilesProcessed?: (files: File[]) => void;
  /** Cap on files (default 10, max 50). */
  maxFiles?: number;
  /** Override default worksheet label (e.g. compact hybrid staging). */
  label?: string;
  /** When true, file inputs accept multiple files at once. Default true. */
  multiple?: boolean;
}

export function FileUploadZone({
  onFilesProcessed,
  maxFiles = DEFAULT_MAX_FILES,
  label,
  multiple = true,
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const cap = Math.min(Math.max(1, maxFiles), ABSOLUTE_MAX_FILES);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      if (newFiles.length === 0) return;
      const remaining = cap - files.length;
      const toAdd = Array.from(newFiles).slice(0, remaining);
      if (toAdd.length === 0) return;

      setScanning(true);
      setScanError(null);

      try {
        const processed: File[] = [];
        for (const file of toAdd) {
          await compressImage(file);
          processed.push(file);
        }
        let updated: File[];
        if (cap === 1 && processed.length > 0) {
          updated = [processed[0]];
        } else {
          updated = [...files, ...processed].slice(0, cap);
        }
        setFiles(updated);
        onFilesProcessed?.(updated);
      } catch (err) {
        console.error('Image processing failed', err);
        setScanError('Failed to process one or more images.');
      } finally {
        setScanning(false);
      }
    },
    [files, cap, onFilesProcessed]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      processFiles(Array.from(selected));
    }
    e.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(Array.from(e.dataTransfer.files));
      }
    },
    [processFiles]
  );

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesProcessed?.(updated);
  };

  const clearAll = () => {
    setFiles([]);
    setScanError(null);
    onFilesProcessed?.([]);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const canAddMore = files.length < cap && !scanning;

  /** Thumbnail grid for batch / multi-page; single-file non-batch keeps compact list. */
  const useThumbnailGrid = files.length > 0 && (multiple || files.length > 1);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label ?? 'Upload Assessment (worksheet or exercise book pages)'}
        </label>
        {files.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1 border border-amber-200/80 tabular-nums">
            {files.length}/{cap} Photos Selected
          </span>
        )}
      </div>

      {files.length > 0 && !useThumbnailGrid && (
        <div className="mb-4 space-y-2">
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}-${file.size}`}
                className="flex items-center justify-between gap-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <span className="text-sm text-gray-800 truncate flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Page {index + 1}: {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                  aria-label={`Remove page ${index + 1}`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500">
            {files.length} page(s). Max {cap} page{cap === 1 ? '' : 's'}. Add more below if needed.
          </p>
        </div>
      )}

      {files.length > 0 && useThumbnailGrid && (
        <div className="mb-4 space-y-2">
          <div className="max-h-[min(22rem,45vh)] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/80 p-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}-${file.size}`}
                  className="relative aspect-square rounded-md overflow-hidden border border-gray-200 bg-white shadow-sm group"
                >
                  {previewUrls[index] && (
                    <img
                      src={previewUrls[index]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white hover:bg-red-600 transition-colors shadow-md"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                  <span className="pointer-events-none absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-1 py-1">
                    <span className="block truncate text-[10px] font-medium text-white drop-shadow-sm">
                      {file.name}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {files.length} of {cap} max. Scroll to see all thumbnails.
          </p>
        </div>
      )}

      {scanError && (
        <div className="mb-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle size={16} />
          {scanError}
        </div>
      )}

      {scanning && (
        <div className="mb-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Optimizing for AI analysis...
        </div>
      )}

      {canAddMore && (
        <div
          onClick={() => galleryInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all duration-200 min-h-[120px] ${
            dragActive
              ? 'border-blue-500 bg-blue-50 border-dashed'
              : 'border-dashed border-gray-300 hover:bg-gray-50 hover:border-blue-400 cursor-pointer'
          }`}
        >
          {files.length === 0 ? (
            <>
              <div className="mb-2 text-sm text-gray-500">
                Drag and drop worksheet photo{multiple ? 's' : ''}, or
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <Camera size={16} /> Take Photo
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    galleryInputRef.current?.click();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <Image size={16} /> Browse Gallery
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supports JPG, PNG. {multiple ? `Up to ${cap} files.` : 'One file at a time from gallery.'}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">Add another page</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <Camera size={14} /> Take Photo
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    galleryInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <Image size={14} /> Browse
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {files.length > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Remove all pages
        </button>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
      />
      <input
        ref={galleryInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
      />
    </div>
  );
}
