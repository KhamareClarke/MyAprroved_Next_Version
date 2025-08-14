import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://jismdkfjkngwbpddhomx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A"
);

export async function GET(request: NextRequest) {
  try {
    // Get all job applications with job and tradesperson details
    const { searchParams } = new URL(request.url);

    const { data: applications, error } = await supabaseAdmin
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
          clients (
            id,
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
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Error fetching job applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch job applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: applications || [],
    });
  } catch (error) {
    console.error("Error in admin job applications API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
