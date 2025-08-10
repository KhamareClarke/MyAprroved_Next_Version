import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Health check API called');
  
  // Return a simple JSON response
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
