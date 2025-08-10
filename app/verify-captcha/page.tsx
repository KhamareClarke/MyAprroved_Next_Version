'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, ArrowLeft, Shield, Key } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';

export default function VerifyCaptcha() {
  const [email, setEmail] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // First try to use Supabase function (if it exists)
      try {
        const { data, error } = await supabase
          .rpc('verify_captcha_code', {
            client_email: email,
            code: captchaCode
          });

        if (error) {
          throw error; // Fall back to manual verification
        }

        if (data) {
          // Verification successful
          setIsVerified(true);
          return;
        }
      } catch (functionError) {
        console.log('Supabase function not available, using manual verification');
      }

      // Manual verification fallback
      const { data, error } = await supabase
        .from('clients')
        .select('captcha_code, first_name')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching verification data:', error);
        setErrorMessage('Verification failed. Please try again.');
        return;
      }

      if (!data) {
        setErrorMessage('Email not found. Please check your email address.');
        return;
      }

      if (data.captcha_code === captchaCode) {
        // Mark email as verified
        const { error: updateError } = await supabase
          .from('clients')
          .update({ 
            is_verified: true,
            email_verified_at: new Date().toISOString(),
            captcha_code: null // Clear the code after successful verification
          })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating verification status:', updateError);
          setErrorMessage('Verification failed. Please try again.');
          return;
        }

        setIsVerified(true);
      } else {
        setAttempts(prev => prev + 1);
        setErrorMessage(`Invalid verification code. Please check your email and try again. (Attempt ${attempts + 1}/3)`);
        
        if (attempts >= 2) {
          setErrorMessage('Too many failed attempts. Please request a new verification code.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Try to use Supabase function first (if it exists)
      let newCode = null;
      try {
        const { data, error } = await supabase
          .rpc('generate_new_captcha_code', {
            client_email: email
          });

        if (!error && data) {
          newCode = data;
        }
      } catch (functionError) {
        console.log('Supabase function not available, using manual code generation');
      }

      // Manual code generation fallback
      if (!newCode) {
        newCode = Math.floor(100 + Math.random() * 900).toString();
        
        // Update the captcha code in database
        try {
          await supabase
            .from('clients')
            .update({ 
              captcha_code: newCode,
              verification_sent_at: new Date().toISOString()
            })
            .eq('email', email);
        } catch (updateError) {
          console.log('Could not update captcha code:', updateError);
        }
      }

      // Send new verification email
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          firstName: 'User',
          token: Math.random().toString(36).substring(2, 15)
        }),
      });

      const result = await response.json();

      if (result.success) {
        setErrorMessage('New verification code sent! Please check your email.');
        setAttempts(0);
      } else {
        setErrorMessage('Failed to send new code. Please try again.');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      setErrorMessage('Failed to send new code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <Shield className="w-8 h-8 text-blue-500 absolute -top-2 -right-2" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">
                Your email address has been successfully verified.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Welcome to <strong>MyApproved All</strong> - your trusted platform for finding reliable tradespeople.
              </p>
            </div>

            {/* Success Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Mail className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Email Verified</span>
              </div>
              <p className="text-sm text-green-700">
                {email && `Email: ${email}`}
              </p>
              <p className="text-sm text-green-700">
                Status: <strong>Active Account</strong>
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                <Link href="/login/client">Login to Your Account</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            {/* Brand Message */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
              <h3 className="font-bold text-lg mb-1">MyApproved All</h3>
              <p className="text-sm text-blue-100">
                Connecting you with verified, reliable tradespeople in your area.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="flex items-center text-blue-700 hover:text-blue-800 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </CardTitle>
          <p className="text-gray-600">
            Enter the verification code sent to your email
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {errorMessage && (
            <Alert className={`mb-6 ${errorMessage.includes('sent') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertDescription className={errorMessage.includes('sent') ? 'text-green-800' : 'text-red-800'}>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="flex items-center mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <Label htmlFor="captchaCode" className="flex items-center mb-2">
                <Shield className="w-4 h-4 mr-2" />
                Verification Code
              </Label>
              <Input
                id="captchaCode"
                type="text"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value)}
                placeholder="Enter 3-digit code"
                maxLength={3}
                pattern="[0-9]{3}"
                required
                className="text-center text-2xl font-mono tracking-widest"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the 3-digit code from your email
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                disabled={isLoading || attempts >= 3}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={resendCode}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Check your email inbox and spam folder for the verification code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 