import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  console.log('Debug: Testing Supabase connection');
  const supabase = createClient();
  
  try {
    // 1. Test DB connection by querying for tables
    const { data: tableData, error: tableError } = await supabase
      .from('trades')
      .select('id')
      .limit(1);
      
    if (tableError) {
      console.error('Failed to query trades table:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed: ' + tableError.message,
        database: false
      }, { status: 500 });
    }
    
    // 2. Test Storage
    let storage = false;
    try {
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('documents');
        
      if (bucketError) {
        console.error('Storage bucket error:', bucketError);
        storage = false;
      } else {
        storage = true;
      }
    } catch (storageErr) {
      console.error('Storage test error:', storageErr);
      storage = false;
    }
    
    // 3. Test Auth
    let auth = false;
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      auth = !authError;
    } catch (authErr) {
      console.error('Auth test error:', authErr);
      auth = false;
    }
    
    // Return status of each component
    return NextResponse.json({
      success: true,
      database: true,
      storage: storage,
      auth: auth,
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    });
    
  } catch (error: any) {
    console.error('Unexpected error in Supabase test:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error: ' + (error.message || String(error)),
      stack: error.stack || 'No stack trace'
    }, { status: 500 });
  }
}
