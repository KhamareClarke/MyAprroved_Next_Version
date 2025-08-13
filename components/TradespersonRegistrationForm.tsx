"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase-client";
import {
  Upload,
  FileText,
  Shield,
  Award,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface TradespersonRegistrationFormProps {
  onRegistrationComplete?: () => void;
}

export default function TradespersonRegistrationForm({
  onRegistrationComplete,
}: TradespersonRegistrationFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    postcode: "",
    city: "",
    address: "",
    trade: "",
    yearsExperience: "",
    hourlyRate: "",
    acceptTerms: false,
  });

  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    insuranceDocument: null as File | null,
    qualificationsDocument: null as File | null,
    tradeCardDocument: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const tradeOptions = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting & Decorating",
    "Roofing",
    "Heating & Ventilation",
    "Air Conditioning",
    "Garden & Landscaping",
    "Cleaning",
    "Carpet & Flooring",
    "Kitchen & Bathroom",
    "General Handyman",
    "Other",
  ];

  // Trades that require trade card
  const tradesRequiringTradeCard = [
    "Plumbing",
    "Electrical",
    "Air Conditioning",
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentUpload = (field: string, file: File | null) => {
    setDocuments((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const uploadDocument = async (
    file: File,
    folder: string
  ): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("tradesperson-documents")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload ${folder}: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("tradesperson-documents").getPublicUrl(filePath);

    return publicUrl;
  };

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      throw new Error("Please fill in all required fields");
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (formData.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (!formData.postcode || !formData.city) {
      throw new Error("Please provide postcode and city");
    }

    if (!formData.trade) {
      throw new Error("Please select your trade");
    }

    if (!formData.acceptTerms) {
      throw new Error("Please accept the terms and conditions");
    }

    // Check required documents
    if (!documents.idDocument) {
      throw new Error("ID document is required");
    }

    if (!documents.insuranceDocument) {
      throw new Error("Insurance document is required");
    }

    if (!documents.qualificationsDocument) {
      throw new Error("Proof of qualifications is required");
    }

    // Check trade card requirement
    if (
      tradesRequiringTradeCard.includes(formData.trade) &&
      !documents.tradeCardDocument
    ) {
      throw new Error(
        `Trade card is required for ${formData.trade} professionals`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      validateForm();

      // Upload all documents
      const documentUrls = {
        idDocumentUrl: await uploadDocument(
          documents.idDocument!,
          "id-documents"
        ),
        insuranceDocumentUrl: await uploadDocument(
          documents.insuranceDocument!,
          "insurance-documents"
        ),
        qualificationsDocumentUrl: await uploadDocument(
          documents.qualificationsDocument!,
          "qualifications-documents"
        ),
        tradeCardUrl: documents.tradeCardDocument
          ? await uploadDocument(documents.tradeCardDocument, "trade-cards")
          : null,
      };

      // Create tradesperson account
      const response = await fetch("/api/tradespeopleeeee/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          postcode: formData.postcode,
          city: formData.city,
          address: formData.address,
          trade: formData.trade,
          yearsExperience: formData.yearsExperience
            ? parseInt(formData.yearsExperience)
            : null,
          hourlyRate: formData.hourlyRate
            ? parseFloat(formData.hourlyRate)
            : null,
          ...documentUrls,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register");
      }

      setSuccess(
        "Registration submitted successfully! Your account will be reviewed and approved by our team."
      );

      // Reset form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        postcode: "",
        city: "",
        address: "",
        trade: "",
        yearsExperience: "",
        hourlyRate: "",
        acceptTerms: false,
      });

      setDocuments({
        idDocument: null,
        insuranceDocument: null,
        qualificationsDocument: null,
        tradeCardDocument: null,
      });

      // Call callback if provided
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Tradesperson Registration</CardTitle>
        <CardDescription>
          Join our network of qualified tradespeople. Please provide all
          required information and documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) =>
                    handleInputChange("postcode", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Trade Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trade Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trade">Trade *</Label>
                <Select
                  value={formData.trade}
                  onValueChange={(value) => handleInputChange("trade", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradeOptions.map((trade) => (
                      <SelectItem key={trade} value={trade}>
                        {trade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsExperience}
                  onChange={(e) =>
                    handleInputChange("yearsExperience", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    handleInputChange("hourlyRate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Required Documents</h3>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All documents must be in PDF, JPG, or PNG format. Maximum file
                size: 5MB per document.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idDocument">
                  <FileText className="w-4 h-4 inline mr-2" />
                  ID Document (Passport/Driving License)ss *
                </Label>
                <Input
                  id="idDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleDocumentUpload(
                      "idDocument",
                      e.target.files?.[0] || null
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceDocument">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Insurance Document *
                </Label>
                <Input
                  id="insuranceDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleDocumentUpload(
                      "insuranceDocument",
                      e.target.files?.[0] || null
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualificationsDocument">
                  <Award className="w-4 h-4 inline mr-2" />
                  Proof of Qualifications *
                </Label>
                <Input
                  id="qualificationsDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleDocumentUpload(
                      "qualificationsDocument",
                      e.target.files?.[0] || null
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradeCardDocument">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Trade Card{" "}
                  {tradesRequiringTradeCard.includes(formData.trade)
                    ? "*"
                    : "(Optional)"}
                </Label>
                <Input
                  id="tradeCardDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleDocumentUpload(
                      "tradeCardDocument",
                      e.target.files?.[0] || null
                    )
                  }
                  required={tradesRequiringTradeCard.includes(formData.trade)}
                />
                {tradesRequiringTradeCard.includes(formData.trade) && (
                  <p className="text-sm text-muted-foreground">
                    Required for {formData.trade} professionals
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  handleInputChange("acceptTerms", checked as boolean)
                }
                required
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                I accept the terms and conditions and agree to the privacy
                policy *
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting Registration..."
              : "Submit Registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
