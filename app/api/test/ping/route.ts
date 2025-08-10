import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Create server-side Supabase client
    const supabase = createClient();
    
    // Test if Supabase connection is working
    let supabaseStatus = {
      database: false,
      auth: false,
      storage: false,
    };
    
    try {
      // Test database connection
      const { data: dbData, error: dbError } = await supabase
        .from('trades')
        .select('id')
        .limit(1);
      
      supabaseStatus.database = !dbError;
      console.log('Database test result:', dbError ? dbError.message : 'Success');
    } catch (e: any) {
      console.error('Database test error:', e.message);
    }

    try {
      // Test auth connection
      const { data: authData, error: authError } = await supabase.auth.getSession();
      supabaseStatus.auth = !authError;
      console.log('Auth test result:', authError ? authError.message : 'Success');
    } catch (e: any) {
      console.error('Auth test error:', e.message);
    }

    try {
      // Test storage connection
      const { data: storageData, error: storageError } = await supabase.storage.listBuckets();
      supabaseStatus.storage = !storageError;
      console.log('Storage test result:', storageError ? storageError.message : 'Success');
    } catch (e: any) {
      console.error('Storage test error:', e.message);
    }

    return NextResponse.json({
      status: 'success',
      message: 'API is reachable',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...',
      supabaseKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseStatus
    });
  } catch (error: any) {
    console.error('API ping error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}
