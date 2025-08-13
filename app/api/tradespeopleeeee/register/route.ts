import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Hardcoded Supabase credentials (no env file needed)
const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
    console.log('Tradesperson registration API called');
    
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });
    
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      postcode,
      city,
      address,
      trade,
      yearsExperience,
      hourlyRate,
      idDocumentUrl,
      insuranceDocumentUrl,
      qualificationsDocumentUrl,
      tradeCardUrl
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !postcode || !city || !address || !trade) {
      console.log('Missing required fields:', { email, firstName, lastName, phone, postcode, city, address, trade });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Checking for existing tradesperson...');
    // Check if email already exists in tradespeople table
    const { data: existingTradesperson, error: tradespersonCheckError } = await supabaseAdmin
      .from('tradespeople')
      .select('id')
      .eq('email', email)
      .single();

    if (existingTradesperson) {
      console.log('Email already registered as tradesperson:', email);
      return NextResponse.json(
        { error: 'Email already registered as a tradesperson' },
        { status: 400 }
      );
    }

    console.log('Checking for existing client...');
    // Check if email exists in clients table
    const { data: existingClient, error: clientCheckError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', email)
      .single();

    if (existingClient) {
      console.log('Email already registered as client:', email);
      return NextResponse.json(
        { error: 'Email already registered as a client' },
        { status: 400 }
      );
    }

    console.log('Creating tradesperson record...');

    // Create tradesperson record
    const { data: tradesperson, error: insertError } = await supabaseAdmin
      .from('tradespeople')
      .insert({
        email,
        password_hash: password, // Store password directly
        first_name: firstName,
        last_name: lastName,
        phone,
        postcode,
        city,
        address,
        trade,
        years_experience: yearsExperience,
        hourly_rate: hourlyRate,
        id_document_url: idDocumentUrl,
        insurance_document_url: insuranceDocumentUrl,
        qualifications_document_url: qualificationsDocumentUrl,
        trade_card_url: tradeCardUrl,
        is_verified: false, // Set to false - needs admin approval
        is_approved: false,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting tradesperson:', insertError);
      return NextResponse.json(
        { error: 'Failed to create tradesperson account', details: insertError.message },
        { status: 500 }
      );
    }

    // Send email notification to admin (non-blocking)
    setTimeout(async () => {
      try {
        console.log('Setting up email transporter...');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'sajidasaif93@gmail.com',
            pass: 'idsp lvmm vmcp iynp'
          }
        });

        const mailOptions = {
          from: 'My Approved <noreply@myapproved.co.uk>',
          to: 'fizasaif0233@gmail.com', // Admin email
          subject: 'New Tradesperson Registration - My Approved',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
            <h2 style="color:#2d3748;">New Tradesperson Registration</h2>
            <p>A new tradesperson has registered and requires your approval.</p>
            <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Registration Details:</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Trade:</strong> ${trade}</p>
              <p><strong>Location:</strong> ${city}, ${postcode}</p>
              <p><strong>Experience:</strong> ${yearsExperience} years</p>
              <p><strong>Hourly Rate:</strong> £${hourlyRate}</p>
            </div>
            <div style="background-color:#f0f9ff;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Documents Uploaded:</h3>
              <p>• ID Document: ${idDocumentUrl ? '✅ Uploaded' : '❌ Missing'}</p>
              <p>• Insurance: ${insuranceDocumentUrl ? '✅ Uploaded' : '❌ Missing'}</p>
              <p>• Qualifications: ${qualificationsDocumentUrl ? '✅ Uploaded' : '❌ Missing'}</p>
              <p>• Trade Card: ${tradeCardUrl ? '✅ Uploaded' : '❌ Missing'}</p>
            </div>
            <div style="background-color:#3b82f6;color:white;padding:12px 24px;border-radius:6px;display:inline-block;text-align:center;margin:16px 0;">
              <strong>Review in Admin Dashboard</strong>
            </div>
            <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
          </div>`
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent successfully:', result.messageId);
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    }, 100); // Send email after 100ms (non-blocking)

    console.log('Tradesperson created successfully:', tradesperson.id);

    return NextResponse.json({
      message: 'Tradesperson registered successfully! Your profile will be reviewed by our admin team.',
      tradesperson: {
        id: tradesperson.id,
        email: tradesperson.email,
        firstName: tradesperson.first_name,
        lastName: tradesperson.last_name
      }
    });

  } catch (error) {
    console.error('Error in tradesperson registration:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 