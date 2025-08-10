'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import FileUploadTest from '@/components/FileUploadTest';

export default function TestFileUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered:', event.target.files);
    const files = Array.from(event.target.files || []);
    console.log('Selected files:', files);
    setSelectedFiles(files);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">File Upload Test Page</h1>
      
      <div className="space-y-8">
        {/* Simple Test */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Simple File Upload Test</h2>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Selected Files ({selectedFiles.length}):</h3>
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

        {/* Advanced Test Component */}
        <FileUploadTest />
      </div>
    </div>
  );
} 