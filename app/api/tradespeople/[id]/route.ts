import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = "https://jismdkfjkngwbpddhomx.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A";

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);

    console.log("Fetching tradesperson details for ID:", params.id);

    // Get tradesperson with reviews
    const { data: tradesperson, error } = await supabase
      .from("tradespeople")
      .select(
        `
        id,
        first_name,
        last_name,
        trade,
        city,
        postcode,
        phone,
        email,
        profile_picture_url,
        years_experience,
        hourly_rate,
        is_verified,
        is_active,
        is_approved,
        created_at,
        job_reviews!job_reviews_tradesperson_id_fkey (
          id,
          rating,
          review_text,
          reviewer_type,
          reviewer_id,
          reviewed_at
        )
      `
      )
      .eq("id", params.id)
      .eq("is_active", true)
      .eq("is_approved", true)
      .single();

    if (error) {
      console.error("Error fetching tradesperson:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch tradesperson: ${error.message}`,
        },
        { status: 500 }
      );
    }

    if (!tradesperson) {
      return NextResponse.json(
        { success: false, error: "Tradesperson not found" },
        { status: 404 }
      );
    }

    // Transform the data
    const fullName = `${tradesperson.first_name || ""} ${
      tradesperson.last_name || ""
    }`.trim();

    // Generate initials for profile picture
    const nameParts = fullName.split(" ").filter((part) => part.length > 0);
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${
            nameParts[nameParts.length - 1][0]
          }`.toUpperCase()
        : (fullName.substring(0, 2) || "NA").toUpperCase();

    // Calculate real ratings and reviews from job_reviews
    const reviews = tradesperson.job_reviews || [];
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
          totalReviews
        : 0;

    // Mock data for fields we don't have yet
    const mockData = {
      distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`,
      description: `Professional ${
        tradesperson.trade?.toLowerCase() || "tradesperson"
      } with ${
        tradesperson.years_experience || "several"
      } years of experience in ${tradesperson.city || "the area"}.`,
      responseTime: `${Math.floor(Math.random() * 4) + 1} hours`,
    };

    // Format hourly rate
    const hourlyRate = tradesperson.hourly_rate
      ? `£${parseFloat(tradesperson.hourly_rate).toFixed(2)}/hr`
      : `£${Math.floor(Math.random() * 30) + 30}-${
          Math.floor(Math.random() * 30) + 60
        }/hr`;

    const transformedTradesperson = {
      id: tradesperson.id,
      name: fullName || "Unknown",
      trade: tradesperson.trade || "General",
      rating: parseFloat(averageRating.toFixed(1)) || 0,
      reviews: totalReviews,
      reviewsData: reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        text: review.review_text,
        reviewerType: review.reviewer_type,
        reviewedAt: review.reviewed_at,
      })),
      location: `${tradesperson.city || "Unknown"}, ${
        tradesperson.postcode || "Unknown"
      }`,
      distance: mockData.distance,
      image: tradesperson.profile_picture_url || null,
      initials: initials,
      verified: tradesperson.is_verified || false,
      yearsExperience:
        tradesperson.years_experience || Math.floor(Math.random() * 15) + 3,
      description: mockData.description,
      hourlyRate: hourlyRate,
      responseTime: mockData.responseTime,
      phone: tradesperson.phone || "",
      email: tradesperson.email || "",
    };

    return NextResponse.json({
      success: true,
      tradesperson: transformedTradesperson,
    });
  } catch (error: any) {
    console.error("Error in tradesperson details API:", error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
