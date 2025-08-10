'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Send } from 'lucide-react';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('123');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600 mr-2" />
            <CardTitle>Test Email Sending - My Approved</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to test"
            />
          </div>

          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter test code"
            />
          </div>

          <Button 
            onClick={sendTestEmail} 
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading ? 'Sending...' : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <h3 className="font-semibold mb-2">
                {result.success ? 'Success!' : 'Error'}
              </h3>
              <p className="text-sm">{result.message || result.error}</p>
              {result.details && (
                <p className="text-xs mt-2 opacity-75">{result.details}</p>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            This will send a real email to test the SMTP configuration.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 