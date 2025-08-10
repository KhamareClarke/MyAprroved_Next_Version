// @ts-nocheck
"use client";

import {
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Star,
  Phone,
  Mail,
  User,
  Wrench,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const benefits = [
  {
    icon: Users,
    title: "More Customers",
    description:
      "Connect with thousands of customers looking for your services every day",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description:
      "Increase your revenue with our lead generation and business management tools",
  },
  {
    icon: Shield,
    title: "Build Trust",
    description:
      "Get verified status and showcase your credentials to win more work",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "£29",
    period: "per month",
    features: [
      "Up to 10 leads per month",
      "Basic profile listing",
      "Customer reviews",
      "Mobile app access",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "£59",
    period: "per month",
    features: [
      "Up to 30 leads per month",
      "Featured profile listing",
      "Priority customer matching",
      "Advanced analytics",
      "Phone & email support",
      "Quote management tools",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "£99",
    period: "per month",
    features: [
      "Unlimited leads",
      "Top of search results",
      "Dedicated account manager",
      "Custom business page",
      "Priority support",
      "Advanced reporting",
      "Marketing assistance",
    ],
    popular: false,
  },
];

const testimonials = [
  {
    name: "Mike Johnson",
    trade: "Plumber",
    image:
      "https://images.pexels.com/photos/8865557/pexels-photo-8865557.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    quote:
      "MyApproved has transformed my business. I'm getting 3x more customers than before!",
    rating: 5,
  },
  {
    name: "Sarah Williams",
    trade: "Electrician",
    image:
      "https://images.pexels.com/photos/5974004/pexels-photo-5974004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    quote:
      "The platform is so easy to use and the leads are high quality. Highly recommend!",
    rating: 5,
  },
  {
    name: "David Brown",
    trade: "Builder",
    image:
      "https://images.pexels.com/photos/8005394/pexels-photo-8005394.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    quote:
      "Best investment I've made for my business. The support team is fantastic too.",
    rating: 5,
  },
];

export default function ForTradespeople() {
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
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-blue-700 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/for-tradespeople"
                className="text-blue-700 font-medium"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-6">
                Grow Your Trade Business with
                <span className="text-yellow-400"> MyApproved</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of successful tradespeople who use MyApproved to
                find new customers, grow their business, and build their
                reputation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  asChild
                >
                  <Link href="/register/tradesperson">Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/5691723/pexels-photo-5691723.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Successful tradesperson"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Tradespeople Choose MyApproved
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to take your trade business to the next level
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan thats right for your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? "ring-2 ring-yellow-500 shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-blue-700 mb-2">
                      {plan.price}
                      <span className="text-lg text-gray-600 font-normal">
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                    asChild
                  >
                    <Link href="/register/tradesperson">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Tradespeople Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">
                        {testimonial.trade}
                      </div>
                    </div>
                  </div>
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
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join MyApproved today and start connecting with more customers in
            your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              asChild
            >
              <Link href="/register/tradesperson">Get Started</Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
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
