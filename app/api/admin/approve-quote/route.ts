import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    
    // Use service role key to bypass RLS for admin actions
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await request.json();
    const { quoteRequestId, action } = body; // action: 'approve' or 'reject'

    if (!quoteRequestId || !action) {
      return NextResponse.json(
        { success: false, error: 'Quote request ID and action are required' },
        { status: 400 }
      );
    }

    // Fetch the quote request details
    const { data: quoteRequest, error: fetchError } = await supabase
      .from('quote_requests')
      .select(`
        *,
        tradespeople: tradesperson_id (
          id,
          first_name,
          last_name,
          trade,
          email
        )
      `)
      .eq('id', quoteRequestId)
      .single();

    if (fetchError || !quoteRequest) {
      return NextResponse.json(
        { success: false, error: 'Quote request not found' },
        { status: 404 }
      );
    }

    // Update the quote request status (avoid updating columns that may not exist)
    const updateData: Record<string, any> = {
      admin_approved: action === 'approve',
      status: action === 'approve' ? 'admin_approved' : 'admin_rejected',
    };

    const { data: updatedRows, error: updateError } = await supabase
      .from('quote_requests')
      .update(updateData)
      .eq('id', quoteRequestId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating quote request:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update quote request' },
        { status: 500 }
      );
    }

    // Send email notification (best effort)
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'myapproved2024@gmail.com', pass: 'qjqj qjqj qjqj qjqj' },
        tls: { rejectUnauthorized: false }
      });

      if (action === 'approve') {
        const tradespersonEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Quote Request Approved - My Approved</h2>
            <p>Hello ${quoteRequest.tradespeople?.first_name || 'Tradesperson'},</p>
            <p>A quote request has been approved and is now available in your dashboard:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Customer Details:</h3>
              <p><strong>Name:</strong> ${quoteRequest.customer_name}</p>
              <p><strong>Email:</strong> ${quoteRequest.customer_email}</p>
              <p><strong>Phone:</strong> ${quoteRequest.customer_phone}</p>
              <p><strong>Location:</strong> ${quoteRequest.location}</p>
            </div>
            <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Project Details:</h3>
              <p><strong>Type:</strong> ${quoteRequest.project_type || 'Not specified'}</p>
              <p><strong>Timeframe:</strong> ${quoteRequest.timeframe || 'Not specified'}</p>
              <p><strong>Budget:</strong> ${quoteRequest.budget_range || 'Not specified'}</p>
              <p><strong>Description:</strong></p>
              <p style="background: white; padding: 10px; border-radius: 3px;">${quoteRequest.project_description}</p>
            </div>
            <p>Please log in to your dashboard to provide a quote for this customer.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px;">This is an automated notification from My Approved platform.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: '"My Approved" <myapproved2024@gmail.com>',
          to: quoteRequest.tradespeople?.email || 'tradesperson@example.com',
          subject: 'Quote Request Approved - Action Required',
          html: tradespersonEmailContent
        });

        const customerEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Quote Request Approved - My Approved</h2>
            <p>Hello ${quoteRequest.customer_name},</p>
            <p>Great news! Your quote request has been approved and ${quoteRequest.tradespeople?.first_name || 'the tradesperson'} has been notified.</p>
            <p>You should receive a detailed quote within 24-48 hours. You can also check your dashboard for updates.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px;">This is an automated notification from My Approved platform.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: '"My Approved" <myapproved2024@gmail.com>',
          to: quoteRequest.customer_email,
          subject: 'Quote Request Approved - My Approved',
          html: customerEmailContent
        });
      } else {
        const rejectionEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Quote Request Update - My Approved</h2>
            <p>Hello ${quoteRequest.customer_name},</p>
            <p>We regret to inform you that your quote request has not been approved at this time.</p>
            <p>Please feel free to submit a new quote request or contact us for assistance.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px;">This is an automated notification from My Approved platform.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: '"My Approved" <myapproved2024@gmail.com>',
          to: quoteRequest.customer_email,
          subject: 'Quote Request Update - My Approved',
          html: rejectionEmailContent
        });
      }
    } catch (emailError) {
      console.error('Failed to send approval emails:', emailError);
      // best-effort only
    }

    return NextResponse.json({
      success: true,
      message: `Quote request ${action}d successfully`,
      updated: updatedRows,
    });

  } catch (error: any) {
    console.error('Error in admin approve quote API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 