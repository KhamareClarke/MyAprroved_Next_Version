'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DebugClientPage() {
  const [userData, setUserData] = useState<string>('');
  const [localStorageData, setLocalStorageData] = useState<string>('');

  useEffect(() => {
    // Check localStorage
    const user = localStorage.getItem('user');
    setLocalStorageData(user || 'No user data found');
  }, []);

  const testLogin = async () => {
    try {
      const response = await fetch('/api/test-client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      const data = await response.json();
      setUserData(JSON.stringify(data, null, 2));
    } catch (err) {
      setUserData('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('user');
    setLocalStorageData('Storage cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Login Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">LocalStorage Data:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {localStorageData}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={testLogin}>Test Login API</Button>
              <Button onClick={clearStorage} variant="outline">Clear Storage</Button>
            </div>

            {userData && (
              <div>
                <h3 className="font-semibold mb-2">API Response:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {userData}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <a href="/login/client">Go to Client Login</a>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <a href="/dashboard/client">Go to Client Dashboard</a>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <a href="/register/client">Go to Client Registration</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 