"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Briefcase,
  Phone,
  MapPin,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  trade: string;
  city: string;
  postcode: string;
  terms: boolean;
  yearsExperience: string;
};

type FormErrors = {
  [key: string]: string;
};

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

export default function TradespersonSignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    trade: "",
    city: "",
    postcode: "",
    terms: false,
    yearsExperience: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = "Full name is required";
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[0-9\-\+\s]+$/.test(formData.phone)) {
        newErrors.phone = "Phone number is invalid";
      }
      if (!formData.trade) newErrors.trade = "Please select your trade";
      if (!formData.yearsExperience)
        newErrors.yearsExperience = "Years of experience is required";
    } else if (step === 2) {
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.postcode) newErrors.postcode = "Postcode is required";
    } else if (step === 3) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.terms) {
        newErrors.terms = "You must accept the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [qualificationDocument, setQualificationDocument] =
    useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [tradeCardDocument, setTradeCardDocument] = useState<File | null>(null);
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [qualificationNumber, setQualificationNumber] = useState("");
  const [tradeCardNumber, setTradeCardNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");
    if (!validateStep(3)) return;

    // Check if trade is selected
    if (!formData.trade) {
      setApiError("Please select your trade.");
      return;
    }

    // Check if this trade requires additional trade card
    const needsTradeCard = [
      "Plumber",
      "Electrician",
      "Aircon Engineer",
    ].includes(formData.trade);

    // Validate required documents for ALL tradespeople
    if (!idDocument || !insuranceDocument || !qualificationDocument) {
      setApiError(
        "ID document, insurance document, and proof of qualifications are required for all tradespeople."
      );
      return;
    }

    // Validate additional documents for specific trades
    if (needsTradeCard && !tradeCardDocument) {
      setApiError(
        "Trade card is required for Plumbers, Electricians, and Aircon Engineers."
      );
      return;
    }

    // Validate required fields
    if (!insuranceExpiry || !qualificationNumber) {
      setApiError(
        "Insurance expiry date and qualification number are required."
      );
      return;
    }

    if (needsTradeCard && !tradeCardNumber) {
      setApiError("Trade card number is required for this trade.");
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "confirmPassword") {
          formDataToSend.append(key, String(value));
        }
      });

      // Add all required documents
      if (idDocument) formDataToSend.append("idDocument", idDocument);
      if (insuranceDocument)
        formDataToSend.append("insuranceDocument", insuranceDocument);
      if (qualificationDocument)
        formDataToSend.append("qualificationDocument", qualificationDocument);
      if (tradeCardDocument)
        formDataToSend.append("tradeCardDocument", tradeCardDocument);

      // Add additional fields
      if (insuranceExpiry)
        formDataToSend.append("insuranceExpiry", insuranceExpiry);
      if (qualificationNumber)
        formDataToSend.append("qualificationNumber", qualificationNumber);
      if (tradeCardNumber)
        formDataToSend.append("tradeCardNumber", tradeCardNumber);
      if (formData.yearsExperience)
        formDataToSend.append("yearsExperience", formData.yearsExperience);

      const response = await fetch("/api/trades/register", {
        method: "POST",
        body: formDataToSend,
      });
      const data = await response.json();
      if (!response.ok) {
        setApiError(data.error || "Registration failed");
      } else {
        setApiSuccess(
          "Registration successful! Our admin team will verify your profile. Once verified, you will be able to login and see available jobs."
        );
      }
    } catch (err) {
      setApiError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user selects an option
    if (errors[name as keyof FormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderStep = () => {
    const needsTradeCard = [
      "Plumber",
      "Electrician",
      "Aircon Engineer",
    ].includes(formData.trade);

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Personal Information</h3>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="+44 1234 567890"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="trade"
                className="block text-sm font-medium text-gray-700"
              >
                Your Trade <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <Select
                  value={formData.trade}
                  onValueChange={(value) => handleSelectChange(value, "trade")}
                >
                  <SelectTrigger
                    className={`w-full ${errors.trade ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select your trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {trades.map((trade) => (
                      <SelectItem key={trade} value={trade}>
                        {trade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trade && (
                  <p className="mt-1 text-sm text-red-600">{errors.trade}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="yearsExperience"
                className="block text-sm font-medium text-gray-700"
              >
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <Select
                  value={formData.yearsExperience}
                  onValueChange={(value) =>
                    handleSelectChange(value, "yearsExperience")
                  }
                >
                  <SelectTrigger
                    className={`w-full ${
                      errors.yearsExperience ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                      7,
                      8,
                      9,
                      10,
                      11,
                      12,
                      13,
                      14,
                      15,
                      16,
                      17,
                      18,
                      19,
                      20,
                      "20+",
                    ].map((years) => (
                      <SelectItem key={years} value={String(years)}>
                        {years} {years === 1 ? "year" : "years"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.yearsExperience && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.yearsExperience}
                  </p>
                )}
              </div>
            </div>

            {/* Required Documents for ALL tradespeople */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-md font-medium mb-4">Required Documents</h4>
              <p className="text-sm text-gray-600 mb-4">
                All tradespeople must upload the following documents for
                verification:
              </p>

              <div className="space-y-6">
                <FileUpload
                  label="ID Documents (Passport/Driving License)"
                  onChange={setIdDocument}
                  value={idDocument}
                  required={true}
                  errorMessage={
                    !idDocument && errors.idDocument
                      ? "ID document is required"
                      : ""
                  }
                />

                <FileUpload
                  label="Insurance Document"
                  onChange={setInsuranceDocument}
                  value={insuranceDocument}
                  required={true}
                  errorMessage={
                    !insuranceDocument && errors.insuranceDocument
                      ? "Insurance document is required"
                      : ""
                  }
                />

                <div>
                  <label
                    htmlFor="insuranceExpiry"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Insurance Expiry Date{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="insuranceExpiry"
                    name="insuranceExpiry"
                    type="date"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <FileUpload
                  label="Proof of Qualifications"
                  onChange={setQualificationDocument}
                  value={qualificationDocument}
                  required={true}
                  errorMessage={
                    !qualificationDocument && errors.qualificationDocument
                      ? "Qualification document is required"
                      : ""
                  }
                />

                <div>
                  <label
                    htmlFor="qualificationNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Qualification Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="qualificationNumber"
                    name="qualificationNumber"
                    type="text"
                    value={qualificationNumber}
                    onChange={(e) => setQualificationNumber(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your qualification/certification number"
                  />
                </div>

                {/* Additional Trade Card for specific trades */}
                {needsTradeCard && (
                  <>
                    <FileUpload
                      label="Trade Card (Required for Plumbers, Electricians, Aircon Engineers)"
                      onChange={setTradeCardDocument}
                      value={tradeCardDocument}
                      required={true}
                      errorMessage={
                        !tradeCardDocument && errors.tradeCardDocument
                          ? "Trade card is required for this trade"
                          : ""
                      }
                    />

                    <div>
                      <label
                        htmlFor="tradeCardNumber"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Trade Card Number{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="tradeCardNumber"
                        name="tradeCardNumber"
                        type="text"
                        value={tradeCardNumber}
                        onChange={(e) => setTradeCardNumber(e.target.value)}
                        className="mt-1"
                        placeholder="Enter your trade card number"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.terms}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      terms: checked === true,
                    }));
                    if (errors.terms) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.terms;
                        return newErrors;
                      });
                    }
                  }}
                  className={errors.terms ? "border-red-500" : ""}
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Terms and Conditions
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Business Information</h3>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className={`pl-10 ${errors.city ? "border-red-500" : ""}`}
                  placeholder="London"
                />
              </div>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="postcode"
                className="block text-sm font-medium text-gray-700"
              >
                Business Postcode <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="postcode"
                  name="postcode"
                  type="text"
                  value={formData.postcode}
                  onChange={handleChange}
                  className={`pl-10 ${errors.postcode ? "border-red-500" : ""}`}
                  placeholder="AB12 3CD"
                />
              </div>
              {errors.postcode && (
                <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                We will use this to show your business to local customers
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Account Setup</h3>

            {/* Show error/success messages */}
            {apiError && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            {apiSuccess && (
              <div
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  <span>{apiSuccess}</span>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.terms}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      terms: checked === true,
                    }));
                    if (errors.terms) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.terms;
                        return newErrors;
                      });
                    }
                  }}
                  className={errors.terms ? "border-red-500" : ""}
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Terms and Conditions
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
                      <span>Customer Login</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/login/trade"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Trade Login</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Join MyApproved as a Tradesperson
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with customers, grow your business, and become part of the
              UK is most trusted tradesperson network.
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <nav aria-label="Progress">
                <ol className="flex items-center justify-center space-x-8">
                  {[1, 2, 3].map((stepNumber) => (
                    <li
                      key={stepNumber}
                      className={`flex items-center ${
                        stepNumber !== 3 ? "flex-1" : "flex-none"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            step === stepNumber
                              ? "border-2 border-white bg-white text-blue-600"
                              : step > stepNumber
                              ? "border-2 border-green-300 bg-green-100 text-green-600"
                              : "border-2 border-blue-300 bg-blue-100 text-blue-300"
                          }`}
                        >
                          {step > stepNumber ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            stepNumber
                          )}
                        </span>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            step >= stepNumber ? "text-white" : "text-blue-200"
                          }`}
                        >
                          {stepNumber === 1
                            ? "Personal Info"
                            : stepNumber === 2
                            ? "Business Info"
                            : "Account"}
                        </span>
                      </div>
                      {stepNumber !== 3 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 ${
                            step > stepNumber ? "bg-green-300" : "bg-blue-300"
                          }`}
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            {/* Form */}
            <div className="px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {renderStep()}

                <div className="flex justify-between pt-6">
                  <div>
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        className="px-6"
                      >
                        Back
                      </Button>
                    )}
                  </div>
                  <div>
                    {step < 3 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="px-6 bg-blue-600 hover:bg-blue-700"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="px-6 bg-blue-600 hover:bg-blue-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login/trade"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

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
