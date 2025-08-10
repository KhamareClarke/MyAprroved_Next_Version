import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if quote_requests table exists by trying to select from it
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Table check failed',
        details: error.message,
        code: error.code
      });
    }

    return NextResponse.json({
      success: true,
      message: 'quote_requests table exists and is accessible',
      data: data
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
} 