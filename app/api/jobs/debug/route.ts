// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trade = searchParams.get("trade");
    const postcode = searchParams.get("postcode");

    const supabase = createClient();

    // Get all jobs to see what's available
    let query = supabase
      .from("jobs")
      .select(
        `
        id,
        trade,
        postcode,
        is_approved,
        application_status,
        is_completed,
        created_at,
        clients (
          first_name,
          last_name
        )
      `
      )
      .order("created_at", { ascending: false });

    // Add filters if provided
    if (trade) {
      query = query.eq("trade", trade);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    // Group jobs by status for better analysis
    const jobsByStatus = {
      approved: jobs?.filter((job) => job.is_approved) || [],
      notApproved: jobs?.filter((job) => !job.is_approved) || [],
      completed: jobs?.filter((job) => job.is_completed) || [],
      notCompleted: jobs?.filter((job) => !job.is_completed) || [],
      open: jobs?.filter((job) => job.application_status === "open") || [],
      inProgress:
        jobs?.filter((job) => job.application_status === "in_progress") || [],
      closed: jobs?.filter((job) => job.application_status === "closed") || [],
      noStatus: jobs?.filter((job) => !job.application_status) || [],
    };

    // Get unique trades
    const uniqueTrades = [...new Set(jobs?.map((job) => job.trade) || [])];

    return NextResponse.json({
      totalJobs: jobs?.length || 0,
      jobsByStatus,
      uniqueTrades,
      jobs: jobs || [],
      filters: {
        trade,
        postcode,
      },
    });
  } catch (error) {
    console.error("Error in debug jobs API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
