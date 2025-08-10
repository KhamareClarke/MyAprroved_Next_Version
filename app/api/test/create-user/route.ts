import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('Create user test API called');
  
  try {
    const formData = await request.formData();
    const supabase = createClient();
    
    // Extract form data
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const trade = formData.get('trade') as string;
    const companyName = formData.get('companyName') as string;
    const postcode = formData.get('postcode') as string;
    
    console.log('Test data received:', { email, fullName, trade, companyName });

    // First, check if the tables exist
    const tableChecks = [];
    
    try {
      const { data: tradesCheck, error: tradesError } = await supabase.from('trades').select('count()').limit(1);
      tableChecks.push({ table: 'trades', exists: !tradesError, error: tradesError?.message });
    } catch (e: any) {
      tableChecks.push({ table: 'trades', exists: false, error: e.message });
    }
    
    try {
      const { data: documentsCheck, error: documentsError } = await supabase.from('documents').select('count()').limit(1);
      tableChecks.push({ table: 'documents', exists: !documentsError, error: documentsError?.message });
    } catch (e: any) {
      tableChecks.push({ table: 'documents', exists: false, error: e.message });
    }
    
    // Check storage buckets
    let storageStatus = {};
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (!bucketsError) {
        const documentsBucket = buckets?.find(b => b.name === 'documents');
        storageStatus = {
          bucketsCount: buckets?.length || 0,
          documentsBucketExists: !!documentsBucket,
          bucketNames: buckets?.map(b => b.name)
        };
      } else {
        storageStatus = { error: bucketsError.message };
      }
    } catch (e: any) {
      storageStatus = { error: e.message };
    }
    
    // Step 1: Create a new user with Supabase Auth
    console.log('Attempting to create user in Supabase Auth');
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      }
    });
    
    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json({
        success: false,
        error: userError.message,
        stage: 'auth_signup',
        tableChecks,
        storageStatus,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not set'
      }, { status: 500 });
    }
    
    const userId = userData.user?.id;
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get user ID after sign up',
        stage: 'user_id_check',
        tableChecks,
        storageStatus
      }, { status: 500 });
    }
    
    // Step 2: Store trade information in the database
    console.log('Inserting trade record for user:', userId);
    const { data: tradeData, error: tradeError } = await supabase
      .from('trades')
      .insert([
        {
          id: userId,
          full_name: fullName,
          email,
          phone,
          trade,
          company_name: companyName,
          postcode,
          status: 'pending',
        }
      ])
      .select();
    
    if (tradeError) {
      console.error('Error creating trade record:', tradeError);
      return NextResponse.json({
        success: false,
        error: tradeError.message,
        stage: 'trade_record_creation',
        tableChecks,
        storageStatus
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      userId,
      message: 'Test user created successfully',
      tableChecks,
      storageStatus
    });
    
  } catch (error: any) {
    console.error('Unexpected error in create-user test:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stage: 'unexpected_error',
    }, { status: 500 });
  }
}
