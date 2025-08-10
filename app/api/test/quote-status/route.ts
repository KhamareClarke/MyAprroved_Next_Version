import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all quote requests with their status
    const { data: allRequests, error: allError } = await supabase
      .from('quote_requests')
      .select('id, status, admin_approved, created_at, customer_name')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('Error fetching all requests:', allError);
      return NextResponse.json({ success: false, error: allError.message });
    }

    // Get only pending requests
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('quote_requests')
      .select('id, status, admin_approved, created_at, customer_name')
      .eq('status', 'pending_admin_approval')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('Error fetching pending requests:', pendingError);
      return NextResponse.json({ success: false, error: pendingError.message });
    }

    return NextResponse.json({
      success: true,
      allRequests: allRequests || [],
      pendingRequests: pendingRequests || [],
      totalCount: allRequests?.length || 0,
      pendingCount: pendingRequests?.length || 0
    });

  } catch (error: any) {
    console.error('Error in quote status test:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 