import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('Quote insert test API called');
    
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user is authenticated as a client
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required. Please log in as a client.',
          requiresAuth: true
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token.startsWith('client_')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid authentication token. Please log in again.',
          requiresAuth: true
        },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log('Received request body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      projectType,
      projectDescription,
      location,
      timeframe,
      budget,
      tradespersonId,
      tradespersonName,
      tradespersonTrade
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !projectDescription || !location || !tradespersonId) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    console.log('Attempting to insert quote request...');
    const quoteId = uuidv4();
    
    // Try to insert the quote request
    const { data: quoteData, error: insertError } = await supabase
      .from('quote_requests')
      .insert({
        id: quoteId,
        tradesperson_id: tradespersonId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        project_type: projectType,
        project_description: projectDescription,
        location: location,
        timeframe: timeframe,
        budget_range: budget,
        status: 'pending_admin_approval'
        // The other columns have default values
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting quote request:', insertError);
      console.error('Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save quote request',
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint
        },
        { status: 500 }
      );
    }

    console.log('Quote request inserted successfully:', quoteData);

    return NextResponse.json({
      success: true,
      message: 'Quote request test successful',
      quoteRequestId: quoteData?.id
    });

  } catch (error: any) {
    console.error('Error in quote insert test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
} 