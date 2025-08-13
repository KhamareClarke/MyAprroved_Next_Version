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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  CheckCircle,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Search,
  Filter,
  Clock,
  Star,
  RefreshCw,
  MessageCircle,
  Wrench,
  TrendingUp,
  Shield,
  Eye,
  Plus,
  X,
  Bell,
  Phone,
  Mail,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import DatabaseChatSystem from "@/components/DatabaseChatSystem";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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
  distance: number;
  distanceText: string;
  images?: string[];
  clients: {
    id: string;
    first_name: string;
    last_name: string;
  };
  is_completed?: boolean;
  completed_at?: string;
  completed_by?: string;
  client_rating?: number;
  client_review?: string;
  job_reviews?: {
    id: string;
    tradesperson_id: string;
    reviewer_type: string;
    reviewer_id: string;
    rating: number;
    review_text: string;
    reviewed_at: string;
  }[];
}

export default function TradespersonDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tradesperson, setTradesperson] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [inProgressJobs, setInProgressJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [showChat, setShowChat] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [applicationData, setApplicationData] = useState({
    quotation_amount: "",
    quotation_notes: "",
  });
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [quotationAmount, setQuotationAmount] = useState("");
  const [quotationNotes, setQuotationNotes] = useState("");
  const [applying, setApplying] = useState(false);
  const [approvedQuoteRequests, setApprovedQuoteRequests] = useState<any[]>([]);
  const [quoteSubmittingId, setQuoteSubmittingId] = useState<string | null>(
    null
  );
  const [quoteAmountById, setQuoteAmountById] = useState<
    Record<string, string>
  >({});
  const [quoteNotesById, setQuoteNotesById] = useState<Record<string, string>>(
    {}
  );
  const [approvedQuoteBanner, setApprovedQuoteBanner] = useState<{
    customerName: string;
    amount?: number;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login/trade");
      return;
    }

    const userObj = JSON.parse(userData);
    if (userObj.type !== "tradesperson") {
      router.push("/login/trade");
      return;
    }

    setUser(userObj);
    loadTradespersonData(userObj.id);

    // Add event listener to refresh data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && userObj) {
        loadTradespersonData(userObj.id);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  useEffect(() => {
    // Close notifications dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".notification-dropdown") &&
        !target.closest(".notification-button")
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

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
        `/api/chat/unread-count?userId=${userId}&userType=tradesperson`
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

  const loadTradespersonData = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tradespeopleeeee/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setTradesperson(data.tradesperson);

        // Load all data in parallel with a timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Data loading timeout")), 10000)
        );

        console.log("Starting to load dashboard data...");

        const results = await Promise.race([
          Promise.allSettled([
            loadAppliedJobs(userId).then(() =>
              console.log("Applied jobs loaded")
            ),
            loadInProgressJobs(userId).then(() =>
              console.log("In-progress jobs loaded")
            ),
            loadCompletedJobs(userId).then(() =>
              console.log("Completed jobs loaded")
            ),
            loadFilteredJobs(data.tradesperson).then(() =>
              console.log("Filtered jobs loaded")
            ),
            loadNotifications(userId).then(() =>
              console.log("Notifications loaded")
            ),
            loadChatUnreadCount(userId).then(() =>
              console.log("Chat unread count loaded")
            ),
            loadApprovedQuoteRequests(userId).then(() =>
              console.log("Approved quote requests loaded")
            ),
            loadQuoteApprovals(userId).then(() =>
              console.log("Quote approvals loaded")
            ),
          ]),
          timeoutPromise,
        ]);

        console.log("All dashboard data loaded successfully");
      } else {
        console.error("Failed to load tradesperson data:", data.error);
        setError("Failed to load tradesperson data");
      }
    } catch (error) {
      console.error("Error loading tradesperson data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedJobs = async (tradespersonId: string) => {
    try {
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
            preferred_date,
            images,
            clients (
              first_name,
              last_name,
              email
            )
          )
        `
        )
        .eq("tradesperson_id", tradespersonId)
        .in("status", ["pending", "rejected"])
        .order("applied_at", { ascending: false });

      if (error) {
        console.error("Error loading applied jobs:", error);
        return;
      }

      setAppliedJobs(applications || []);
    } catch (err) {
      console.error("Error in loadAppliedJobs:", err);
    }
  };

  const loadInProgressJobs = async (tradespersonId: string) => {
    try {
      const { data: inProgressJobs, error } = await supabase
        .from("jobs")
        .select(
          `
          *,
          clients (
            first_name,
            last_name,
            email
          )
        `
        )
        .eq("assigned_tradesperson_id", tradespersonId)
        .eq("application_status", "in_progress")
        .is("completed_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading in-progress jobs:", error);
        return;
      }

      setInProgressJobs(inProgressJobs || []);
    } catch (err) {
      console.error("Error in loadInProgressJobs:", err);
    }
  };

  const loadCompletedJobs = async (tradespersonId: string) => {
    try {
      const { data: completedJobs, error } = await supabase
        .from("jobs")
        .select(
          `
          *,
          clients (
            first_name,
            last_name,
            email
          ),
          job_reviews (
            id,
            tradesperson_id,
            reviewer_type,
            reviewer_id,
            rating,
            review_text,
            reviewed_at
          )
        `
        )
        .eq("assigned_tradesperson_id", tradespersonId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error loading completed jobs:", error);
        return;
      }

      // Filter reviews to only show reviews for this specific tradesperson
      const filteredCompletedJobs =
        completedJobs?.map((job) => ({
          ...job,
          job_reviews:
            job.job_reviews?.filter(
              (review: any) => review.tradesperson_id === tradespersonId
            ) || [],
        })) || [];

      setCompletedJobs(filteredCompletedJobs);
    } catch (err) {
      console.error("Error in loadCompletedJobs:", err);
    }
  };

  const loadFilteredJobs = async (tradespersonData: any) => {
    try {
      console.log("Loading filtered jobs for tradesperson:", {
        id: tradespersonData.id,
        trade: tradespersonData.trade,
        postcode: tradespersonData.postcode,
      });

      const response = await fetch(
        `/api/jobs/filtered?trade=${tradespersonData.trade}&postcode=${tradespersonData.postcode}&tradespersonId=${tradespersonData.id}`
      );
      const data = await response.json();

      if (response.ok) {
        console.log(`Loaded ${data.jobs?.length || 0} filtered jobs`);
        setJobs(data.jobs || []);
      } else {
        console.error("Error loading filtered jobs:", data.error);
      }
    } catch (err) {
      console.error("Error in loadFilteredJobs:", err);
    }
  };

  const loadApprovedQuoteRequests = async (tradespersonId: string) => {
    try {
      const res = await fetch(
        `/api/tradesperson/quote-requests?tradespersonId=${tradespersonId}&ts=${Date.now()}`,
        { cache: "no-store" } as RequestInit
      );
      const data = await res.json();
      if (res.ok) {
        setApprovedQuoteRequests(data.quoteRequests || []);
      } else {
        console.error("Failed to load approved quote requests:", data.error);
      }
    } catch (err) {
      console.error("Error loading approved quote requests:", err);
    }
  };

  const loadQuoteApprovals = async (tradespersonId: string) => {
    try {
      const { data: quotes, error } = await supabase
        .from("quotes")
        .select(
          `id, quote_amount, status, created_at, quote_requests:quote_request_id ( customer_name )`
        )
        .eq("tradesperson_id", tradespersonId)
        .eq("status", "client_approved")
        .order("created_at", { ascending: false })
        .limit(1);
      if (!error && quotes && quotes.length > 0) {
        const q = quotes[0] as any;
        setApprovedQuoteBanner({
          customerName: q.quote_requests?.customer_name || "client",
          amount: q.quote_amount,
        });
      }
    } catch (e) {
      // ignore
    }
  };

  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job);
    setQuotationAmount("");
    setQuotationNotes("");
    setShowApplicationDialog(true);
  };

  const submitApplication = async () => {
    if (!selectedJob || !user) return;

    if (!quotationAmount || parseFloat(quotationAmount) <= 0) {
      setError("Please enter a valid quotation amount");
      return;
    }

    setApplying(true);
    setError("");

    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          tradespersonId: user.id,
          quotationAmount: parseFloat(quotationAmount),
          quotationNotes: quotationNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Application submitted successfully!");
        setShowApplicationDialog(false);
        setQuotationAmount("");
        setQuotationNotes("");
        setSelectedJob(null);

        // Refresh the jobs list
        if (tradesperson) {
          loadFilteredJobs(tradesperson);
          loadAppliedJobs(user.id);
        }
      } else {
        setError(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    router.push("/login/trade");
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
    return <div className="flex">{stars}</div>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const refreshNotifications = async () => {
    if (user) {
      await loadNotifications(user.id);
    }
  };

  const loadNotifications = async (tradespersonId: string) => {
    try {
      // Load unread chat messages
      // Get chat rooms for this tradesperson
      const { data: chatRooms, error: roomsError } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("tradesperson_id", tradespersonId);

      if (roomsError) {
        console.error("Error loading chat rooms:", roomsError);
      }

      let chatMessages = [];
      if (chatRooms && chatRooms.length > 0) {
        const roomIds = chatRooms.map((room) => room.id);

        // Get unread messages where tradesperson is not the sender
        const { data: messages, error: chatError } = await supabase
          .from("chat_messages")
          .select(
            `
            *,
            chat_rooms (
              jobs (
                trade,
                job_description
              )
            )
          `
          )
          .in("chat_room_id", roomIds)
          .neq("sender_id", tradespersonId)
          .eq("is_read", false);

        if (chatError) {
          console.error("Error loading chat notifications:", chatError);
        } else {
          chatMessages = messages || [];
        }
      }

      // Load job application status changes (recent)
      let applicationUpdates = [];
      try {
        const { data: apps, error: appError } = await supabase
          .from("job_applications")
          .select(
            `
            *,
            jobs (
              trade,
              job_description,
              postcode
            )
          `
          )
          .eq("tradesperson_id", tradespersonId)
          .in("status", ["accepted", "rejected"])
          .gte(
            "applied_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 7 days

        if (appError) {
          console.error("Error loading application updates:", appError);
        } else {
          applicationUpdates = apps || [];
        }
      } catch (error) {
        console.error("Error in application updates query:", error);
      }

      // Load new job matches (jobs that match tradesperson's trade and location)
      let newJobs = [];
      try {
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("trade", tradesperson?.trade)
          .eq("is_approved", true)
          .eq("status", "approved")
          .eq("application_status", "open")
          .gte(
            "created_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          ); // Last 24 hours

        if (jobsError) {
          console.error("Error loading new job notifications:", jobsError);
        } else {
          newJobs = jobs || [];
        }
      } catch (error) {
        console.error("Error in new jobs query:", error);
      }

      // Load completed jobs where tradesperson was assigned
      let completedJobs = [];
      try {
        const { data: jobs, error: completedError } = await supabase
          .from("jobs")
          .select("*")
          .eq("assigned_tradesperson_id", tradespersonId)
          .not("completed_at", "is", null)
          .gte(
            "completed_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 7 days

        if (completedError) {
          console.error(
            "Error loading completed job notifications:",
            completedError
          );
        } else {
          completedJobs = jobs || [];
        }
      } catch (error) {
        console.error("Error in completed jobs query:", error);
      }

      // Load new reviews received
      let newReviews = [];
      try {
        const { data: reviews, error: reviewsError } = await supabase
          .from("job_reviews")
          .select(
            `
            *,
            jobs (
              trade,
              job_description
            )
          `
          )
          .eq("tradesperson_id", tradespersonId)
          .gte(
            "reviewed_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 7 days

        if (reviewsError) {
          console.error("Error loading review notifications:", reviewsError);
        } else {
          newReviews = reviews || [];
        }
      } catch (error) {
        console.error("Error in reviews query:", error);
      }

      // Load job assignments (when admin assigns you to a job)
      let jobAssignments = [];
      try {
        const { data: jobs, error: assignmentError } = await supabase
          .from("jobs")
          .select("*")
          .eq("assigned_tradesperson_id", tradespersonId)
          .not("assigned_tradesperson_id", "is", null)
          .gte(
            "updated_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 7 days

        if (assignmentError) {
          console.error(
            "Error loading job assignment notifications:",
            assignmentError
          );
        } else {
          jobAssignments = jobs || [];
        }
      } catch (error) {
        console.error("Error in job assignments query:", error);
      }

      // Load quote approvals (client approved your quote)
      let quoteApprovals: any[] = [];
      try {
        const { data: quotes, error: quotesErr } = await supabase
          .from("quotes")
          .select("id, quote_amount, status, created_at")
          .eq("tradesperson_id", tradespersonId)
          .eq("status", "client_approved")
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          );
        if (!quotesErr) {
          quoteApprovals = quotes || [];
        }
      } catch (error) {
        console.error("Error in quote approvals query:", error);
      }

      // Combine notifications
      const allNotifications = [
        // Chat messages
        ...(chatMessages || []).map((msg) => ({
          id: `chat-${msg.id}`,
          type: "chat",
          title: "New Message",
          message: `New message about ${msg.chat_rooms?.jobs?.trade || "job"}`,
          timestamp: msg.created_at,
          data: msg,
        })),

        // Application updates
        ...(applicationUpdates || []).map((app) => ({
          id: `app-${app.id}`,
          type: "application",
          title: `Application ${
            app.status.charAt(0).toUpperCase() + app.status.slice(1)
          }`,
          message: `Your application for ${app.jobs?.trade} job was ${app.status}`,
          timestamp: app.updated_at,
          data: app,
        })),

        // New job matches
        ...(newJobs || []).map((job) => ({
          id: `job-${job.id}`,
          type: "new_job",
          title: "New Job Available",
          message: `New ${job.trade} job in ${job.postcode} - £${
            job.budget || "TBC"
          }`,
          timestamp: job.created_at,
          data: job,
        })),

        // Completed jobs
        ...(completedJobs || []).map((job) => ({
          id: `completed-${job.id}`,
          type: "job_completed",
          title: "Job Completed",
          message: `Your ${job.trade} job has been marked as completed`,
          timestamp: job.completed_at,
          data: job,
        })),

        // New reviews
        ...(newReviews || []).map((review) => ({
          id: `review-${review.id}`,
          type: "review_received",
          title: "New Review Received",
          message: `You received a ${review.rating}/5 star review for your ${review.jobs?.trade} work`,
          timestamp: review.reviewed_at,
          data: review,
        })),

        // Job assignments
        ...(jobAssignments || []).map((job) => ({
          id: `assignment-${job.id}`,
          type: "job_assigned",
          title: "Job Assigned to You",
          message: `You've been assigned to a ${job.trade} job in ${job.postcode}`,
          timestamp: job.assigned_at || job.updated_at,
          data: job,
        })),
        // Quote approvals
        ...(quoteApprovals || []).map((qa) => ({
          id: `quote-approved-${qa.id}`,
          type: "quote_approved",
          title: "Quote Approved",
          message: `A client approved your quote${
            qa.quote_amount ? ` (£${qa.quote_amount})` : ""
          }. Chat is now enabled.`,
          timestamp: qa.created_at,
          data: qa,
        })),
      ];

      // Sort by timestamp (newest first)
      allNotifications.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);
      setNotificationCount(allNotifications.length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const submitQuoteForRequest = async (qr: any) => {
    if (!user) return;
    const amount = quoteAmountById[qr.id];
    const notes = quoteNotesById[qr.id] || "";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid quotation amount");
      return;
    }
    try {
      setQuoteSubmittingId(qr.id);
      const res = await fetch("/api/tradesperson/submit-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteRequestId: qr.id,
          tradespersonId: user.id,
          quoteAmount: amount,
          quoteDescription: notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Quote submitted successfully");
        // Remove the request from the approved list
        setApprovedQuoteRequests((prev) => prev.filter((r) => r.id !== qr.id));
        // Clear inputs
        setQuoteAmountById((prev) => {
          const n = { ...prev };
          delete n[qr.id];
          return n;
        });
        setQuoteNotesById((prev) => {
          const n = { ...prev };
          delete n[qr.id];
          return n;
        });
      } else {
        setError(data.error || "Failed to submit quote");
      }
    } catch (e: any) {
      setError("Failed to submit quote");
    } finally {
      setQuoteSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                <span className="text-blue-700">My</span>
                <span className="text-yellow-600">Approved</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative notification-button">
                <Button
                  onClick={() => setShowNotifications(!showNotifications)}
                  variant="outline"
                  className="flex items-center space-x-2 bg-white hover:bg-gray-50 relative"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </Badge>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto notification-dropdown">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Notifications
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshNotifications}
                          className="h-6 w-6 p-0"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No new notifications</p>
                          <p className="text-xs mt-1">
                            You'll see notifications for:
                          </p>
                          <div className="text-xs mt-2 space-y-1 text-gray-400">
                            <p>• New job matches in Postal Code</p>
                            <p>• Application status updates</p>
                            <p>• Job assignments and completions</p>
                            <p>• New reviews and messages</p>
                          </div>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              if (notification.type === "chat") {
                                setShowChat(true);
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {notification.type === "chat" && (
                                    <MessageCircle className="w-4 h-4 text-blue-600" />
                                  )}
                                  {notification.type === "application" && (
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                  )}
                                  {notification.type === "new_job" && (
                                    <Search className="w-4 h-4 text-green-600" />
                                  )}
                                  {notification.type === "job_completed" && (
                                    <CheckCircle className="w-4 h-4 text-purple-600" />
                                  )}
                                  {notification.type === "review_received" && (
                                    <Star className="w-4 h-4 text-orange-600" />
                                  )}
                                  {notification.type === "job_assigned" && (
                                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                                  )}
                                  {notification.type === "quote_approved" && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </h4>
                                </div>
                                <p className="text-gray-600 text-xs mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                  {formatDate(notification.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  console.log(
                    "Chat button clicked, showChat:",
                    showChat,
                    "user:",
                    user
                  );
                  setShowChat(true);
                  setChatUnreadCount(0); // Clear unread count when opening chat
                }}
                variant="outline"
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 relative"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
                {chatUnreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                  </div>
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {tradesperson?.first_name}!
              </h1>
              <p className="text-blue-100 mb-4">
                Ready to find your next job? Here are the latest opportunities
                in your area.
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4" />
                  <span>{tradesperson?.trade}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{tradesperson?.postcode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Verified Professional</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{jobs.length}</div>
                <div className="text-sm text-blue-100">Available Jobs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Approved Banner */}
        {approvedQuoteBanner && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-700 mt-0.5 mr-2 flex-shrink-0" />
                <AlertDescription className="text-green-800">
                  Your quote
                  {approvedQuoteBanner.amount
                    ? ` (£${approvedQuoteBanner.amount})`
                    : ""}{" "}
                  has been approved by {approvedQuoteBanner.customerName}. Chat
                  is now enabled.
                </AlertDescription>
              </div>
              <button
                onClick={() => setApprovedQuoteBanner(null)}
                className="text-green-800 hover:text-green-900 text-sm"
              >
                Dismiss
              </button>
            </div>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Available Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Applied Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appliedJobs.length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inProgressJobs.length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedJobs.length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="available"
              className="flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Available Jobs</span>
            </TabsTrigger>
            <TabsTrigger
              value="applied"
              className="flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Applied</span>
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">In Progress</span>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Completed</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Quote Requests</span>
            </TabsTrigger>
          </TabsList>

          {/* Available Jobs Tab */}
          <TabsContent value="available" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Jobs
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Open jobs in your area that you can apply to
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => loadFilteredJobs(tradesperson)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {jobs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No open jobs available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    There are currently no open jobs in your area that match
                    your trade. Check back later for new opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Job Images */}
                      {job.images && job.images.length > 0 && (
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={job.images[0]}
                            alt="Job"
                            className="w-full h-full object-cover"
                          />
                          {job.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                              +{job.images.length - 1} more
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {job.trade}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {job.job_description}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {formatCurrency(job.budget)}
                          </Badge>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{job.postcode}</span>
                            {job.distanceText && (
                              <span className="ml-2 text-blue-600">
                                ({job.distanceText})
                              </span>
                            )}
                          </div>

                          {job.preferred_date && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>
                                Preferred: {formatDate(job.preferred_date)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>
                              Budget: {formatCurrency(job.budget)} (
                              {job.budget_type})
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleApplyToJob(job)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applied Jobs Tab */}
          <TabsContent value="applied" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Applied Jobs</h2>

            {appliedJobs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No applications yet
                  </h3>
                  <p className="text-gray-600">
                    Start applying to available jobs to see them here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((application) => (
                  <Card
                    key={application.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.jobs.trade}
                            </h3>
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
                          </div>
                          <p className="text-gray-600 mb-3">
                            {application.jobs.job_description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{application.jobs.postcode}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>
                                Your Quote:{" "}
                                {formatCurrency(application.quotation_amount)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>
                                Applied: {formatDate(application.applied_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* In Progress Jobs Tab */}
          <TabsContent value="in-progress" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              In Progress Jobs
            </h2>

            {inProgressJobs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No active jobs
                  </h3>
                  <p className="text-gray-600">
                    Jobs you're currently working on will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {inProgressJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {job.trade}
                            </h3>
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              In Progress
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {job.job_description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{job.postcode}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Budget: {formatCurrency(job.budget)}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Started: {formatDate(job.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Jobs Tab */}
          <TabsContent value="completed" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Completed Jobs</h2>

            {completedJobs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No completed jobs
                  </h3>
                  <p className="text-gray-600">
                    Jobs you've completed will appear here with reviews.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {job.trade}
                            </h3>
                            <Badge
                              variant="default"
                              className="bg-purple-100 text-purple-800"
                            >
                              Completed
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {job.job_description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{job.postcode}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Budget: {formatCurrency(job.budget)}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>
                                Completed: {formatDate(job.completed_at || "")}
                              </span>
                            </div>
                          </div>

                          {/* Reviews */}
                          {job.job_reviews && job.job_reviews.length > 0 ? (
                            <div className="border-t pt-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Client Reviews
                              </h4>
                              {job.job_reviews.map((review: any) => (
                                <div
                                  key={review.id}
                                  className="bg-gray-50 rounded-lg p-3 mb-2"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      {renderStars(review.rating)}
                                      <span className="text-sm font-medium text-gray-900">
                                        {review.rating}/5
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(review.reviewed_at)}
                                    </span>
                                  </div>
                                  {review.review_text && (
                                    <p className="text-sm text-gray-700">
                                      "{review.review_text}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border-t pt-4">
                              <p className="text-sm text-gray-500 italic">
                                No reviews yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quote Requests Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Approved Quote Requests
              </h2>
              <div className="flex space-x-2">
                <Button
                  onClick={() => user?.id && loadApprovedQuoteRequests(user.id)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {approvedQuoteRequests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No approved quote requests yet
                  </h3>
                  <p className="text-gray-600">
                    When an admin approves a client request for you, it will
                    appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedQuoteRequests.map((qr) => (
                  <Card
                    key={qr.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {qr.project_type || "Project"}
                            </h3>
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              Admin Approved
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {qr.project_description}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Customer:</strong> {qr.customer_name}
                            </div>
                            <div>
                              <strong>Location:</strong> {qr.location}
                            </div>
                            <div>
                              <strong>Timeframe:</strong>{" "}
                              {qr.timeframe || "N/A"}
                            </div>
                            <div>
                              <strong>Budget:</strong>{" "}
                              {qr.budget_range || "Discuss"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline quote submission form (client email hidden) */}
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Provide Your Quotation
                        </h4>
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="md:col-span-1">
                            <Label htmlFor={`amount-${qr.id}`}>
                              Amount (£)
                            </Label>
                            <Input
                              id={`amount-${qr.id}`}
                              type="number"
                              min="0"
                              placeholder="e.g. 1200"
                              value={quoteAmountById[qr.id] || ""}
                              onChange={(e) =>
                                setQuoteAmountById((prev) => ({
                                  ...prev,
                                  [qr.id]: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`notes-${qr.id}`}>
                              Notes (optional)
                            </Label>
                            <Textarea
                              id={`notes-${qr.id}`}
                              rows={2}
                              placeholder="Brief description of what’s included"
                              value={quoteNotesById[qr.id] || ""}
                              onChange={(e) =>
                                setQuoteNotesById((prev) => ({
                                  ...prev,
                                  [qr.id]: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button
                            onClick={() => submitQuoteForRequest(qr)}
                            disabled={quoteSubmittingId === qr.id}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {quoteSubmittingId === qr.id
                              ? "Submitting..."
                              : "Submit Quote"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Dialog */}
      <Dialog
        open={showApplicationDialog}
        onOpenChange={setShowApplicationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Job</DialogTitle>
            <DialogDescription>
              Submit your quotation for this job. Make sure to provide a
              competitive price and clear notes.
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Job Details:</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedJob.job_description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <strong>Trade:</strong> {selectedJob.trade}
                  </div>
                  <div>
                    <strong>Postal Code:</strong> {selectedJob.postcode}
                  </div>
                  <div>
                    <strong>Budget:</strong>{" "}
                    {formatCurrency(selectedJob.budget)}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedJob.budget_type}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="quotation-amount">
                  Your Quotation Amount (£)
                </Label>
                <Input
                  id="quotation-amount"
                  type="number"
                  placeholder="Enter your price"
                  value={quotationAmount}
                  onChange={(e) => setQuotationAmount(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="quotation-notes">Notes (Optional)</Label>
                <Textarea
                  id="quotation-notes"
                  placeholder="Add any additional notes about your approach, timeline, or special considerations..."
                  value={quotationNotes}
                  onChange={(e) => setQuotationNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicationDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitApplication}
                  disabled={applying || !quotationAmount}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat System */}
      <DatabaseChatSystem
        userType="tradesperson"
        userId={user?.id || ""}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
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
                    href="/register/trade"
                    className="hover:text-white transition-colors"
                  >
                    Register as Trade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
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
