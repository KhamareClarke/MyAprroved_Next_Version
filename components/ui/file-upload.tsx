'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from './button';
import { Upload, X, FileText, AlertTriangle } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onChange: (file: File | null) => void;
  value?: File | null;
  required?: boolean;
  errorMessage?: string;
}

export function FileUpload({
  label,
  accept = 'application/pdf,image/*',
  maxSizeMB = 5,
  onChange,
  value = null,
  required = false,
  errorMessage
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) {
      onChange(null);
      return;
    }
    
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB`);
      onChange(null);
      return;
    }
    
    onChange(file);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      
      <div className="border border-gray-300 rounded-md p-4">
        {value ? (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="text-sm truncate max-w-[200px]">{value.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear} 
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center justify-center py-4">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <div className="text-sm text-gray-500 text-center">
                <label htmlFor={`file-upload-${label.replace(/\s/g, '-')}`} className="cursor-pointer text-blue-600 hover:text-blue-500">
                  Click to upload
                </label>
                <p>or drag and drop</p>
                <p className="text-xs">PDF or Images (max. {maxSizeMB}MB)</p>
              </div>
            </div>
            <input
              id={`file-upload-${label.replace(/\s/g, '-')}`}
              name={label.replace(/\s/g, '_').toLowerCase()}
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept={accept}
              ref={inputRef}
            />
          </div>
        )}
      </div>
      
      {(error || errorMessage) && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{error || errorMessage}</span>
        </div>
      )}
    </div>
  );
}
