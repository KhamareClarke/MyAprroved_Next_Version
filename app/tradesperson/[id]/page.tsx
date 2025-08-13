"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, Shield, MapPin, Calendar, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InitialsAvatar from "@/components/InitialsAvatar";
import GetQuoteModal from "@/components/GetQuoteModal";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  text: string;
  reviewerType: string;
  reviewedAt: string;
}

interface Tradesperson {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  reviewsData: Review[];
  location: string;
  distance: string;
  image: string | null;
  initials: string;
  verified: boolean;
  yearsExperience: number;
  description: string;
  hourlyRate: string;
  responseTime: string;
  phone: string;
  email: string;
}

export default function TradespersonProfile() {
  const params = useParams();
  const [tradesperson, setTradesperson] = useState<Tradesperson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const fetchTradesperson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trade-data/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setTradesperson(data.tradesperson);
        } else {
          setError(data.error || "Failed to fetch tradesperson details");
        }
      } catch (err) {
        setError("Failed to fetch tradesperson details");
        console.error("Error fetching tradesperson:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTradesperson();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error || !tradesperson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tradesperson Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The tradesperson you are looking for does not exist."}
          </p>
          <Button asChild>
            <Link href="/find-tradespeople">Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                className="text-blue-700 font-medium"
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
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                asChild
              >
                <Link href="/join">Join as Trade</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/find-tradespeople">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  {tradesperson.image ? (
                    <img
                      src={tradesperson.image}
                      alt={tradesperson.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  ) : (
                    <InitialsAvatar
                      initials={tradesperson.initials}
                      size="lg"
                      className="w-24 h-24 text-2xl"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                          {tradesperson.name}
                        </h1>
                        {tradesperson.verified && (
                          <Shield className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-700">
                          {tradesperson.hourlyRate}
                        </div>
                        <div className="text-sm text-gray-600">
                          Response: {tradesperson.responseTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        {tradesperson.trade}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {renderStars(tradesperson.rating)}
                        <span className="ml-1 font-semibold">
                          {tradesperson.rating || "No rating"}
                        </span>
                        <span className="text-gray-600">
                          ({tradesperson.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">
                      {tradesperson.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {tradesperson.location} • {tradesperson.distance}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {tradesperson.yearsExperience} years experience
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  Reviews ({tradesperson.reviews})
                </h2>
                {tradesperson.reviewsData.length > 0 ? (
                  <div className="space-y-4">
                    {tradesperson.reviewsData.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-4 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="font-semibold">
                              {review.rating}/5
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.text}</p>
                        <span className="text-xs text-gray-500 capitalize">
                          {review.reviewerType}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={() => setShowQuoteModal(true)}
                  >
                    Get Quote
                  </Button>
                </div>

                <div className="mt-6 space-y-3 text-center">
                  <p className="text-sm text-gray-600">
                    Contact details will be shared after quote request
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold">
                      {tradesperson.reviews}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold">
                      {tradesperson.rating || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Years Experience</span>
                    <span className="font-semibold">
                      {tradesperson.yearsExperience}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold">
                      {tradesperson.responseTime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {tradesperson && (
        <GetQuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          tradesperson={{
            id: tradesperson.id,
            name: tradesperson.name,
            trade: tradesperson.trade,
          }}
        />
      )}
    </div>
  );
}
