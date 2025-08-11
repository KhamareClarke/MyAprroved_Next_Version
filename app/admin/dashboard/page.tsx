"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, CheckCircle, XCircle, Eye, Star, Clock } from "lucide-react";
import SimpleQuoteRequests from "@/components/SimpleQuoteRequests";

interface Tradesperson {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  postcode: string;
  city: string;
  address: string;
  trade: string;
  years_experience: number;
  hourly_rate: number;
  id_document_url: string;
  insurance_document_url: string;
  qualifications_document_url: string;
  trade_card_url: string;
  is_verified: boolean;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
}

interface Job {
  id: string;
  trade: string;
  job_description: string;
  postcode: string;
  budget: number;
  budget_type: string;
  preferred_date: string;
  status: string;
  is_approved: boolean;
  created_at: string;
  clients: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  assigned_tradesperson_id?: string;
  quotation_amount?: number;
  assigned_by?: "client" | "admin";
  is_completed?: boolean;
  completed_at?: string;
  completed_by?: string;
  client_rating?: number;
  client_review?: string;
  tradespeople?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    trade: string;
    years_experience: number;
    hourly_rate: number;
    phone: string;
  };
  job_reviews?: {
    id: string;
    tradesperson_id: string;
    reviewer_type: "client" | "tradesperson";
    reviewer_id: string;
    rating: number;
    review_text: string;
    reviewed_at: string;
  }[];
}

interface JobApplication {
  id: string;
  quotation_amount: number;
  quotation_notes: string;
  status: string;
  applied_at: string;
  jobs: {
    id: string;
    trade: string;
    job_description: string;
    postcode: string;
    budget: number;
    budget_type: string;
    clients: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  tradespeople: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    trade: string;
    years_experience: number;
    hourly_rate: number;
    phone: string;
  };
}

export default function AdminDashboardPage() {
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("tradespeople");
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedJobForAssignment, setSelectedJobForAssignment] =
    useState<any>(null);
  const [assignmentQuotation, setAssignmentQuotation] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [availableTradespeople, setAvailableTradespeople] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!adminLoggedIn) {
      router.push("/admin/login");
      return;
    }

    loadData();
  }, [router]);

  // Monitor jobs state changes
  useEffect(() => {
    console.log("Admin dashboard - Jobs state changed:", {
      jobsLength: jobs.length,
      jobs: jobs,
    });
  }, [jobs]);

  const loadData = async () => {
    try {
      console.log("Admin dashboard - Loading data...");

      // Load tradespeople
      const tradespeopleResponse = await fetch("/api/admin/tradespeople");
      if (tradespeopleResponse.ok) {
        const tradespeopleData = await tradespeopleResponse.json();
        console.log(
          "Admin dashboard - Tradespeople loaded:",
          tradespeopleData.tradespeople?.length || 0
        );
        setTradespeople(tradespeopleData.tradespeople);
      }

      // Load jobs
      const jobsResponse = await fetch("/api/client/jobs");
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        console.log("Admin dashboard - Full jobs response:", jobsData);
        console.log(
          "Admin dashboard - Jobs loaded:",
          jobsData.jobs?.length || 0
        );
        console.log("Admin dashboard - Jobs data:", jobsData.jobs);

        // Handle both possible response structures
        const jobsArray = jobsData.jobs || jobsData || [];
        console.log("Admin dashboard - Final jobs array:", jobsArray);
        setJobs(jobsArray);
      } else {
        console.error(
          "Admin dashboard - Failed to load jobs:",
          jobsResponse.status
        );
        const errorText = await jobsResponse.text();
        console.error("Admin dashboard - Error response:", errorText);
      }

      // Load job applications
      const applicationsResponse = await fetch("/api/admin/job-applications");
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        console.log(
          "Admin dashboard - Applications loaded:",
          applicationsData.applications?.length || 0
        );
        setApplications(applicationsData.applications);
      }
    } catch (err) {
      console.error("Admin dashboard - Error loading data:", err);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTradesperson = async (tradespersonId: string) => {
    try {
      const response = await fetch("/api/admin/verify-tradesperson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tradespersonId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Tradesperson verified successfully!");
        loadData(); // Reload data
      } else {
        setError(data.error || "Failed to verify tradesperson");
      }
    } catch (err) {
      setError("Error verifying tradesperson");
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      const response = await fetch("/api/admin/approve-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Job approved successfully!");
        loadData(); // Reload data
      } else {
        setError(data.error || "Failed to approve job");
      }
    } catch (err) {
      setError("Error approving job");
    }
  };

  const handleApproveQuotation = async (
    applicationId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetch("/api/admin/approve-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Quotation ${action}d successfully!`);
        loadData(); // Reload data
      } else {
        setError(data.error || `Failed to ${action} quotation`);
      }
    } catch (err) {
      setError(`Error ${action}ing quotation`);
    }
  };

  const loadAvailableTradespeople = async (
    jobTrade: string,
    jobPostcode: string
  ) => {
    try {
      const { data: tradespeople, error } = await fetch(
        "/api/admin/tradespeople"
      ).then((res) => res.json());

      if (error) {
        console.error("Error loading tradespeople:", error);
        return;
      }

      // Filter by trade and location
      const filteredTradespeople =
        tradespeople?.filter((tp: any) => {
          return tp.trade === jobTrade && tp.is_approved && tp.is_verified;
        }) || [];

      setAvailableTradespeople(filteredTradespeople);
    } catch (err) {
      console.error("Error in loadAvailableTradespeople:", err);
    }
  };

  const loadJobApplications = async (jobId: string) => {
    try {
      const { data, error } = await fetch("/api/admin/job-applications").then(
        (res) => res.json()
      );
      if (!error) setJobApplications(data || []);
      else setJobApplications([]);
    } catch (err) {
      setJobApplications([]);
    }
  };

  const handleAssignJob = (job: any) => {
    if (job.assigned_by === "client") {
      setError(
        "This job is already assigned by client. Admin cannot reassign."
      );
      return;
    }
    setSelectedJobForAssignment(job);
    setJobApplications([]);
    loadJobApplications(job.id);
    setShowAssignmentDialog(true);
  };

  const submitAssignment = async (application: any) => {
    if (!selectedJobForAssignment) {
      setError("Please select an application");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      const response = await fetch("/api/admin/assign-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJobForAssignment.id,
          tradespersonId: application.tradespeople.id,
          quotationAmount: application.quotation_amount,
          quotationNotes: application.quotation_notes,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Job assigned successfully!");
        setShowAssignmentDialog(false);
        loadData();
      } else {
        setError(data.error || "Failed to assign job");
      }
    } catch (err) {
      setError("Error assigning job");
    } finally {
      setAssigning(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  // Filter jobs by status
  const pendingJobs = jobs.filter((job) => !job.is_approved);
  const availableJobs = jobs.filter(
    (job) =>
      job.is_approved && !job.assigned_tradesperson_id && !job.is_completed
  );
  const inProgressJobs = jobs.filter(
    (job) => job.assigned_tradesperson_id && !job.is_completed
  );
  const completedJobs = jobs.filter((job) => job.is_completed);

  // Debug logging
  console.log("Admin dashboard - Jobs state:", {
    totalJobs: jobs.length,
    pendingJobs: pendingJobs.length,
    availableJobs: availableJobs.length,
    inProgressJobs: inProgressJobs.length,
    completedJobs: completedJobs.length,
    jobsData: jobs,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage tradespeople, jobs, and applications
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{tradespeople.length}</div>
              <div className="text-sm text-gray-600">Total Tradespeople</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingJobs.length}
              </div>
              <div className="text-sm text-gray-600">Pending Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {inProgressJobs.length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {completedJobs.length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="tradespeople">Tradespeople</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="quote-requests">Quote Requests</TabsTrigger>
            <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
          </TabsList>

          {/* Tradespeople Tab */}
          <TabsContent value="tradespeople">
            <Card>
              <CardHeader>
                <CardTitle>Registered Tradespeople</CardTitle>
                <CardDescription>
                  Review and verify tradesperson registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Trade</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradespeople.map((tradesperson) => (
                      <TableRow key={tradesperson.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {tradesperson?.first_name}{" "}
                              {tradesperson?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tradesperson?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tradesperson?.trade}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{tradesperson?.phone}</div>
                            <div className="text-gray-500">
                              {tradesperson?.years_experience} years exp.
                            </div>
                            <div className="text-gray-500">
                              £{tradesperson?.hourly_rate}/hr
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{tradesperson?.postcode}</div>
                            <div className="text-gray-500">
                              {tradesperson?.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  tradesperson?.is_verified
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {tradesperson?.is_verified
                                  ? "Verified"
                                  : "Unverified"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  tradesperson?.is_approved
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {tradesperson?.is_approved
                                  ? "Approved"
                                  : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {!tradesperson?.is_verified && (
                            <Button
                              onClick={() =>
                                handleVerifyTradesperson(tradesperson.id)
                              }
                              size="sm"
                              className="mr-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Posted Jobs</CardTitle>
                <CardDescription>
                  Review and approve job postings from clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No jobs found</p>
                    <p className="text-sm text-gray-400">
                      Jobs loaded: {jobs.length}
                    </p>
                    <p className="text-sm text-gray-400">
                      Loading: {loading ? "Yes" : "No"}
                    </p>
                    <Button
                      onClick={loadData}
                      variant="outline"
                      className="mt-2"
                    >
                      Refresh Data
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Trade</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {job.clients.first_name} {job.clients.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {job.clients.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.trade}</Badge>
                          </TableCell>
                          <TableCell>
                            <div
                              className="max-w-xs truncate"
                              title={job.job_description}
                            >
                              {job.job_description}
                            </div>
                          </TableCell>
                          <TableCell>{job.postcode}</TableCell>
                          <TableCell>
                            £{job.budget || "Not specified"} ({job.budget_type})
                          </TableCell>
                          <TableCell>
                            {job.assigned_tradesperson_id ? (
                              <div className="text-sm">
                                <div className="font-medium">Assigned</div>
                                <div className="text-gray-500">
                                  ID: {job.assigned_tradesperson_id}
                                </div>
                                {job.quotation_amount && (
                                  <div className="text-green-600">
                                    £{job.quotation_amount}
                                  </div>
                                )}
                                {job.assigned_by && (
                                  <div className="text-xs text-gray-400">
                                    By:{" "}
                                    {job.assigned_by === "client"
                                      ? "Client"
                                      : "Admin"}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {!job.is_approved && (
                              <Button
                                onClick={() => handleApproveJob(job.id)}
                                size="sm"
                                className="mr-2"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
            <Card>
              <CardHeader>
                <CardTitle>Job Quotations</CardTitle>
                <CardDescription>
                  Review and approve/reject tradesperson quotations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Details</TableHead>
                      <TableHead>Tradesperson</TableHead>
                      <TableHead>Quotation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {application.jobs.trade}
                            </div>
                            <div
                              className="text-sm text-gray-600 max-w-xs truncate"
                              title={application.jobs.job_description}
                            >
                              {application.jobs.job_description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.jobs.postcode}
                            </div>
                            <div className="text-xs text-gray-400">
                              Client: {application.jobs.clients.first_name}{" "}
                              {application.jobs.clients.last_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {application.tradespeople.first_name}{" "}
                              {application.tradespeople.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.tradespeople.trade}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.tradespeople.years_experience} years
                              exp.
                            </div>
                            <div className="text-xs text-gray-400">
                              £{application.tradespeople.hourly_rate}/hr
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-bold text-lg">
                              £{application.quotation_amount}
                            </div>
                            {application.quotation_notes && (
                              <div className="text-sm text-gray-600 mt-1">
                                {application.quotation_notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              application.status === "pending"
                                ? "secondary"
                                : application.status === "accepted"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {application.status.charAt(0).toUpperCase() +
                              application.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(
                            application.applied_at
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {application.status === "pending" && (
                            <div className="space-y-1">
                              <Button
                                onClick={() =>
                                  handleApproveQuotation(
                                    application.id,
                                    "approve"
                                  )
                                }
                                size="sm"
                                className="w-full"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() =>
                                  handleApproveQuotation(
                                    application.id,
                                    "reject"
                                  )
                                }
                                variant="destructive"
                                size="sm"
                                className="w-full"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Requests Tab */}
          <TabsContent value="quote-requests">
            <SimpleQuoteRequests />
          </TabsContent>

          {/* Completed Jobs Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Jobs</CardTitle>
                <CardDescription>
                  View completed jobs with ratings and reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Details</TableHead>
                      <TableHead>Tradesperson</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.trade}</div>
                            <div
                              className="text-sm text-gray-600 max-w-xs truncate"
                              title={job.job_description}
                            >
                              {job.job_description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.postcode}
                            </div>
                            <div className="text-xs text-gray-400">
                              Completed by: {job.completed_by}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.tradespeople ? (
                            <div>
                              <div className="font-medium">
                                {job.tradespeople.first_name}{" "}
                                {job.tradespeople.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {job.tradespeople.trade}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {job.clients.first_name} {job.clients.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.clients.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(job.completed_at!).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {job.job_reviews && job.job_reviews.length > 0 ? (
                            <div className="space-y-2">
                              {job.job_reviews.map((review: any) => (
                                <div
                                  key={review.id}
                                  className="border-l-2 border-blue-200 pl-2"
                                >
                                  <div className="flex items-center gap-2">
                                    {renderStars(review.rating)}
                                    <span className="text-sm">
                                      ({review.rating}/5)
                                    </span>
                                  </div>
                                  {review.review_text && (
                                    <div
                                      className="text-xs text-gray-600 mt-1 max-w-xs truncate"
                                      title={review.review_text}
                                    >
                                      {review.review_text}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No ratings</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {job.job_reviews && job.job_reviews.length > 0 ? (
                            <div className="space-y-1">
                              {job.job_reviews.map((review: any) => (
                                <div
                                  key={review.id}
                                  className="text-sm text-gray-600 max-w-xs truncate"
                                  title={review.review_text}
                                >
                                  {review.review_text || "No review text"}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No reviews</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog
          open={showAssignmentDialog}
          onOpenChange={setShowAssignmentDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Job to Tradesperson</DialogTitle>
              <DialogDescription>
                Select a tradesperson who has applied to this job. Their
                quotation and notes are shown below.
              </DialogDescription>
            </DialogHeader>
            {selectedJobForAssignment && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold mb-2">Job Details:</h4>
                  <p className="text-sm text-gray-600">
                    {selectedJobForAssignment.job_description}
                  </p>
                  <p className="text-sm text-gray-600">
                    Trade: {selectedJobForAssignment.trade}
                  </p>
                  <p className="text-sm text-gray-600">
                    Location: {selectedJobForAssignment.postcode}
                  </p>
                  <p className="text-sm text-gray-600">
                    Client: {selectedJobForAssignment.clients.first_name}{" "}
                    {selectedJobForAssignment.clients.last_name}
                  </p>
                </div>
                <div>
                  <Label>Applicants:</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {jobApplications.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No tradespeople have applied for this job yet.
                      </p>
                    ) : (
                      jobApplications.map((app) => (
                        <div key={app.id} className="border p-2 rounded">
                          <div className="font-medium">
                            {app.tradespeople.first_name}{" "}
                            {app.tradespeople.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Experience: {app.tradespeople.years_experience}{" "}
                            years | Rate: £{app.tradespeople.hourly_rate}/hr
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <strong>Quotation:</strong> £{app.quotation_amount}
                          </div>
                          {app.quotation_notes && (
                            <div className="text-sm text-gray-600 mt-1">
                              <strong>Notes:</strong> {app.quotation_notes}
                            </div>
                          )}
                          <Button
                            onClick={() => submitAssignment(app)}
                            disabled={assigning}
                            size="sm"
                            className="mt-2"
                          >
                            {assigning
                              ? "Assigning..."
                              : "Assign to This Tradesperson"}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignmentDialog(false)}
                    disabled={assigning}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
