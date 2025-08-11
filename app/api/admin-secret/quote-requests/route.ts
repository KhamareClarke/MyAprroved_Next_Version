export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch only pending quote requests
    const { data: quoteRequests, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('status', 'pending_admin_approval')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch quote requests' },
        { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
      );
    }

    // Fetch tradesperson details separately for each request
    const transformedRequests = [] as any[];
    if (quoteRequests && quoteRequests.length > 0) {
      for (const request of quoteRequests) {
        const { data: tradesperson } = await supabase
          .from('tradespeople')
          .select('first_name, last_name, trade')
          .eq('id', request.tradesperson_id)
          .single();

        transformedRequests.push({
          id: request.id,
          tradesperson_id: request.tradesperson_id,
          customer_name: request.customer_name,
          customer_email: request.customer_email,
          customer_phone: request.customer_phone,
          project_type: request.project_type,
          project_description: request.project_description,
          location: request.location,
          timeframe: request.timeframe,
          budget_range: request.budget_range,
          status: request.status,
          created_at: request.created_at,
          admin_approved: request.admin_approved,
          tradesperson_quoted: request.tradesperson_quoted,
          client_approved: request.client_approved,
          chat_enabled: request.chat_enabled,
          tradespersonName: tradesperson 
            ? `${tradesperson.first_name} ${tradesperson.last_name}`
            : 'Unknown Tradesperson',
          tradespersonTrade: tradesperson?.trade || 'Unknown Trade'
        });
      }
    }

    return NextResponse.json(
      { success: true, quoteRequests: transformedRequests },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  }
} 