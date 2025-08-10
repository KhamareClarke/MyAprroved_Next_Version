import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test basic internet connectivity
    const testUrl = 'https://httpbin.org/get';
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'MyApproved-Trades-Platform/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      status: 'success',
      message: 'Internet connectivity is working',
      testUrl,
      responseStatus: response.status,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Connectivity test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Connectivity test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 