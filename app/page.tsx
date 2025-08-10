"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Star,
  Shield,
  Users,
  TrendingUp,
  ChevronRight,
  Phone,
  Mail,
  ChevronLeft,
  Smartphone,
  Download,
  Bell,
  Calculator,
  Clock,
  Upload,
  X,
  User,
  Wrench,
  ChevronDown,
} from "lucide-react";
import SmartSearchBar from "../components/SmartSearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import InitialsAvatar from "@/components/InitialsAvatar";

const tradeCategories = [
  { name: "Plumber", icon: "P", jobs: 1247 },
  { name: "Electrician", icon: "E", jobs: 892 },
  { name: "Builder", icon: "B", jobs: 1156 },
  { name: "Painter", icon: "P", jobs: 743 },
  { name: "Roofer", icon: "R", jobs: 567 },
  { name: "Gardener", icon: "G", jobs: 834 },
  { name: "Tiler", icon: "T", jobs: 445 },
  { name: "Carpenter", icon: "C", jobs: 678 },
  { name: "Locksmith", icon: "L", jobs: 324 },
  { name: "Cleaner", icon: "C", jobs: 956 },
  { name: "Handyman", icon: "H", jobs: 1089 },
  { name: "Plasterer", icon: "P", jobs: 387 },
  { name: "Flooring", icon: "F", jobs: 523 },
  { name: "Kitchen Fitter", icon: "K", jobs: 298 },
  { name: "Bathroom Fitter", icon: "B", jobs: 412 },
  { name: "Window Cleaner", icon: "W", jobs: 634 },
  { name: "Pest Control", icon: "P", jobs: 189 },
  { name: "Appliance Repair", icon: "A", jobs: 267 },
  { name: "HVAC", icon: "H", jobs: 345 },
  { name: "Decorator", icon: "D", jobs: 456 },
  { name: "Driveway", icon: "D", jobs: 234 },
  { name: "Fencing", icon: "F", jobs: 378 },
  { name: "Guttering", icon: "G", jobs: 289 },
  { name: "Insulation", icon: "I", jobs: 156 },
];

type FeaturedTP = {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  location: string;
  image: string | null;
  verified: boolean;
  yearsExperience: number;
};
// Will be populated from API
// const initialFeatured: FeaturedTP[] = [];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    trade: "",
    description: "",
    postcode: "",
    urgency: "",
    availability: "",
    images: [] as File[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [featured, setFeatured] = useState<FeaturedTP[]>([]);

  const itemsPerSlide = 8;
  const totalSlides = Math.ceil(tradeCategories.length / itemsPerSlide);

  const trades = [
    "Plumber",
    "Electrician",
    "Builder",
    "Painter",
    "Roofer",
    "Gardener",
    "Tiler",
    "Carpenter",
    "Locksmith",
    "Cleaner",
    "Handyman",
    "Plasterer",
    "Flooring",
    "Kitchen Fitter",
    "Bathroom Fitter",
    "Window Cleaner",
    "Pest Control",
    "Appliance Repair",
    "HVAC",
    "Decorator",
    "Driveway",
    "Fencing",
    "Guttering",
    "Insulation",
    "Other",
  ];

  const urgencyOptions = [
    { value: "emergency", label: "Emergency (Same day)", icon: "!" },
    { value: "urgent", label: "Urgent (Within 24 hours)", icon: "!" },
    { value: "normal", label: "Normal (Within a week)", icon: "•" },
    { value: "flexible", label: "Flexible (No rush)", icon: "~" },
  ];

  const steps = [
    { number: 1, title: "Select Trade", icon: "1" },
    { number: 2, title: "Describe Job", icon: "2" },
    { number: 3, title: "Location & Timing", icon: "3" },
    { number: 4, title: "Get Estimate", icon: "4" },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalSlides, isAutoPlaying]);

  // Load featured tradespeople from API (top 3)
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch(
          "/api/tradespeople/list?page=1&limit=3&sortBy=rating",
          { cache: "no-store" } as RequestInit
        );
        const data = await res.json();
        if (data.success) {
          const mapped: FeaturedTP[] = (data.tradespeople || []).map(
            (p: any) => ({
              id: p.id,
              name: p.name,
              trade: p.trade,
              rating: p.rating,
              reviews: p.reviews,
              location: (p.location || "").toString().split(",")[0] || "",
              image: p.image || null,
              verified: p.verified || false,
              yearsExperience: p.yearsExperience || 0,
            })
          );
          setFeatured(mapped);
        }
      } catch {}
    };
    loadFeatured();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
  };

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return tradeCategories.slice(startIndex, startIndex + itemsPerSlide);
  };

  const handleInputChange = (field: string, value: string | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateEstimate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Base pricing by trade and urgency
      const basePricing = {
        plumber: {
          emergency: { min: 200, max: 350 },
          urgent: { min: 150, max: 250 },
          normal: { min: 100, max: 200 },
          flexible: { min: 80, max: 150 },
        },
        electrician: {
          emergency: { min: 300, max: 500 },
          urgent: { min: 200, max: 350 },
          normal: { min: 150, max: 250 },
          flexible: { min: 100, max: 200 },
        },
        builder: {
          emergency: { min: 500, max: 1000 },
          urgent: { min: 400, max: 800 },
          normal: { min: 300, max: 600 },
          flexible: { min: 200, max: 400 },
        },
        painter: {
          emergency: { min: 250, max: 400 },
          urgent: { min: 200, max: 300 },
          normal: { min: 150, max: 250 },
          flexible: { min: 100, max: 200 },
        },
        roofer: {
          emergency: { min: 400, max: 700 },
          urgent: { min: 300, max: 500 },
          normal: { min: 250, max: 400 },
          flexible: { min: 200, max: 350 },
        },
        carpenter: {
          emergency: { min: 300, max: 500 },
          urgent: { min: 250, max: 400 },
          normal: { min: 200, max: 300 },
          flexible: { min: 150, max: 250 },
        },
        tiler: {
          emergency: { min: 350, max: 600 },
          urgent: { min: 300, max: 500 },
          normal: { min: 250, max: 400 },
          flexible: { min: 200, max: 350 },
        },
        handyman: {
          emergency: { min: 150, max: 300 },
          urgent: { min: 120, max: 250 },
          normal: { min: 100, max: 200 },
          flexible: { min: 80, max: 150 },
        },
        cleaner: {
          emergency: { min: 100, max: 200 },
          urgent: { min: 80, max: 150 },
          normal: { min: 60, max: 120 },
          flexible: { min: 50, max: 100 },
        },
        locksmith: {
          emergency: { min: 200, max: 400 },
          urgent: { min: 150, max: 300 },
          normal: { min: 100, max: 200 },
          flexible: { min: 80, max: 150 },
        },
        gardener: {
          emergency: { min: 120, max: 250 },
          urgent: { min: 100, max: 200 },
          normal: { min: 80, max: 150 },
          flexible: { min: 60, max: 120 },
        },
        plasterer: {
          emergency: { min: 250, max: 450 },
          urgent: { min: 200, max: 350 },
          normal: { min: 150, max: 250 },
          flexible: { min: 120, max: 200 },
        },
        flooring: {
          emergency: { min: 300, max: 600 },
          urgent: { min: 250, max: 500 },
          normal: { min: 200, max: 400 },
          flexible: { min: 150, max: 300 },
        },
        "kitchen fitter": {
          emergency: { min: 800, max: 1500 },
          urgent: { min: 600, max: 1200 },
          normal: { min: 500, max: 1000 },
          flexible: { min: 400, max: 800 },
        },
        "bathroom fitter": {
          emergency: { min: 600, max: 1200 },
          urgent: { min: 500, max: 1000 },
          normal: { min: 400, max: 800 },
          flexible: { min: 300, max: 600 },
        },
        "window cleaner": {
          emergency: { min: 80, max: 150 },
          urgent: { min: 60, max: 120 },
          normal: { min: 50, max: 100 },
          flexible: { min: 40, max: 80 },
        },
        "pest control": {
          emergency: { min: 150, max: 300 },
          urgent: { min: 120, max: 250 },
          normal: { min: 100, max: 200 },
          flexible: { min: 80, max: 150 },
        },
        "appliance repair": {
          emergency: { min: 200, max: 400 },
          urgent: { min: 150, max: 300 },
          normal: { min: 120, max: 250 },
          flexible: { min: 100, max: 200 },
        },
        hvac: {
          emergency: { min: 400, max: 700 },
          urgent: { min: 300, max: 500 },
          normal: { min: 250, max: 400 },
          flexible: { min: 200, max: 350 },
        },
        decorator: {
          emergency: { min: 200, max: 350 },
          urgent: { min: 150, max: 250 },
          normal: { min: 120, max: 200 },
          flexible: { min: 100, max: 180 },
        },
        driveway: {
          emergency: { min: 500, max: 1000 },
          urgent: { min: 400, max: 800 },
          normal: { min: 300, max: 600 },
          flexible: { min: 250, max: 500 },
        },
        fencing: {
          emergency: { min: 300, max: 600 },
          urgent: { min: 250, max: 500 },
          normal: { min: 200, max: 400 },
          flexible: { min: 150, max: 300 },
        },
        guttering: {
          emergency: { min: 200, max: 400 },
          urgent: { min: 150, max: 300 },
          normal: { min: 120, max: 250 },
          flexible: { min: 100, max: 200 },
        },
        insulation: {
          emergency: { min: 400, max: 800 },
          urgent: { min: 300, max: 600 },
          normal: { min: 250, max: 500 },
          flexible: { min: 200, max: 400 },
        },
      };

      // Location multipliers (based on UK regions)
      const locationMultipliers = {
        london: 1.4,
        manchester: 1.2,
        birmingham: 1.1,
        leeds: 1.1,
        liverpool: 1.0,
        sheffield: 1.0,
        edinburgh: 1.2,
        glasgow: 1.1,
        bristol: 1.2,
        cardiff: 1.1,
        newcastle: 1.0,
        belfast: 1.0,
        default: 1.0,
      };

      const tradeKey = formData.trade.toLowerCase();
      const urgencyKey = formData.urgency as keyof typeof basePricing.plumber;

      // Get base pricing for the trade and urgency
      const basePrice =
        basePricing[tradeKey as keyof typeof basePricing]?.[urgencyKey] ||
        basePricing.handyman[urgencyKey];

      // Determine location multiplier
      const postcode = formData.postcode.toLowerCase();
      let locationMultiplier = locationMultipliers.default;

      // Check for major cities in postcode
      for (const [city, multiplier] of Object.entries(locationMultipliers)) {
        if (postcode.includes(city)) {
          locationMultiplier = multiplier;
          break;
        }
      }

      // Apply location multiplier
      const adjustedMin = Math.round(basePrice.min * locationMultiplier);
      const adjustedMax = Math.round(basePrice.max * locationMultiplier);

      // Add some randomness to make it feel more realistic
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% variation
      const finalMin = Math.round(adjustedMin * randomVariation);
      const finalMax = Math.round(adjustedMax * randomVariation);

      const estimate = `£${finalMin}-${finalMax}`;
      setEstimate(estimate);
    } catch (error) {
      console.error("Error generating estimate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                What service do you need?
              </h3>
              <p className="text-gray-600 text-base md:text-lg">
                Select the type of trade you are looking for
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-4">
                Trade Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.trade}
                onValueChange={(value) => handleInputChange("trade", value)}
              >
                <SelectTrigger className="w-full h-14 text-base text-gray-900 bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 rounded-lg">
                  <SelectValue placeholder="e.g. Plumber, Electrician, Builder" />
                </SelectTrigger>
                <SelectContent>
                  {trades.map((trade) => (
                    <SelectItem key={trade} value={trade}>
                      {trade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Describe your job
              </h3>
              <p className="text-gray-600 text-base md:text-lg">
                Tell us what you need done
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-700 mb-4">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the work you need done in detail..."
                  className="min-h-[140px] text-base text-gray-900 bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Images (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 mb-2">
                    Click to upload images or drag and drop
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-700 mb-4">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => handleInputChange("urgency", value)}
                >
                  <SelectTrigger className="w-full h-14 text-base text-gray-900 bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 rounded-lg">
                    <SelectValue placeholder="Select urgency level..." />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Location & Availability
              </h3>
              <p className="text-gray-600">
                Where and when do you need the work done?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Where? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={formData.postcode}
                  onChange={(e) =>
                    handleInputChange("postcode", e.target.value.toUpperCase())
                  }
                  placeholder="Enter your postcode or town"
                  className="pl-10 h-12 text-base text-gray-900 bg-white border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Availability
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Morning", "Afternoon", "Evening", "Flexible"].map((time) => (
                  <Button
                    key={time}
                    variant={
                      formData.availability === time ? "default" : "outline"
                    }
                    onClick={() => handleInputChange("availability", time)}
                    className={`h-14 text-sm md:text-base font-medium transition-all duration-200 ${
                      formData.availability === time
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                        : "bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Your AI Estimate
              </h3>
              <p className="text-gray-600">
                Based on your job details and location
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your estimate...</p>
              </div>
            ) : estimate ? (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl">
                <CardContent className="p-8 md:p-10 text-center">
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
                    {estimate}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg">
                    Estimated cost for your {formData.trade.toLowerCase()} job
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base text-gray-700 bg-white/50 rounded-lg p-4 mb-6">
                    <div>
                      <strong>Trade:</strong> {formData.trade}
                    </div>
                    <div>
                      <strong>Location:</strong> {formData.postcode}
                    </div>
                    <div>
                      <strong>Urgency:</strong>{" "}
                      {
                        urgencyOptions.find((u) => u.value === formData.urgency)
                          ?.label
                      }
                    </div>
                    <div>
                      <strong>Availability:</strong>{" "}
                      {formData.availability || "Flexible"}
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ This is an AI-generated quote. Your selected tradesman
                      may quote differently.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center">
                <Button
                  onClick={generateEstimate}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-lg font-medium py-4 px-8 rounded-lg font-semibold"
                >
                  Generate Estimate
                </Button>
              </div>
            )}

            {estimate && (
              <div className="text-center space-y-4">
                <Button
                  asChild
                  className="bg-blue-700 hover:bg-blue-800 text-white text-lg font-medium py-4 px-8 rounded-lg w-full font-semibold"
                >
                  <Link href="/find-tradespeople">
                    Get Quotes from Tradespeople
                  </Link>
                </Button>
                <p className="text-sm text-gray-700">
                  We will connect you with verified tradespeople in your area
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Add Font Awesome CSS for icons
  if (typeof document !== "undefined") {
    const link = document.createElement("link");
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
    link.rel = "stylesheet";
    link.integrity =
      "sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWkm5s1Od3m4YV5s1LrUnh8D5K5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    document.head.appendChild(link);
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
                      href="/login/tradeperson"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Tradeperson Login</span>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content and Search */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                  Find Local <span className="text-yellow-400">Approved</span>{" "}
                  TradesPeople
                </h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0">
                  Connect with verified, reliable tradespeople in your area. Get
                  quotes, compare services, and hire with confidence.
                </p>
              </div>

              {/* 4-Step AI Quote Form */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10 border border-gray-100">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 md:mb-10">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                      <div
                        className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full text-sm md:text-base font-semibold transition-all duration-300 ${
                          currentStep >= step.number
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110"
                            : "bg-gray-100 text-gray-500 border-2 border-gray-200"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        ) : (
                          step.number
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 md:mx-4 rounded-full transition-all duration-300 ${
                            currentStep > step.number
                              ? "bg-gradient-to-r from-blue-600 to-blue-700"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Form Content */}
                <div className="min-h-[350px] md:min-h-[400px]">
                  {renderStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 md:mt-10">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center justify-center bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 px-6 py-3 text-base font-medium"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 4 && (
                    <Button
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && !formData.trade) ||
                        (currentStep === 2 &&
                          (!formData.description || !formData.urgency)) ||
                        (currentStep === 3 && !formData.postcode)
                      }
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative h-full min-h-[400px]">
              <img
                src="https://images.pexels.com/photos/5691616/pexels-photo-5691616.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Professional tradespeople"
                className="rounded-xl shadow-2xl w-full h-full object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-yellow-500 text-black p-3 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">All Trades Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Categories Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Our Trending Categories
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {tradeCategories
                        .slice(
                          slideIndex * itemsPerSlide,
                          (slideIndex + 1) * itemsPerSlide
                        )
                        .map((category, index) => (
                          <Card
                            key={`${slideIndex}-${index}`}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                          >
                            <CardContent className="p-6 text-center">
                              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                                {category.icon}
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-2">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {category.jobs} jobs available
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-700" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 group"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-700" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? "bg-blue-700 scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Quote CTA Section removed per requirements */}

      {/* Featured Tradespeople */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Top-Rated Professionals
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by thousands of customers across the UK
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(featured.length > 0 ? featured : []).map((person) => (
              <Card
                key={person.id}
                className="hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {person.image ? (
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="mr-4">
                        <InitialsAvatar
                          initials={`${person.name?.split(" ")[0]?.[0] || "U"}${
                            person.name?.split(" ").slice(-1)[0]?.[0] || ""
                          }`.toUpperCase()}
                          size="lg"
                          className="w-16 h-16"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900">
                          {person.name}
                        </h3>
                        <Shield className="w-4 h-4 text-green-500 ml-2" />
                      </div>
                      <p className="text-yellow-600 font-medium">
                        {person.trade}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold">
                        {person.rating}
                      </span>
                      <span className="text-gray-600 ml-1">
                        ({person.reviews} reviews)
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {person.yearsExperience} years
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {person.location}
                  </div>

                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                    asChild
                  >
                    <Link href={`/tradesperson/${person.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
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
                    href="/ai-quote"
                    className="hover:text-white transition-colors"
                  >
                    Get AI Quote
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
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
