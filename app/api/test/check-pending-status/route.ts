import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the specific requests we're looking for
    const { data: specificRequests, error } = await supabase
      .from('quote_requests')
      .select('id, status, customer_name, project_description, created_at')
      .in('id', [
        '6e53bf52-d312-4332-b779-c09ae6f7cf5f',  // Should be pending_admin_approval
        '7297e838-7a42-43c6-903e-475e6ab64739'   // Should be admin_approved
      ])
      .order('created_at', { ascending: false });

    // Also get all pending requests
    const { data: allPending, error: pendingError } = await supabase
      .from('quote_requests')
      .select('id, status, customer_name, project_description, created_at')
      .eq('status', 'pending_admin_approval')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      specificRequests: specificRequests || [],
      allPending: allPending || [],
      error: error,
      pendingError: pendingError
    });

  } catch (error: any) {
    console.error('Error in check pending status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 