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
    const clientEmail = searchParams.get('email');

    if (!clientEmail) {
      return NextResponse.json(
        { success: false, error: 'Client email is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
      );
    }

    const { data: quoteRequests, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        tradespeople: tradesperson_id (
          id,
          first_name,
          last_name,
          trade
        ),
        quotes:quotes( id, quote_amount, quote_description, created_at )
      `)
      .eq('customer_email', clientEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client quote requests:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch quote requests' },
        { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
      );
    }

    const transformedRequests = (quoteRequests || []).map(request => {
      let latestQuoteAmount: number | null = null;
      let latestQuoteDescription: string | null = null;
      let latestQuoteId: string | null = null;
      if (request.quotes && Array.isArray(request.quotes) && request.quotes.length > 0) {
        const sorted = [...request.quotes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        latestQuoteAmount = sorted[0]?.quote_amount ?? null;
        latestQuoteDescription = sorted[0]?.quote_description ?? null;
        latestQuoteId = sorted[0]?.id ?? null;
      }
      return {
        ...request,
        tradespersonName: request.tradespeople 
          ? `${request.tradespeople.first_name} ${request.tradespeople.last_name}`
          : 'Unknown Tradesperson',
        tradespersonTrade: request.tradespeople?.trade || 'Unknown Trade',
        latestQuoteAmount,
        latestQuoteDescription,
        latestQuoteId,
      };
    });

    return NextResponse.json(
      { success: true, quoteRequests: transformedRequests },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );

  } catch (error: any) {
    console.error('Error in client quote requests API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  }
} 