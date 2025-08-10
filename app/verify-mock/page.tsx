"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, PartyPopper, Mail } from "lucide-react";
import Link from "next/link";

export default function MockVerificationSuccess() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    setEmail(emailParam || "");

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <PartyPopper className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Account Verified!
            </h2>
            <p className="text-gray-600 mb-4">
              Your account has been verified successfully!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Welcome to <strong>MyApproved All</strong> - your trusted platform
              for finding reliable tradespeople.
            </p>
          </div>

          {/* Success Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Mail className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Email Verified
              </span>
            </div>
            <p className="text-sm text-green-700">
              {email && `Email: ${email}`}
            </p>
            <p className="text-sm text-green-700">
              Status: <strong>Active Account</strong>
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What is Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Complete your profile</li>
              <li>• Browse available tradespeople</li>
              <li>• Get instant quotes for your projects</li>
              <li>• Book trusted professionals</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
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
