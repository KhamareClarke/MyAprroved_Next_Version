import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Testing client login for:', email);

    // Check if client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json({
        error: 'Database error',
        details: clientError.message
      }, { status: 500 });
    }

    if (!client) {
      return NextResponse.json({
        error: 'Client not found',
        email: email
      }, { status: 404 });
    }

    // Check password
    const passwordMatch = client.password_hash === password;

    return NextResponse.json({
      client: {
        id: client.id,
        email: client.email,
        first_name: client.first_name,
        is_verified: client.is_verified,
        password_hash: client.password_hash ? '***' : 'null'
      },
      passwordMatch,
      loginValid: passwordMatch && client.is_verified
    });

  } catch (error) {
    console.error('Error in test client login:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 