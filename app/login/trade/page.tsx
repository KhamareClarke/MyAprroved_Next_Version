'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase-client';
import { User, Mail, Lock, ChevronDown, Phone } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TradespersonLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if tradesperson exists and get approval status
      const { data: tradesperson, error: userError } = await supabase
        .from('tradespeople')
        .select('id, email, first_name, is_approved, is_verified')
        .eq('email', email)
        .eq('password_hash', password)
        .maybeSingle();

      if (userError || !tradesperson) {
        setError('Invalid email or password');
        return;
      }

      // Check if tradesperson is verified by admin
      if (!tradesperson.is_verified) {
        setError('Your profile has not been verified by our admin team yet. Please wait for verification before logging in.');
        return;
      }

      // Check if tradesperson is approved by admin
      if (!tradesperson.is_approved) {
        setError('Your profile is currently under review by our admin team. You will receive an email notification once your profile is approved.');
        return;
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: tradesperson.id,
        email: tradesperson.email,
        firstName: tradesperson.first_name,
        type: 'tradesperson',
        isApproved: tradesperson.is_approved,
        isVerified: tradesperson.is_verified
      }));

      // Redirect to tradesperson dashboard
      router.push('/dashboard/tradesperson');

    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-blue-700">My</span>
                <span className="text-yellow-500">Approved</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/find-tradespeople" className="text-gray-700 hover:text-blue-700 transition-colors">
                Find Tradespeople
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-700 transition-colors">
                How It Works
              </Link>
              <Link href="/for-tradespeople" className="text-gray-700 hover:text-blue-700 transition-colors">
                For Tradespeople
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {/* Login Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Login</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/login/client" className="flex items-center space-x-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>Customer Login</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login/trade" className="flex items-center space-x-2 cursor-pointer">
                      <Lock className="w-4 h-4" />
                      <span>Trade Login</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome Back, Tradesperson
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to access your dashboard and manage your jobs
            </p>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Tradesperson Login</CardTitle>
              <CardDescription>
                Sign in to your tradesperson account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/register/tradesperson" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Register here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-blue-400">My</span>
                <span className="text-yellow-400">Approved</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting customers with trusted, verified tradespeople across the UK.
              </p>
              <div className="flex space-x-4">
                <Phone className="w-5 h-5" />
                <span className="text-sm">+44 20 1234 5678</span>
              </div>
              <div className="flex space-x-4 mt-2">
                <Mail className="w-5 h-5" />
                <span className="text-sm">hello@myapproved.co.uk</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/find-tradespeople" className="hover:text-white transition-colors">Find Tradespeople</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/login/client" className="hover:text-white transition-colors">Customer Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Tradespeople</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/for-tradespeople" className="hover:text-white transition-colors">Join Our Platform</Link></li>
                <li><Link href="/register/tradesperson" className="hover:text-white transition-colors">Register as Trade</Link></li>
                <li><Link href="/login/trade" className="hover:text-white transition-colors">Trade Login</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MyApproved. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 