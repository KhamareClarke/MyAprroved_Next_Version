import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// Simple postcode distance calculation (UK postcodes)
function calculatePostcodeDistance(postcode1: string, postcode2: string): number {
  // Extract first part of postcode (e.g., "SW1A" from "SW1A 1AA")
  const area1 = postcode1.split(' ')[0].toUpperCase();
  const area2 = postcode2.split(' ')[0].toUpperCase();
  
  // If same area, distance is 0
  if (area1 === area2) return 0;
  
  // Simple distance calculation based on postcode areas
  // This is a simplified version - in production you'd use a proper geocoding service
  const postcodeAreas: { [key: string]: number } = {
    'SW': 1, 'W': 2, 'NW': 3, 'N': 4, 'NE': 5, 'E': 6, 'SE': 7, 'S': 8,
    '25': 1, '75': 2
  };
  
  const area1Num = postcodeAreas[area1] || 0;
  const area2Num = postcodeAreas[area2] || 0;
  
  return Math.abs(area1Num - area2Num);
}

// Function to normalize trade names for better matching
function normalizeTradeName(trade: string): string {
  return trade.toLowerCase().trim();
}

// Function to check if trades match (handles variations)
function tradesMatch(trade1: string, trade2: string): boolean {
  const normalized1 = normalizeTradeName(trade1);
  const normalized2 = normalizeTradeName(trade2);
  
  // Direct match
  if (normalized1 === normalized2) return true;
  
  // Handle common variations
  const tradeVariations: { [key: string]: string[] } = {
    'plumber': ['plumbing', 'plumber'],
    'plumbing': ['plumber', 'plumbing'],
    'electrician': ['electrical', 'electrician'],
    'electrical': ['electrician', 'electrical'],
    'carpenter': ['carpentry', 'carpenter'],
    'carpentry': ['carpenter', 'carpentry'],
    'painter': ['painting', 'painter'],
    'painting': ['painter', 'painting'],
    'carpet & flooring': ['carpet', 'flooring', 'carpet & flooring'],
    'carpet': ['carpet & flooring', 'carpet'],
    'flooring': ['carpet & flooring', 'flooring']
  };
  
  const variations1 = tradeVariations[normalized1] || [normalized1];
  const variations2 = tradeVariations[normalized2] || [normalized2];
  
  return variations1.some(v1 => variations2.includes(v1));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trade = searchParams.get('trade');
    const postcode = searchParams.get('postcode');
    const tradespersonId = searchParams.get('tradespersonId');

    console.log('Job filtering request:', { trade, postcode, tradespersonId });

    if (!trade || !postcode) {
      return NextResponse.json(
        { error: 'Trade and postcode are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get all approved jobs first
    let query = supabase
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('is_approved', true)
      .eq('is_active', true);

    const { data: allJobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    console.log('Total approved jobs found:', allJobs?.length || 0);

    // If tradespersonId is provided, get their applications to exclude applied jobs
    let appliedJobIds: string[] = [];
    if (tradespersonId) {
      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('tradesperson_id', tradespersonId);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      } else {
        appliedJobIds = applications?.map(app => app.job_id) || [];
        console.log('Applied job IDs:', appliedJobIds);
      }
    }

    // Filter jobs based on trade, postcode, exclude applied jobs, and only show open jobs
    const filteredJobs = allJobs?.filter(job => {
      // Skip if tradesperson has already applied to this job
      if (appliedJobIds.includes(job.id)) {
        console.log(`Job ${job.id}: Skipped - already applied`);
        return false;
      }

      // Skip if job is already assigned to another tradesperson (not open)
      if (job.assigned_tradesperson_id) {
        console.log(`Job ${job.id}: Skipped - already assigned to tradesperson ${job.assigned_tradesperson_id}`);
        return false;
      }

      // Skip if job is completed
      if (job.is_completed) {
        console.log(`Job ${job.id}: Skipped - job is completed`);
        return false;
      }

      // Check if trade matches (using flexible matching)
      const tradeMatches = tradesMatch(job.trade, trade);
      
      // Check if postcode is within reasonable distance
      const distance = calculatePostcodeDistance(job.postcode, postcode);
      const postcodeMatches = distance <= 5; // Within 5 areas
      
      console.log(`Job ${job.id}: trade="${job.trade}" (matches: ${tradeMatches}), postcode="${job.postcode}" (distance: ${distance}, matches: ${postcodeMatches}), assigned=${job.assigned_tradesperson_id}, completed=${job.is_completed}`);
      
      return tradeMatches && postcodeMatches;
    }) || [];

    console.log('Filtered jobs count (excluding applied):', filteredJobs.length);

    return NextResponse.json({
      jobs: filteredJobs,
      totalJobs: allJobs?.length || 0,
      filteredCount: filteredJobs.length,
      appliedJobsCount: appliedJobIds.length,
      filters: { trade, postcode }
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 