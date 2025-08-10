'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestAPI() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Basic test to check if API is reachable
  const testAPIConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/test/ping', {
        method: 'GET'
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
    } catch (err: any) {
      setError(`API connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Test user creation (no file uploads)
  const testUserCreation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('fullName', 'Test User');
      formData.append('email', `test${Date.now()}@example.com`); // Unique email
      formData.append('password', 'Password123!');
      formData.append('phone', '07777000000');
      formData.append('trade', 'Plumber');
      formData.append('companyName', 'Test Company');
      formData.append('postcode', 'SW1A 1AA');
      
      const response = await fetch('/api/test/create-user', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        setError(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`User creation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">API Testing</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test API Connection</h2>
          <p className="mb-4 text-gray-600">Simple ping test to verify the API routes are accessible</p>
          <Button onClick={testAPIConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test API Connection'}
          </Button>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test User Creation</h2>
          <p className="mb-4 text-gray-600">Tests Supabase user creation without file uploads</p>
          <Button onClick={testUserCreation} disabled={loading}>
            {loading ? 'Creating...' : 'Create Test User'}
          </Button>
        </div>
      </div>
      
      {/* Results display */}
      <div className="mt-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
            <p className="font-medium">Error:</p>
            <pre className="whitespace-pre-wrap mt-2">{error}</pre>
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">
            <p className="font-medium">Response:</p>
            <pre className="whitespace-pre-wrap mt-2 overflow-auto max-h-60">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
