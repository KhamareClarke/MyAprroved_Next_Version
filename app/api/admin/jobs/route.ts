import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://jismdkfjkngwbpddhomx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzNzYzOSwiZXhwIjoyMDY4NTEzNjM5fQ.4CHut9RbSI1vf0z8SGT95Jd8V5CI1LLZMg8Oittd_3Y"
);

export async function GET(request: NextRequest) {
  try {
    // const supabaseAdmin = supabase();

    // Get all jobs with client information and job reviews
    const { data: jobs, error } = await supabaseAdmin
      .from("jobs")
      .select(
        `
        *,
        clients (
          id,
          email,
          first_name,
          last_name
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    console.log("Admin jobs API - Jobs found:", jobs?.length || 0);
    return NextResponse.json({
      jobs: jobs || [],
    });
  } catch (error) {
    console.error("Error in admin jobs API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
