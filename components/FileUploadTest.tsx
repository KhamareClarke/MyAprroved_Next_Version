'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function FileUploadTest() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered:', event.target.files);
    const files = Array.from(event.target.files || []);
    console.log('Selected files:', files);
    setSelectedFiles(files);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">File Upload Test</h3>
      
      {/* Method 1: Hidden input with label */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Method 1: Hidden input with label</h4>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-1"
        />
        <label 
          htmlFor="file-upload-1"
          className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files (Method 1)
        </label>
      </div>

      {/* Method 2: Direct button with click handler */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Method 2: Direct button with click</h4>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-2"
        />
        <Button 
          type="button" 
          variant="outline"
          onClick={() => document.getElementById('file-upload-2')?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files (Method 2)
        </Button>
      </div>

      {/* Method 3: Visible input */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Method 3: Visible input</h4>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Display selected files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length}):</h4>
          <ul className="space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 