"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  CheckCircle,
  XCircle,
  Star,
  Plus,
  LogOut,
  Clock,
  MessageCircle,
  ChevronDown,
  Wrench,
  Phone,
  Mail,
  User,
} from "lucide-react";
import JobPostForm from "@/components/JobPostForm";
import JobCompletionDialog from "@/components/JobCompletionDialog";
import { supabase } from "@/lib/supabase-client";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimpleChatSystem from "@/components/SimpleChatSystem";
import DatabaseChatSystem from "@/components/DatabaseChatSystem";
import PostJobDialog from "@/components/PostJobDialog";
import ClientQuoteRequests from "@/components/ClientQuoteRequests";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  firstName: string;
  type: string;
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
  application_status?: string;
  tradespeople?: {
    id: string;
    first_name: string;
    last_name: string;
    trade: string;
    years_experience: number;
    hourly_rate: number;
    phone: string;
  };
  quotation_amount?: number;
  quotation_notes?: string;
  assigned_by?: string;
  is_completed?: boolean;
  completed_at?: string;
  completed_by?: string;
  client_rating?: number;
  client_review?: string;
  assigned_tradesperson_id?: string; // Added for assignment status
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

export default function ClientDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [showJobForm, setShowJobForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedJobForAssignment, setSelectedJobForAssignment] =
    useState<any>(null);
  const [assignmentQuotation, setAssignmentQuotation] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [availableTradespeople, setAvailableTradespeople] = useState<any[]>([]);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [selectedJobForCompletion, setSelectedJobForCompletion] =
    useState<any>(null);
  const [completing, setCompleting] = useState(false);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]); // New state for all applications
  const [activeTab, setActiveTab] = useState("jobs"); // New state for active tab
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login/client");
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      if (userObj.type !== "client") {
        router.push("/login/client");
        return;
      }

      setUser(userObj);
      // Load jobs after user is set
      loadJobs(userObj.id);
      loadAllApplications(userObj.id); // Load all applications for quotations tab
    } catch (err) {
      console.error("Error parsing user data:", err);
      router.push("/login/client");
    }
  }, [router]);

  // Auto-refresh chat unread count every 10 seconds
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(() => {
        loadChatUnreadCount(user.id);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Load chat unread count
  const loadChatUnreadCount = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/chat/unread-count?userId=${userId}&userType=client`
      );
      const data = await response.json();

      if (response.ok) {
        setChatUnreadCount(data.unreadCount || 0);
      } else {
        console.error("Failed to load chat unread count:", data.error);
      }
    } catch (error) {
      console.error("Error loading chat unread count:", error);
    }
  };

  const loadJobs = async (userId: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/client/jobs?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
        await loadAllApplications(userId);
        await loadChatUnreadCount(userId);
      } else {
        setError(data.error || "Failed to load jobs");
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const loadJobApplications = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(
          `*, tradespeople (id, first_name, last_name, trade, years_experience, hourly_rate, phone, email)`
        )
        .eq("job_id", jobId)
        .order("applied_at", { ascending: false });
      if (!error) setJobApplications(data || []);
      else setJobApplications([]);
    } catch (err) {
      setJobApplications([]);
    }
  };

  const loadAllApplications = async (userId: string) => {
    try {
      console.log("Loading all applications for user:", userId);

      const { data: applications, error } = await supabase
        .from("job_applications")
        .select(
          `
          *,
          jobs (
            id,
            trade,
            job_description,
            postcode,
            budget,
            budget_type,
            client_id,
            clients (
              first_name,
              last_name,
              email
            )
          ),
          tradespeople (
            id,
            first_name,
            last_name,
            email,
            trade,
            years_experience,
            hourly_rate,
            phone
          )
        `
        )
        .eq("jobs.client_id", userId)
        .order("applied_at", { ascending: false });

      if (error) {
        console.error("Error loading all applications:", error);
        setError("Failed to load applications: " + error.message);
        return;
      }

      console.log("All applications loaded:", applications);
      setAllApplications(applications || []);
    } catch (err) {
      console.error("Error in loadAllApplications:", err);
      setError(
        "Error loading applications: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login/client");
  };

  const handleJobPosted = () => {
    setShowJobForm(false);
    if (user) {
      loadJobs(user.id); // Reload jobs after posting
    }
  };

  const loadAvailableTradespeople = async (
    jobTrade: string,
    jobPostcode: string
  ) => {
    try {
      const { data: tradespeople, error } = await supabase
        .from("tradespeople")
        .select("*")
        .eq("trade", jobTrade)
        .eq("is_approved", true)
        .eq("is_verified", true);

      if (error) {
        console.error("Error loading tradespeople:", error);
        return;
      }

      // Filter by location (simple postcode matching)
      const filteredTradespeople =
        tradespeople?.filter((tp) => {
          // Simple distance calculation (same postcode area)
          const tpArea = tp.postcode.split(" ")[0];
          const jobArea = jobPostcode.split(" ")[0];
          return tpArea === jobArea;
        }) || [];

      setAvailableTradespeople(filteredTradespeople);
    } catch (err) {
      console.error("Error in loadAvailableTradespeople:", err);
    }
  };

  const handleAssignJob = (job: any) => {
    if (job.assigned_by === "admin") {
      setError(
        "This job has already been assigned by admin. You cannot reassign it."
      );
      return;
    }
    setSelectedJobForAssignment(job);
    setJobApplications([]);
    loadJobApplications(job.id);
    setShowAssignmentDialog(true);
  };

  const submitAssignment = async (application: any) => {
    if (!selectedJobForAssignment || !user) {
      setError("Missing job or user information");
      return;
    }

    setAssigning(true);
    setError("");

    try {
      // Directly assign to the specific tradesperson
      const response = await fetch("/api/jobs/client-assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJobForAssignment.id,
          tradespersonId: application.tradesperson_id,
          quotationAmount: application.quotation_amount,
          quotationNotes: application.quotation_notes,
          assignedBy: "client",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Job assigned successfully!");
        setShowAssignmentDialog(false);
        loadJobs(user.id); // Reload jobs to update the UI
      } else {
        setError(data.error || "Failed to assign job");
      }
    } catch (err) {
      setError("Error assigning job");
    } finally {
      setAssigning(false);
    }
  };

  const handleCompleteJob = async (job: any) => {
    setSelectedJobForCompletion(job);

    // Load all accepted applications for this job
    try {
      const { data: acceptedApplications, error } = await supabase
        .from("job_applications")
        .select(
          `
          *,
          tradespeople (
            id,
            first_name,
            last_name,
            email,
            trade,
            years_experience,
            hourly_rate,
            phone
          )
        `
        )
        .eq("job_id", job.id)
        .eq("status", "accepted")
        .order("accepted_at", { ascending: false });

      if (error) {
        console.error("Error loading accepted applications:", error);
        setError("Failed to load tradespeople for rating");
        return;
      }

      setSelectedJobForCompletion({
        ...job,
        acceptedApplications: acceptedApplications || [],
      });
    } catch (err) {
      console.error("Error in handleCompleteJob:", err);
      setError("Error loading tradespeople for rating");
      return;
    }

    setShowCompletionDialog(true);
  };

  const submitJobCompletion = async (ratings: {
    [tradespersonId: string]: { rating: number; review: string };
  }) => {
    if (!selectedJobForCompletion || !user) {
      setError("Missing job or user information");
      return;
    }

    setCompleting(true);
    setError("");

    try {
      // First complete the job
      const response = await fetch("/api/jobs/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJobForCompletion.id,
          completedBy: "client",
          reviewerType: "client",
          reviewerId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Now submit ratings for each tradesperson
        const ratingPromises = Object.entries(ratings).map(
          ([tradespersonId, ratingData]) =>
            fetch("/api/jobs/rate-tradesperson", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jobId: selectedJobForCompletion.id,
                tradespersonId: tradespersonId,
                rating: ratingData.rating,
                review: ratingData.review,
                reviewerType: "client",
                reviewerId: user.id,
              }),
            })
        );

        await Promise.all(ratingPromises);

        setSuccess("Job completed successfully with ratings!");
        setShowCompletionDialog(false);
        await refreshAllData(); // Refresh all data
      } else {
        setError(data.error || "Failed to complete job");
      }
    } catch (err) {
      setError("Error completing job");
    } finally {
      setCompleting(false);
    }
  };

  const handleApproveQuotation = async (
    applicationId: string,
    action: "approve" | "reject"
  ) => {
    setAssigning(true);
    setError("");
    try {
      const response = await fetch(
        "/api/client/admin-secret/approve-quotation",
        {
          // Reusing admin API
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId, action }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Quotation ${action}d successfully!`);
        await refreshAllData(); // Refresh all data after action
      } else {
        setError(data.error || `Failed to ${action} quotation`);
      }
    } catch (err) {
      setError(`Error ${action}ing quotation`);
    } finally {
      setAssigning(false);
    }
  };

  const refreshAllData = async () => {
    if (!user) return;

    console.log("Refreshing all data for user:", user.id);
    await loadJobs(user.id);
    await loadAllApplications(user.id);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div>No user data found. Redirecting to login...</div>
        </div>
      </div>
    );
  }

  // Filter jobs by status
  const pendingJobs = jobs.filter((job) => !job.is_approved);
  const availableJobs = jobs.filter(
    (job) =>
      job.is_approved && job.application_status === "open" && !job.is_completed
  );
  const inProgressJobs = jobs.filter(
    (job) => job.application_status === "in_progress" && !job.is_completed
  );
  const completedJobs = jobs.filter((job) => job.is_completed);

  // Get accepted jobs for chat rooms
  const acceptedJobs = jobs.filter(
    (job) =>
      job.assigned_tradesperson_id &&
      job.application_status === "in_progress" &&
      !job.is_completed
  );

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
                      href="/login/trade"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Tradesperson Login</span>
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

      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Client Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <PostJobDialog onJobPosted={handleJobPosted} />
              <Button
                onClick={() => {
                  setShowChat(true);
                  setChatUnreadCount(0); // Clear unread count when opening chat
                }}
                variant="outline"
                className="flex items-center gap-2 relative"
              >
                <MessageCircle className="w-4 h-4" />
                Chat ({acceptedJobs.length})
                {chatUnreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                  </div>
                )}
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Success/Error Messages */}
          {success && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="mb-6" variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Job Posting Form */}
          {showJobForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Post a New Job</CardTitle>
                <CardDescription>
                  Fill in the details below to post a new job for tradespeople
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobPostForm onJobPosted={handleJobPosted} />
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{jobs.length}</div>
                <div className="text-sm text-gray-600">Total Jobs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {jobs.filter((job) => !job.is_approved).length}
                </div>
                <div className="text-sm text-gray-600">Pending Approval</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    jobs.filter(
                      (job) => job.assigned_tradesperson_id && !job.is_completed
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {jobs.filter((job) => job.is_completed).length}
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
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
              <TabsTrigger value="quote-requests">Quote Requests</TabsTrigger>
              <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
            </TabsList>

            {/* Jobs Tab */}
            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>My Jobs</CardTitle>
                  <CardDescription>
                    Manage your posted jobs and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
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
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge
                                variant={
                                  job.is_approved ? "default" : "secondary"
                                }
                              >
                                {job.is_approved ? "Approved" : "Pending"}
                              </Badge>
                              {job.assigned_tradesperson_id && (
                                <Badge variant="outline">Assigned</Badge>
                              )}
                              {job.is_completed && (
                                <Badge variant="default">Completed</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                £{job.budget || "Not specified"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {job.budget_type}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(job.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {job.assigned_tradesperson_id &&
                                !job.is_completed && (
                                  <Button
                                    onClick={() => handleCompleteJob(job)}
                                    size="sm"
                                    className="w-full"
                                  >
                                    <Clock className="w-4 h-4 mr-1" />
                                    Complete Job
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quotations Tab */}
            <TabsContent value="quotations">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Job Quotations</CardTitle>
                      <CardDescription>
                        Review and approve/reject tradesperson quotations
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => user && loadAllApplications(user.id)}
                      variant="outline"
                      size="sm"
                    >
                      🔄 Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {allApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        📝 No quotations yet
                      </div>
                      <p className="text-gray-600 mb-4">
                        When tradespeople apply for your jobs, their quotations
                        will appear here.
                      </p>
                      <Button
                        onClick={() => user && loadAllApplications(user.id)}
                        variant="outline"
                      >
                        🔄 Refresh Quotations
                      </Button>
                    </div>
                  ) : (
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
                        {allApplications.map((application) => (
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
                                  {application.tradespeople.years_experience}{" "}
                                  years exp.
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
                                    "{application.quotation_notes}"
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
                              {application.status === "accepted" && (
                                <Badge
                                  variant="default"
                                  className="w-full justify-center"
                                >
                                  ✓ Approved
                                </Badge>
                              )}
                              {application.status === "rejected" && (
                                <Badge
                                  variant="destructive"
                                  className="w-full justify-center"
                                >
                                  ✗ Rejected
                                </Badge>
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

            {/* Quote Requests Tab */}
            <TabsContent value="quote-requests">
              <ClientQuoteRequests
                clientEmail={user.email}
                clientId={user.id}
              />
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
                                      <span className="text-sm text-gray-600">
                                        ({review.rating}/5)
                                      </span>
                                    </div>
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

          {/* Job Quotations Dialog */}
          <Dialog
            open={showAssignmentDialog}
            onOpenChange={setShowAssignmentDialog}
          >
            <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Job Quotations</DialogTitle>
                <DialogDescription>
                  Review and approve/reject tradesperson quotations for this job
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
                  </div>

                  <div>
                    {jobApplications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No tradespeople have applied for this job yet.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tradesperson</TableHead>
                            <TableHead>Quotation</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applied</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobApplications.map((application) => (
                            <TableRow key={application.id}>
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
                                    {application.tradespeople.years_experience}{" "}
                                    years exp.
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    £{application.tradespeople.hourly_rate}/hr
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {application.tradespeople.phone}
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
                                      "{application.quotation_notes}"
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
                                {application.status === "pending" &&
                                  !selectedJobForAssignment.assigned_tradesperson_id &&
                                  selectedJobForAssignment.application_status ===
                                    "open" && (
                                    <div className="space-y-1">
                                      <Button
                                        onClick={() =>
                                          handleApproveQuotation(
                                            application.id,
                                            "approve"
                                          )
                                        }
                                        disabled={assigning}
                                        size="sm"
                                        className="w-full"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        {assigning ? "Approving..." : "Approve"}
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleApproveQuotation(
                                            application.id,
                                            "reject"
                                          )
                                        }
                                        variant="destructive"
                                        disabled={assigning}
                                        size="sm"
                                        className="w-full"
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        {assigning ? "Rejecting..." : "Reject"}
                                      </Button>
                                    </div>
                                  )}
                                {selectedJobForAssignment.assigned_tradesperson_id ===
                                  application.tradesperson_id && (
                                  <Badge
                                    variant="default"
                                    className="w-full justify-center"
                                  >
                                    ✓ Assigned
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Clear message if job is already assigned */}
                  {selectedJobForAssignment.assigned_tradesperson_id && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-800 p-3 rounded-lg text-center">
                      <div className="font-bold text-lg">✓ Job Assigned!</div>
                      <div className="text-sm">
                        This job has been assigned to{" "}
                        {
                          jobApplications.find(
                            (app) =>
                              app.tradesperson_id ===
                              selectedJobForAssignment.assigned_tradesperson_id
                          )?.tradespeople.first_name
                        }{" "}
                        {
                          jobApplications.find(
                            (app) =>
                              app.tradesperson_id ===
                              selectedJobForAssignment.assigned_tradesperson_id
                          )?.tradespeople.last_name
                        }
                      </div>
                      <div className="text-xs mt-1">
                        No further assignments are allowed.
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAssignmentDialog(false)}
                      disabled={assigning}
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Job Completion Dialog */}
          <JobCompletionDialog
            open={showCompletionDialog}
            onOpenChange={setShowCompletionDialog}
            job={selectedJobForCompletion}
            onComplete={submitJobCompletion}
            loading={completing}
          />

          {/* Simple Chat System */}
          <DatabaseChatSystem
            userId={user?.id || ""}
            userType="client"
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />
        </div>
      </main>

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
