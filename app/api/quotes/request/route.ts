import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('Quote request API called');
    
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user is authenticated as a client
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required. Please log in as a client to send quote requests.',
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

    console.log('Client authentication verified');

    let body;
    try {
      body = await request.json();
      console.log('Received request body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
    const {
      customerName,
      customerEmail,
      customerPhone,
      projectType,
      projectDescription,
      location,
      timeframe,
      budget,
      tradespersonId,
      tradespersonName,
      tradespersonTrade
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !projectDescription || !location || !tradespersonId) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    console.log('Processing quote request:', {
      customerName,
      customerEmail,
      tradespersonName,
      projectType,
      location
    });

    // Check if customer has already sent a quote request to this tradesperson
    console.log('Checking for existing quote requests...');
    const { data: existingQuotes, error: checkError } = await supabase
      .from('quote_requests')
      .select('id')
      .eq('tradesperson_id', tradespersonId)
      .eq('customer_email', customerEmail)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing quotes:', checkError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error while checking existing requests',
          details: checkError.message
        },
        { status: 500 }
      );
    }

    if (existingQuotes && existingQuotes.length > 0) {
      console.log('Duplicate quote request detected');
      return NextResponse.json(
        { 
          success: false, 
          error: 'You have already sent a quote request to this tradesperson. Please wait for their response.',
          isDuplicate: true
        },
        { status: 409 }
      );
    }

    // Create quote request record with admin approval workflow
    console.log('Attempting to insert quote request...');
    const quoteId = uuidv4();
    const { data: quoteData, error: insertError } = await supabase
      .from('quote_requests')
      .insert({
        id: quoteId,
        tradesperson_id: tradespersonId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        project_type: projectType,
        project_description: projectDescription,
        location: location,
        timeframe: timeframe,
        budget_range: budget,
        status: 'pending_admin_approval' // New status for admin approval
        // The other columns (admin_approved, tradesperson_quoted, etc.) have default values
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting quote request:', insertError);
      console.error('Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save quote request',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    console.log('Quote request inserted successfully:', quoteData);
    const quoteRequestId = quoteData?.id;

    // Send email notification to admin for approval
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'myapproved2024@gmail.com',
          pass: 'qjqj qjqj qjqj qjqj'
        }
      });

      const adminEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Quote Request - Admin Approval Required</h2>
          <p>Hello Admin,</p>
          
          <p>A new quote request has been submitted and requires your approval:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Details:</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
            <p><strong>Location:</strong> ${location}</p>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Project Details:</h3>
            <p><strong>Type:</strong> ${projectType || 'Not specified'}</p>
            <p><strong>Timeframe:</strong> ${timeframe || 'Not specified'}</p>
            <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
            <p><strong>Description:</strong></p>
            <p style="background: white; padding: 10px; border-radius: 3px;">${projectDescription}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Tradesperson:</h3>
            <p><strong>Name:</strong> ${tradespersonName}</p>
            <p><strong>Trade:</strong> ${tradespersonTrade}</p>
          </div>
          
          <p><strong>Quote ID:</strong> ${quoteId}</p>
          
          <p>Please review and approve this quote request in your admin dashboard.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated notification from My Approved platform.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: '"My Approved" <myapproved2024@gmail.com>',
        to: 'fizasaif0233@gmail.com', // Admin email
        subject: 'New Quote Request - Admin Approval Required',
        html: adminEmailContent
      });

      // Send confirmation email to customer
      const customerEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Quote Request Confirmation - My Approved</h2>
          <p>Hello ${customerName},</p>
          
          <p>Thank you for requesting a quote through My Approved! Your request has been sent to ${tradespersonName}.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Request Summary:</h3>
            <p><strong>Tradesperson:</strong> ${tradespersonName} (${tradespersonTrade})</p>
            <p><strong>Project:</strong> ${projectType || 'Not specified'}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Timeframe:</strong> ${timeframe || 'Not specified'}</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>${tradespersonName} will review your request</li>
            <li>They will contact you directly within 24-48 hours</li>
            <li>You'll receive a detailed quote for your project</li>
            <li>You can then decide whether to proceed</li>
          </ul>
          
          <p>If you don't hear back within 48 hours, please contact us at support@myapproved.co.uk</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated confirmation from My Approved platform.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: '"My Approved" <myapproved2024@gmail.com>',
        to: customerEmail,
        subject: 'Quote Request Confirmation - My Approved',
        html: customerEmailContent
      });

      console.log('Quote request emails sent successfully');
    } catch (emailError) {
      console.error('Failed to send quote request emails:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully! It has been sent to admin for approval. You will be notified once approved.',
      quoteRequestId,
      status: 'pending_admin_approval'
    });

  } catch (error: any) {
    console.error('Error processing quote request:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}