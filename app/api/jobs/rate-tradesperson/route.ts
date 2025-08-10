import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
    const { 
      jobId, 
      tradespersonId, 
      rating, 
      review,
      reviewerType,
      reviewerId 
    } = await request.json();

    if (!jobId || !tradespersonId || !rating || !reviewerType || !reviewerId) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, tradespersonId, rating, reviewerType, reviewerId' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if job exists and is completed
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('is_completed', true)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found or not completed' },
        { status: 404 }
      );
    }

    // Check if tradesperson exists
    const { data: tradesperson, error: tradespersonError } = await supabaseAdmin
      .from('tradespeople')
      .select('*')
      .eq('id', tradespersonId)
      .single();

    if (tradespersonError || !tradesperson) {
      return NextResponse.json(
        { error: 'Tradesperson not found' },
        { status: 404 }
      );
    }

    // Check if rating already exists for this job-tradesperson-reviewer combination
    const { data: existingRating, error: checkError } = await supabaseAdmin
      .from('job_reviews')
      .select('*')
      .eq('job_id', jobId)
      .eq('reviewer_id', reviewerId)
      .eq('tradesperson_id', tradespersonId)
      .single();

    if (existingRating) {
      return NextResponse.json(
        { error: 'Rating already exists for this tradesperson' },
        { status: 400 }
      );
    }

    // Add rating to job_reviews table
    const { error: reviewError } = await supabaseAdmin
      .from('job_reviews')
      .insert({
        job_id: jobId,
        tradesperson_id: tradespersonId,
        reviewer_type: reviewerType,
        reviewer_id: reviewerId,
        rating: rating,
        review_text: review || '',
        reviewed_at: new Date().toISOString()
      });

    if (reviewError) {
      console.error('Error adding review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to add rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Rating added successfully'
    });

  } catch (error) {
    console.error('Error in rate tradesperson API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 