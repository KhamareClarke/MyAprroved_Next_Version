'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkSupabaseConnection = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/debug/check-supabase', {
        method: 'POST',
      });
      
      const data = await response.json();
      setResult(data);
      
      if (!response.ok) {
        setError(data.error || 'Failed to connect to Supabase');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      
      <div className="space-y-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Supabase Connection Test</h2>
          <Button 
            onClick={checkSupabaseConnection}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Supabase Connection'}
          </Button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              <p className="font-medium">Error:</p>
              <p className="whitespace-pre-wrap">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              <p className="font-medium">Success:</p>
              <pre className="whitespace-pre-wrap overflow-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
