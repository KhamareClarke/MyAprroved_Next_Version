import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const trade = formData.get('trade') as string;
    const city = formData.get('city') as string;
    const postcode = formData.get('postcode') as string;

    // Validate required fields
    if (!fullName || !email || !password || !phone || !trade || !city || !postcode) {
      console.log('Missing required fields:', { fullName, email, phone, trade, city, postcode });
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    console.log('Form data received:', { 
      fullName, 
      email, 
      phone, 
      trade, 
      city, 
      postcode
    });

    // Initialize Supabase client
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('tradespeople')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'A tradesperson with this email already exists' },
        { status: 400 }
      );
    }

    // 2. Create tradesperson record
    const userId = uuidv4();
    const [firstName, ...lastNameParts] = fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const { data: tradesperson, error: insertError } = await supabase
      .from('tradespeople')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase().trim(),
        password_hash: password,
        phone: phone,
        trade: trade,
        postcode: postcode,
        city: city,
        is_verified: false,
        is_approved: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting tradesperson:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return NextResponse.json(
        { 
          error: 'Failed to create tradesperson account',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    console.log('Tradesperson created successfully:', tradesperson);

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Trade registration successful! Please check your email to verify your account.',
      tradespersonId: userId
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error?.message || String(error),
        stack: error?.stack || 'No stack trace available',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15) + '...',
        supabaseKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      { status: 500 }
    );
  }
} 