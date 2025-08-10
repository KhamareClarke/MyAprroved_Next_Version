export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await request.json();
    const {
      quoteRequestId,
      tradespersonId,
      quoteAmount,
      quoteDescription,
      estimatedDuration,
      termsAndConditions
    } = body;

    if (!quoteRequestId || !tradespersonId || !quoteAmount || !quoteDescription) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Verify the quote request exists and is approved by admin
    const { data: quoteRequest, error: fetchError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteRequestId)
      .eq('tradesperson_id', tradespersonId)
      .eq('status', 'admin_approved')
      .single();

    if (fetchError || !quoteRequest) {
      return NextResponse.json(
        { success: false, error: 'Quote request not found or not approved by admin', details: fetchError?.message },
        { status: 404 }
      );
    }

    // Create quote response
    const quoteId = require('uuid').v4();
    const insertPayload: any = {
      id: quoteId,
      quote_request_id: quoteRequestId,
      tradesperson_id: tradespersonId,
      quote_amount: parseFloat(quoteAmount),
      quote_description: quoteDescription,
      status: 'pending_client_approval',
      created_at: new Date().toISOString()
    };
    if (estimatedDuration) insertPayload.estimated_duration = estimatedDuration;
    if (termsAndConditions) insertPayload.terms_and_conditions = termsAndConditions;

    const { error: insertError } = await supabase
      .from('quotes')
      .insert(insertPayload);

    if (insertError) {
      console.error('Error inserting quote:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to submit quote', details: insertError.message, code: insertError.code },
        { status: 500 }
      );
    }

    // Update quote request status
    const { error: updateError } = await supabase
      .from('quote_requests')
      .update({
        status: 'tradesperson_quoted',
        tradesperson_quoted: true
      })
      .eq('id', quoteRequestId);

    if (updateError) {
      console.error('Error updating quote request:', updateError);
    }

    // Send email to client (best-effort)
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'myapproved2024@gmail.com', pass: 'qjqj qjqj qjqj qjqj' }
      });

      const clientEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Quote Received - Action Required</h2>
          <p>Hello ${quoteRequest.customer_name},</p>
          <p>A tradesperson has submitted a quote for your project:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Quote Details:</h3>
            <p><strong>Amount:</strong> £${quoteAmount}</p>
            ${estimatedDuration ? `<p><strong>Estimated Duration:</strong> ${estimatedDuration}</p>` : ''}
            <p><strong>Description:</strong></p>
            <p style="background: white; padding: 10px; border-radius: 3px;">${quoteDescription}</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated notification from My Approved platform.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: '"My Approved" <myapproved2024@gmail.com>',
        to: quoteRequest.customer_email,
        subject: 'Quote Received - Review Required',
        html: clientEmailContent
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Quote submitted successfully. Client has been notified.',
      quoteId: quoteId,
      status: 'pending_client_approval'
    });

  } catch (error: any) {
    console.error('Error in tradesperson submit quote API:', error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 