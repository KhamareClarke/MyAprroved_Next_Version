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
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postcode: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  postcode?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ClientRegistration() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    postcode: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationToken, setVerificationToken] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Postcode validation
    if (!formData.postcode.trim()) {
      newErrors.postcode = "Postcode is required";
    } else if (formData.postcode.length < 5) {
      newErrors.postcode = "Please enter a valid postcode";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.length < 10) {
      newErrors.address = "Please enter a complete address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("clients")
        .select("email")
        .eq("email", formData.email);

      if (existingUser && existingUser.length > 0) {
        setErrorMessage("An account with this email already exists");
        setIsLoading(false);
        return;
      }

      // Create new client account in database
      const { data, error } = await supabase
        .from("clients")
        .insert({
          email: formData.email,
          password_hash: formData.password, // Store password in password_hash column
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          postcode: formData.postcode,
          address: formData.address,
          is_verified: false,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Registration error:", error);
        setErrorMessage("Registration failed. Please try again.");
      } else {
        // Send verification email
        await sendVerificationEmail(formData.email);
        setIsEmailSent(true);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          postcode: "",
          address: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      // Create a verification token
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      setVerificationToken(token);

      // Send verification email via API
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          firstName: formData.firstName,
          token: token,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Verification email sent successfully");
        setIsEmailSent(true);
      } else {
        console.error("Error sending verification email:", result.error);
        setErrorMessage("Failed to send verification email. Please try again.");
      }
    } catch (error) {
      console.error("Error in email verification:", error);
      setErrorMessage("Failed to send verification email. Please try again.");
    }
  };

  if (isEmailSent) {
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
          <Card className="w-full max-w-2xl shadow-2xl border-0">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Email Verification Sent!
                </h2>
                <p className="text-gray-600 mb-4">
                  We have sent a verification email to{" "}
                  <strong>{formData.email}</strong>
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Please check your inbox and click the verification link to
                  activate your account.
                </p>
              </div>

              {/* Email Sent Message */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Check Your Email!
                </h4>
                <p className="text-gray-600 mb-4">
                  We have sent a verification email to{" "}
                  <strong>{formData.email}</strong>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 mt-2 space-y-1 text-left">
                    <li>1. Check your email inbox</li>
                    <li>2. Look for email from MyApproved All</li>
                    <li>3. Copy the 3-digit verification code</li>
                    <li>4. Enter it on the next page</li>
                  </ol>
                </div>
                <p className="text-sm text-gray-500">
                  Can not find the email? Check your spam folder or request a
                  new code.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href={`/verify-captcha?email=${formData.email}`}>
                    Enter Verification Code
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full h-12 text-base font-semibold rounded-lg"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Check your email inbox for the
                  verification code. If you do not see it, check your spam
                  folder.
                </p>
              </div>
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
                  Connecting customers with trusted, verified tradespeople
                  across the UK.
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
        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <Link
                href="/"
                className="flex items-center text-blue-700 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Create Client Account
            </CardTitle>
            <p className="text-gray-600">
              Join thousands of satisfied customers who trust our platform
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {errorMessage && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={`h-12 text-base bg-white border-2 ${
                      errors.firstName
                        ? "border-red-500"
                        : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                    } transition-all duration-200 rounded-lg`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="lastName"
                    className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`h-12 text-base bg-white border-2 ${
                      errors.lastName
                        ? "border-red-500"
                        : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                    } transition-all duration-200 rounded-lg`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label
                  htmlFor="email"
                  className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-12 text-base bg-white border-2 ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                  } transition-all duration-200 rounded-lg`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label
                  htmlFor="phone"
                  className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`h-12 text-base bg-white border-2 ${
                    errors.phone
                      ? "border-red-500"
                      : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                  } transition-all duration-200 rounded-lg`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="postcode"
                    className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Postcode *
                  </Label>
                  <Input
                    id="postcode"
                    type="text"
                    value={formData.postcode}
                    onChange={(e) =>
                      handleInputChange("postcode", e.target.value)
                    }
                    className={`h-12 text-base bg-white border-2 ${
                      errors.postcode
                        ? "border-red-500"
                        : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                    } transition-all duration-200 rounded-lg`}
                    placeholder="Enter your postcode"
                  />
                  {errors.postcode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.postcode}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="address"
                    className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className={`h-12 text-base bg-white border-2 ${
                      errors.address
                        ? "border-red-500"
                        : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                    } transition-all duration-200 rounded-lg`}
                    placeholder="Enter your full address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="password"
                    className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`h-12 text-base bg-white border-2 ${
                        errors.password
                          ? "border-red-500"
                          : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                      } transition-all duration-200 rounded-lg pr-10`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center mb-2 text-sm font-semibold text-gray-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className={`h-12 text-base bg-white border-2 ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                      } transition-all duration-200 rounded-lg pr-10`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login/client"
                    className="text-blue-600 hover:text-blue-800 font-medium"
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
