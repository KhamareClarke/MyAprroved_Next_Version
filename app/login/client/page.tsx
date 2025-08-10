// @ts-nocheck
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  User,
  ChevronDown,
  Wrench,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Initialize Supabase client
const supabase = createClient(
  "https://jismdkfjkngwbpddhomx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A"
);

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Check email and password directly in database
      const { data: userData, error: userError } = await supabase
        .from("clients")
        .select("id, email, first_name, is_verified")
        .eq("email", email)
        .eq("password_hash", password)
        .maybeSingle();

      if (userError || !userData) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!userData.is_verified) {
        setError(
          "Please verify your email address before logging in. Check your inbox for the verification email."
        );
        setIsLoading(false);
        return;
      }

      setSuccess("Login successful! Redirecting...");

      // Store user info and token in localStorage
      const clientToken = `client_${userData.id}_${Date.now()}`;
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          isVerified: userData.is_verified,
          type: "client",
        })
      );
      localStorage.setItem("clientToken", clientToken);

      // Check if there's a redirect URL stored
      const redirectUrl = localStorage.getItem("redirectAfterLogin");

      // Redirect to stored URL or default dashboard
      setTimeout(() => {
        if (redirectUrl) {
          localStorage.removeItem("redirectAfterLogin"); // Clean up
          window.location.href = redirectUrl;
        } else {
          window.location.href = "/dashboard/client";
        }
      }, 1500);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
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
              <Link
                href="/find-tradespeople"
                className="text-gray-700 hover:text-blue-700 transition-colors"
              >
                Find Tradespeople
              </Link>
              {/* AI Quote removed */}
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-blue-700 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/for-tradespeople"
                className="text-gray-700 hover:text-blue-700 transition-colors"
              >
                For Tradespeople
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {/* Login Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/login/client"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Client Login</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/login/trade"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Tradesperson Login</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Signup Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center space-x-2">
                    <span>Sign Up</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/register/client"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Client Registration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/register/tradesperson"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Tradesperson Registration</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin Link */}
              <Button variant="ghost" asChild>
                <Link
                  href="/admin/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Admin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Client Login
            </CardTitle>
            <p className="text-gray-600">
              Welcome back! Please sign in to your client account.
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12 text-base bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 text-base bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 rounded-lg pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password removed as requested */}

              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Do not have a client account?{" "}
                  <Link
                    href="/register/client"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  Are you a tradesperson?{" "}
                  <Link
                    href="/login/trade"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

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
                Connecting customers with trusted, verified tradespeople across
                the UK.
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
                <li>
                  <Link
                    href="/find-tradespeople"
                    className="hover:text-white transition-colors"
                  >
                    Find Tradespeople
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                {/* AI Quote removed */}
                <li>
                  <Link
                    href="/login/client"
                    className="hover:text-white transition-colors"
                  >
                    Customer Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Tradespeople</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/for-tradespeople"
                    className="hover:text-white transition-colors"
                  >
                    Join Our Platform
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register/tradesperson"
                    className="hover:text-white transition-colors"
                  >
                    Register as Trade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login/trade"
                    className="hover:text-white transition-colors"
                  >
                    Trade Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
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
