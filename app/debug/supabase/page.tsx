'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState({
    loading: true,
    error: '',
    url: '',
    key: '',
    database: false,
    storage: false,
    auth: false,
  });

  useEffect(() => {
    // Check environment variables directly
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setStatus(prev => ({
      ...prev,
      url: url ? 'Set' : 'Missing',
      key: key ? 'Set' : 'Missing',
      loading: false
    }));

    // Test if we can connect to Supabase
    testSupabase();
  }, []);

  async function testSupabase() {
    setStatus(prev => ({ ...prev, loading: true }));
    
    try {
      // Test database connection
      const { data: dbData, error: dbError } = await supabase
        .from('trades')
        .select('id')
        .limit(1);
      
      // Test storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .listBuckets();
      
      // Test auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      setStatus({
        loading: false,
        error: '',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        database: !dbError,
        storage: !storageError,
        auth: !authError,
      });
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Unknown error'
      }));
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Status</h2>
        
        {status.loading ? (
          <p className="text-gray-500">Testing connection...</p>
        ) : (
          <div>
            {status.error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                <p className="font-medium">Error:</p>
                <p>{status.error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span>Environment Variables:</span>
                <span></span>
              </div>
              <div className="flex justify-between pl-4">
                <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={status.url === 'Missing' ? 'text-red-600 font-medium' : 'text-green-600'}>
                  {status.url}
                </span>
              </div>
              <div className="flex justify-between pl-4">
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={status.key === 'Missing' ? 'text-red-600 font-medium' : 'text-green-600'}>
                  {status.key}
                </span>
              </div>
              
              <div className="flex justify-between border-b pb-2 pt-4">
                <span>Connection Tests:</span>
                <span></span>
              </div>
              <div className="flex justify-between pl-4">
                <span>Database:</span>
                <span className={status.database ? 'text-green-600' : 'text-red-600 font-medium'}>
                  {status.database ? 'Connected' : 'Failed'}
                </span>
              </div>
              <div className="flex justify-between pl-4">
                <span>Storage:</span>
                <span className={status.storage ? 'text-green-600' : 'text-red-600 font-medium'}>
                  {status.storage ? 'Connected' : 'Failed'}
                </span>
              </div>
              <div className="flex justify-between pl-4">
                <span>Auth:</span>
                <span className={status.auth ? 'text-green-600' : 'text-red-600 font-medium'}>
                  {status.auth ? 'Connected' : 'Failed'}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={testSupabase}>Test Again</Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting Tips</h2>
        
        <ul className="list-disc list-inside space-y-2">
          <li>Check that your <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are correctly set in your <code>.env.local</code> file</li>
          <li>Verify your Supabase project is active and online</li>
          <li>Ensure the "trades" table exists in your Supabase database</li>
          <li>Make sure you have created a "documents" storage bucket</li>
          <li>Create the <code>uuid-ossp</code> extension by running <code>CREATE EXTENSION IF NOT EXISTS "uuid-ossp";</code> in Supabase SQL editor</li>
        </ul>
      </div>
    </div>
  );
}
