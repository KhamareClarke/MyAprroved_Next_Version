import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Get all quote requests
    const { data: allRequests, error: allError } = await supabase
      .from('quote_requests')
      .select('id, status, customer_name, created_at')
      .order('created_at', { ascending: false });

    // Test 2: Get only pending requests
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('quote_requests')
      .select('id, status, customer_name, created_at')
      .eq('status', 'pending_admin_approval')
      .order('created_at', { ascending: false });

    // Test 3: Get the exact query that admin API uses
    const { data: adminQueryResult, error: adminError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('status', 'pending_admin_approval')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      allRequests: allRequests || [],
      pendingRequests: pendingRequests || [],
      adminQueryResult: adminQueryResult || [],
      allError: allError,
      pendingError: pendingError,
      adminError: adminError,
      totalCount: allRequests?.length || 0,
      pendingCount: pendingRequests?.length || 0,
      adminQueryCount: adminQueryResult?.length || 0
    });

  } catch (error: any) {
    console.error('Error in admin quote debug:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 