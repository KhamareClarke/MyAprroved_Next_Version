// @ts-nocheck
"use client";

import {
  Search,
  UserCheck,
  MessageSquare,
  Star,
  Phone,
  Mail,
  User,
  Wrench,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const steps = [
  {
    icon: Search,
    title: "Search & Compare",
    description:
      "Search for tradespeople in your area by trade type, location, and reviews. Compare profiles, rates, and availability.",
    image:
      "https://images.pexels.com/photos/5691723/pexels-photo-5691723.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
  {
    icon: MessageSquare,
    title: "Get Quotes",
    description:
      "Contact multiple professionals or post your job to receive competitive quotes. Discuss your project requirements.",
    image:
      "https://images.pexels.com/photos/5691616/pexels-photo-5691616.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
  {
    icon: UserCheck,
    title: "Choose & Hire",
    description:
      "Select the best tradesperson based on their profile, reviews, and quote. Book directly through our platform.",
    image:
      "https://images.pexels.com/photos/8865557/pexels-photo-8865557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
  {
    icon: Star,
    title: "Leave a Review",
    description:
      "After completion, rate your experience to help other customers and support quality tradespeople.",
    image:
      "https://images.pexels.com/photos/5974004/pexels-photo-5974004.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
];

const faqs = [
  {
    question: "How are tradespeople verified?",
    answer:
      "All tradespeople go through our comprehensive verification process including ID checks, qualification verification, insurance validation, and reference checks.",
  },
  {
    question: "Is it free to use MyApproved?",
    answer:
      "Yes, it's completely free for customers to search, compare, and contact tradespeople. You only pay the tradesperson directly for their work.",
  },
  {
    question: "What if I'm not satisfied with the work?",
    answer:
      "We have a dispute resolution process and guarantee system. Contact our support team and we'll help resolve any issues with the tradesperson.",
  },
  {
    question: "How quickly can I find a tradesperson?",
    answer:
      "Many of our tradespeople respond within hours. For urgent jobs, you can filter by availability and response time to find someone quickly.",
  },
  {
    question: "Can I get multiple quotes?",
    answer:
      "Absolutely! We encourage getting multiple quotes to ensure you get the best value. You can contact several tradespeople or post a job to receive quotes.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-blue-700">My</span>
              <span className="text-yellow-500">Approved</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/find-tradespeople"
                className="text-gray-700 hover:text-blue-700 transition-colors"
              >
                Find Tradespeople
              </Link>
              <Link href="/how-it-works" className="text-blue-700 font-medium">
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
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                asChild
              >
                <Link href="/register/tradesperson">Join as Trade</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">How MyApproved Works</h1>
          <p className="text-xl text-blue-100 mb-8">
            Finding reliable tradespeople has never been easier. Here is how our
            simple 4-step process works.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-row-dense" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full mr-4">
                      <step.icon className="w-8 h-8 text-blue-700" />
                    </div>
                    <div className="bg-yellow-500 text-black font-bold text-lg px-4 py-2 rounded-full">
                      Step {index + 1}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                  <img
                    src={step.image}
                    alt={step.title}
                    className="rounded-xl shadow-lg w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose MyApproved?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Verified Professionals
                </h3>
                <p className="text-gray-600">
                  All tradespeople are thoroughly vetted with background checks,
                  qualifications, and insurance verification.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Quality Guaranteed
                </h3>
                <p className="text-gray-600">
                  Read genuine reviews from real customers and choose
                  professionals with proven track records.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Easy to Use</h3>
                <p className="text-gray-600">
                  Our simple platform makes it easy to find, compare, and hire
                  the right tradesperson for your job.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Find Your Perfect Tradesperson?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who found reliable
            professionals through MyApproved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              asChild
            >
              <Link href="/find-tradespeople">Find Tradespeople</Link>
            </Button>
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              asChild
            >
              <Link href="/login/client">Post a Job</Link>
            </Button>
          </div>
        </div>
      </section>

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
                  <Link href="/find-tradespeople" className="hover:text-white">
                    Find Tradespeople
                  </Link>
                </li>
                <li>
                  <Link href="/post-job" className="hover:text-white">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="hover:text-white">
                    Reviews
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Tradespeople</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/join" className="hover:text-white">
                    Join MyApproved
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/success-stories" className="hover:text-white">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
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
