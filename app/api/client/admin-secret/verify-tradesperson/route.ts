import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
    const { tradespersonId } = await request.json();

    if (!tradespersonId) {
      return NextResponse.json(
        { error: 'Tradesperson ID is required' },
        { status: 400 }
      );
    }

    // Get tradesperson details
    const { data: tradesperson, error: fetchError } = await supabaseAdmin
      .from('tradespeople')
      .select('*')
      .eq('id', tradespersonId)
      .single();

    if (fetchError || !tradesperson) {
      return NextResponse.json(
        { error: 'Tradesperson not found' },
        { status: 404 }
      );
    }

    // Update tradesperson to approved
    const { error: updateError } = await supabaseAdmin
      .from('tradespeople')
      .update({ 
        is_approved: true,
        is_verified: true 
      })
      .eq('id', tradespersonId);

    if (updateError) {
      console.error('Error updating tradesperson:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve tradesperson' },
        { status: 500 }
      );
    }

    // Send email notification to tradesperson
    try {
      console.log('Setting up email transporter for verification...');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sajidasaif93@gmail.com',
          pass: 'idsp lvmm vmcp iynp'
        },
        debug: true,
        logger: true
      });

      console.log('Creating verification email content...');
      const mailOptions = {
        from: 'My Approved <noreply@myapproved.co.uk>',
        to: tradesperson.email,
        subject: 'Your Profile Has Been Verified - My Approved',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
          <h2 style="color:#2d3748;">Congratulations!</h2>
          <p>Dear ${tradesperson.first_name} ${tradesperson.last_name},</p>
          <p>Great news! Your tradesperson profile has been verified and approved by our admin team.</p>
          <p>You can now log in to your profile and start receiving job requests from clients.</p>
          <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
            <h3 style="margin-top:0;">Your Profile Details:</h3>
            <p><strong>Trade:</strong> ${tradesperson.trade}</p>
            <p><strong>Location:</strong> ${tradesperson.city}, ${tradesperson.postcode}</p>
            <p><strong>Experience:</strong> ${tradesperson.years_experience} years</p>
          </div>
          <p>Thank you for choosing My Approved!</p>
          <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
        </div>`
      };

      console.log('Sending verification email to tradesperson...');
      const result = await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully:', result.messageId);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      console.error('Email error details:', {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      });
      // Don't fail the verification if email fails
    }

    return NextResponse.json({
      message: 'Tradesperson verified successfully',
      tradesperson: {
        id: tradesperson.id,
        email: tradesperson.email,
        firstName: tradesperson.first_name,
        lastName: tradesperson.last_name
      }
    });

  } catch (error) {
    console.error('Error in verify tradesperson API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 