// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  Shield,
  Filter,
  ChevronDown,
  User,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InitialsAvatar from "@/components/InitialsAvatar";
import GetQuoteModal from "@/components/GetQuoteModal";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Tradesperson {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
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

export default function FindTradespeople() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedTradesperson, setSelectedTradesperson] =
    useState<Tradesperson | null>(null);

  const fetchTradespeople = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setTradespeople([]);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (location) params.append("location", location);
      if (sortBy) params.append("sortBy", sortBy);
      params.append("page", page.toString());
      params.append("limit", pagination.limit.toString());

      const response = await fetch(`/api/tradespeopleeeee/list?${params}`);
      const data = await response.json();

      console.log("Frontend received data:", data);

      if (data.success) {
        if (append) {
          setTradespeople((prev) => [...prev, ...data.tradespeople]);
        } else {
          setTradespeople(data.tradespeople);
        }
        setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to fetch tradespeople");
      }
    } catch (err) {
      setError("Failed to fetch tradespeople");
      console.error("Error fetching tradespeople:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchTradespeople(pagination.page + 1, true);
    }
  };

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTradespeople(1, false);
  }, [searchTerm, location, sortBy]);

  const handleSearch = () => {
    fetchTradespeople();
  };

  const handleGetQuote = (tradesperson: Tradesperson) => {
    setSelectedTradesperson(tradesperson);
    setShowQuoteModal(true);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by trade or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <Input
                placeholder="Enter postcode or area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              className="h-12 bg-blue-700 hover:bg-blue-800"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
                <SelectItem value="price">Price (Low to High)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tradespeople Listings */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading tradespeople...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchTradespeople} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : tradespeople.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No tradespeople found matching your criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setLocation("");
                    fetchTradespeople();
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              tradespeople.map((person) => (
                <Card
                  key={person.id}
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {person.image ? (
                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <InitialsAvatar
                          initials={person.initials}
                          size="lg"
                          className="w-20 h-20"
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {person.name}
                            </h3>
                            {person.verified && (
                              <Shield className="w-5 h-5 text-green-500 ml-2" />
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-blue-700">
                              {person.hourlyRate}
                            </div>
                            <div className="text-sm text-gray-600">
                              Response: {person.responseTime}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-3">
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            {person.trade}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 font-semibold">
                              {person.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-600 ml-1">
                              ({person.reviews} reviews)
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">
                          {person.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {person.location} • {person.distance}
                            </div>
                            <span>
                              {person.yearsExperience} years experience
                            </span>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/tradesperson/${person.id}`}>
                                View Profile
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              className="bg-yellow-500 hover:bg-yellow-600 text-black"
                              onClick={() => handleGetQuote(person)}
                            >
                              Get Quote
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Load More */}
            {tradespeople.length > 0 && (
              <div className="text-center">
                {pagination.hasMore ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading..." : "Load More Results"}
                  </Button>
                ) : (
                  <p className="text-gray-500">No more results to load</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Showing {tradespeople.length} of {pagination.total}{" "}
                  tradespeople
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Filters */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Filters</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Available Today</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Verified Badge</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">5+ Years Experience</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">100+ Reviews</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Featured Trade */}
            <Card className="bg-gradient-to-br from-blue-700 to-blue-800 text-white">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Need Help Choosing?</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Post your job for free and let qualified tradespeople come to
                  you with quotes.
                </p>
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                  asChild
                >
                  <Link href="/login/client">Post a Job</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Get Quote Modal */}
      {selectedTradesperson && (
        <GetQuoteModal
          isOpen={showQuoteModal}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedTradesperson(null);
          }}
          tradesperson={{
            id: selectedTradesperson.id,
            name: selectedTradesperson.name,
            trade: selectedTradesperson.trade,
          }}
        />
      )}
    </div>
  );
}
