export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { searchParams } = new URL(request.url);
    const tradespersonId = searchParams.get('tradespersonId');

    if (!tradespersonId) {
      return NextResponse.json(
        { success: false, error: 'Tradesperson ID is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
      );
    }

    // Only show items still awaiting a quote
    const { data: quoteRequests, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('tradesperson_id', tradespersonId)
      .eq('status', 'admin_approved')
      .eq('tradesperson_quoted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tradesperson quote requests:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch quote requests' },
        { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
      );
    }

    return NextResponse.json(
      { success: true, quoteRequests: quoteRequests || [] },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );

  } catch (error: any) {
    console.error('Error in tradesperson quote requests API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  }
} 