import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { PostgrestQueryBuilder } from "@supabase/postgrest-js";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const supabase = createClient();

    // Get jobs for the client
    let query: any = supabase.from("jobs");

    if (userId) {
      query = query
        .select(
          `
        *,
        tradespeople (
          id,
          first_name,
          last_name,
          trade,
          years_experience,
          hourly_rate,
          phone,
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
        .eq("client_id", userId);
    } else {
      query = query.select(
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
      );
    }

    query = query.order("created_at", { ascending: false });
    const { data: jobs, error } = await query;
    if (error) {
      console.error("Error fetching client jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
