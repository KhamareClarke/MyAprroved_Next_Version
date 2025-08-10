// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Shield,
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import "framer-motion";

// Define types
interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  description: string;
  trade: string;
  postcode: string;
  estimate?: string;
}

// Loading spinner component
const LoadingSpinner = ({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) => <Loader2 className={`animate-spin ${className}`} size={size} />;

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Validation functions
const validateJobDescription = (description: string): string | null => {
  if (!description.trim()) return "Job description is required";
  if (description.length < 20)
    return "Please provide more details (at least 20 characters)";
  return null;
};

const validateContactInfo = (
  data: LeadFormData
): { isValid: boolean; error: string | null } => {
  if (!data.email || !data.phone) {
    return {
      isValid: false,
      error: "Please provide both email and phone number",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  // Simple phone validation (at least 10 digits)
  const phoneDigits = data.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return { isValid: false, error: "Please enter a valid phone number" };
  }

  return { isValid: true, error: null };
};

// API function
const submitLead = async (
  data: LeadFormData
): Promise<{ success: boolean; message?: string }> => {
  try {
    // In a real app, this would be an API call to your backend
    console.log("Submitting lead:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  } catch (error) {
    console.error("Error submitting lead:", error);
    return {
      success: false,
      message: "Failed to submit lead. Please try again.",
    };
  }
};

export default function JobDescriptionPage() {
  const [description, setDescription] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    description: "",
    trade: "",
    postcode: "",
  });

  // Mock function to simulate AI estimate generation
  const getAIEstimate = async (
    description: string,
    trade: string,
    postcode: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const estimates = {
          plumber: "£150 - £300",
          electrician: "£200 - £500",
          carpenter: "£100 - £400",
          cleaner: "£50 - £150",
          handyman: "£80 - £250",
        };
        const defaultEstimate = "£100 - £500";
        resolve(
          estimates[trade.toLowerCase() as keyof typeof estimates] ||
            defaultEstimate
        );
      }, 1500);
    });
  };
  const router = useRouter();

  // Load trade and postcode from session storage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTrade = sessionStorage.getItem("selectedTrade");
      const savedPostcode = sessionStorage.getItem("postcode");

      if (savedTrade) {
        setFormData((prev) => ({
          ...prev,
          trade: savedTrade,
          postcode: savedPostcode || "",
        }));
      } else {
        // If no trade is selected, redirect to home
        router.push("/");
      }
    }
  }, [router]);

  // Handle job description submission to get estimate
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!description.trim()) {
      setError("Please describe the work you need done");
      return;
    }

    if (!formData.trade || !formData.postcode) {
      setError("Missing trade or location information");
      return;
    }
    setIsEstimating(true);
    setError(null);

    try {
      // Simulate API call to get estimate
      const estimatedCost = await getAIEstimate(
        description,
        formData.trade,
        formData.postcode
      );
      setEstimate(estimatedCost);
      setShowContactForm(true);

      // Scroll to contact form
      setTimeout(() => {
        const contactForm = document.getElementById("contact-form");
        if (contactForm) {
          contactForm.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err) {
      setError("Failed to get estimate. Please try again.");
      console.error("Error getting estimate:", err);
    } finally {
      setIsEstimating(false);
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validate contact info
    const { isValid, error: validationError } = validateContactInfo(formData);
    if (!isValid && validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the lead
      await submitLead({
        ...formData,
        description,
        estimate: estimate || "",
      });

      // Show success message
      setFormSuccess("Thank you! We'll be in touch with you shortly.");

      // Reset form
      setDescription("");
      setFormData({
        name: "",
        email: "",
        phone: "",
        description: "",
        trade: formData.trade,
        postcode: formData.postcode,
      });

      // Reset form after delay
      setTimeout(() => {
        setFormSuccess(null);
        setShowContactForm(false);
        setEstimate(null);
      }, 3000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setFormError("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error) setError(null);
  };

  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  // Update step based on form state
  useEffect(() => {
    if (!showContactForm) {
      setCurrentStep(1);
    } else if (showContactForm && !formSuccess) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
    }
  }, [showContactForm, formSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: "0%" }}
                animate={{
                  width:
                    currentStep === 1
                      ? "0%"
                      : currentStep === 2
                      ? "50%"
                      : "100%",
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <motion.div
                  variants={itemVariants}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    currentStep >= step
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-500"
                  } font-semibold text-lg`}
                >
                  {step}
                </motion.div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    currentStep >= step ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step === 1
                    ? "Job Details"
                    : step === 2
                    ? "Your Info"
                    : "Complete"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-white hover:bg-white/10 rounded-full p-2 -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">
                  {formData.trade} Services in {formData.postcode}
                </h1>
                <p className="text-blue-100 mt-1">
                  {!showContactForm
                    ? "Tell us about your project"
                    : "Almost there! Share your contact details"}
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <motion.div
            variants={containerVariants}
            className="px-8 py-8 sm:px-10"
          >
            {/* Alerts */}
            <motion.div variants={itemVariants}>
              {formError && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {formError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {formSuccess && (
                <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {formSuccess}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {!showContactForm ? (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-8"
                variants={itemVariants}
              >
                <div className="space-y-6">
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Help us understand your project
                    </h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Please provide as much detail as possible about the work
                      you need done. This helps us match you with the right
                      professionals and provide an accurate estimate.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Project Details
                        </label>
                        <Textarea
                          id="description"
                          rows={6}
                          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-base leading-relaxed"
                          placeholder="Example: I need a kitchen remodel including new cabinets, countertops, and flooring. The space is approximately 12' x 15'."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                          disabled={isEstimating}
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Include details like measurements, materials, and any
                          specific requirements.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            Timeline
                          </h4>
                          <p className="text-sm text-gray-600">
                            When would you like to start this project?
                          </p>
                          <select
                            className="mt-2 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isEstimating}
                          >
                            <option>Flexible timing</option>
                            <option>Within 1 month</option>
                            <option>Within 2-3 months</option>
                            <option>Not sure yet</option>
                          </select>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-600" />
                            Project Type
                          </h4>
                          <p className="text-sm text-gray-600">
                            What best describes your project?
                          </p>
                          <select
                            className="mt-2 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isEstimating}
                          >
                            <option>New installation</option>
                            <option>Repair/Replacement</option>
                            <option>Maintenance</option>
                            <option>Inspection</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    disabled={isEstimating}
                  >
                    Back to Search
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-8 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    disabled={isEstimating || !description.trim()}
                  >
                    {isEstimating ? (
                      <>
                        <LoadingSpinner size={20} className="mr-2" />
                        Analyzing Project...
                      </>
                    ) : (
                      <span className="flex items-center">
                        Get Free Estimate
                        <svg
                          className="ml-2 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </span>
                    )}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                onSubmit={handleContactSubmit}
                className="space-y-8"
                variants={itemVariants}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Estimate Card */}
                <div
                  id="estimate-section"
                  className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 p-6 rounded-xl"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-blue-800">
                        Your Project Estimate
                      </h3>
                      <div className="mt-1 text-2xl font-bold text-blue-900">
                        {estimate}
                      </div>
                      <p className="mt-2 text-sm text-blue-700">
                        This is an estimated price range based on the details
                        you have provided. A professional will provide a more
                        accurate quote after reviewing your project.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Contact Information
                    </h2>
                    <p className="mt-2 text-gray-600">
                      We will use this information to connect you with local
                      professionals.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Name Field */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                      >
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                        Your Name
                        <span className="ml-1 text-xs text-gray-500">
                          (optional)
                        </span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-colors"
                          placeholder="John Smith"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        So we know what to call you
                      </p>
                    </div>

                    {/* Email Field */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        Email Address
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-colors"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        We will send your estimate and contact info to local
                        professionals
                      </p>
                    </div>

                    {/* Phone Field */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                      >
                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                        Phone Number
                        <span className="ml-1 text-xs text-gray-500">
                          (optional)
                        </span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-colors"
                          placeholder="+44 1234 567890"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Helps professionals contact you faster. We will not
                        share your number without permission.
                      </p>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-blue-700">
                        By submitting this form, you agree to our{" "}
                        <a
                          href="/privacy"
                          className="font-medium text-blue-900 hover:underline"
                        >
                          Privacy Policy
                        </a>{" "}
                        and consent to be contacted by our professional network.
                        You may receive SMS messages. Reply STOP to opt out.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowContactForm(false)}
                      className="w-full sm:w-auto justify-center px-6 py-3 text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Project Details
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size={20} className="mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <span className="flex items-center">
                          Get Free Quotes
                          <svg
                            className="ml-2 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.form>
            )}
          </motion.div>

          {/* Trust badge */}
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <motion.div
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-3 flex items-center space-x-2 z-10"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                All tradespeople are vetted & verified
              </span>
            </motion.div>
            <p className="text-xs text-gray-500 mt-2">
              5,000+ trusted professionals in our network
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
