"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Mail,
  ArrowLeft,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";

export default function VerifyEmail() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading");
  const [email, setEmail] = useState("");
  const [verificationData, setVerificationData] = useState<any>(null);

  useEffect(() => {
    const verifyEmail = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const emailParam = urlParams.get("email");

      if (!token || !emailParam) {
        setStatus("invalid");
        return;
      }

      // Check if this is a valid verification link from localStorage
      const storedVerification = localStorage.getItem("emailVerification");
      if (storedVerification) {
        const data = JSON.parse(storedVerification);
        if (
          data.email === emailParam &&
          data.token === token &&
          !data.verified
        ) {
          // Mark as verified
          localStorage.setItem(
            "emailVerification",
            JSON.stringify({
              ...data,
              verified: true,
              verifiedAt: new Date().toISOString(),
            })
          );
          setStatus("success");
          setEmail(emailParam);
          setVerificationData(data);
        } else if (data.verified) {
          setStatus("success");
          setEmail(emailParam);
          setVerificationData(data);
        } else {
          setStatus("error");
        }
      } else {
        setStatus("invalid");
      }
    };

    // Simulate loading
    setTimeout(() => {
      verifyEmail();
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
          <CardTitle className="text-2xl font-bold text-gray-900">
            Email Verification
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {status === "loading" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
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
                Welcome to <strong>MyApproved All</strong> - your trusted
                platform for finding reliable tradespeople.
              </p>

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
                <h3 className="font-semibold text-blue-900 mb-2">
                  What is Next?
                </h3>
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
                  Connecting you with verified, reliable tradespeople in your
                  area.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                The verification link is invalid or has expired.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/register/client/email-verification">
                    Register Again
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center">
              <Mail className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Invalid Link
              </h2>
              <p className="text-gray-600 mb-6">
                Please check your email for the correct verification link.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/register/client/email-verification">
                    Register Again
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login/client">Go to Login</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
