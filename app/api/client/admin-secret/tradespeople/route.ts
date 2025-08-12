import { NextRequest, NextResponse } from "next/server";
// import { createClient } from '@supabase/supabase-js';
import { createClient } from "@/lib/supabase";

// const supabaseAdmin = createClient(
//   'https://jismdkfjkngwbpddhomx.supabase.co',
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
// );

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get all tradespeople ordered by creation date (newest first)
    const supabaseAdmin = createClient();

    const { data: tradespeople, error } = await supabaseAdmin
      .from("tradespeople")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tradespeople:", error);
      return NextResponse.json(
        { error: "Failed to fetch tradespeople" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tradespeople: tradespeople || [],
    });
  } catch (error) {
    console.error("Error in admin tradespeople API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
