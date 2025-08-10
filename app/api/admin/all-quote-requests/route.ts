import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all quote requests with tradesperson details (for overview)
    const { data: quoteRequests, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        tradespeople: tradesperson_id (
          id,
          first_name,
          last_name,
          trade,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all quote requests:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch quote requests' },
        { status: 500 }
      );
    }

    // Transform the data to include tradesperson name
    const transformedRequests = quoteRequests?.map(request => ({
      ...request,
      tradespersonName: request.tradespeople 
        ? `${request.tradespeople.first_name} ${request.tradespeople.last_name}`
        : 'Unknown Tradesperson',
      tradespersonTrade: request.tradespeople?.trade || 'Unknown Trade'
    })) || [];

    return NextResponse.json({
      success: true,
      quoteRequests: transformedRequests
    });

  } catch (error: any) {
    console.error('Error in admin all quote requests API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 