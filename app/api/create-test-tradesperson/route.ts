import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Create a test tradesperson account
    const testTradesperson = {
      email: 'test.tradesperson@example.com',
      password_hash: 'testpassword123',
      first_name: 'Test',
      last_name: 'Tradesperson',
      phone: '07123456789',
      postcode: 'SW1A 1AA',
      city: 'London',
      address: '10 Downing Street, London',
      trade: 'Plumber',
      years_experience: 5,
      hourly_rate: 45.00,
      is_verified: true,
      is_active: true,
      is_approved: true,
      email_verified_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tradespeople')
      .insert(testTradesperson)
      .select()
      .single();

    if (error) {
      console.error('Error creating test tradesperson:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test tradesperson created successfully',
      tradesperson: {
        id: data.id,
        email: data.email,
        name: `${data.first_name} ${data.last_name}`,
        loginCredentials: {
          email: 'test.tradesperson@example.com',
          password: 'testpassword123'
        }
      }
    });

  } catch (error) {
    console.error('Create test tradesperson API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 