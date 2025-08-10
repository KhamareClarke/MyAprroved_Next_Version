import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get jobs for the client
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
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
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 