import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tradespeople')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('Database connection error:', connectionError);
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: connectionError.message
      }, { status: 500 });
    }

    // Check which tables exist
    const tablesToCheck = [
      'tradespeople',
      'clients', 
      'jobs',
      'job_applications',
      'chat_rooms',
      'chat_messages'
    ];

    const tableStatus = {};

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        tableStatus[tableName] = {
          exists: !error,
          error: error ? error.message : null,
          count: data ? data.length : 0
        };
      } catch (err) {
        tableStatus[tableName] = {
          exists: false,
          error: err.message,
          count: 0
        };
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      tables: tableStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test database API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
} 