import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Auth check API called');
    
    // Check if user is authenticated as a client
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required. Please log in as a client.',
          requiresAuth: true
        },
        { status: 401 }
      );
    }

    // Extract token and verify client authentication
    const token = authHeader.replace('Bearer ', '');
    console.log('Client token received:', token);
    
    // For now, we'll verify the token format (client_<id>_<timestamp>)
    if (!token.startsWith('client_')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid authentication token. Please log in again.',
          requiresAuth: true
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token: token
    });

  } catch (error: any) {
    console.error('Error in auth check:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
} 