'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function APITest() {
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setResponse('');
    setError('');
    
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container p-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Simple API Test</h1>
      
      <div className="space-y-6">
        <Button 
          onClick={testAPI} 
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test API Connection'}
        </Button>
        
        {error && (
          <div className="p-4 border rounded bg-red-50 border-red-200 text-red-700">
            <div className="font-semibold">Error:</div>
            <div>{error}</div>
          </div>
        )}
        
        {response && (
          <div className="p-4 border rounded bg-green-50 border-green-200 text-green-700">
            <div className="font-semibold">Success:</div>
            <pre className="mt-2 whitespace-pre-wrap">{response}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
