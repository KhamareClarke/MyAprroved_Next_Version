// @ts-nocheck
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  User,
  CheckCircle,
  Clock,
  Shield,
  Star,
  Heart,
} from "lucide-react";
import Link from "next/link";

type Plan = {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  featured: boolean;
  cta: string;
  href: string;
  icon: React.ReactNode;
  popular?: boolean;
};

export default function JoinPage() {
  const plans: Plan[] = [
    {
      id: "trade",
      title: "Trade Professional",
      description:
        "For tradespeople and businesses looking to get more customers",
      price: "Free to join",
      features: [
        "Get quality leads in your area",
        "Showcase your work with photos",
        "Receive customer reviews",
        "Manage jobs with our tools",
        "24/7 customer support",
      ],
      featured: true,
      cta: "Join as a Trade",
      href: "/register/trade",
      icon: <Briefcase className="h-8 w-8 text-blue-600" />,
      popular: true,
    },
    {
      id: "customer",
      title: "Homeowner",
      description: "For homeowners looking to hire trusted tradespeople",
      price: "Free to use",
      features: [
        "Find local, vetted professionals",
        "Read verified customer reviews",
        "Get free quotes",
        "Message trades directly",
        "Safe and secure payments",
      ],
      featured: false,
      cta: "Continue as Homeowner",
      href: "/register/customer",
      icon: <User className="h-8 w-8 text-green-600" />,
    },
  ];

  const benefits = [
    {
      title: "Verified Professionals",
      description: "All tradespeople are vetted and verified",
      icon: <Shield className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Customer Reviews",
      description: "Read real reviews from other customers",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
    },
    {
      title: "Quick Response",
      description: "Get quotes from multiple trades quickly",
      icon: <Clock className="h-6 w-6 text-green-600" />,
    },
    {
      title: "Satisfaction Guaranteed",
      description: "Quality work or your money back",
      icon: <Heart className="h-6 w-6 text-red-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Join MyApproved Today
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Connect with trusted local tradespeople or grow your business with
            quality leads
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-10 mb-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-50 rounded-md p-2">
                    {benefit.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${
                plan.popular ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1 transform translate-x-2 -translate-y-2">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                    {plan.icon}
                  </div>
                  <div className="ml-4">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-600">
                      {plan.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {plan.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    No credit card required
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle
                        className={`h-5 w-5 ${
                          plan.id === "trade"
                            ? "text-blue-500"
                            : "text-yellow-500"
                        } mr-2 mt-0.5 flex-shrink-0`}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href={plan.href} className="block w-full">
                    <Button
                      size="lg"
                      className={`w-full ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Already have an account */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
