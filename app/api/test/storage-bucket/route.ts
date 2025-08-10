import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if documents bucket exists
    let bucketExists = false;
    let bucketInfo = null;
    let error = null;

    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
      bucketExists = !!documentsBucket;
      bucketInfo = documentsBucket;

      console.log('Available buckets:', buckets?.map(b => b.name));
      console.log('Documents bucket found:', bucketExists);
      console.log('Documents bucket info:', bucketInfo);

    } catch (bucketError: any) {
      error = bucketError.message;
      console.error('Error checking bucket:', bucketError);
    }

    // Check documents table
    let documentsCount = 0;
    let documentsError = null;

    try {
      const { count, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        documentsError = countError.message;
      } else {
        documentsCount = count || 0;
      }
    } catch (tableError: any) {
      documentsError = tableError.message;
    }

    return NextResponse.json({
      success: true,
      bucketExists,
      bucketInfo,
      bucketError: error,
      documentsCount,
      documentsError,
      message: bucketExists 
        ? 'Documents bucket exists and is accessible' 
        : 'Documents bucket does not exist or is not accessible'
    });

  } catch (error: any) {
    console.error('Storage bucket test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 