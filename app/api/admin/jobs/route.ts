import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// import { createClient } from "@/lib/supabase";

const supabaseAdmin = createClient(
  "https://jismdkfjkngwbpddhomx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A",
  {
    auth: {
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    // const supabaseAdmin = createClient();

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
