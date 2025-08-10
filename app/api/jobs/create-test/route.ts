import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Sample test jobs with different trades and postcodes
    const testJobs = [
      {
        trade: 'Plumber',
        job_description: 'Need a plumber to fix a leaking tap in the kitchen',
        postcode: 'SW1A 1AA',
        budget: 150,
        budget_type: 'fixed',
        preferred_date: '2024-02-15',
        status: 'approved',
        is_approved: true,
        application_status: 'open',
        is_completed: false,
        client_id: '3a06feee-ba78-4104-af51-e5b4f24c47b4' // Use existing client ID
      },
      {
        trade: 'Electrician',
        job_description: 'Install new electrical outlets in the living room',
        postcode: 'SW1A 1AA',
        budget: 200,
        budget_type: 'fixed',
        preferred_date: '2024-02-16',
        status: 'approved',
        is_approved: true,
        application_status: 'open',
        is_completed: false,
        client_id: '3a06feee-ba78-4104-af51-e5b4f24c47b4'
      },
      {
        trade: 'Plumber',
        job_description: 'Replace bathroom sink and fix drainage issues',
        postcode: 'W1A 1AA',
        budget: 300,
        budget_type: 'fixed',
        preferred_date: '2024-02-17',
        status: 'approved',
        is_approved: true,
        application_status: 'open',
        is_completed: false,
        client_id: '3a06feee-ba78-4104-af51-e5b4f24c47b4'
      },
      {
        trade: 'Carpenter',
        job_description: 'Build custom bookshelves for home office',
        postcode: 'NW1 1AA',
        budget: 500,
        budget_type: 'fixed',
        preferred_date: '2024-02-18',
        status: 'approved',
        is_approved: true,
        application_status: 'open',
        is_completed: false,
        client_id: '3a06feee-ba78-4104-af51-e5b4f24c47b4'
      },
      {
        trade: 'Electrician',
        job_description: 'Upgrade electrical panel and add new circuits',
        postcode: 'SE1 1AA',
        budget: 800,
        budget_type: 'fixed',
        preferred_date: '2024-02-19',
        status: 'approved',
        is_approved: true,
        application_status: 'open',
        is_completed: false,
        client_id: '3a06feee-ba78-4104-af51-e5b4f24c47b4'
      }
    ];

    const createdJobs = [];

    for (const jobData of testJobs) {
      const { data: job, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        console.error('Error creating test job:', error);
      } else {
        createdJobs.push(job);
      }
    }

    return NextResponse.json({
      message: 'Test jobs created successfully',
      createdJobs: createdJobs.length,
      jobs: createdJobs
    });

  } catch (error) {
    console.error('Error creating test jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 