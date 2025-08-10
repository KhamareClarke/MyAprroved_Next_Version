"use client";

import { CheckCircle, Home, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You for Your Request!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          We have received your request and our team will be in touch with you
          shortly to discuss your project and connect you with the best
          tradespeople in your area.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 text-left">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            What Happens Next?
          </h2>

          <ol className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  We will review your request
                </h3>
                <p className="text-gray-600 text-sm">
                  Our team will go through the details you have provided.
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Match you with tradespeople
                </h3>
                <p className="text-gray-600 text-sm">
                  We will connect you with up to 3 verified professionals in
                  your area.
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Get quotes and book
                </h3>
                <p className="text-gray-600 text-sm">
                  Compare quotes and book the best professional for your job.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Need help right away?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:support@myapproved.co.uk"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </a>
            <a
              href="tel:+441234567890"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Us
            </a>
          </div>
        </div>

        <div className="mt-8">
          <Button asChild>
            <Link href="/" className="inline-flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
