"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_type: string;
  project_description: string;
  location: string;
  timeframe: string;
  budget_range: string;
  status: string;
  admin_approved: boolean;
  tradesperson_quoted: boolean;
  client_approved: boolean;
  created_at: string;
  tradespersonName: string;
  tradespersonTrade: string;
}

export default function AdminQuoteRequests() {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  console.log(
    "AdminQuoteRequests: Component rendered, loading:",
    loading,
    "quoteRequests:",
    quoteRequests
  );

  useEffect(() => {
    console.log("AdminQuoteRequests: useEffect triggered");
    fetchQuoteRequests();
  }, []);

  const fetchQuoteRequests = async () => {
    try {
      console.log("AdminQuoteRequests: Fetching quote requests...");
      const response = await fetch("/api/client/admin-secret/quote-requests");
      const data = await response.json();
      console.log("AdminQuoteRequests: API response:", data);

      if (data.success) {
        console.log(
          "AdminQuoteRequests: Setting quote requests:",
          data.quoteRequests
        );
        setQuoteRequests(data.quoteRequests);
      } else {
        console.error("AdminQuoteRequests: API error:", data.error);
        setError("Failed to fetch quote requests");
      }
    } catch (err) {
      console.error("AdminQuoteRequests: Fetch error:", err);
      setError("Error fetching quote requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (
    quoteRequestId: string,
    action: "approve" | "reject"
  ) => {
    try {
      setLoading(true); // Show loading state
      const response = await fetch("/api/client/admin-secret/approve-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteRequestId,
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Quote request ${action}d successfully! Email notifications have been sent.`
        );
        // Remove the request from the list since it's no longer pending
        setQuoteRequests((prevRequests) =>
          prevRequests.filter((request) => request.id !== quoteRequestId)
        );
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || `Failed to ${action} quote request`);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError(`Error ${action}ing quote request`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (request: QuoteRequest) => {
    // Since we only show pending requests, this should always be "Pending Approval"
    return <Badge variant="outline">Pending Approval</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-100 p-4 rounded mb-4">
        <p className="text-yellow-800">
          Debug: AdminQuoteRequests component loaded. Loading:{" "}
          {loading ? "Yes" : "No"}, Requests: {quoteRequests.length}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quote Requests</h2>
        <Button onClick={fetchQuoteRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {quoteRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quote requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {quoteRequests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Quote Request from {request.customer_name}
                  </CardTitle>
                  {getStatusBadge(request)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">
                      Customer Details
                    </h4>
                    <p>
                      <strong>Name:</strong> {request.customer_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {request.customer_email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {request.customer_phone}
                    </p>
                    <p>
                      <strong>Location:</strong> {request.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">
                      Project Details
                    </h4>
                    <p>
                      <strong>Type:</strong>{" "}
                      {request.project_type || "Not specified"}
                    </p>
                    <p>
                      <strong>Timeframe:</strong>{" "}
                      {request.timeframe || "Not specified"}
                    </p>
                    <p>
                      <strong>Budget:</strong>{" "}
                      {request.budget_range || "Not specified"}
                    </p>
                    <p>
                      <strong>Description:</strong>
                    </p>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                      {request.project_description}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">
                    Tradesperson
                  </h4>
                  <p>
                    <strong>Name:</strong> {request.tradespersonName}
                  </p>
                  <p>
                    <strong>Trade:</strong> {request.tradespersonTrade}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Requested on {formatDate(request.created_at)}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveReject(request.id, "approve")}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {loading ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleApproveReject(request.id, "reject")}
                      size="sm"
                      variant="destructive"
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {loading ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
